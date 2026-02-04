/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { ProcessedResult, TransactionDetail } from '../types';
import {
    Clock, Calendar, ChevronRight, FileText, Search, Activity,
    CornerDownRight, Zap, ShieldCheck, Filter, TrendingUp,
    DollarSign, Briefcase, User, Scale, ArrowRight, Layers
} from 'lucide-react';

interface TimelineEvent {
    id: string;
    date: Date;
    dateStr: string;
    title: string;
    description: string;
    sourceId: string;
    type: 'DOCUMENT' | 'ÉVÉNEMENT_CLÉ' | 'TRANSACTION' | 'JURIDIQUE';
    metadata?: any;
}

interface TimelineViewProps {
    onDeepDive: (docTitle: string, style: 'standard' | 'simple' | 'technical') => void;
    isGuestMode?: boolean;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onDeepDive, isGuestMode }) => {
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('ALL');
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

    useEffect(() => {
        storageService.getAllResults().then(data => {
            setHistory(data);
            setLoading(false);
        });
    }, []);

    const events = useMemo(() => {
        const list: TimelineEvent[] = [];

        history.forEach(res => {
            if (!res.output) return;

            // 1. Documents
            res.output.documents?.forEach((doc, dIdx) => {
                const dateStr = doc.date;
                if (!dateStr || dateStr.toLowerCase().includes('inconnue')) return;

                const yearMatch = dateStr.match(/\d{4}/);
                if (yearMatch) {
                    const year = parseInt(yearMatch[0]);
                    list.push({
                        id: `doc-${res.id}-${dIdx}`,
                        date: new Date(year, 0, 1),
                        dateStr: dateStr,
                        title: doc.title,
                        description: doc.description,
                        sourceId: res.id,
                        type: 'DOCUMENT',
                        metadata: {
                            legal: doc.legal_implications,
                            docType: doc.type
                        }
                    });
                }
            });

            // 2. Key Facts
            res.output.documents?.forEach((doc, dIdx) => {
                doc.key_facts?.forEach((fact, fIdx) => {
                    const yearMatch = fact.match(/\b(19|20)\d{2}\b/);
                    if (yearMatch) {
                        const year = parseInt(yearMatch[0]);
                        list.push({
                            id: `fact-${res.id}-${dIdx}-${fIdx}`,
                            date: new Date(year, 0, 1),
                            dateStr: year.toString(),
                            title: "Fait Marquant",
                            description: fact,
                            sourceId: res.id,
                            type: 'ÉVÉNEMENT_CLÉ'
                        });
                    }
                });
            });

            // 3. Transactions
            res.output.transactions_financieres?.forEach((tx, tIdx) => {
                const yearMatch = tx.date.match(/\d{4}/);
                if (yearMatch) {
                    const year = parseInt(yearMatch[0]);
                    list.push({
                        id: `tx-${res.id}-${tIdx}`,
                        date: new Date(year, 0, 1),
                        dateStr: tx.date,
                        title: `Mouvement de fonds: ${tx.montant} ${tx.devise}`,
                        description: tx.description || `${tx.source} -> ${tx.destination}`,
                        sourceId: res.id,
                        type: 'TRANSACTION',
                        metadata: { ...tx }
                    });
                }
            });
        });

        // Sorting & Filtering
        let filtered = list.sort((a, b) => b.date.getTime() - a.date.getTime());

        if (searchTerm) {
            const lowSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(e =>
                e.title.toLowerCase().includes(lowSearch) ||
                e.description.toLowerCase().includes(lowSearch) ||
                e.dateStr.toLowerCase().includes(lowSearch)
            );
        }

        if (filterType !== 'ALL') {
            filtered = filtered.filter(e => e.type === filterType);
        }

        return filtered;
    }, [history, searchTerm, filterType]);

    // Grouping events by year for better visual flow
    const groupedEvents = useMemo(() => {
        const groups: { year: string; events: TimelineEvent[] }[] = [];
        events.forEach(event => {
            const year = event.date.getFullYear().toString();
            const existingGroup = groups.find(g => g.year === year);
            if (existingGroup) {
                existingGroup.events.push(event);
            } else {
                groups.push({ year, events: [event] });
            }
        });
        return groups;
    }, [events]);

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'DOCUMENT': return { color: 'text-[#B91C1C]', border: 'border-[#B91C1C]', bg: 'bg-[#B91C1C]/5', icon: <FileText size={14} /> };
            case 'ÉVÉNEMENT_CLÉ': return { color: 'text-[#B5965D]', border: 'border-[#B5965D]', bg: 'bg-[#B5965D]/5', icon: <Zap size={14} /> };
            case 'TRANSACTION': return { color: 'text-emerald-600', border: 'border-emerald-600', bg: 'bg-emerald-50', icon: <DollarSign size={14} /> };
            default: return { color: 'text-slate-500', border: 'border-slate-200', bg: 'bg-slate-50', icon: <Activity size={14} /> };
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-[3px] border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-t-[3px] border-[#B91C1C] rounded-full animate-spin"></div>
                        <Clock size={32} className="absolute inset-0 m-auto text-[#B91C1C] animate-pulse" />
                    </div>
                    <div className="space-y-2 text-center">
                        <span className="block text-xs font-black text-slate-800 uppercase tracking-[0.4em]">Reconstruction Temporelle</span>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Séquençage des données en cours...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <header className="px-6 lg:px-10 py-5 bg-white border-b border-slate-100 z-20 shadow-sm relative shrink-0">
                <div className="max-w-12xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#B91C1C] to-[#7F1D1D] rounded-2xl flex items-center justify-center shadow-xl shadow-red-900/10 rotate-3">
                            <Clock className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl lg:text-2xl font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight leading-tight">
                                Chronologie <span className="text-[#B91C1C]">Analytique</span>
                            </h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-[0.15em] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    Live Analysis
                                </span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                    {events.length} Entrées Détectées
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#B91C1C] transition-colors" />
                            <input
                                type="text"
                                placeholder="Rechercher un fait, une date..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium w-64 focus:w-80 transition-all duration-300 outline-none"
                            />
                        </div>

                        <div className="flex items-center bg-white border border-slate-100 p-1 rounded-xl shadow-sm">
                            <button
                                onClick={() => setFilterType('ALL')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filterType === 'ALL' ? 'bg-[#B91C1C] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Tous
                            </button>
                            <button
                                onClick={() => setFilterType('DOCUMENT')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filterType === 'DOCUMENT' ? 'bg-[#B91C1C] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Docs
                            </button>
                            <button
                                onClick={() => setFilterType('TRANSACTION')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filterType === 'TRANSACTION' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Fonds
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar z-10 scroll-smooth">
                <div className="max-w-5xl mx-auto relative pl-4 lg:pl-0">
                    {/* Central Vertical Line (for larger screens) */}
                    <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#B91C1C]/40 via-slate-100 to-transparent lg:-translate-x-1/2 hidden lg:block"></div>
                    <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-[1px] bg-slate-200 lg:-translate-x-1/2 lg:hidden"></div>

                    {groupedEvents.map((group, gIdx) => (
                        <div key={group.year} className="mb-20 last:mb-0">
                            {/* Year Marker */}
                            <div className="relative flex justify-center mb-16">
                                <div className="bg-white border-2 border-slate-100 px-8 py-2 rounded-2xl shadow-xl z-20 relative group hover:border-[#B91C1C] transition-colors duration-500">
                                    <div className="absolute inset-0 bg-[#B91C1C] blur-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                    <span className="text-2xl font-serif-legal font-black text-[#0F172A] italic tracking-tighter tabular-nums">
                                        {group.year}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-12">
                                {group.events.map((event, idx) => {
                                    const isEven = idx % 2 === 0;
                                    const styles = getTypeStyles(event.type);

                                    return (
                                        <div
                                            key={event.id}
                                            className={`relative flex flex-col lg:flex-row items-center gap-8 group animate-pro-reveal`}
                                            style={{ animationDelay: `${idx * 0.1}s` }}
                                        >
                                            {/* Left side (Even) / Right side (Odd) */}
                                            <div className={`hidden lg:block flex-1 ${isEven ? 'text-right' : 'order-last text-left'}`}>
                                                <div className="transition-all duration-500 group-hover:scale-105">
                                                    <div className={`text-xl font-serif-legal font-black ${styles.color} italic tracking-tighter mb-1`}>
                                                        {event.dateStr}
                                                    </div>
                                                    <div className={`flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isEven ? 'justify-end' : ''}`}>
                                                        {styles.icon}
                                                        {event.type.replace('_', ' ')}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Connector Marker */}
                                            <div className="absolute left-8 lg:left-1/2 w-4 h-4 rounded-full bg-white border-4 border-slate-100 group-hover:border-[#B91C1C] lg:-translate-x-1/2 z-30 transition-all duration-500 shadow-md group-hover:scale-125">
                                                <div className="absolute inset-0 bg-[#B91C1C] rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                                            </div>

                                            {/* Card Content */}
                                            <div className="flex-1 w-full lg:w-auto pl-12 lg:pl-0">
                                                <div
                                                    className={`
                                                        bg-white p-6 lg:p-8 rounded-[2.5rem] border border-transparent 
                                                        group-hover:border-slate-100 transition-all duration-500 shadow-sm 
                                                        hover:shadow-2xl hover:shadow-slate-200/50 relative overflow-hidden
                                                        cursor-pointer
                                                        ${expandedEvent === event.id ? 'ring-2 ring-[#B91C1C]/10' : ''}
                                                    `}
                                                    onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                                                >
                                                    {/* Type Accent */}
                                                    <div className={`absolute top-0 right-0 w-32 h-32 ${styles.bg} -mr-16 -mt-16 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700`}></div>

                                                    <div className="relative z-10">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <h3 className="text-[#0F172A] font-black text-lg lg:text-xl italic tracking-tight font-serif-legal leading-tight pr-10">
                                                                {event.title}
                                                            </h3>
                                                            <div className={`p-2 rounded-xl ${styles.bg} ${styles.color} border border-transparent group-hover:border-current/10 transition-all`}>
                                                                {styles.icon}
                                                            </div>
                                                        </div>

                                                        {/* Description / Content */}
                                                        <div className="bg-[#FFFFF0]/40 p-4 lg:p-5 rounded-2xl border border-slate-50 mb-5 relative group-hover:bg-[#FFFFF0] transition-colors duration-500">
                                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${styles.bg.replace('/5', '')} transition-all rounded-full`}></div>
                                                            <p className="text-slate-600 text-[13px] lg:text-sm leading-relaxed italic font-medium">
                                                                "{event.description}"
                                                            </p>
                                                        </div>

                                                        {/* Expanded Details */}
                                                        {expandedEvent === event.id && (
                                                            <div className="space-y-4 pt-2 pb-4 animate-pro-reveal border-t border-slate-50 mt-4">
                                                                {event.metadata?.legal && (
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2 text-[9px] font-black text-[#B91C1C] uppercase tracking-widest">
                                                                            <Scale size={10} /> Implications Légales
                                                                        </div>
                                                                        <p className="text-[12px] text-slate-500 leading-snug">
                                                                            {event.metadata.legal}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {event.type === 'TRANSACTION' && (
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="bg-slate-50 p-3 rounded-xl">
                                                                            <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Source</div>
                                                                            <div className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                                                                                <User size={10} /> {event.metadata.source}
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-slate-50 p-3 rounded-xl">
                                                                            <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Destination</div>
                                                                            <div className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                                                                                <ArrowRight size={10} /> {event.metadata.destination}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-slate-50">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center gap-2 text-[9px] font-mono-data font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                                    <Layers size={10} /> {event.sourceId.slice(0, 8)}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50">
                                                                    <ShieldCheck size={12} /> SECURE
                                                                </div>
                                                            </div>
                                                            {!isGuestMode && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onDeepDive(event.title, 'standard');
                                                                    }}
                                                                    className="flex items-center gap-2 text-[10px] font-black uppercase text-[#0F172A] hover:text-[#B91C1C] transition-all tracking-wider group/btn bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm hover:shadow-md"
                                                                >
                                                                    Analyse Profonde <ChevronRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-500" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {events.length === 0 && (
                        <div className="text-center py-40 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                            <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto mb-8 relative group">
                                <div className="absolute inset-0 bg-[#B91C1C]/5 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-all duration-700 scale-110"></div>
                                <Calendar size={56} className="text-slate-200 group-hover:text-[#B91C1C] transition-all duration-700" />
                            </div>
                            <h3 className="text-2xl font-black text-[#0F172A] uppercase tracking-[0.3em] mb-4 font-serif-legal italic">Flux Temporel Silencieux</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] max-w-sm mx-auto leading-relaxed">
                                Aucun point de données synchronisé pour les critères actuels.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <footer className="px-10 py-5 bg-white border-t border-slate-50 flex flex-wrap justify-between items-center gap-6 z-20">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#B91C1C] shadow-[0_0_8px_rgba(185,28,28,0.3)]"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Document Officiel</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#B5965D] shadow-[0_0_8px_rgba(181,150,93,0.3)]"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Événement Critique</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Flux Financier</span>
                    </div>
                </div>
                <div>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.6em] italic">Temporal Reconstruction Unit // v2.0</span>
                </div>
            </footer>
        </div>
    );
};

