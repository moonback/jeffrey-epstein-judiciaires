/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { DisclosureAnalysis } from '../types';
import { Search, Calendar, Users, FileText, Link as LinkIcon, ShieldAlert, File, List, Zap, Scale, Download, BookOpen, GraduationCap, ArrowUpRight, Filter } from 'lucide-react';

interface DataCardProps {
    data: DisclosureAnalysis | null;
    sources: { title: string; uri: string }[];
    loading: boolean;
    onDeepDive: (docTitle: string, style: 'standard' | 'simple' | 'technical') => void;
    onDownload: () => void;
    onEntityClick: (entityName: string) => void;
}

export const DataCard: React.FC<DataCardProps> = ({ data, sources, loading, onDeepDive, onDownload, onEntityClick }) => {
    const [activeFilter, setActiveFilter] = useState<string>('ALL');

    // Extraction des types uniques de documents pour le filtre
    const availableTypes = useMemo(() => {
        if (!data?.documents) return [];
        const types = data.documents.map(doc => doc.type).filter(Boolean);
        return Array.from(new Set(types));
    }, [data]);

    // Filtrage de la liste des documents
    const filteredDocuments = useMemo(() => {
        if (!data?.documents) return [];
        if (activeFilter === 'ALL') return data.documents;
        return data.documents.filter(doc => doc.type === activeFilter);
    }, [data, activeFilter]);

    if (loading) {
        return (
            <div className="w-full bg-[#1E1E1E] rounded-3xl p-8 border border-[#444746] flex flex-col items-center justify-center min-h-[400px] gap-6">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-[#444746]"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-[#F2B8B5] border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-[#F2B8B5] font-medium animate-pulse tracking-widest uppercase text-[13px]">Extraction de Données Profondes</p>
                    <p className="text-[#C4C7C5] text-[13px]">Analyse structurelle des documents en cours...</p>
                </div>
            </div>
        );
    }

    if (!data && !loading) {
        return (
            <div className="w-full bg-[#1E1E1E] rounded-3xl p-8 border border-[#601410] bg-gradient-to-br from-[#1E1E1E] to-[#370003]/20 flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="p-4 bg-[#601410]/20 rounded-full border border-[#601410]/50 text-[#F2B8B5]">
                    <ShieldAlert size={40} />
                </div>
                <div className="text-center">
                    <h3 className="text-[#F2B8B5] font-bold uppercase tracking-wider mb-2">Analyse Interrompue</h3>
                    <p className="text-[#C4C7C5] text-[13px] max-w-sm">
                        L'extraction a échoué ou les données sont corrompues. Vérifiez le terminal système pour plus de détails.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 flex flex-col">

            {/* En-tête Badge */}
            <div className="bg-[#121212] px-6 py-4 flex justify-between items-center border-b border-[#1A1A1A]">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-[#301010] rounded border border-[#F2B8B5]/20">
                        <ShieldAlert size={14} className="text-[#F2B8B5]" />
                    </div>
                    <span className="text-[#EEE] font-bold tracking-widest text-[10px] uppercase">Rapport de Forensic Numérique</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onDownload}
                        className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#F2B8B5] hover:text-[#370003] text-[#888] px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all border border-[#2A2A2A]"
                    >
                        <Download size={11} /> Export JSON
                    </button>
                    <div className="h-4 w-[1px] bg-[#2A2A2A]"></div>
                    <span className="text-[#F2B8B5] font-mono text-[11px] font-bold opacity-90 px-2 py-0.5 bg-[#F2B8B5]/10 rounded border border-[#F2B8B5]/20 uppercase">{data.contexte_juridique || 'CLASSIFIED'}</span>
                </div>
            </div>

            <div className="p-6 md:p-10 flex flex-col gap-10 flex-1 report-paper">

                {/* Résumé Global */}
                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#2A2A2A] to-[#2A2A2A]"></div>
                        <label className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#F2B8B5] flex items-center gap-2 px-2">
                            Synthèse de l'Affaire
                        </label>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#2A2A2A] to-[#2A2A2A]"></div>
                    </div>
                    <div className="text-[#BBB] leading-relaxed text-base bg-[#0A0A0A]/60 backdrop-blur-sm p-8 rounded-xl border border-[#1A1A1A] relative group">
                        <div className="absolute top-0 left-0 w-[2px] h-full bg-[#F2B8B5]/40 group-hover:bg-[#F2B8B5] transition-colors"></div>
                        <p className="relative z-10 font-light italic leading-loose text-lg text-[#EEE]">{data.context_general}</p>
                    </div>
                </div>

                {/* Section Documents Détaillés */}
                <div>
                    <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                        <label className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#555] flex items-center gap-2">
                            <File size={12} /> Éléments de Preuve
                        </label>

                        {/* Barre de Filtres */}
                        {availableTypes.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
                                <button
                                    onClick={() => setActiveFilter('ALL')}
                                    className={`px-3 py-1 rounded text-[9px] uppercase font-bold tracking-widest transition-all border ${activeFilter === 'ALL'
                                        ? 'bg-[#EEE] text-[#000] border-[#EEE]'
                                        : 'bg-[#121212] text-[#555] border-[#1A1A1A] hover:border-[#F2B8B5]/40 hover:text-[#888]'
                                        }`}
                                >
                                    ALL
                                </button>
                                {availableTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setActiveFilter(type)}
                                        className={`px-3 py-1 rounded text-[9px] uppercase font-bold tracking-widest transition-all border whitespace-nowrap ${activeFilter === type
                                            ? 'bg-[#F2B8B5]/20 text-[#F2B8B5] border-[#F2B8B5]/40'
                                            : 'bg-[#121212] text-[#555] border-[#1A1A1A] hover:border-[#F2B8B5]/40 hover:text-[#888]'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {filteredDocuments && filteredDocuments.length > 0 ? (
                            filteredDocuments.map((doc, idx) => (
                                <div key={idx} className="bg-[#0D0D0D] rounded-xl border border-[#1A1A1A] overflow-hidden hover:border-[#F2B8B5]/30 transition-all group flex flex-col md:flex-row">

                                    {/* Sidebar de la carte document */}
                                    <div className="w-full md:w-64 bg-[#121212]/50 p-5 border-b md:border-b-0 md:border-r border-[#1A1A1A] shrink-0">
                                        <div className="flex flex-col h-full">
                                            <div className="mb-4">
                                                <div className="text-[8px] font-bold text-[#F2B8B5] uppercase tracking-[0.3em] mb-1">Type de Document</div>
                                                <span className="text-[10px] font-bold uppercase text-[#EEE] bg-[#F2B8B5]/10 px-2 py-0.5 rounded-sm border border-[#F2B8B5]/20 block w-fit">{doc.type || 'SOURCE'}</span>
                                            </div>
                                            <div className="mb-6">
                                                <div className="text-[8px] font-bold text-[#555] uppercase tracking-[0.3em] mb-1">Datation</div>
                                                <span className="text-[10px] font-mono text-[#888]">{doc.date}</span>
                                            </div>

                                            <div className="mt-auto flex flex-col gap-2">
                                                <button
                                                    onClick={() => onDeepDive(doc.title, 'simple')}
                                                    className="w-full flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-[#F2B8B5] hover:text-[#000] text-[#888] py-2 rounded border border-[#1A1A1A] transition-all text-[9px] font-bold uppercase tracking-widest"
                                                >
                                                    <BookOpen size={10} /> Expliquer
                                                </button>
                                                <button
                                                    onClick={() => onDeepDive(doc.title, 'technical')}
                                                    className="w-full flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-[#8AB4F8] hover:text-[#000] text-[#888] py-2 rounded border border-[#1A1A1A] transition-all text-[9px] font-bold uppercase tracking-widest"
                                                >
                                                    <GraduationCap size={10} /> Forensic
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contenu de la carte document */}
                                    <div className="flex-1 p-6 flex flex-col gap-5">
                                        <h4 className="text-[#EEE] font-bold text-lg leading-tight group-hover:text-[#F2B8B5] transition-colors">{doc.title}</h4>
                                        <p className="text-[#888] text-[13px] leading-relaxed font-light italic">
                                            {doc.description}
                                        </p>

                                        {doc.key_facts && doc.key_facts.length > 0 && (
                                            <div className="bg-[#0A0A0A] rounded-lg p-5 border border-[#1A1A1A]">
                                                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#444] mb-3 flex items-center gap-2">
                                                    <List size={10} /> Faits Extraits
                                                </label>
                                                <ul className="space-y-3">
                                                    {doc.key_facts.map((fact, k) => (
                                                        <li key={k} className="text-[#BBB] text-[12px] flex items-start gap-3 group/fact">
                                                            <span className="text-[#F2B8B5] mt-1 text-[10px] font-bold opacity-40 group-hover/fact:opacity-100 transition-opacity">0{k + 1}</span>
                                                            <span className="leading-snug">{fact}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {doc.legal_implications && (
                                            <div className="flex items-start gap-3 text-[11px] text-[#8AB4F8] bg-[#8AB4F8]/5 p-3 rounded border border-[#8AB4F8]/10 group-hover:border-[#8AB4F8]/30 transition-colors">
                                                <Scale size={14} className="shrink-0 mt-0.5 opacity-60" />
                                                <span className="font-light leading-relaxed"><strong className="font-bold uppercase tracking-widest text-[9px] mr-2">Portée Juridique :</strong> {doc.legal_implications}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-[#444] text-[10px] uppercase font-bold tracking-[0.2em] py-12 bg-[#0A0A0A] rounded-xl border border-[#1A1A1A] border-dashed text-center">
                                Aucune donnée filtrée
                            </div>
                        )}
                    </div>
                </div>

                {/* Section Pied de Page: Entités & Sources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-[#1A1A1A]">
                    {/* Entités Globales */}
                    <div>
                        <label className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#555] mb-4 flex items-center gap-2">
                            <Users size={12} /> Réseau de Personnes Morales & Physiques
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {data.entites_cles && data.entites_cles.length > 0 ? (
                                data.entites_cles.map((entity, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onEntityClick(entity)}
                                        className="group flex items-center gap-3 px-3 py-2 rounded-md bg-[#121212] text-[#888] text-[11px] border border-[#1A1A1A] hover:border-[#F2B8B5]/40 hover:bg-[#1A1A1A] transition-all"
                                    >
                                        <span className="font-medium group-hover:text-[#EEE] transition-colors">{entity}</span>
                                        <ArrowUpRight size={10} className="text-[#F2B8B5] opacity-20 group-hover:opacity-100 transition-all" />
                                    </button>
                                ))
                            ) : (
                                <span className="text-[#333] text-[10px] uppercase font-bold italic tracking-widest">Inconnu</span>
                            )}
                        </div>
                    </div>

                    {/* Sources Section */}
                    <div>
                        <label className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#555] mb-4 flex items-center gap-2">
                            <LinkIcon size={12} /> Sources Authentifiées (Grounding)
                        </label>
                        <div className="space-y-1">
                            {sources.length > 0 ? (
                                sources.map((source, i) => (
                                    <a
                                        key={i}
                                        href={source.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between group p-2 rounded hover:bg-[#121212] transition-all"
                                    >
                                        <span className="text-[12px] text-[#555] group-hover:text-[#8AB4F8] transition-colors truncate max-w-[85%]">{source.title}</span>
                                        <span className="text-[8px] font-bold text-[#333] group-hover:text-[#F2B8B5] transition-colors font-mono">LINK-EXT</span>
                                    </a>
                                ))
                            ) : (
                                <div className="text-[9px] text-[#333] uppercase font-bold italic tracking-widest">Aucune source listée</div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
