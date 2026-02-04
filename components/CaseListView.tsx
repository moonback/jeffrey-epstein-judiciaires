/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ProcessedResult } from '../types';
import { Search, Folder, Calendar, ArrowUpRight, ShieldCheck, Activity, Database, Clock, FileText, Filter, LayoutGrid, List } from 'lucide-react';

interface CaseListViewProps {
    history: ProcessedResult[];
    onOpenInvestigation: (id: string) => void;
}

export const CaseListView: React.FC<CaseListViewProps> = ({ history, onOpenInvestigation }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

    const filteredCases = useMemo(() => {
        return history.filter(item =>
            item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.input.query.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => b.input.timestamp - a.input.timestamp);
    }, [history, searchTerm]);

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden relative font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <header className="px-6 lg:px-12 py-8 lg:py-10 border-b border-slate-100 bg-white/90 backdrop-blur-2xl z-20 shrink-0 shadow-sm relative">
                <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none opacity-50"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-black rounded-[1.5rem] flex items-center justify-center shadow-2xl group transition-all hover:rotate-6">
                            <Database className="text-white group-hover:scale-110 transition-transform" size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight leading-none mb-2">Index des <span className="text-[#B91C1C]">Dossiers</span></h2>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Base de Données Forensique Sécurisée</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="relative group w-full lg:w-96">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-[#B91C1C] transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Rechercher par ID ou mot-clé..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="bg-[#F8FAFC] border border-slate-100 rounded-2xl py-3.5 pl-14 pr-6 text-sm text-[#0F172A] w-full focus:bg-white focus:border-[#B91C1C] outline-none transition-all shadow-inner placeholder-slate-300 font-bold"
                            />
                        </div>

                        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
                            <button
                                onClick={() => setViewLayout('grid')}
                                className={`p-2 rounded-lg transition-all ${viewLayout === 'grid' ? 'bg-white text-[#B91C1C] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewLayout('list')}
                                className={`p-2 rounded-lg transition-all ${viewLayout === 'list' ? 'bg-white text-[#B91C1C] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar z-10">
                <div className="max-w-7xl mx-auto pb-40">
                    {filteredCases.length > 0 ? (
                        <div className={viewLayout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" : "space-y-4"}>
                            {filteredCases.map((res, idx) => (
                                <div
                                    key={res.id}
                                    onClick={() => onOpenInvestigation(res.id)}
                                    className={`
                                        group bg-white border border-slate-100 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:border-[#B91C1C]/20 relative overflow-hidden animate-pro-reveal
                                        ${viewLayout === 'grid'
                                            ? 'rounded-[3rem] p-10 flex flex-col hover:-translate-y-2'
                                            : 'rounded-[1.5rem] p-6 pr-10 flex items-center gap-10 hover:translate-x-2'}
                                    `}
                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                >
                                    {/* Case ID & Date */}
                                    <div className={`flex flex-col ${viewLayout === 'grid' ? 'mb-8' : 'w-48 shrink-0'}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-[#B91C1C]"></div>
                                            <span className="text-[12px] font-mono-data font-black text-[#B91C1C] tracking-[0.2em]">{res.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest pl-5">
                                            <Clock size={10} />
                                            {new Date(res.input.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>

                                    {/* Query Content */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h3 className={`font-serif-legal italic font-black text-[#0F172A] group-hover:text-[#B91C1C] transition-colors line-clamp-2 leading-tight ${viewLayout === 'grid' ? 'text-2xl' : 'text-xl'}`}>
                                            {res.input.query}
                                        </h3>
                                        <div className={`flex items-center gap-4 mt-4 ${viewLayout === 'grid' ? '' : 'hidden xl:flex'}`}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{res.output?.documents?.length || 0} Pièces</span>
                                            </div>
                                            <div className="w-px h-2 bg-slate-100"></div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{res.output?.transactions_financieres?.length || 0} Flux</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Link Icon */}
                                    <div className={`absolute ${viewLayout === 'grid' ? 'bottom-10 right-10' : 'right-8 top-1/2 -translate-y-1/2'} transition-all duration-500 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 flex flex-col items-center gap-2`}>
                                        <div className="w-10 h-10 rounded-full bg-[#B91C1C] text-white flex items-center justify-center shadow-xl shadow-red-900/20">
                                            <ArrowUpRight size={20} />
                                        </div>
                                        <span className="text-[8px] font-black text-[#B91C1C] uppercase tracking-widest hidden xl:block">Ouvrir</span>
                                    </div>

                                    {/* Side Aesthetic Line */}
                                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-slate-50 group-hover:bg-[#B91C1C] transition-all"></div>
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                                        <Folder size={120} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[600px] bg-white border-2 border-dashed border-slate-100 rounded-[4rem] group animate-pro-reveal relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#B91C1C]/3 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-2000 pointer-events-none"></div>
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-[#B91C1C] blur-[60px] opacity-10 animate-pulse"></div>
                                <div className="relative w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center shadow-inner">
                                    <Folder size={48} className="text-slate-200" strokeWidth={1} />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-[0.5em] italic font-serif-legal">Archives Vides</h3>
                            <p className="mt-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center leading-relaxed">
                                Aucun dossier n'a été indexé par le moteur de recherche.<br />
                                Initialisez une nouvelle investigation pour peupler la base.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-10 px-8 py-3 bg-[#0F172A] hover:bg-[#B91C1C] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                            >
                                Recharger le Système
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Meta Label */}
            <div className="hidden xl:block fixed bottom-10 right-10 rotate-90 origin-right pointer-events-none z-0 opacity-[0.05]">
                <span className="text-[12px] font-black text-black uppercase tracking-[1.5em] whitespace-nowrap italic">NEURAL DATA INDEXER // UNIT 4.2 // SECURITY LEVEL ALPHA</span>
            </div>
        </div>
    );
};
