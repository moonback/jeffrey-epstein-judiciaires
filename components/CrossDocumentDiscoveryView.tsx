/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
            <div className="h-full flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-[#B91C1C] rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Initialisation du scanner...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative font-sans">
            <header className="px-10 py-6 border-b border-slate-100 bg-white/90 backdrop-blur-xl z-20 shrink-0 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-[#B91C1C] rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
                            <Network size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight">Cross-Document <span className="text-[#B91C1C]">Discovery</span></h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">IA Predictive Linking Engine</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                            <input
                                type="text"
                                placeholder="Filtrer les découvertes..."
                                value={discoverySearch}
                                onChange={(e) => setDiscoverySearch(e.target.value)}
                                className="bg-slate-50 border border-slate-100 rounded-lg pl-9 pr-3 py-1.5 text-[10px] font-bold text-[#0F172A] outline-none focus:border-[#B91C1C] transition-all w-full"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Source :</span>
                            <select
                                value={selectedDocId || ''}
                                onChange={(e) => setSelectedDocId(e.target.value)}
                                className="bg-white border border-slate-100 rounded-lg px-3 py-1.5 text-[10px] font-bold text-[#0F172A] focus:ring-2 focus:ring-[#B91C1C]/20 outline-none transition-all shadow-sm max-w-[200px]"
                            >
                                {results.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.input.query.slice(0, 30)}...
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar pb-1">
                    {['all', 'entity', 'pii', 'transaction', 'flight', 'semantic'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filterType === type
                                    ? 'bg-[#0F172A] text-white shadow-lg'
                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                }`}
                        >
                            {type === 'all' ? 'Tous les liens' : type}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar z-10">
                {analyzing ? (
                    <div className="text-center py-20">
                        <div className="inline-block relative">
                            <div className="w-20 h-20 border-2 border-slate-100 rounded-full animate-spin border-t-[#B91C1C]"></div>
                            <Activity size={24} className="absolute inset-0 m-auto text-[#B91C1C] animate-pulse" />
                        </div>
                        <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Analyse des convergences en cours...</p>
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
                                    <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-[#B91C1C]/5 transition-all duration-700 group overflow-hidden border-l-4 border-l-transparent hover:border-l-[#B91C1C]">
                                        <div className="flex flex-col lg:flex-row h-full">
                                            {/* Document Info Sidebar */}
                                            <div className="lg:w-85 border-r border-slate-50 p-10 flex flex-col bg-slate-50/20">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-[#B91C1C] uppercase tracking-[0.3em] mb-1">Convergence IA</span>
                                                        <span className="text-2xl font-black text-[#0F172A]">{Math.round(discovery.totalStrength)}%</span>
                                                    </div>
                                                    <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center relative">
                                                        <div
                                                            className="absolute inset-0 rounded-full border-2 border-[#B91C1C] border-t-transparent animate-spin-slow"
                                                            style={{ opacity: discovery.totalStrength / 100 }}
                                                        ></div>
                                                        <Link2 size={20} className="text-slate-200 group-hover:text-[#B91C1C] transition-colors" />
                                                    </div>
                                                </div>

                                                <div className="space-y-4 mb-8">
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Document Cible :</div>
                                                    <h3 className="text-sm font-black text-[#0F172A] italic font-serif-legal leading-relaxed">
                                                        {otherDoc?.input.query}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold italic underline decoration-slate-200">
                                                        {otherDoc?.input.targetUrl.split('/').pop()?.slice(0, 30)}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-8">
                                                    {Array.from(new Set(discovery.links.map(l => l.type))).map(t => (
                                                        <span key={t} className="px-2 py-1 bg-white border border-slate-100 rounded text-[8px] font-black text-slate-400 uppercase tracking-widest">{t}</span>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => onNavigateToInvestigation?.(discovery.doc2Id)}
                                                    className="mt-auto flex items-center justify-center gap-3 px-6 py-4 bg-[#0F172A] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#B91C1C] transition-all transform active:scale-95 shadow-lg shadow-slate-900/10"
                                                >
                                                    Ouvrir l'Analyse <ArrowRight size={14} />
                                                </button>
                                            </div>

                                            {/* Links Content */}
                                            <div className="flex-1 p-10 bg-white relative">
                                                <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-6">
                                                    <h4 className="text-[10px] font-black text-[#B91C1C] uppercase tracking-[0.4em] flex items-center gap-3">
                                                        <Activity size={16} /> Matrix des Connecteurs
                                                    </h4>
                                                    <div className="flex items-center gap-4 text-slate-300 font-black text-[9px] uppercase tracking-widest">
                                                        <span>Confidence: HIGH</span>
                                                        <span>Matches: {filteredLinks.length}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {filteredLinks.map((link, lIdx) => (
                                                        <div key={lIdx} className="group/link bg-[#F8FAFC] hover:bg-white p-6 rounded-3xl border border-slate-100 hover:border-[#B91C1C]/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/link:opacity-10 transition-opacity">
                                                                {getLinkIcon(link.type)}
                                                            </div>
                                                            <div className="flex items-center gap-4 mb-4">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover/link:scale-110 duration-500 ${link.type === 'pii' ? 'bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-900/5' :
                                                                        link.type === 'transaction' ? 'bg-red-50 text-[#B91C1C] shadow-sm shadow-red-900/5' :
                                                                            link.type === 'semantic' ? 'bg-purple-50 text-purple-600 shadow-sm shadow-purple-900/5' :
                                                                                'bg-blue-50 text-[#0F4C81] shadow-sm shadow-blue-900/5'
                                                                    }`}>
                                                                    {getLinkIcon(link.type)}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{link.type}</span>
                                                                    <span className="text-xs font-black text-[#0F172A] italic font-serif-legal line-clamp-1">{link.label}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium pl-14">
                                                                {link.description}
                                                            </p>

                                                            {link.strength > 8 && (
                                                                <div className="absolute bottom-4 right-6 text-[8px] font-black text-[#B91C1C] uppercase tracking-[0.2em] flex items-center gap-1.5 opacity-0 group-hover/link:opacity-100 transition-opacity">
                                                                    <Zap size={10} className="fill-[#B91C1C]" /> HIGH CONFIDENCE
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
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                            <Search size={32} className="text-slate-200" />
                        </div>
                        <h3 className="text-lg font-black text-slate-300 uppercase tracking-widest italic mb-2">Aucun pont identifié</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Importez plus de documents pour activer la découverte</p>
                    </div>
                )}
            </div>

            <div className="fixed bottom-10 right-10 rotate-90 origin-right pointer-events-none opacity-[0.05] z-0">
                <span className="text-[10px] font-black text-black uppercase tracking-[2em] whitespace-nowrap italic font-serif-legal">IA DISCOVERY PROTOCOL ACTIVATE</span>
            </div>
        </div>
    );
};
