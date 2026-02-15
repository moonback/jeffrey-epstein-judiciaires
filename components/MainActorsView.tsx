/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from './PageHeader';
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
    Loader2,
    Database,
    Filter,
    ListFilter
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
        // Top 3 roles
        const rolesCount = new Map<string, number>();
        allActors.forEach(a => {
            if (a.role) rolesCount.set(a.role, (rolesCount.get(a.role) || 0) + 1);
        });
        const topRoles = Array.from(rolesCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);

        return { total: allActors.length, highRisk, influencers, topRoles };
    }, [allActors]);

    const roles = useMemo(() => {
        const r = new Set<string>();
        allActors.forEach(a => {
            if (a.role && a.role.length < 40) r.add(a.role);
        });
        return Array.from(r).sort().slice(0, 20);
    }, [allActors]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-[#FDFDFD]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="text-[#B91C1C] animate-spin" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chargement des profils...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative font-sans">
            {/* Ultra Compact Professional Header */}
            {/* Ultra Compact Professional Header */}
            <PageHeader
                title="Acteurs"
                titleHighlight="Clés"
                icon={Users}
                badgeText="Neural Registry v2.1"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                totalLabel="Profils Identifiés"
                totalCount={stats.total}
                stats={[
                    {
                        label: "Critiques",
                        value: stats.highRisk,
                        icon: <div className={`w-1.5 h-1.5 rounded-full ${stats.highRisk > 0 ? 'bg-[#B91C1C] animate-pulse' : 'bg-emerald-500'}`}></div>
                    },
                    {
                        label: "Influenceurs",
                        value: stats.influencers,
                        icon: <Activity size={10} className="text-slate-400" />
                    }
                ]}
            >
                <button
                    onClick={() => setOnlyHighMentions(!onlyHighMentions)}
                    title="Filtrer par activité"
                    className={`mt-[-4px] p-2 h-[34px] rounded-lg border transition-all flex items-center justify-center ${onlyHighMentions ? 'bg-[#0F172A] border-[#0F172A] text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-[#B91C1C] hover:text-[#B91C1C]'}`}
                >
                    <Activity size={14} />
                    <span className="ml-2 text-[10px] font-black uppercase tracking-wider hidden sm:inline">Actifs</span>
                </button>

                <div className="relative mt-[-4px]">
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="appearance-none pl-3 pr-8 h-[34px] bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 focus:border-[#B91C1C] outline-none cursor-pointer hover:bg-slate-50 w-40 truncate"
                    >
                        <option value="all">Tous Rôles</option>
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <ChevronRight size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                </div>
            </PageHeader>

            {/* Dashboard Content - Densified */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar z-10 bg-[#F8FAFC]">
                <div className="max-w-[1920px] mx-auto space-y-6">

                    {/* High Importance Grid */}
                    {actors.some(a => a.risk_level >= 8 || a.influence >= 8) && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <ShieldAlert size={14} className="text-[#B91C1C]" />
                                <span className="text-[10px] font-black text-[#B91C1C] uppercase tracking-[0.2em]">Cibles Prioritaires Alpha</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-[#B91C1C]/20 to-transparent"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                                {actors.filter(a => a.risk_level >= 8 || a.influence >= 8).map((actor, idx) => (
                                    <ActorCard
                                        key={actor.nom + idx}
                                        actor={actor}
                                        isPriority
                                        onClick={() => onEntityClick?.(actor.nom)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Standard Registry */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Database size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registre Complet</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                            {actors.filter(a => !(a.risk_level >= 8 || a.influence >= 8)).map((actor, idx) => (
                                <ActorCard
                                    key={actor.nom + idx}
                                    actor={actor}
                                    onClick={() => onEntityClick?.(actor.nom)}
                                />
                            ))}
                        </div>
                    </div>

                    {actors.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Search size={24} className="text-slate-300" />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Aucun profil détecté</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div className="bg-white border-t border-slate-100 px-4 py-2 flex justify-between items-center z-30 shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Status: Connecté</span>
                    <div className="h-3 w-px bg-slate-100"></div>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Mode: Investigation</span>
                </div>
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Protocol V8.2</div>
            </div>
        </div>
    );
};

// Ultra Compact Actor Card
const ActorCard: React.FC<{ actor: any, isPriority?: boolean, onClick: () => void }> = ({ actor, isPriority, onClick }) => {
    // Risk color logic
    const isHighRisk = actor.risk_level >= 7;
    const isMediumRisk = actor.risk_level >= 4 && actor.risk_level < 7;

    return (
        <div
            onClick={onClick}
            className={`
                group relative flex flex-col
                bg-white border rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:border-slate-300
                ${isPriority ? 'border-red-100 shadow-sm bg-red-50/10' : 'border-slate-100'}
            `}
        >
            {/* Hover Accent Line */}
            <div className={`absolute top-0 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ${isHighRisk ? 'bg-[#B91C1C]' : 'bg-[#0F172A]'}`}></div>

            <div className="p-3">
                <div className="flex justify-between items-start gap-3 mb-2">
                    {/* Avatar Info */}
                    <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs font-serif-legal italic transition-all group-hover:scale-105 shrink-0
                        ${isHighRisk ? 'bg-[#B91C1C] text-white shadow-md shadow-red-900/10' :
                            isMediumRisk ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                'bg-slate-50 text-slate-500 border border-slate-100'}
                    `}>
                        {actor.nom[0]}
                    </div>

                    {/* Risk Badge */}
                    <div className={`
                        px-1.5 py-0.5 rounded flex items-center gap-1 border
                        ${isHighRisk ? 'bg-red-50 border-red-100 text-[#B91C1C]' : 'bg-slate-50 border-slate-100 text-slate-400'}
                    `}>
                        {isHighRisk && <AlertTriangle size={8} />}
                        <span className="text-[9px] font-black uppercase tracking-wider">{actor.risk_level}/10</span>
                    </div>
                </div>

                <div className="mb-2.5">
                    <h3 className="font-bold text-[#0F172A] text-xs leading-tight group-hover:text-[#B91C1C] transition-colors truncate" title={actor.nom}>
                        {actor.nom}
                    </h3>
                    <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider truncate mt-0.5" title={actor.role}>
                        {actor.role || 'Rôle Inconnu'}
                    </p>
                </div>

                {/* Micro Stats */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                    <div className="bg-slate-50/50 rounded flex flex-col justify-center px-2 py-1 border border-slate-100/50">
                        <span className="text-[6px] font-black text-slate-300 uppercase tracking-widest leading-none mb-0.5">MENTIONS</span>
                        <span className="text-[10px] font-black text-slate-600 leading-none">{actor.mentions}</span>
                    </div>
                    <div className="bg-slate-50/50 rounded flex flex-col justify-center px-2 py-1 border border-slate-100/50">
                        <span className="text-[6px] font-black text-slate-300 uppercase tracking-widest leading-none mb-0.5">INFLUENCE</span>
                        <span className="text-[10px] font-black text-slate-600 leading-none">{actor.influence}</span>
                    </div>
                </div>
            </div>

            {/* View Profile Overlay Action */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300 z-20">
                <div className="w-5 h-5 rounded-full bg-[#0F172A] flex items-center justify-center shadow-lg">
                    <ChevronRight size={10} className="text-white" />
                </div>
            </div>
        </div>
    );
};
