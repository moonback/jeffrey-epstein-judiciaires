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

                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Document Source :</span>
                        <select
                            value={selectedDocId || ''}
                            onChange={(e) => setSelectedDocId(e.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 text-[11px] font-bold text-[#0F172A] focus:ring-2 focus:ring-[#B91C1C]/20 outline-none transition-all shadow-inner"
                        >
                            {results.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.id === selectedDocId ? '📍 ' : ''}{r.input.query.slice(0, 40)}...
                                </option>
                            ))}
                        </select>
                    </div>
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
                    <div className="max-w-6xl mx-auto space-y-8">
                        {discoveries.map((discovery, idx) => {
                            const otherDoc = results.find(r => r.id === discovery.doc2Id);
                            return (
                                <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 group overflow-hidden">
                                    <div className="flex flex-col lg:flex-row h-full">
                                        {/* Document Info Sidebar */}
                                        <div className="lg:w-80 border-r border-slate-50 p-8 flex flex-col bg-slate-50/30">
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="px-2 py-0.5 bg-black text-white text-[8px] font-black rounded uppercase tracking-widest">
                                                    Match {Math.round(discovery.totalStrength)}%
                                                </div>
                                                <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-[#B91C1C] to-red-400 transition-all duration-1000"
                                                        style={{ width: `${Math.min(100, discovery.totalStrength)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <h3 className="text-sm font-black text-[#0F172A] italic font-serif-legal mb-4 line-clamp-3">
                                                {otherDoc?.input.query}
                                            </h3>

                                            <button
                                                onClick={() => onNavigateToInvestigation?.(discovery.doc2Id)}
                                                className="mt-auto flex items-center justify-between px-5 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#B91C1C] hover:border-[#B91C1C]/20 transition-all group/btn shadow-sm"
                                            >
                                                Ouvrir Dossier
                                                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>

                                        {/* Links Content */}
                                        <div className="flex-1 p-8">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="w-1 h-3 bg-[#B91C1C] rounded-full"></div>
                                                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Liens Identifiés ({discovery.links.length})</h4>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {discovery.links.map((link, lIdx) => (
                                                    <div key={lIdx} className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group/link relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover/link:opacity-20 transition-opacity">
                                                            {getLinkIcon(link.type)}
                                                        </div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className={`p-2 rounded-lg ${link.type === 'pii' ? 'bg-emerald-50 text-emerald-600' :
                                                                    link.type === 'transaction' ? 'bg-red-50 text-[#B91C1C]' :
                                                                        'bg-blue-50 text-[#0F4C81]'
                                                                }`}>
                                                                {getLinkIcon(link.type)}
                                                            </div>
                                                            <span className="text-[11px] font-black text-[#0F172A] italic font-serif-legal">{link.label}</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium pl-10">
                                                            {link.description}
                                                        </p>
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
