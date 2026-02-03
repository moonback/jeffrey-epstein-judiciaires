import React, { useMemo, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { ProcessedResult } from '../types';
import { Clock, Calendar, ChevronRight, FileText, Search, Activity, CornerDownRight } from 'lucide-react';

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
                            title: "Événement extrait",
                            description: fact,
                            sourceId: res.id,
                            type: "FAIT_MARQUANT"
                        });
                    }
                });
            });
        });

        return list.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [history]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-[#0A0A0A]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-t-2 border-[#FFD54F] rounded-full animate-spin"></div>
                        <Clock size={24} className="absolute inset-0 m-auto text-[#FFD54F]" />
                    </div>
                    <span className="text-[11px] font-black text-[#757775] uppercase tracking-[0.3em]">Reconstructing Timeline...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0A0A0A] overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.2]"
                style={{ backgroundImage: 'linear-gradient(to right, #1F1F1F 1px, transparent 1px), linear-gradient(to bottom, #1F1F1F 1px, transparent 1px)', backgroundSize: '64px 64px' }}>
            </div>

            <header className="p-10 border-b border-[#1F1F1F] bg-[#0F0F0F]/50 backdrop-blur-3xl z-10 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#FFD54F]/10 rounded-lg">
                            <Clock className="text-[#FFD54F]" size={20} />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">Chronologie Forensic</h2>
                    </div>
                    <p className="text-[#757775] text-[12px] font-bold uppercase tracking-widest pl-12 flex items-center gap-2">
                        <Activity size={12} className="text-[#6DD58C]" />
                        {events.length} Data Points Syncronisés
                    </p>
                </div>
                <div className="hidden lg:block text-right pb-1">
                    <div className="text-[11px] font-black text-[#444746] uppercase tracking-[0.2em] mb-1">Time Range</div>
                    <div className="text-lg font-mono font-black text-[#FFD54F]">
                        {events.length > 0 ? `${events[events.length - 1].dateStr} — ${events[0].dateStr}` : 'N/A'}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar z-10">
                <div className="max-w-5xl mx-auto relative border-l-2 border-[#1F1F1F] pl-12 space-y-16 pb-32">
                    {events.map((event, idx) => (
                        <div key={idx} className="relative animate-in slide-in-from-left-8 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                            {/* Technical Dot */}
                            <div className="absolute -left-[55px] top-4 flex items-center justify-center">
                                <div className="absolute inset-0 bg-[#FFD54F] blur-md opacity-20 animate-pulse"></div>
                                <div className="relative w-3.5 h-3.5 rounded-full bg-[#0A0A0A] border-[3px] border-[#FFD54F] shadow-2xl"></div>
                            </div>

                            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 group">
                                {/* Date Side */}
                                <div className="lg:col-span-2 pt-2">
                                    <div className="text-xl font-black text-[#FFD54F] tracking-tighter leading-none mb-2 tabular-nums">
                                        {event.dateStr}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 h-[1px] bg-[#1F1F1F]"></span>
                                        <span className="text-[10px] font-black text-[#757775] uppercase tracking-widest truncate">
                                            {event.type}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Side */}
                                <div className="lg:col-span-10">
                                    <div className="bg-[#161616] p-8 rounded-[40px] border border-[#1F1F1F] group-hover:border-[#FFD54F]/30 transition-all shadow-xl hover:shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-white">
                                            <div className="text-8xl font-black">{idx + 1}</div>
                                        </div>

                                        <div className="relative z-10">
                                            <h3 className="text-white font-black text-lg mb-4 italic tracking-tight flex items-center gap-3">
                                                {event.title}
                                            </h3>
                                            <p className="text-[#C4C7C5] text-[13px] leading-relaxed mb-8 italic border-l-2 border-[#FFD54F]/20 pl-6">
                                                "{event.description}"
                                            </p>

                                            <div className="flex items-center justify-between border-t border-[#1F1F1F] pt-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-[11px] bg-[#0A0A0A] border border-[#2D2D2D] px-3 py-1.5 rounded-xl font-mono text-[#757775]">
                                                        ID: {event.sourceId}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[11px] font-black text-[#FFD54F] uppercase tracking-widest opacity-60">
                                                        <CornerDownRight size={12} /> Source Verified
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onDeepDive(event.title, 'standard')}
                                                    className="flex items-center gap-2 text-[11px] font-black uppercase text-white hover:text-[#FFD54F] transition-colors tracking-[0.1em]"
                                                >
                                                    Inspect Deep Dive <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {events.length === 0 && (
                        <div className="text-center py-40">
                            <div className="w-24 h-24 bg-[#161616] rounded-[40px] flex items-center justify-center mx-auto mb-6 border border-[#1F1F1F]">
                                <Calendar size={40} className="text-[#757775] opacity-20" />
                            </div>
                            <p className="text-[#757775] font-bold uppercase tracking-[0.2em] text-xs">
                                Aucun marqueur temporel détecté dans le cloud
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
