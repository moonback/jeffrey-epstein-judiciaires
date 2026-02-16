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
            <div className="h-full flex items-center justify-center bg-[var(--background)]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="text-[var(--accent)] animate-spin" />
                    <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">Chargement des profils...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[var(--background)] overflow-hidden relative font-sans">
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
                        icon: <div className={`w-1.5 h-1.5 rounded-full ${stats.highRisk > 0 ? 'bg-[var(--danger)] animate-pulse' : 'bg-[var(--success)]'}`}></div>
                    },
                    {
                        label: "Influenceurs",
                        value: stats.influencers,
                        icon: <Activity size={10} className="text-[var(--text-dim)]" />
                    }
                ]}
            >
                <button
                    onClick={() => setOnlyHighMentions(!onlyHighMentions)}
                    title="Filtrer par activité"
                    className={`mt-[-4px] p-2 h-[34px] rounded-lg border transition-all flex items-center justify-center ${onlyHighMentions ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}
                >
                    <Activity size={14} />
                    <span className="ml-2 text-[10px] font-black uppercase tracking-wider hidden sm:inline">Actifs</span>
                </button>

                <div className="relative mt-[-4px]">
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="appearance-none pl-3 pr-8 h-[34px] bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] focus:border-[var(--accent)] outline-none cursor-pointer hover:bg-[var(--surface-muted)] w-40 truncate"
                    >
                        <option value="all">Tous Rôles</option>
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <ChevronRight size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-dim)] pointer-events-none rotate-90" />
                </div>
            </PageHeader>

            {/* Dashboard Content - Densified */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar z-10 bg-[var(--background)]">
                <div className="max-w-[1920px] mx-auto space-y-6">

                    {/* High Importance Grid */}
                    {actors.some(a => a.risk_level >= 8 || a.influence >= 8) && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-1.5 bg-[var(--danger)]/10 rounded-lg">
                                    <ShieldAlert size={14} className="text-[var(--danger)]" />
                                </div>
                                <span className="text-[10px] font-black text-[var(--text)] uppercase tracking-[0.2em]">Cibles Prioritaires Alpha</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent opacity-50"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
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
                    <div className="pt-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-1.5 bg-[var(--primary)]/5 rounded-lg text-[var(--text-dim)]">
                                <Database size={14} />
                            </div>
                            <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em]">Registre Complet</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent opacity-50"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
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
                            <div className="w-16 h-16 bg-[var(--surface-muted)] rounded-full flex items-center justify-center mb-4">
                                <Search size={24} className="text-[var(--text-dim)]" />
                            </div>
                            <p className="text-xs font-black text-[var(--text-dim)] uppercase tracking-widest">Aucun profil détecté</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <div className="bg-[var(--surface)] border-t border-[var(--border)] px-4 py-2 flex justify-between items-center z-30 shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em]">Status: Connecté</span>
                    <div className="h-3 w-px bg-[var(--border)]"></div>
                    <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em]">Mode: Investigation</span>
                </div>
                <div className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em]">Protocol V8.2</div>
            </div>
        </div>
    );
};

// Ultra Compact Actor Card
const ActorCard: React.FC<{ actor: any, isPriority?: boolean, onClick: () => void }> = ({ actor, isPriority, onClick }) => {
    const isHighRisk = actor.risk_level >= 7;
    const isMediumRisk = actor.risk_level >= 4 && actor.risk_level < 7;

    return (
        <div
            onClick={onClick}
            className={`
                group relative flex flex-col
                bg-[var(--surface)] border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden cursor-pointer transition-all duration-500
                hover:shadow-[var(--shadow-premium)] hover:-translate-y-1.5 hover:border-[var(--accent)]/30
                ${isPriority ? 'border-[var(--danger)]/20 shadow-sm bg-gradient-to-b from-[var(--surface)] to-[var(--danger)]/5' : 'shadow-sm'}
            `}
        >
            <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                    <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm font-legal italic transition-all duration-500 group-hover:scale-110 shrink-0
                        ${isHighRisk ? 'bg-[var(--danger)] text-white shadow-lg shadow-red-900/10' :
                            isMediumRisk ? 'bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20' :
                                'bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]'}
                    `}>
                        {actor.nom[0]}
                    </div>

                    <div className={`
                        px-2 py-0.5 rounded-full flex items-center gap-1 border text-[10px] font-black uppercase tracking-wider
                        ${isHighRisk ? 'bg-[var(--danger)]/5 border-[var(--danger)]/20 text-[var(--danger)]' : 'bg-[var(--surface-muted)] border-[var(--border)] text-[var(--text-dim)]'}
                    `}>
                        <span className="tabular-nums">{actor.risk_level}</span>
                        <span className="opacity-40">/10</span>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="font-bold text-[var(--text)] text-[13px] leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2" title={actor.nom}>
                        {actor.nom}
                    </h3>
                    <p className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest truncate mt-1.5 opacity-70">
                        {actor.role || 'Rôle Inconnu'}
                    </p>
                </div>

                {/* Simplified Stats */}
                <div className="flex items-center gap-4 pt-4 border-t border-[var(--border)]/40 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-0.5">Mentions</span>
                        <span className="text-[11px] font-black text-[var(--text)] leading-none tabular-nums">{actor.mentions}</span>
                    </div>
                    <div className="h-6 w-px bg-[var(--border)]/50"></div>
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-0.5">Influence</span>
                        <span className="text-[11px] font-black text-[var(--text)] leading-none tabular-nums">{actor.influence}</span>
                    </div>
                </div>
            </div>

            {/* Subtle Hover Action indicator */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <ChevronRight size={14} className="text-[var(--accent)]" />
            </div>
        </div>
    );
};
