/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CorrelationService, Correlation } from '../services/correlationService';
import { Network, Link2, AlertTriangle, Search, Fingerprint, Activity, Layers, Repeat, ShieldAlert, Zap } from 'lucide-react';

export const CrossSessionView: React.FC = () => {
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

            <header className="px-6 lg:px-10 py-5 lg:py-6 border-b border-slate-100 bg-white/90 backdrop-blur-xl z-20 shrink-0 shadow-sm relative">
                <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none opacity-50"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg transition-transform hover:rotate-6">
                            <Repeat size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg lg:text-xl font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight leading-tight">Intelligence <span className="text-[#B91C1C]">Croisée</span></h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-[#B91C1C] animate-pulse"></span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Détection de Récurrences Multi-Sessions</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative group w-full lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#B91C1C] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Rechercher une entité liée..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-[#F8FAFC] border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-[12px] text-[#0F172A] focus:border-[#B91C1C] focus:bg-white outline-none transition-all w-full shadow-inner placeholder-slate-300 font-medium"
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar z-10">
                <div className="max-w-5xl mx-auto space-y-8 pb-20">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((c, i) => (
                            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                                {/* Risk Gradient Glow */}
                                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 transition-opacity group-hover:opacity-20 ${c.riskScore > 7 ? 'bg-[#B91C1C]' : 'bg-[#0F4C81]'}`}></div>

                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-black group-hover:border-black transition-all">
                                            <Fingerprint size={18} className="text-slate-300 group-hover:text-white transition-colors" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono-data">#{i + 1}</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${c.riskScore > 7 ? 'bg-red-50 text-[#B91C1C] border-red-100' : 'bg-blue-50 text-[#0F4C81] border-blue-100'}`}>
                                        Risque: {c.riskScore}/10
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-[#0F172A] italic font-serif-legal mb-4 group-hover:text-[#B91C1C] transition-colors line-clamp-1">{c.entity}</h3>

                                <div className="space-y-4 mb-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                            <Link2 size={14} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Récurrences détectées</div>
                                            <div className="text-[13px] font-black text-slate-700 italic font-serif-legal">{c.occurrences} Investigations distinctes</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-50 relative z-10 group-hover:bg-white transition-colors">
                                    <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                        <Activity size={10} /> Cluster d'Enquêtes liées
                                    </h4>
                                    <div className="space-y-3">
                                        {c.relatedInvestigations.map((inv, idx) => (
                                            <div key={idx} className="text-[11px] font-medium text-slate-600 italic border-l-2 border-slate-50 pl-3 group-hover:border-[#B91C1C]/20 transition-colors line-clamp-1">
                                                "{inv}"
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-[#B91C1C] transition-colors relative z-10">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert size={12} /> ALERTE CORRÉLATION
                                    </div>
                                    <Zap size={12} className="opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {correlations.length === 0 && (
                        <div className="text-center py-40 opacity-30 italic text-[11px] font-black uppercase tracking-widest animate-pro-reveal">
                            Aucun point de divergence ou de convergence transversale détecté
                        </div>
                    )}
                </div>
            </div>

            {/* Label */}
            <div className="fixed bottom-10 right-10 rotate-90 origin-right pointer-events-none opacity-[0.02] z-0">
                <span className="text-[10px] font-black text-black uppercase tracking-[1.5em] whitespace-nowrap">CROSS-SESSION INTELLIGENCE UNIT // PROTOCOL 9</span>
            </div>
        </div>
    );
};
