/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { DisclosureAnalysis } from '../types';
import { Search, Calendar, Users, FileText, Link as LinkIcon, ShieldAlert, File } from 'lucide-react';

interface DataCardProps {
  data: DisclosureAnalysis | null;
  sources: { title: string; uri: string }[];
  loading: boolean;
}

export const DataCard: React.FC<DataCardProps> = ({ data, sources, loading }) => {
  if (loading) {
    return (
      <div className="w-full bg-[#1E1E1E] rounded-3xl p-8 border border-[#444746] flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="relative w-20 h-20">
           <div className="absolute inset-0 rounded-full border-4 border-[#444746]"></div>
           <div className="absolute inset-0 rounded-full border-4 border-[#F2B8B5] border-t-transparent animate-spin"></div>
        </div>
        <div className="text-center space-y-2">
            <p className="text-[#F2B8B5] font-medium animate-pulse tracking-widest uppercase text-sm">Analyse Forensique en Cours</p>
            <p className="text-[#C4C7C5] text-xs">Accès à l'Index Google Search & Archives DOJ...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full bg-[#1E1E1E] rounded-3xl p-8 border border-[#444746] border-dashed flex items-center justify-center min-h-[400px]">
        <div className="text-center opacity-50">
            <Search size={48} className="mx-auto text-[#444746] mb-3" />
            <span className="text-[#757775] font-mono text-sm">En attente d'investigation...</span>
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
            <span className="text-[#F2B8B5] font-bold tracking-wide text-sm uppercase">Rapport d'Analyse</span>
        </div>
        <span className="text-[#F2B8B5] font-mono text-xs opacity-80 px-2 py-1 bg-[#601410] rounded">{data.contexte_juridique || 'ENQUÊTE GÉNÉRALE'}</span>
      </div>

      <div className="p-8 flex flex-col gap-8 flex-1">
        
        {/* Résumé Global */}
        <div>
            <label className="text-[11px] uppercase tracking-widest text-[#8E918F] mb-2 flex items-center gap-2">
                <FileText size={12} /> Contexte Général
            </label>
            <div className="text-[#E3E3E3] leading-relaxed text-sm bg-[#121212] p-4 rounded-xl border border-[#444746]/50 italic">
                {data.context_general}
            </div>
        </div>

        {/* Section Documents Détaillés */}
        <div>
            <label className="text-[11px] uppercase tracking-widest text-[#8E918F] mb-3 flex items-center gap-2">
                <File size={12} /> Documents Identifiés & Analysés
            </label>
            <div className="space-y-3">
                {data.documents && data.documents.length > 0 ? (
                    data.documents.map((doc, idx) => (
                        <div key={idx} className="bg-[#2B2B2B] p-4 rounded-xl border border-[#444746] hover:border-[#F2B8B5] transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-[#F2B8B5] font-semibold text-sm">{doc.title}</h4>
                                <span className="text-[10px] bg-[#004A77]/50 text-[#D3E3FD] px-2 py-0.5 rounded font-mono shrink-0 ml-2">
                                    {doc.date}
                                </span>
                            </div>
                            <p className="text-[#C4C7C5] text-xs leading-relaxed">
                                {doc.description}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-[#757775] text-xs italic p-4 bg-[#121212] rounded-lg">Aucun document spécifique détecté pour cette requête.</div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 gap-8 pt-4 border-t border-[#444746]/50">
            {/* Entités */}
            <div>
                <label className="text-[11px] uppercase tracking-widest text-[#8E918F] mb-2 flex items-center gap-2">
                    <Users size={12} /> Entités Mentionnées
                </label>
                <div className="flex flex-wrap gap-2">
                    {data.entites_cles && data.entites_cles.length > 0 ? (
                        data.entites_cles.map((entity, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-[#2B2B2B] text-[#E3E3E3] text-xs border border-[#444746]">
                                {entity}
                            </span>
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
                <LinkIcon size={12} /> Sources Vérifiées
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
