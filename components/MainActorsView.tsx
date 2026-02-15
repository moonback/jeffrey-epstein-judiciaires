/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { ProcessedResult, EntityDetail } from '../types';
import {
    Users,
    ShieldAlert,
    Target,
    Fingerprint,
    Search,
    ShieldCheck,
    Activity,
    ArrowUpRight,
    Lock,
    Scale,
    AlertTriangle,
    Zap,
    TrendingUp,
    ChevronRight,
    Loader2
} from 'lucide-react';

interface MainActorsViewProps {
    onEntityClick?: (name: string) => void;
    isGuestMode?: boolean;
}

export const MainActorsView: React.FC<MainActorsViewProps> = ({ onEntityClick, isGuestMode }) => {
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<string | 'all'>('all');
    const [minRisk, setMinRisk] = useState<number>(0);
    const [onlyHighMentions, setOnlyHighMentions] = useState(false);

    useEffect(() => {
        storageService.getAllResults().then(data => {
            setHistory(data);
            setLoading(false);
        });
    }, []);

    const normalize = (name: string) => name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const allActors = useMemo(() => {
        const actorsMap = new Map<string, EntityDetail & { mentions: number, sources: string[], lastSeen: number }>();

        history.forEach(res => {
            const entities = res.output?.entites_details || [];
            entities.forEach(entity => {
                const key = normalize(entity.nom);
                if (!actorsMap.has(key)) {
                    actorsMap.set(key, {
                        ...entity,
                        mentions: 1,
                        sources: [res.id],
                        lastSeen: res.timestamp || Date.now()
                    });
                } else {
                    const existing = actorsMap.get(key)!;
                    existing.mentions++;
                    if (!existing.sources.includes(res.id)) {
                        existing.sources.push(res.id);
                    }
                    existing.risk_level = Math.max(existing.risk_level || 0, entity.risk_level || 0);
                    existing.influence = Math.max(existing.influence || 0, entity.influence || 0);
                    if (existing.role.length < entity.role.length) {
                        existing.role = entity.role;
                    }
                }
            });

            res.output?.entites_cles?.forEach(entName => {
                const name = typeof entName === 'string' ? entName : (entName as any).nom || entName;
                const key = normalize(name || 'Inconnu');
                if (!actorsMap.has(key)) {
                    actorsMap.set(key, {
                        nom: name || 'Inconnu',
                        role: 'Partie mentionnée',
                        risk_level: 5,
                        influence: 3,
                        mentions: 1,
                        sources: [res.id],
                        lastSeen: res.timestamp || Date.now()
                    });
                }
            });
        });

        return Array.from(actorsMap.values());
    }, [history]);

    const actors = useMemo(() => {
        return allActors
            .filter(a => (a.nom || '').toLowerCase().includes(searchQuery.toLowerCase()))
            .filter(a => selectedRole === 'all' || (a.role || '').toLowerCase().includes(selectedRole.toLowerCase()))
            .filter(a => (a.risk_level || 0) >= minRisk)
            .filter(a => !onlyHighMentions || a.mentions > 1)
            .sort((a, b) => (b.risk_level * b.influence) - (a.risk_level * a.influence));
    }, [allActors, searchQuery, selectedRole, minRisk, onlyHighMentions]);

    const stats = useMemo(() => {
        const highRisk = allActors.filter(a => (a.risk_level || 0) > 7).length;
        const influencers = allActors.filter(a => (a.influence || 0) > 7).length;
        return { total: allActors.length, highRisk, influencers };
    }, [allActors]);

    const roles = useMemo(() => {
        const r = new Set<string>();
        allActors.forEach(a => {
            if (a.role && a.role.length < 40) r.add(a.role);
        });
        return Array.from(r).sort().slice(0, 12);
    }, [allActors]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-6">
                    <Loader2 size={40} className="text-[#B91C1C] animate-spin" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Indexation des Profils Mobiles...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <header className="px-6 lg:px-12 py-8 bg-white/90 backdrop-blur-xl border-b border-slate-100 z-30 shadow-sm relative shrink-0">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-black rounded-[1.5rem] flex items-center justify-center shadow-2xl group transition-all hover:rotate-6">
                            <Users className="text-white group-hover:scale-110 transition-transform" size={26} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl lg:text-3xl font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight leading-none">
                                    Acteurs <span className="text-[#B91C1C]">Principaux</span>
                                </h1>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] bg-slate-50 px-2 py-1 rounded-md border border-slate-100">Intel-Unit 07</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stats.total} Profils Indexés</span>
                                </div>
                                <div className="h-3 w-px bg-slate-100"></div>
                                <div className="flex items-center gap-2">
                                    <ShieldAlert size={12} className="text-[#B91C1C]" />
                                    <span className="text-[9px] font-black text-[#B91C1C] uppercase tracking-widest">{stats.highRisk} Cibles de Risque Alpha</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative group">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#B91C1C] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Rechercher une cible..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-[#0F172A] w-64 focus:w-80 focus:bg-white focus:border-[#B91C1C] transition-all outline-none shadow-inner"
                                />
                            </div>

                            <div className="h-10 w-px bg-slate-100 hidden lg:block"></div>

                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-2 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <ShieldAlert size={12} /> Risque Min:
                                </span>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={minRisk}
                                    onChange={e => setMinRisk(Number(e.target.value))}
                                    className="accent-[#B91C1C] w-24"
                                />
                                <span className="text-[11px] font-black text-[#B91C1C] w-6">{minRisk}</span>
                            </div>

                            <button
                                onClick={() => setOnlyHighMentions(!onlyHighMentions)}
                                className={`px-4 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${onlyHighMentions ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-[#B91C1C] hover:text-[#B91C1C]'}`}
                            >
                                <Zap size={14} /> Multi-mentions
                            </button>
                        </div>

                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                            <button
                                onClick={() => setSelectedRole('all')}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedRole === 'all' ? 'bg-[#B91C1C] border-[#B91C1C] text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                            >
                                Tous
                            </button>
                            {roles.map(role => (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedRole === role ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar z-10 scroll-smooth">
                <div className="max-w-7xl mx-auto">
                    {/* Top Tier: High Priority Targets */}
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-[10px] font-black text-[#B91C1C] uppercase tracking-[0.5em] italic">Priorités de Profilage Alpha</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-[#B91C1C]/20 to-transparent"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {actors.filter(a => a.risk_level >= 7 || a.influence >= 8).slice(0, 6).map((actor, idx) => (
                                <ActorCard
                                    key={idx}
                                    actor={actor}
                                    isPriority
                                    onClick={() => onEntityClick?.(actor.nom)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Second Tier: Full Registry */}
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic">Registre Global des Acteurs</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {actors.filter(a => a.risk_level < 7 && a.influence < 8 || actors.indexOf(a) >= 6).map((actor, idx) => (
                                <ActorCard
                                    key={idx}
                                    actor={actor}
                                    onClick={() => onEntityClick?.(actor.nom)}
                                />
                            ))}
                        </div>
                    </div>

                    {actors.length === 0 && (
                        <div className="py-40 text-center bg-white rounded-[4rem] border border-slate-100 shadow-sm">
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 bg-slate-50 rounded-full animate-ping opacity-20"></div>
                                <Search size={48} className="mx-auto text-slate-100 relative z-10" />
                            </div>
                            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-widest font-serif-legal italic mb-3">Aucun Agent Détecté</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Affinez vos critères de scan neural</p>
                        </div>
                    )}
                </div>
            </div>

            <footer className="px-10 py-5 bg-white border-t border-slate-100 flex justify-between items-center z-30 shrink-0">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#B91C1C]"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Risque Critique</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#B5965D]"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Influence Système</span>
                    </div>
                </div>
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] italic">
                    Protocol 07: Data-Driven Profiling v8.2
                </div>
            </footer>
        </div>
    );
};

