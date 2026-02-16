/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { PageHeader } from './PageHeader';
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
                if (Array.isArray(doc.key_facts)) {
                    doc.key_facts.forEach((fact, fIdx) => {
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
                }
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
            case 'DOCUMENT': return { color: 'text-[var(--accent)]', border: 'border-[var(--accent)]', bg: 'bg-[var(--accent)]/5', icon: <FileText size={14} /> };
            case 'ÉVÉNEMENT_CLÉ': return { color: 'text-[var(--warning)]', border: 'border-[var(--warning)]', bg: 'bg-[var(--warning)]/5', icon: <Zap size={14} /> };
            case 'TRANSACTION': return { color: 'text-[var(--success)]', border: 'border-[var(--success)]', bg: 'bg-[var(--success)]/5', icon: <DollarSign size={14} /> };
            default: return { color: 'text-[var(--text-muted)]', border: 'border-[var(--border)]', bg: 'bg-[var(--surface-muted)]', icon: <Activity size={14} /> };
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-[var(--background)]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-[3px] border-[var(--surface-muted)] rounded-full"></div>
                        <div className="absolute inset-0 border-t-[3px] border-[var(--accent)] rounded-full animate-spin"></div>
                        <Clock size={32} className="absolute inset-0 m-auto text-[var(--accent)] animate-pulse" />
                    </div>
                    <div className="space-y-2 text-center">
                        <span className="block text-xs font-black text-[var(--text)] uppercase tracking-[0.4em]">Reconstruction Temporelle</span>
                        <span className="block text-[8px] font-bold text-[var(--text-dim)] uppercase tracking-widest">Séquençage des données en cours...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[var(--background)] overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <PageHeader
                title="Chronologie"
                titleHighlight="Analytique"
                icon={Clock}
                badgeText="Timeline Forensics"
                searchQuery={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Rechercher un fait, une date..."
                totalLabel="Points Temporels"
                totalCount={events.length}
                stats={[
                    {
                        label: "Live Analysis",
                        value: "",
                        icon: <div className="w-1.5 h-1.5 bg-[var(--success)] rounded-full animate-pulse"></div>
                    }
                ]}
            >
                <button
                    onClick={() => setFilterType('ALL')}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${filterType === 'ALL'
                        ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)] shadow-md'
                        : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'}`}
                >
                    Tous
                </button>
                <button
                    onClick={() => setFilterType('DOCUMENT')}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${filterType === 'DOCUMENT'
                        ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)] shadow-md'
                        : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'}`}
                >
                    Docs
                </button>
                <button
                    onClick={() => setFilterType('TRANSACTION')}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${filterType === 'TRANSACTION'
                        ? 'bg-[var(--success)] text-white border-[var(--success)] shadow-md'
                        : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'}`}
                >
                    Fonds
                </button>
            </PageHeader>

            <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar z-10 scroll-smooth">
                <div className="max-w-5xl mx-auto relative pl-4 lg:pl-0">
                    {/* Central Vertical Line (for larger screens) */}
                    <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[var(--accent)]/40 via-[var(--surface-muted)] to-transparent lg:-translate-x-1/2 hidden lg:block"></div>
                    <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-[1px] bg-[var(--border)] lg:-translate-x-1/2 lg:hidden"></div>

                    {groupedEvents.map((group, gIdx) => (
                        <div key={group.year} className="mb-20 last:mb-0">
                            {/* Year Marker */}
                            <div className="relative flex justify-center mb-16">
                                <div className="bg-[var(--surface)] border-2 border-[var(--border)] px-8 py-2 rounded-[var(--radius-xl)] shadow-[var(--shadow-soft)] z-20 relative group hover:border-[var(--accent)] transition-colors duration-500">
                                    <div className="absolute inset-0 bg-[var(--accent)] blur-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                    <span className="text-2xl font-legal font-black text-[var(--text)] italic tracking-tighter tabular-nums">
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
                                                    <div className={`text-xl font-legal font-black ${styles.color} italic tracking-tighter mb-1`}>
                                                        {event.dateStr}
                                                    </div>
                                                    <div className={`flex items-center gap-2 text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest ${isEven ? 'justify-end' : ''}`}>
                                                        {styles.icon}
                                                        {event.type.replace('_', ' ')}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Connector Marker */}
                                            <div className="absolute left-8 lg:left-1/2 w-4 h-4 rounded-full bg-[var(--surface)] border-4 border-[var(--border)] group-hover:border-[var(--accent)] lg:-translate-x-1/2 z-30 transition-all duration-500 shadow-md group-hover:scale-125">
                                                <div className="absolute inset-0 bg-[var(--accent)] rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                                            </div>

                                            {/* Card Content */}
                                            <div className="flex-1 w-full lg:w-auto pl-12 lg:pl-0">
                                                <div
                                                    className={`
                                                        bg-[var(--surface)] p-6 lg:p-8 rounded-[var(--radius-2xl)] border border-transparent 
                                                        group-hover:border-[var(--border)] transition-all duration-500 shadow-[var(--shadow-subtle)] 
                                                        hover:shadow-[var(--shadow-premium)] relative overflow-hidden
                                                        cursor-pointer
                                                        ${expandedEvent === event.id ? 'ring-2 ring-[var(--accent)]/10' : ''}
                                                    `}
                                                    onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                                                >
                                                    {/* Type Accent */}
                                                    <div className={`absolute top-0 right-0 w-32 h-32 ${styles.bg} -mr-16 -mt-16 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700`}></div>

                                                    <div className="relative z-10">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <h3 className="text-[var(--text)] font-black text-lg lg:text-xl italic tracking-tight font-legal leading-tight pr-10">
                                                                {event.title}
                                                            </h3>
                                                            <div className={`p-2 rounded-xl ${styles.bg} ${styles.color} border border-transparent group-hover:border-current/10 transition-all`}>
                                                                {styles.icon}
                                                            </div>
                                                        </div>

                                                        {/* Description / Content */}
                                                        <div className="bg-[var(--surface-muted)]/40 p-4 lg:p-5 rounded-[var(--radius-xl)] border border-[var(--border)]/50 mb-5 relative group-hover:bg-[var(--surface-muted)] transition-colors duration-500">
                                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${styles.bg.replace('/5', '')} transition-all rounded-full`}></div>
                                                            <p className="text-[var(--text-muted)] text-[13px] lg:text-sm leading-relaxed italic font-medium">
                                                                "{event.description}"
                                                            </p>
                                                        </div>

                                                        {/* Expanded Details */}
                                                        {expandedEvent === event.id && (
                                                            <div className="space-y-4 pt-2 pb-4 animate-reveal border-t border-[var(--border)]/50 mt-4">
                                                                {event.metadata?.legal && (
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2 text-[9px] font-black text-[var(--accent)] uppercase tracking-widest">
                                                                            <Scale size={10} /> Implications Légales
                                                                        </div>
                                                                        <p className="text-[12px] text-[var(--text-muted)] leading-snug">
                                                                            {event.metadata.legal}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {event.type === 'TRANSACTION' && (
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="bg-[var(--surface-muted)]/50 p-3 rounded-[var(--radius-lg)]">
                                                                            <div className="text-[8px] font-black text-[var(--text-dim)] uppercase mb-1">Source</div>
                                                                            <div className="text-[11px] font-black text-[var(--text)] flex items-center gap-1">
                                                                                <User size={10} /> {event.metadata.source}
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-[var(--surface-muted)]/50 p-3 rounded-[var(--radius-lg)]">
                                                                            <div className="text-[8px] font-black text-[var(--text-dim)] uppercase mb-1">Destination</div>
                                                                            <div className="text-[11px] font-black text-[var(--text)] flex items-center gap-1">
                                                                                <ArrowRight size={10} /> {event.metadata.destination}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[var(--border)]/50">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center gap-2 text-[9px] font-mono-data font-black text-[var(--text-dim)] bg-[var(--surface-muted)]/50 px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--border)]/50">
                                                                    <Layers size={10} /> {event.sourceId.slice(0, 8)}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[9px] font-black text-[var(--success)] uppercase tracking-widest bg-[var(--success)]/10 px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--success)]/20">
                                                                    <ShieldCheck size={12} /> SECURE
                                                                </div>
                                                            </div>
                                                            {!isGuestMode && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onDeepDive(event.title, 'standard');
                                                                    }}
                                                                    className="flex items-center gap-2 text-[10px] font-black uppercase text-[var(--primary)] hover:text-[var(--accent)] transition-all tracking-wider group/btn bg-[var(--surface)] hover:bg-[var(--surface-muted)] px-4 py-2 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-sm hover:shadow-md"
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
                        <div className="text-center py-40 bg-[var(--surface)] rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-sm">
                            <div className="w-32 h-32 bg-[var(--surface-muted)] rounded-[var(--radius-xl)] flex items-center justify-center mx-auto mb-8 relative group">
                                <div className="absolute inset-0 bg-[var(--accent)]/5 rounded-[var(--radius-xl)] opacity-0 group-hover:opacity-100 transition-all duration-700 scale-110"></div>
                                <Calendar size={56} className="text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-all duration-700" />
                            </div>
                            <h3 className="text-2xl font-black text-[var(--text)] uppercase tracking-[0.3em] mb-4 font-legal italic">Flux Temporel Silencieux</h3>
                            <p className="text-[var(--text-dim)] font-bold uppercase tracking-[0.2em] text-[10px] max-w-sm mx-auto leading-relaxed">
                                Aucun point de données synchronisé pour les critères actuels.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <footer className="px-10 py-5 bg-[var(--surface)] border-t border-[var(--border)] flex flex-wrap justify-between items-center gap-6 z-20">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_rgba(185,28,28,0.3)]"></div>
                        <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">Document Officiel</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--warning)] shadow-[0_0_8px_rgba(245,158,11,0.3)]"></div>
                        <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">Événement Critique</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)] shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                        <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">Flux Financier</span>
                    </div>
                </div>
                <div>
                    <span className="text-[9px] font-black text-[var(--text-dim)]/40 uppercase tracking-[0.6em] italic">Temporal Reconstruction Unit // v5.0</span>
                </div>
            </footer>
        </div>
    );
};

