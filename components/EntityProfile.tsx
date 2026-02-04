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
            <div className="h-full flex items-center justify-center bg-white">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-[#B91C1C] rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-400 text-sm font-bold">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden">
            {/* Header */}
            <div className="px-8 lg:px-12 py-8 bg-white border-b border-slate-100 shrink-0">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-[#B91C1C] transition-colors mb-6 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-wider">Retour</span>
                </button>

                <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-[#0F4C81] rounded-2xl flex items-center justify-center shadow-xl">
                        <User size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[9px] font-black text-[#0F4C81] uppercase tracking-[0.4em]">Profil d'Entité</span>
                            <div className="h-1 w-1 rounded-full bg-slate-200"></div>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Analyse Transversale</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-[#0F172A] font-serif-legal italic tracking-tight">{entityName}</h1>
                        <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-[#B91C1C]" />
                                <span className="text-sm font-bold text-slate-600">{occurrences.length} Apparition{occurrences.length > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Network size={16} className="text-[#0F4C81]" />
                                <span className="text-sm font-bold text-slate-600">{relatedEntities.length} Entité{relatedEntities.length > 1 ? 's' : ''} Liée{relatedEntities.length > 1 ? 's' : ''}</span>
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
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Target size={20} className="text-[#B91C1C]" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fréquence</span>
                            </div>
                            <div className="text-4xl font-black text-[#B91C1C] font-mono-data">{occurrences.length}</div>
                            <p className="text-xs text-slate-500 mt-2 font-bold">Mentions dans les dossiers</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Link2 size={20} className="text-[#0F4C81]" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Réseau</span>
                            </div>
                            <div className="text-4xl font-black text-[#0F4C81] font-mono-data">{relatedEntities.length}</div>
                            <p className="text-xs text-slate-500 mt-2 font-bold">Connexions identifiées</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <TrendingUp size={20} className="text-emerald-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact</span>
                            </div>
                            <div className="text-4xl font-black text-emerald-600 font-mono-data">
                                {Math.min(100, Math.round((occurrences.length / 10) * 100))}%
                            </div>
                            <p className="text-xs text-slate-500 mt-2 font-bold">Score de pertinence</p>
                        </div>
                    </div>

                    {/* Related Entities */}
                    {relatedEntities.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Network size={18} className="text-[#0F4C81]" />
                                <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Entités Associées</h2>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {relatedEntities.slice(0, 20).map((entity, idx) => (
                                    <div
                                        key={idx}
                                        className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:border-[#0F4C81] hover:text-[#0F4C81] transition-all cursor-pointer shadow-sm"
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
                                <FileText size={18} className="text-[#B91C1C]" />
                                <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Historique des Apparitions</h2>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    type="text"
                                    placeholder="Filtrer..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-11 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-sm focus:border-[#B91C1C] outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredOccurrences.map((occ, idx) => (
                                <div
                                    key={idx}
                                    className="group bg-white p-6 rounded-2xl border border-slate-100 hover:border-[#B91C1C]/20 hover:shadow-lg transition-all cursor-pointer"
                                    onClick={() => onNavigateToInvestigation?.(occ.investigationId)}
                                >
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-black text-[#0F172A] font-serif-legal italic mb-2 group-hover:text-[#B91C1C] transition-colors">
                                                {occ.investigationTitle}
                                            </h3>
                                            <div className="flex items-center gap-4 text-xs text-slate-400 font-bold">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} />
                                                    {occ.date}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={12} />
                                                    {occ.documentTitle}
                                                </div>
                                            </div>
                                        </div>
                                        <Shield size={16} className="text-emerald-500 shrink-0" />
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 italic">
                                        {occ.context}
                                    </p>
                                </div>
                            ))}

                            {filteredOccurrences.length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    <p className="text-sm font-bold">Aucune occurrence trouvée</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
