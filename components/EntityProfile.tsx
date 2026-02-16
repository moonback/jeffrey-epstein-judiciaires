/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProcessedResult } from '../types';
import { storageService } from '../services/storageService';
import { User, FileText, Link2, Calendar, MapPin, ArrowLeft, TrendingUp, Shield, Target, Network, Search } from 'lucide-react';

interface EntityProfileProps {
    entityName: string;
    onBack: () => void;
    onNavigateToInvestigation?: (investigationId: string) => void;
}

interface EntityOccurrence {
    investigationId: string;
    investigationTitle: string;
    date: string;
    context: string;
    documentTitle?: string;
}

export const EntityProfile: React.FC<EntityProfileProps> = ({ entityName, onBack, onNavigateToInvestigation }) => {
    const [occurrences, setOccurrences] = useState<EntityOccurrence[]>([]);
    const [relatedEntities, setRelatedEntities] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadEntityData();
    }, [entityName]);

    const loadEntityData = async () => {
        setLoading(true);
        const allResults = await storageService.getAllResults();

        const entityOccurrences: EntityOccurrence[] = [];
        const relatedEntitySet = new Set<string>();

        allResults.forEach(result => {
            if (!result.output) return;

            const entities = result.output.entites_cles || [];
            if (entities.includes(entityName)) {
                // Add this investigation as an occurrence
                entityOccurrences.push({
                    investigationId: result.id,
                    investigationTitle: result.input.query,
                    date: new Date(result.timestamp).toLocaleDateString('fr-FR'),
                    context: result.output.context_general || '',
                    documentTitle: result.input.targetUrl.split(' : ')[1] || result.input.targetUrl
                });

                // Collect related entities (co-occurring entities)
                entities.forEach(ent => {
                    if (ent !== entityName) {
                        relatedEntitySet.add(ent);
                    }
                });
            }
        });

        setOccurrences(entityOccurrences);
        setRelatedEntities(Array.from(relatedEntitySet));
        setLoading(false);
    };

    const filteredOccurrences = occurrences.filter(occ =>
        occ.investigationTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        occ.context.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-[var(--background)]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-[var(--surface-muted)] border-t-[var(--accent)] rounded-full animate-spin mx-auto"></div>
                    <p className="text-[var(--text-dim)] text-xs font-black uppercase tracking-widest">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[var(--background)] overflow-hidden font-sans text-[var(--text)]">
            {/* Header */}
            <div className="px-8 lg:px-12 py-8 bg-[var(--surface)] border-b border-[var(--border)] shrink-0 shadow-sm relative z-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors mb-6 group relative z-10"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Retour</span>
                </button>

                <div className="flex items-start gap-6 relative z-10">
                    <div className="w-16 h-16 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[var(--radius-xl)] flex items-center justify-center shadow-[var(--shadow-premium)] border border-[var(--primary)]/10">
                        <User size={32} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-[0.4em]">Profil d'Entité</span>
                            <div className="h-1 w-1 rounded-full bg-[var(--border)]"></div>
                            <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em]">Analyse Transversale</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-[var(--text)] font-legal italic tracking-tight">{entityName}</h1>
                        <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-[var(--accent)]" />
                                <span className="text-sm font-bold text-[var(--text-muted)]">{occurrences.length} Apparition{occurrences.length > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Network size={16} className="text-[var(--primary)]" />
                                <span className="text-sm font-bold text-[var(--text-muted)]">{relatedEntities.length} Entité{relatedEntities.length > 1 ? 's' : ''} Liée{relatedEntities.length > 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[var(--surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-sm hover:shadow-[var(--shadow-soft)] transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
                                    <Target size={18} className="text-[var(--accent)]" />
                                </div>
                                <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">Fréquence</span>
                            </div>
                            <div className="text-4xl font-black text-[var(--accent)] font-mono-data tabular-nums">{occurrences.length}</div>
                            <p className="text-[10px] text-[var(--text-muted)] mt-2 font-black uppercase tracking-wider">Mentions dans les dossiers</p>
                        </div>

                        <div className="bg-[var(--surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-sm hover:shadow-[var(--shadow-soft)] transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                                    <Link2 size={18} className="text-[var(--primary)]" />
                                </div>
                                <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">Réseau</span>
                            </div>
                            <div className="text-4xl font-black text-[var(--primary)] font-mono-data tabular-nums">{relatedEntities.length}</div>
                            <p className="text-[10px] text-[var(--text-muted)] mt-2 font-black uppercase tracking-wider">Connexions identifiées</p>
                        </div>

                        <div className="bg-[var(--surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-sm hover:shadow-[var(--shadow-soft)] transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <TrendingUp size={18} className="text-emerald-500" />
                                </div>
                                <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">Impact</span>
                            </div>
                            <div className="text-4xl font-black text-emerald-600 font-mono-data tabular-nums">
                                {Math.min(100, Math.round((occurrences.length / 10) * 100))}%
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] mt-2 font-black uppercase tracking-wider">Score de pertinence</p>
                        </div>
                    </div>

                    {/* Related Entities */}
                    {relatedEntities.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Network size={18} className="text-[var(--primary)]" />
                                <h2 className="text-xl font-black text-[var(--text)] uppercase tracking-tight">Entités Associées</h2>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {relatedEntities.slice(0, 20).map((entity, idx) => (
                                    <div
                                        key={idx}
                                        className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] text-xs font-black uppercase tracking-wider text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all cursor-pointer shadow-sm hover:shadow-[var(--shadow-soft)] hover:-translate-y-0.5"
                                    >
                                        {entity}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Occurrences List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <FileText size={18} className="text-[var(--accent)]" />
                                <h2 className="text-xl font-black text-[var(--text)] uppercase tracking-tight">Historique des Apparitions</h2>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={16} />
                                <input
                                    type="text"
                                    placeholder="Filtrer..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-11 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] text-xs font-black uppercase tracking-wider focus:border-[var(--accent)] outline-none transition-all shadow-sm w-48 lg:w-64"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredOccurrences.map((occ, idx) => (
                                <div
                                    key={idx}
                                    className="group bg-[var(--surface)] p-6 rounded-[var(--radius-2xl)] border border-[var(--border)] hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-premium)] transition-all cursor-pointer relative overflow-hidden"
                                    onClick={() => onNavigateToInvestigation?.(occ.investigationId)}
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]/0 group-hover:bg-[var(--accent)] transition-all"></div>
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-black text-[var(--text)] font-legal italic mb-2 group-hover:text-[var(--accent)] transition-colors">
                                                {occ.investigationTitle}
                                            </h3>
                                            <div className="flex items-center gap-4 text-[10px] text-[var(--text-dim)] font-black uppercase tracking-[0.1em]">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} className="text-[var(--accent)]" />
                                                    {occ.date}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={12} className="text-[var(--primary)]" />
                                                    {occ.documentTitle}
                                                </div>
                                            </div>
                                        </div>
                                        <Shield size={16} className="text-emerald-500 shrink-0 opacity-50 group-hover:opacity-100" />
                                    </div>
                                    <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-2 italic font-legal">
                                        {occ.context}
                                    </p>
                                </div>
                            ))}

                            {filteredOccurrences.length === 0 && (
                                <div className="text-center py-12 text-[var(--text-dim)]">
                                    <p className="text-xs font-black uppercase tracking-widest">Aucune occurrence trouvée</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
