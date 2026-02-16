/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageHeader } from './PageHeader';
import { CorrelationService } from '../services/correlationService';
import { ProcessedResult, DiscoveryResult } from '../types';
import { storageService } from '../services/storageService';
import {
    Zap,
    Link2,
    FileText,
    ChevronRight,
    AlertCircle,
    Search,
    Fingerprint,
    ShieldAlert,
    Network,
    Activity,
    ArrowRight
} from 'lucide-react';

interface CrossDocumentDiscoveryViewProps {
    onNavigateToInvestigation?: (id: string) => void;
}

export const CrossDocumentDiscoveryView: React.FC<CrossDocumentDiscoveryViewProps> = ({ onNavigateToInvestigation }) => {
    const [results, setResults] = useState<ProcessedResult[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [discoveries, setDiscoveries] = useState<DiscoveryResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [filterType, setFilterType] = useState<string | 'all'>('all');
    const [discoverySearch, setDiscoverySearch] = useState('');

    useEffect(() => {
        storageService.getAllResults().then(data => {
            const completed = data.filter(r => r.status === 'completed');
            setResults(completed);
            if (completed.length > 0) {
                setSelectedDocId(completed[0].id);
            }
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (selectedDocId) {
            setAnalyzing(true);
            CorrelationService.findDiscoveryLinks(selectedDocId).then(data => {
                setDiscoveries(data);
                setAnalyzing(false);
            });
        }
    }, [selectedDocId]);

    const getLinkIcon = (type: string) => {
        switch (type) {
            case 'entity': return <Fingerprint size={12} />;
            case 'pii': return <ShieldAlert size={12} />;
            case 'transaction': return <Zap size={12} />;
            case 'flight': return <Activity size={12} />;
            default: return <Link2 size={12} />;
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-[var(--background)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--surface-muted)] border-t-[var(--accent)] rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">Initialisation du scanner...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[var(--background)] overflow-hidden relative font-sans text-[var(--text)]">
            <PageHeader
                title="Cross-Document"
                titleHighlight="Discovery"
                icon={Network}
                badgeText="IA Predictive Linking Engine"
                searchQuery={discoverySearch}
                onSearchChange={setDiscoverySearch}
                searchPlaceholder="Filtrer les découvertes..."
                totalLabel="Découvertes"
                totalCount={discoveries.length}
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 shrink-0 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-xl)] px-3 py-1.5 shadow-inner">
                        <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest leading-none">Source</span>
                        <select
                            value={selectedDocId || ''}
                            onChange={(e) => setSelectedDocId(e.target.value)}
                            className="bg-transparent text-[10px] font-bold text-[var(--primary)] outline-none max-w-[150px] truncate"
                        >
                            {results.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.input.query.slice(0, 30)}...
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="h-6 w-px bg-slate-100 hidden sm:block"></div>

                    <div className="flex items-center gap-2">
                        {['all', 'entity', 'pii', 'transaction', 'flight', 'semantic'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-1.5 rounded-[var(--radius-xl)] text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filterType === type
                                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-md translate-y-[-1px]'
                                    : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--border-strong)]'
                                    }`}
                            >
                                {type === 'all' ? 'Tous' : type}
                            </button>
                        ))}
                    </div>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar z-10">
                {analyzing ? (
                    <div className="text-center py-20">
                        <div className="inline-block relative">
                            <div className="w-20 h-20 border-2 border-[var(--border)] rounded-full animate-spin border-t-[var(--accent)]"></div>
                            <Activity size={24} className="absolute inset-0 m-auto text-[var(--accent)] animate-pulse" />
                        </div>
                        <p className="mt-6 text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.4em]">Analyse des convergences en cours...</p>
                    </div>
                ) : discoveries.length > 0 ? (
                    <div className="max-w-6xl mx-auto space-y-10">
                        {discoveries
                            .filter(d => {
                                const otherDoc = results.find(r => r.id === d.doc2Id);
                                const matchesSearch = otherDoc?.input.query.toLowerCase().includes(discoverySearch.toLowerCase()) ||
                                    d.links.some(l => l.label.toLowerCase().includes(discoverySearch.toLowerCase()));
                                const matchesFilter = filterType === 'all' || d.links.some(l => l.type === filterType);
                                return matchesSearch && matchesFilter;
                            })
                            .map((discovery, idx) => {
                                const otherDoc = results.find(r => r.id === discovery.doc2Id);
                                const filteredLinks = filterType === 'all' ? discovery.links : discovery.links.filter(l => l.type === filterType);

                                if (filteredLinks.length === 0) return null;

                                return (
                                    <div key={idx} className="bg-[var(--surface)] rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-[var(--shadow-premium)] hover:shadow-2xl hover:shadow-[var(--accent)]/5 transition-all duration-700 group overflow-hidden border-l-4 border-l-transparent hover:border-l-[var(--accent)]">
                                        <div className="flex flex-col lg:flex-row h-full">
                                            {/* Document Info Sidebar */}
                                            <div className="lg:w-85 border-r border-[var(--border)]/50 p-10 flex flex-col bg-[var(--surface-muted)]/30 backdrop-blur-sm">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-[var(--accent)] uppercase tracking-[0.3em] mb-1">Convergence IA</span>
                                                        <span className="text-2xl font-black text-[var(--text)] font-legal italic tabular-nums">{Math.round(discovery.totalStrength)}%</span>
                                                    </div>
                                                    <div className="w-12 h-12 rounded-full border-2 border-[var(--border)] flex items-center justify-center relative bg-[var(--surface)] shadow-sm">
                                                        <div
                                                            className="absolute inset-0 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin-slow"
                                                            style={{ opacity: discovery.totalStrength / 100 }}
                                                        ></div>
                                                        <Link2 size={20} className="text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors" />
                                                    </div>
                                                </div>

                                                <div className="space-y-4 mb-8">
                                                    <div className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">Document Cible :</div>
                                                    <h3 className="text-sm font-black text-[var(--text)] italic font-legal leading-relaxed">
                                                        {otherDoc?.input.query}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-[10px] text-[var(--text-dim)] font-bold italic underline decoration-[var(--border)]">
                                                        {otherDoc?.input.targetUrl.split('/').pop()?.slice(0, 30)}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-8">
                                                    {Array.from(new Set(discovery.links.map(l => l.type))).map(t => (
                                                        <span key={t} className="px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-[8px] font-black text-[var(--text-dim)] uppercase tracking-widest shadow-sm">{t}</span>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => onNavigateToInvestigation?.(discovery.doc2Id)}
                                                    className="mt-auto flex items-center justify-center gap-3 px-6 py-4 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[var(--radius-xl)] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--accent)] transition-all transform active:scale-95 shadow-lg shadow-[var(--primary)]/10"
                                                >
                                                    Ouvrir l'Analyse <ArrowRight size={14} />
                                                </button>
                                            </div>

                                            {/* Links Content */}
                                            <div className="flex-1 p-10 bg-[var(--surface)] relative">
                                                <div className="flex items-center justify-between mb-10 border-b border-[var(--border)]/50 pb-6">
                                                    <h4 className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.4em] flex items-center gap-3">
                                                        <Activity size={16} /> Matrix des Connecteurs
                                                    </h4>
                                                    <div className="flex items-center gap-4 text-[var(--text-muted)] font-black text-[9px] uppercase tracking-widest">
                                                        <span>Confidence: HIGH</span>
                                                        <span>Matches: {filteredLinks.length}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {filteredLinks.map((link, lIdx) => (
                                                        <div key={lIdx} className="group/link bg-[var(--surface-muted)]/50 hover:bg-[var(--surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--border)]/50 hover:border-[var(--accent)]/20 hover:shadow-[var(--shadow-premium)] transition-all duration-500 relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/link:opacity-10 transition-opacity">
                                                                {getLinkIcon(link.type)}
                                                            </div>
                                                            <div className="flex items-center gap-4 mb-4">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover/link:scale-110 duration-500 ${link.type === 'pii' ? 'bg-emerald-500/10 text-emerald-600 shadow-inner' :
                                                                    link.type === 'transaction' ? 'bg-[var(--accent)]/10 text-[var(--accent)] shadow-inner' :
                                                                        link.type === 'semantic' ? 'bg-purple-500/10 text-purple-600 shadow-inner' :
                                                                            'bg-blue-500/10 text-blue-600 shadow-inner'
                                                                    }`}>
                                                                    {getLinkIcon(link.type)}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-0.5">{link.type}</span>
                                                                    <span className="text-xs font-black text-[var(--text)] italic font-legal line-clamp-1">{link.label}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed font-medium pl-14">
                                                                {link.description}
                                                            </p>

                                                            {link.strength > 8 && (
                                                                <div className="absolute bottom-4 right-6 text-[8px] font-black text-[var(--accent)] uppercase tracking-[0.2em] flex items-center gap-1.5 opacity-0 group-hover/link:opacity-100 transition-opacity">
                                                                    <Zap size={10} className="fill-[var(--accent)]" /> HIGH CONFIDENCE
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                ) : (
                    <div className="text-center py-40">
                        <div className="w-24 h-24 bg-[var(--surface-muted)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border)] shadow-inner">
                            <Search size={32} className="text-[var(--text-dim)]" />
                        </div>
                        <h3 className="text-lg font-black text-[var(--text-dim)] uppercase tracking-widest italic mb-2 font-legal">Aucun pont identifié</h3>
                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-[0.2em]">Importez plus de documents pour activer la découverte</p>
                    </div>
                )}
            </div>

            <div className="fixed bottom-10 right-10 rotate-90 origin-right pointer-events-none opacity-[0.05] z-0">
                <span className="text-[10px] font-black text-black uppercase tracking-[2em] whitespace-nowrap italic font-serif-legal">IA DISCOVERY PROTOCOL ACTIVATE</span>
            </div>
        </div>
    );
};
