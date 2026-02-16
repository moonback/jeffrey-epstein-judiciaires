import React, { useMemo, useState, useEffect } from 'react';
import { PageHeader } from './PageHeader';
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
            <div className="h-full flex items-center justify-center bg-[var(--background)]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-[3px] border-[var(--surface-muted)] rounded-full"></div>
                        <div className="absolute inset-0 border-t-[3px] border-[var(--accent)] rounded-full animate-spin"></div>
                        <Plane size={32} className="absolute inset-0 m-auto text-[var(--accent)] animate-pulse" />
                    </div>
                    <div className="space-y-2 text-center">
                        <span className="block text-xs font-black text-[var(--text)] uppercase tracking-[0.4em]">Synchronisation des Logs Aériens</span>
                        <span className="block text-[8px] font-bold text-[var(--text-dim)] uppercase tracking-widest italic">Analyse des manifestes de bord...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[var(--background)] overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <PageHeader
                title="Manifestes"
                titleHighlight="Aériens"
                icon={Plane}
                badgeText="Forensic Air-Trace v2.0"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Rechercher un vol, passager, ville..."
                totalLabel="Vols Identifiés"
                totalCount={allFlights.length}
                stats={[
                    {
                        label: "Passagers",
                        value: passengerStats.length,
                        icon: <Users size={10} className="text-[var(--text-dim)]" />
                    }
                ]}
            >
                {selectedPassenger && (
                    <button
                        onClick={() => setSelectedPassenger(null)}
                        className="flex items-center gap-1.5 text-[9px] font-black text-[var(--success)] uppercase tracking-widest bg-[var(--success)]/5 px-3 py-1.5 rounded-xl border border-[var(--success)]/20 hover:bg-[var(--success)]/10 transition-colors shadow-sm"
                    >
                        Passager: {selectedPassenger} (X)
                    </button>
                )}
            </PageHeader>

            <div className="flex-1 overflow-hidden flex z-10">
                {/* Sidebar: Top Passengers */}
                <aside className="w-[300px] border-r border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-md overflow-y-auto custom-scrollbar p-6 space-y-8">
                    <div>
                        <h3 className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Users size={14} className="text-[var(--accent)]" /> Fréquence Passagers
                        </h3>
                        <div className="space-y-2">
                            {passengerStats.map(([name, count]) => (
                                <button
                                    key={name}
                                    onClick={() => setSelectedPassenger(name === selectedPassenger ? null : name)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedPassenger === name
                                        ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)] shadow-lg'
                                        : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--text)] shadow-sm'
                                        }`}
                                >
                                    <span className="text-[11px] font-black italic truncate font-legal">{name}</span>
                                    <span className={`text-[10px] font-mono-data font-bold px-2 py-0.5 rounded ${selectedPassenger === name ? 'bg-[var(--accent)]' : 'bg-[var(--surface-muted)] text-[var(--text-dim)]'}`}>
                                        {count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl space-y-3">
                        <h4 className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest flex items-center gap-2">
                            <Shield size={12} className="text-[var(--warning)]" /> Audit Info
                        </h4>
                        <p className="text-[10px] text-[var(--text-muted)] font-medium italic leading-relaxed">
                            Les journaux de vol sont extraits des archives publiques et des dépositions judiciaires. Les corrélations sont basées sur les manifestes de bord officiels.
                        </p>
                    </div>
                </aside>

                {/* Main Content: Flight List */}
                <main className="flex-1 overflow-y-auto p-10 custom-scrollbar scroll-smooth bg-[var(--background)]/30">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.4em] italic leading-none">Chronologie des vols détectés</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest bg-[var(--surface)] px-3 py-1 rounded-full border border-[var(--border)] shadow-sm">
                                {allFlights.length} ENTRIES
                            </span>
                        </div>

                        {allFlights.map((flight, idx) => (
                            <FlightCard key={idx} flight={flight} onPassengerClick={setSelectedPassenger} />
                        ))}

                        {allFlights.length === 0 && (
                            <div className="py-40 text-center bg-[var(--surface)] rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-sm">
                                <Plane size={48} className="mx-auto text-[var(--surface-muted)] mb-6" />
                                <h3 className="text-xl font-black text-[var(--text)] uppercase tracking-widest font-legal italic mb-2">Aucun Vol Identifié</h3>
                                <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-[0.2em]">Modifiez vos critères de recherche ou analysez de nouveaux dossiers</p>
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
        <div className="bg-[var(--surface)] group rounded-[var(--radius-xl)] border border-[var(--border)] hover:border-[var(--border-strong)] shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-premium)] transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-700">
                <Plane size={120} className="text-[var(--text)]" />
            </div>

            <div className="p-8 flex flex-col xl:flex-row gap-10 relative z-10">
                {/* Left: Metadata */}
                <div className="xl:w-1/4 space-y-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
                            <CalendarDays size={20} />
                        </div>
                        <div>
                            <div className="text-[14px] font-black text-[var(--text)] font-mono-data italic">{flight.date}</div>
                            <div className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest">Date du Vol</div>
                        </div>
                    </div>
                    <div className="bg-[var(--surface-muted)] p-4 rounded-xl border border-[var(--border)]/50 space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">
                            <Info size={10} /> Appareil
                        </div>
                        <div className="text-[12px] font-black text-[var(--text-muted)] font-mono-data">{flight.source}</div>
                    </div>
                </div>

                {/* Center: Route */}
                <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between gap-8 bg-[var(--surface-muted)] p-6 rounded-xl border border-[var(--border)]/50">
                        <div className="flex-1">
                            <div className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <ArrowUpRight size={12} className="text-[var(--success)]" /> DÉPART
                            </div>
                            <div className="text-[16px] font-black text-[var(--text)] font-legal italic">{flight.depart}</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-[var(--surface)] rounded-full border border-[var(--border)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <ArrowRight size={18} className="text-[var(--accent)]" />
                            </div>
                        </div>
                        <div className="flex-1 text-right">
                            <div className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em] mb-2 flex items-center justify-end gap-2">
                                ARRIVÉE <ArrowDownLeft size={12} className="text-[var(--danger)]" />
                            </div>
                            <div className="text-[16px] font-black text-[var(--text)] font-legal italic text-right">{flight.destination}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em] flex items-center gap-2 pl-2">
                            <Users size={12} /> Passagers à bord ({Array.isArray(flight.passagers) ? flight.passagers.length : 0})
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(flight.passagers) && flight.passagers.map((p: any, i: number) => {
                                const name = typeof p === 'string' ? p : ((p as any).nom || (p as any).name || "Inconnu");
                                return (
                                    <button
                                        key={i}
                                        onClick={() => onPassengerClick(name)}
                                        className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[10px] font-black font-legal italic text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 hover:shadow-md transition-all active:scale-95"
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
                    <div className="bg-[var(--surface-muted)] p-6 rounded-xl border border-[var(--border)]/50 relative group-hover:bg-[var(--surface)] transition-colors h-full flex flex-col">
                        <div className="absolute left-0 top-4 bottom-4 w-1 bg-[var(--border)] group-hover:bg-[var(--accent)] transition-colors rounded-full"></div>
                        <div className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-3 italic">Annotations Forensiques</div>
                        <p className="text-[12px] text-[var(--text-muted)] leading-relaxed italic font-medium">"{flight.description || 'Manifeste standard, aucune anomalie signalée par le pilote.'}"</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
