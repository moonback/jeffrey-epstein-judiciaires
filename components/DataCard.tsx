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
                    <p className="text-[#F2B8B5] font-medium animate-pulse tracking-widest uppercase text-sm">Extraction de Données Profondes</p>
                    <p className="text-[#C4C7C5] text-xs">Analyse structurelle des documents en cours...</p>
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
                    <p className="text-[#C4C7C5] text-sm max-w-sm">
                        L'extraction a échoué ou les données sont corrompues. Vérifiez le terminal système pour plus de détails.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#1E1E1E] rounded-3xl overflow-hidden border border-[#444746] shadow-2xl transition-all duration-500 flex flex-col h-full">

            {/* En-tête Badge */}
            <div className="bg-[#370003] px-6 py-4 flex justify-between items-center border-b border-[#601410]">
                <div className="flex items-center gap-3">
                    <ShieldAlert size={20} className="text-[#F2B8B5]" />
                    <span className="text-[#F2B8B5] font-bold tracking-wide text-sm uppercase">Rapport Forensique</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onDownload}
                        className="flex items-center gap-1.5 bg-[#444746]/50 hover:bg-[#F2B8B5] hover:text-[#370003] text-[#E3E3E3] px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wide transition-all border border-[#444746]"
                        title="Télécharger les données au format JSON"
                    >
                        <Download size={12} /> Sauvegarder JSON
                    </button>
                    <span className="text-[#F2B8B5] font-mono text-xs opacity-80 px-2 py-1 bg-[#601410] rounded">{data.contexte_juridique || 'DOSSIER CLASSIFIÉ'}</span>
                </div>
            </div>

            <div className="p-8 flex flex-col gap-8 flex-1">

                {/* Résumé Global */}
                <div>
                    <label className="text-[11px] uppercase tracking-widest text-[#8E918F] mb-2 flex items-center gap-2">
                        <FileText size={12} /> Synthèse de l'Investigation
                    </label>
                    <div className="text-[#E3E3E3] leading-relaxed text-sm bg-[#121212] p-4 rounded-xl border border-[#444746]/50 italic border-l-4 border-l-[#F2B8B5]">
                        {data.context_general}
                    </div>
                </div>

                {/* Section Documents Détaillés */}
                <div>
                    <div className="flex flex-wrap items-center justify-between mb-3 gap-3">
                        <label className="text-[11px] uppercase tracking-widest text-[#8E918F] flex items-center gap-2">
                            <File size={12} /> Documents & Preuves
                        </label>

                        {/* Barre de Filtres */}
                        {availableTypes.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
                                <Filter size={12} className="text-[#444746] shrink-0" />
                                <button
                                    onClick={() => setActiveFilter('ALL')}
                                    className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide transition-colors border ${activeFilter === 'ALL'
                                            ? 'bg-[#E3E3E3] text-[#1E1E1E] border-[#E3E3E3]'
                                            : 'bg-[#1E1E1E] text-[#757775] border-[#444746] hover:border-[#757775]'
                                        }`}
                                >
                                    TOUS
                                </button>
                                {availableTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setActiveFilter(type)}
                                        className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide transition-colors border whitespace-nowrap ${activeFilter === type
                                                ? 'bg-[#004A77] text-[#D3E3FD] border-[#004A77]'
                                                : 'bg-[#1E1E1E] text-[#757775] border-[#444746] hover:border-[#8AB4F8] hover:text-[#8AB4F8]'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {filteredDocuments && filteredDocuments.length > 0 ? (
                            filteredDocuments.map((doc, idx) => (
                                <div key={idx} className="bg-[#2B2B2B] rounded-xl border border-[#444746] overflow-hidden hover:border-[#F2B8B5]/50 transition-colors group">

                                    {/* Doc Header */}
                                    <div className="bg-[#1E1E1E] p-3 border-b border-[#444746] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold uppercase text-[#004A77] bg-[#D3E3FD] px-1.5 rounded">{doc.type || 'DOCUMENT'}</span>
                                                <span className="text-[10px] font-mono text-[#C4C7C5]">{doc.date}</span>
                                            </div>
                                            <h4 className="text-[#E3E3E3] font-semibold text-sm leading-tight">{doc.title}</h4>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => onDeepDive(doc.title, 'simple')}
                                                className="flex items-center gap-1 bg-[#1E1E1E] hover:bg-[#F2B8B5] hover:text-[#370003] text-[#F2B8B5] px-2 py-1.5 rounded-lg border border-[#F2B8B5]/30 transition-all text-[10px] uppercase font-bold"
                                                title="Vulgariser (Expliquer simplement)"
                                            >
                                                <BookOpen size={12} /> Simple
                                            </button>
                                            <button
                                                onClick={() => onDeepDive(doc.title, 'technical')}
                                                className="flex items-center gap-1 bg-[#1E1E1E] hover:bg-[#8AB4F8] hover:text-[#004A77] text-[#8AB4F8] px-2 py-1.5 rounded-lg border border-[#8AB4F8]/30 transition-all text-[10px] uppercase font-bold"
                                                title="Analyse Technique Juridique"
                                            >
                                                <GraduationCap size={12} /> Technique
                                            </button>
                                            <button
                                                onClick={() => onDeepDive(doc.title, 'standard')}
                                                className="flex items-center gap-1 bg-[#370003] hover:bg-[#601410] text-[#F2B8B5] px-2 py-1.5 rounded-lg border border-[#601410] transition-all text-[10px] uppercase font-bold"
                                                title="Analyse Approfondie Standard"
                                            >
                                                <Zap size={12} /> Profond
                                            </button>
                                        </div>
                                    </div>

                                    {/* Doc Body */}
                                    <div className="p-4 space-y-4">
                                        <p className="text-[#C4C7C5] text-xs leading-relaxed border-l-2 border-[#444746] pl-3">
                                            {doc.description}
                                        </p>

                                        {doc.key_facts && doc.key_facts.length > 0 && (
                                            <div className="bg-[#121212] rounded-lg p-3">
                                                <label className="text-[10px] uppercase tracking-widest text-[#8E918F] mb-2 flex items-center gap-1.5">
                                                    <List size={10} /> Faits Clés Extraits
                                                </label>
                                                <ul className="space-y-1.5">
                                                    {doc.key_facts.map((fact, k) => (
                                                        <li key={k} className="text-[#E3E3E3] text-xs flex items-start gap-2">
                                                            <span className="text-[#F2B8B5] mt-1 text-[8px]">●</span>
                                                            <span className="leading-snug">{fact}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {doc.legal_implications && (
                                            <div className="flex items-start gap-2 text-xs text-[#A8C7FA] bg-[#004A77]/20 p-2 rounded border border-[#004A77]/30">
                                                <Scale size={14} className="shrink-0 mt-0.5" />
                                                <span><strong className="font-semibold">Implication :</strong> {doc.legal_implications}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-[#757775] text-xs italic p-4 bg-[#121212] rounded-lg border border-[#444746] border-dashed text-center">
                                Aucun document ne correspond au filtre "{activeFilter}".
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 pt-4 border-t border-[#444746]/50">
                    {/* Entités Globales */}
                    <div>
                        <label className="text-[11px] uppercase tracking-widest text-[#8E918F] mb-2 flex items-center gap-2">
                            <Users size={12} /> Entités Globales Identifiées
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {data.entites_cles && data.entites_cles.length > 0 ? (
                                data.entites_cles.map((entity, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onEntityClick(entity)}
                                        className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2B2B2B] text-[#E3E3E3] text-xs border border-[#444746] hover:border-[#F2B8B5] hover:bg-[#370003] transition-all cursor-pointer"
                                        title={`Lancer une recherche spécifique sur ${entity}`}
                                    >
                                        <span>{entity}</span>
                                        <ArrowUpRight size={10} className="text-[#F2B8B5] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))
                            ) : (
                                <span className="text-[#757775] text-xs italic">Aucune entité détectée</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sources Section */}
                <div className="mt-auto pt-6 border-t border-[#444746]">
                    <label className="text-[11px] uppercase tracking-widest text-[#8E918F] mb-3 flex items-center gap-2">
                        <LinkIcon size={12} /> Sources de Données (Grounding)
                    </label>
                    <div className="space-y-2">
                        {sources.length > 0 ? (
                            sources.map((source, i) => (
                                <a
                                    key={i}
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between group p-2 rounded-lg hover:bg-[#2B2B2B] transition-colors cursor-pointer"
                                >
                                    <span className="text-xs text-[#8AB4F8] truncate max-w-[80%] group-hover:underline">{source.title}</span>
                                    <span className="text-[10px] text-[#444746] font-mono group-hover:text-[#C4C7C5]">LIEN EXT ↗</span>
                                </a>
                            ))
                        ) : (
                            <div className="text-[11px] text-[#757775] italic">Aucune source externe citée.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
