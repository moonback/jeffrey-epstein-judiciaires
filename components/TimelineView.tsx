/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { ProcessedResult } from '../types';
import { Clock, Calendar, ChevronRight, FileText, Search, Activity, CornerDownRight, Zap, ShieldCheck } from 'lucide-react';

interface TimelineEvent {
    date: Date;
    dateStr: string;
    title: string;
    description: string;
    sourceId: string;
    type: string;
}

interface TimelineViewProps {
    onDeepDive: (docTitle: string, style: 'standard' | 'simple' | 'technical') => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onDeepDive }) => {
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        storageService.getAllResults().then(data => {
            setHistory(data);
            setLoading(false);
        });
    }, []);

    const events = useMemo(() => {
        const list: TimelineEvent[] = [];

        history.forEach(res => {
            if (!res.output?.documents) return;

            res.output.documents.forEach(doc => {
                const dateStr = doc.date;
                if (!dateStr || dateStr.toLowerCase().includes('inconnue')) return;

                const yearMatch = dateStr.match(/\d{4}/);
                if (yearMatch) {
                    const year = parseInt(yearMatch[0]);
                    list.push({
                        date: new Date(year, 0, 1),
                        dateStr: dateStr,
                        title: doc.title,
                        description: doc.description,
                        sourceId: res.id,
                        type: doc.type
                    });
                }
            });

            res.output.documents.forEach(doc => {
                doc.key_facts.forEach(fact => {
                    const yearMatch = fact.match(/\b(19|20)\d{2}\b/);
                    if (yearMatch) {
                        const year = parseInt(yearMatch[0]);
                        list.push({
                            date: new Date(year, 0, 1),
                            dateStr: year.toString(),
                            title: "Fait Marquant",
                            description: fact,
                            sourceId: res.id,
                            type: "ÉVÉNEMENT_CLÉ"
                        });
                    }
                });
            });
        });

        return list.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [history]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-white animate-pro-reveal">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-[2px] border-slate-50 rounded-full"></div>
                        <div className="absolute inset-0 border-t-[2px] border-[#B91C1C] rounded-full animate-spin"></div>
                        <Clock size={24} className="absolute inset-0 m-auto text-[#B91C1C] animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">Séquençage Chronologique...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <header className="px-6 lg:px-12 h-16 lg:h-20 border-b border-slate-100 bg-white/90 backdrop-blur-xl z-10 flex justify-between items-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none opacity-50"></div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-10 h-10 bg-[#B91C1C] rounded-[1rem] flex items-center justify-center shadow-xl shadow-red-900/10">
                        <Clock className="text-white" size={18} />
                    </div>
                    <div>
                        <h2 className="text-lg lg:text-xl font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight leading-tight">Chronologie <span className="text-[#B91C1C]">Analytique</span></h2>
                        <div className="flex items-center gap-3 mt-0.5">
                            <Zap size={10} className="text-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                {events.length} Points Temporels Synchronisés
                            </span>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-6 text-right relative z-10">
                    <div>
                        <div className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Période d'Investigation</div>
                        <div className="text-sm font-mono-data font-black text-[#B91C1C] bg-white px-4 py-1.5 border border-slate-100 rounded-xl shadow-sm">
                            {events.length > 0 ? `${events[events.length - 1].dateStr} — ${events[0].dateStr}` : 'STDBY'}
                        </div>
                    </div>
                    <div className="h-8 w-px bg-slate-100"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Live Order</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 lg:p-16 custom-scrollbar z-10 scroll-smooth">
                <div className="max-w-5xl mx-auto relative border-l-2 border-slate-100 pl-8 lg:pl-16 space-y-12 pb-40">
                    {/* Vertical line glow */}
                    <div className="absolute -left-[2px] top-0 bottom-40 w-[2px] bg-gradient-to-b from-[#B91C1C]/20 via-slate-100 to-transparent"></div>

                    {events.map((event, idx) => (
                        <div key={idx} className="relative animate-pro-reveal group" style={{ animationDelay: `${idx * 0.05}s` }}>
                            {/* Marker - Enhanced Pro Style */}
                            <div className="absolute -left-[41px] lg:-left-[73px] top-4 flex items-center justify-center">
                                <div className="absolute inset-0 bg-[#B91C1C] blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500 scale-150"></div>
                                <div className="relative w-4 h-4 rounded-full bg-white border-4 border-slate-100 group-hover:border-[#B91C1C] shadow-lg transition-all duration-500 group-hover:scale-125 z-20"></div>
                                <div className="absolute left-6 h-px w-6 bg-slate-50 group-hover:bg-[#B91C1C]/20 transition-all"></div>
                            </div>

                            <div className="flex flex-col xl:grid xl:grid-cols-12 gap-8">
                                {/* Date Side */}
                                <div className="xl:col-span-2 pt-2">
                                    <div className="text-xl font-serif-legal font-black text-[#B91C1C] italic tracking-tighter leading-none mb-3 tabular-nums group-hover:scale-110 origin-left transition-transform duration-500">
                                        {event.dateStr}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-1 w-1 bg-slate-200 rounded-full"></div>
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] group-hover:text-slate-500 transition-colors">
                                            {event.type}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Side */}
                                <div className="xl:col-span-10">
                                    <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 group-hover:border-[#B91C1C]/10 transition-all duration-700 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 relative overflow-hidden">
                                        {/* Background ID Marker */}
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                                            <div className="text-[100px] font-black italic select-none">{String(idx + 1).padStart(2, '0')}</div>
                                        </div>

                                        <div className="relative z-10">
                                            <h3 className="text-[#0F172A] font-black text-lg mb-4 italic tracking-tight flex items-center gap-4 group-hover:text-[#B91C1C] transition-colors font-serif-legal leading-tight">
                                                {event.title}
                                            </h3>

                                            <div className="bg-[#FFFFF0]/40 p-6 rounded-[1.5rem] border border-slate-50 mb-6 relative group-hover:bg-[#FFFFF0] transition-colors backdrop-blur-sm">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B91C1C]/10 rounded-full group-hover:bg-[#B91C1C] transition-all"></div>
                                                <p className="text-slate-600 text-sm lg:text-[15px] leading-[1.6] italic font-medium selection:bg-yellow-100">
                                                    "{event.description}"
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 text-[9px] font-mono-data font-black text-slate-300 bg-white border border-slate-50 px-3 py-1.5 rounded-lg shadow-sm">
                                                        <FileText size={10} />
                                                        REF: {event.sourceId.slice(0, 8)}
                                                    </div>
                                                    <div className="h-4 w-px bg-slate-100"></div>
                                                    <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50 shadow-sm group-hover:bg-emerald-100 transition-colors">
                                                        <ShieldCheck size={12} /> SECURE LOG
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onDeepDive(event.title, 'standard')}
                                                    className="flex items-center gap-2 text-[10px] font-black uppercase text-[#0F172A] hover:text-[#B91C1C] transition-all tracking-[0.15em] group/btn bg-slate-50 hover:bg-white px-5 py-2 rounded-xl border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md"
                                                >
                                                    Visualiser Dossier <ChevronRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {events.length === 0 && (
                        <div className="text-center py-40 animate-pro-reveal">
                            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-50 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[#B91C1C]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <Calendar size={40} className="text-slate-200 group-hover:text-[#B91C1C] transition-all duration-700" />
                            </div>
                            <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-[0.4em] mb-3 font-serif-legal italic">Flux Temporel Vide</h3>
                            <div className="flex items-center justify-center gap-3">
                                <div className="h-px w-10 bg-slate-100"></div>
                                <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-[9px]">
                                    Séquenceur en attente de données qualifiées
                                </p>
                                <div className="h-px w-10 bg-slate-100"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Legend / Status Bar */}
            <footer className="px-6 py-3 bg-white border-t border-slate-50 flex justify-between items-center z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border border-slate-200"></div>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Marker Standby</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#B91C1C]"></div>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Verified Proof</span>
                    </div>
                </div>
                <div>
                    <span className="text-[8px] font-black text-slate-200 uppercase tracking-[0.5em] italic">Unit-01 Temporal Processor</span>
                </div>
            </footer>
        </div>
    );
};
