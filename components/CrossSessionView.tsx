/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CorrelationService, Correlation } from '../services/correlationService';
import { Network, Link2, AlertTriangle, Search, Fingerprint, Activity, Repeat, ShieldAlert, Zap, DollarSign, ArrowUpRight } from 'lucide-react';

interface CrossSessionViewProps {
    onNavigateToInvestigation?: (id: string) => void;
}

export const CrossSessionView: React.FC<CrossSessionViewProps> = ({ onNavigateToInvestigation }) => {
    const [correlations, setCorrelations] = useState<Correlation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        CorrelationService.getCrossSessionCorrelations().then(data => {
            setCorrelations(data);
            setLoading(false);
        });
    }, []);

    const filtered = useMemo(() => {
        return correlations.filter(c => c.entity.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [correlations, searchQuery]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-white animate-pro-reveal">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-[2px] border-slate-50 rounded-full"></div>
                        <div className="absolute inset-0 border-t-[2px] border-[#B91C1C] rounded-full animate-spin"></div>
                        <Network size={24} className="absolute inset-0 m-auto text-[#B91C1C] animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">Computing Neural Links...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <header className="px-6 lg:px-10 py-4 border-b border-slate-100 bg-white/90 backdrop-blur-xl z-20 shrink-0 shadow-sm relative">
                <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none opacity-50"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 lg:w-9 lg:h-9 bg-black rounded-xl flex items-center justify-center shadow-lg transition-transform hover:rotate-6">
                            <Repeat size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-md lg:text-lg font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight leading-tight">Intelligence <span className="text-[#B91C1C]">Croisée</span></h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-[#B91C1C] animate-pulse"></span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Détection de Récurrences Multi-Sessions</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative group w-full lg:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#B91C1C] transition-colors" size={12} />
                        <input
                            type="text"
                            placeholder="Rechercher une entité..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-[#F8FAFC] border border-slate-100 rounded-lg py-1.5 pl-9 pr-3 text-[11px] text-[#0F172A] focus:border-[#B91C1C] focus:bg-white outline-none transition-all w-full shadow-inner placeholder-slate-300 font-medium"
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar z-10">
                <div className="max-w-12xl mx-auto space-y-6 pb-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((c, i) => (
                            <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden flex flex-col">
                                <div className={`absolute top-0 right-0 w-24 h-24 blur-[50px] opacity-10 transition-opacity group-hover:opacity-20 ${c.riskScore > 7 ? 'bg-[#B91C1C]' : 'bg-[#0F4C81]'}`}></div>

                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-black group-hover:border-black transition-all">
                                            <Fingerprint size={16} className="text-slate-300 group-hover:text-white transition-colors" />
                                        </div>
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest font-mono-data">#{i + 1}</span>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${c.riskScore > 7 ? 'bg-red-50 text-[#B91C1C] border-red-100' : 'bg-blue-50 text-[#0F4C81] border-blue-100'}`}>
                                        Neural: {c.riskScore}/10
                                    </div>
                                </div>

                                <h3 className="text-md font-black text-[#0F172A] italic font-serif-legal mb-4 group-hover:text-[#B91C1C] transition-colors truncate">{c.entity}</h3>

                                <div className="space-y-3 mb-5 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-white transition-colors shrink-0">
                                            <Link2 size={14} className="text-[#0F4C81]" />
                                        </div>
                                        <div>
                                            <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Impact</div>
                                            <div className="text-[11px] font-black text-slate-700 italic font-serif-legal">{c.occurrences} Enquêtes</div>
                                        </div>
                                    </div>

                                    {(c as any).piiCount > 0 && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-white transition-colors shrink-0">
                                                <ShieldAlert size={14} className="text-emerald-600" />
                                            </div>
                                            <div>
                                                <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">PII Correlés</div>
                                                <div className="text-[11px] font-black text-emerald-600 italic font-serif-legal">
                                                    {(c as any).piiCount} Coordonnées
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(c.totalAmountSent! > 0 || c.totalAmountReceived! > 0) && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center group-hover:bg-white transition-colors shrink-0">
                                                <DollarSign size={14} className="text-red-600" />
                                            </div>
                                            <div>
                                                <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Flux Total</div>
                                                <div className="text-[11px] font-black text-[#B91C1C] italic font-serif-legal">
                                                    {(c.totalAmountSent! + c.totalAmountReceived!).toLocaleString('fr-FR')} USD
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-50 relative z-10 group-hover:bg-white transition-colors mb-4 flex-1">
                                    {c.sharedThematics.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {c.sharedThematics.slice(0, 3).map((theme, idx) => (
                                                <span key={idx} className="bg-white/80 text-slate-500 text-[7px] font-black uppercase px-2 py-0.5 rounded border border-slate-100 shadow-sm">
                                                    {theme}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <Activity size={10} /> Investigations
                                    </h4>
                                    <div className="space-y-2">
                                        {c.relatedInvestigations.slice(0, 2).map((invId, idx) => (
                                            <button
                                                key={invId}
                                                onClick={() => onNavigateToInvestigation?.(invId)}
                                                className="w-full text-left flex items-center group/inv cursor-pointer"
                                            >
                                                <div className="text-[10px] font-medium text-slate-600 italic border-l-2 border-slate-200 pl-3 group-hover/inv:border-[#B91C1C] group-hover/inv:text-[#B91C1C] transition-colors line-clamp-1 flex-1 py-0.5">
                                                    Doc #{invId.slice(0, 8)}
                                                </div>
                                                <ArrowUpRight size={10} className="text-slate-200 opacity-0 group-hover/inv:opacity-100 transition-all shrink-0 ml-1" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-300 group-hover:text-[#B91C1C] transition-colors relative z-10">
                                    <div className="flex items-center gap-1.5">
                                        <ShieldAlert size={12} /> ALERTE ACTIVE
                                    </div>
                                    <Zap size={12} className="opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-20 opacity-30 italic text-[10px] font-black uppercase tracking-widest animate-pro-reveal">
                            Aucune convergence détectée
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed bottom-10 right-10 rotate-90 origin-right pointer-events-none opacity-[0.01] z-0">
                <span className="text-[8px] font-black text-black uppercase tracking-[1.5em] whitespace-nowrap italic">CROSS-SESSION INTELLIGENCE UNIT</span>
            </div>
        </div>
    );
};
