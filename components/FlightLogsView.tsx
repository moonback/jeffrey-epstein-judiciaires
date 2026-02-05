import React, { useMemo, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { ProcessedResult, FlightDetail } from '../types';
import {
    Plane,
    Users,
    MapPin,
    Calendar,
    Search,
    ArrowRight,
    ArrowUpRight,
    ArrowDownLeft,
    Shield,
    Activity,
    Maximize2,
    CalendarDays,
    Info,
    History,
    FileText,
    Globe
} from 'lucide-react';

export const FlightLogsView: React.FC = () => {
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPassenger, setSelectedPassenger] = useState<string | null>(null);

    useEffect(() => {
        storageService.getAllResults().then(data => {
            setHistory(data);
            setLoading(false);
        });
    }, []);

    const allFlights = useMemo(() => {
        const list: (FlightDetail & { parentId: string, parentTitle: string })[] = [];
        history.forEach(res => {
            if (res.output?.journaux_de_vol) {
                res.output.journaux_de_vol.forEach(f => {
                    list.push({
                        ...f,
                        parentId: res.id,
                        parentTitle: res.input.query || "Analyse Sans Titre"
                    });
                });
            }
        });

        return list.filter(f => {
            const passengers = Array.isArray(f.passagers) ? f.passagers : [];
            const matchesSearch =
                (f.source || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (f.depart || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (f.destination || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                passengers.some(p => {
                    const name = typeof p === 'string' ? p : ((p as any).nom || (p as any).name || String(p));
                    return name.toLowerCase().includes(searchQuery.toLowerCase());
                });

            const matchesPassenger = !selectedPassenger ||
                passengers.some(p => {
                    const name = typeof p === 'string' ? p : ((p as any).nom || (p as any).name || String(p));
                    return name === selectedPassenger;
                });

            return matchesSearch && matchesPassenger;
        }).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    }, [history, searchQuery, selectedPassenger]);

    const passengerStats = useMemo(() => {
        const stats: Record<string, number> = {};
        history.forEach(res => {
            res.output?.journaux_de_vol?.forEach(f => {
                if (Array.isArray(f.passagers)) {
                    f.passagers.forEach(p => {
                        const name = typeof p === 'string' ? p : ((p as any).nom || (p as any).name || "Inconnu");
                        stats[name] = (stats[name] || 0) + 1;
                    });
                }
            });
        });
        return Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);
    }, [history]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-[3px] border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-t-[3px] border-[#B91C1C] rounded-full animate-spin"></div>
                        <Plane size={32} className="absolute inset-0 m-auto text-[#B91C1C] animate-pulse" />
                    </div>
                    <div className="space-y-2 text-center">
                        <span className="block text-xs font-black text-slate-800 uppercase tracking-[0.4em]">Synchronisation des Logs Aériens</span>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">Analyse des manifestes de bord...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <header className="px-6 lg:px-10 py-6 bg-white border-b border-slate-100 z-30 shadow-sm relative shrink-0">
                <div className="max-w-12xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0F172A] to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl skew-x-[-12deg] group cursor-pointer hover:skew-x-0 transition-transform">
                            <Plane className="text-white" size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl lg:text-2xl font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight leading-none">
                                    Manifestes <span className="text-[#B91C1C]">Aériens</span>
                                </h2>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Lolita Express Logs</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                    <Globe size={10} /> Forensic Air-Trace
                                </span>
                                {selectedPassenger && (
                                    <button
                                        onClick={() => setSelectedPassenger(null)}
                                        className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors"
                                    >
                                        Passager: {selectedPassenger} (X)
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#B91C1C] transition-colors" />
                            <input
                                type="text"
                                placeholder="Rechercher un vol, passager, ville..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium w-64 focus:w-80 transition-all duration-300 outline-none shadow-inner focus:bg-white"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex z-10">
                {/* Sidebar: Top Passengers */}
                <aside className="w-[300px] border-r border-slate-100 bg-white/60 backdrop-blur-md overflow-y-auto custom-scrollbar p-6 space-y-8">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Users size={14} className="text-[#B91C1C]" /> Fréquence Passagers
                        </h3>
                        <div className="space-y-2">
                            {passengerStats.map(([name, count]) => (
                                <button
                                    key={name}
                                    onClick={() => setSelectedPassenger(name === selectedPassenger ? null : name)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedPassenger === name
                                        ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg'
                                        : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600 shadow-sm'
                                        }`}
                                >
                                    <span className="text-[11px] font-black italic truncate font-serif-legal">{name}</span>
                                    <span className={`text-[10px] font-mono-data font-bold px-2 py-0.5 rounded ${selectedPassenger === name ? 'bg-[#B91C1C]' : 'bg-slate-50 text-slate-400'}`}>
                                        {count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 bg-[#F8FAFC] border border-slate-50 rounded-2xl space-y-3">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Shield size={12} className="text-[#B5965D]" /> Audit Info
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">
                            Les journaux de vol sont extraits des archives publiques et des dépositions judiciaires. Les corrélations sont basées sur les manifestes de bord officiels.
                        </p>
                    </div>
                </aside>

                {/* Main Content: Flight List */}
                <main className="flex-1 overflow-y-auto p-10 custom-scrollbar scroll-smooth bg-[#F8FAFC]/30">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic leading-none">Chronologie des vols détectés</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                                {allFlights.length} ENTRIES
                            </span>
                        </div>

                        {allFlights.map((flight, idx) => (
                            <FlightCard key={idx} flight={flight} onPassengerClick={setSelectedPassenger} />
                        ))}

                        {allFlights.length === 0 && (
                            <div className="py-40 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                                <Plane size={48} className="mx-auto text-slate-100 mb-6" />
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest font-serif-legal italic mb-2">Aucun Vol Identifié</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Modifiez vos critères de recherche ou analysez de nouveaux dossiers</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

const FlightCard: React.FC<{ flight: any, onPassengerClick: (name: string) => void }> = ({ flight, onPassengerClick }) => {
    return (
        <div className="bg-white group rounded-[2.5rem] border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-700">
                <Plane size={120} />
            </div>

            <div className="p-8 flex flex-col xl:flex-row gap-10 relative z-10">
                {/* Left: Metadata */}
                <div className="xl:w-1/4 space-y-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
                            <CalendarDays size={20} />
                        </div>
                        <div>
                            <div className="text-[14px] font-black text-slate-900 font-mono-data italic">{flight.date}</div>
                            <div className="text-[9px] font-black text-[#B91C1C] uppercase tracking-widest">Date du Vol</div>
                        </div>
                    </div>
                    <div className="bg-[#F8FAFC] p-4 rounded-2x border border-slate-50 space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <Info size={10} /> Appareil
                        </div>
                        <div className="text-[12px] font-black text-slate-800 font-mono-data">{flight.source}</div>
                    </div>
                </div>

                {/* Center: Route */}
                <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between gap-8 bg-[#F8FAFC] p-6 rounded-[2rem] border border-slate-50">
                        <div className="flex-1">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <ArrowUpRight size={12} className="text-emerald-500" /> DÉPART
                            </div>
                            <div className="text-[16px] font-black text-slate-800 font-serif-legal italic">{flight.depart}</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-white rounded-full border border-slate-100 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <ArrowRight size={18} className="text-[#B91C1C]" />
                            </div>
                        </div>
                        <div className="flex-1 text-right">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center justify-end gap-2">
                                ARRIVÉE <ArrowDownLeft size={12} className="text-red-500" />
                            </div>
                            <div className="text-[16px] font-black text-slate-800 font-serif-legal italic text-right">{flight.destination}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2 pl-2">
                            <Users size={12} /> Passagers à bord ({Array.isArray(flight.passagers) ? flight.passagers.length : 0})
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(flight.passagers) && flight.passagers.map((p: any, i: number) => {
                                const name = typeof p === 'string' ? p : ((p as any).nom || (p as any).name || "Inconnu");
                                return (
                                    <button
                                        key={i}
                                        onClick={() => onPassengerClick(name)}
                                        className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[10px] font-black font-serif-legal italic text-slate-600 hover:text-[#B91C1C] hover:border-[#B91C1C]/30 hover:shadow-md transition-all active:scale-95"
                                    >
                                        {name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Notes */}
                <div className="xl:w-1/4 flex flex-col justify-between">
                    <div className="bg-[#FFFFF0]/50 p-6 rounded-2xl border border-[#B5965D]/10 relative group-hover:bg-[#FFFFF0] transition-colors h-full flex flex-col">
                        <div className="absolute left-0 top-4 bottom-4 w-1 bg-slate-100 group-hover:bg-[#B91C1C] transition-colors rounded-full"></div>
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3 italic">Annotations Forensiques</div>
                        <p className="text-[12px] text-slate-600 leading-relaxed italic font-medium">"{flight.description || 'Manifeste standard, aucune anomalie signalée par le pilote.'}"</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