const ActorCard: React.FC<{ actor: any, isPriority?: boolean, onClick: () => void }> = ({ actor, isPriority, onClick }) => {
    const riskColor = actor.risk_level > 7 ? 'text-red-600' : actor.risk_level > 4 ? 'text-[#B5965D]' : 'text-emerald-600';
    const riskBg = actor.risk_level > 7 ? 'bg-red-50' : actor.risk_level > 4 ? 'bg-orange-50' : 'bg-emerald-50';

    return (
        <div
            onClick={onClick}
            className={`
                bg-white rounded-[2.5rem] border transition-all duration-500 cursor-pointer group hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden
                ${isPriority ? 'p-8 border-slate-200 shadow-xl' : 'p-6 border-slate-100 shadow-sm'}
            `}
        >
            {isPriority && (
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] transition-transform group-hover:scale-125 duration-1000 pointer-events-none">
                    <Fingerprint size={120} className="text-black" />
                </div>
            )}

            <div className="flex justify-between items-start mb-6">
                <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 font-black text-xl italic font-serif-legal
                    ${isPriority ? 'bg-black text-white shadow-xl rotate-3 group-hover:rotate-0' : 'bg-slate-50 text-slate-400 border border-slate-100'}
                    group-hover:bg-[#B91C1C] group-hover:text-white
                `}>
                    {actor.nom[0]}
                </div>
                <div className="text-right">
                    <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 justify-end">
                        <ShieldAlert size={10} className={actor.risk_level > 7 ? 'text-[#B91C1C]' : 'text-slate-300'} /> Risque
                    </div>
                    <div className={`text-xl font-mono-data font-black ${actor.risk_level > 7 ? 'text-[#B91C1C]' : 'text-slate-900'}`}>
                        {actor.risk_level}/10
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className={`font-black text-[#0F172A] font-serif-legal italic leading-tight mb-1 group-hover:text-[#B91C1C] transition-colors truncate ${isPriority ? 'text-xl' : 'text-base'}`}>
                        {actor.nom}
                    </h3>
                    <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1`}>
                        {actor.role}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                        <div className="text-[7px] font-black text-slate-300 uppercase mb-1 tracking-widest">Influence</div>
                        <div className="flex items-end gap-1.5">
                            <span className="text-lg font-mono-data font-black text-[#0F172A] leading-none">{actor.influence}</span>
                            <TrendingUp size={10} className="text-[#B5965D] mb-1" />
                        </div>
                    </div>
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                        <div className="text-[7px] font-black text-slate-300 uppercase mb-1 tracking-widest">Mentions</div>
                        <div className="flex items-end gap-1.5">
                            <span className="text-lg font-mono-data font-black text-[#0F172A] leading-none">{actor.mentions}</span>
                            <Activity size={10} className="text-blue-500 mb-1" />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {actor.sources.slice(0, 3).map((s, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-[#F1F5F9] border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400" title={s}>
                                {i + 1}
                            </div>
                        ))}
                        {actor.sources.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[7px] font-black text-white">
                                +{actor.sources.length - 3}
                            </div>
                        )}
                    </div>
                    <button className="flex items-center gap-2 text-[8px] font-black text-[#B91C1C] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        Profil Complet <ChevronRight size={10} />
                    </button>
                </div>
            </div>

            {actor.risk_level > 8 && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#B91C1C] animate-pulse"></div>
            )}
        </div>
    );
};
