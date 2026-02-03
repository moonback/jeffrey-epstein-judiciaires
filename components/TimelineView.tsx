import React, { useMemo, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { ProcessedResult } from '../types';
import { Clock, Calendar, ChevronRight, FileText, Search } from 'lucide-react';

interface TimelineEvent {
    date: Date;
    dateStr: string;
    title: string;
    description: string;
    sourceId: string;
    type: string;
}

export const TimelineView: React.FC = () => {
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
                // Try to parse date
                const dateStr = doc.date;
                if (!dateStr || dateStr.toLowerCase().includes('inconnue')) return;

                // Naive date parsing for common formats (e.g., "2005", "Janvier 2008")
                // In a real app, use a lib like date-fns or specialized LLM extraction
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

            // Also parse from key_facts if they have date patterns
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
        return <div className="h-full flex items-center justify-center">Chargement de la chronologie...</div>;
    }

    return (
        <div className="h-full flex flex-col bg-[#0F0F0F] overflow-hidden">
            <header className="p-8 border-b border-[#2D2D2D]">
                <h2 className="text-2xl font-bold text-[#E3E3E3] flex items-center gap-3">
                    <Clock className="text-[#FFD54F]" size={28} />
                    Chronologie Forensic
                </h2>
                <p className="text-[#8E918F] text-sm mt-1">
                    {events.length} événements extraits et ordonnés par date.
                </p>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto relative border-l-2 border-[#2D2D2D] pl-8 space-y-12 pb-20">
                    {events.map((event, idx) => (
                        <div key={idx} className="relative animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                            {/* Timeline Dot */}
                            <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-[#121212] border-2 border-[#FFD54F] shadow-[0_0_10px_rgba(255,213,79,0.3)]"></div>

                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="shrink-0 w-32">
                                    <div className="text-xl font-black text-[#FFD54F] tracking-tighter">
                                        {event.dateStr}
                                    </div>
                                    <div className="text-[10px] uppercase font-bold text-[#757775] mt-1 tracking-widest">
                                        {event.type}
                                    </div>
                                </div>

                                <div className="bg-[#1A1A1A] p-6 rounded-3xl border border-[#2D2D2D] border-l-4 border-l-[#FFD54F] flex-1 shadow-lg hover:shadow-2xl transition-all">
                                    <h3 className="text-[#E3E3E3] font-bold text-lg mb-2">{event.title}</h3>
                                    <p className="text-[#C4C7C5] text-sm leading-relaxed italic mb-4">
                                        {event.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono text-[#757775]">Dossier: {event.sourceId}</span>
                                        <button className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#FFD54F] hover:underline">
                                            Détails <ChevronRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {events.length === 0 && (
                        <div className="text-center py-20 opacity-30">
                            <Calendar size={64} className="mx-auto mb-4" />
                            <p>Aucune date exploitable trouvée dans les documents indexés.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
