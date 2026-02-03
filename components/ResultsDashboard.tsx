/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { ProcessedResult, DocumentDetail } from '../types';
import { Search, Database, FileText, Calendar, Filter, ArrowUpRight, BookOpen, GraduationCap, Zap, Download } from 'lucide-react';

interface ResultsDashboardProps {
  history: ProcessedResult[];
  onDeepDive: (docTitle: string, style: 'standard' | 'simple' | 'technical') => void;
  onOpenInvestigation: (id: string) => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ history, onDeepDive, onOpenInvestigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState<string>('ALL');

  // Flatten all documents from all successful investigations
  const allDocuments = useMemo(() => {
    const docs: { doc: DocumentDetail; investigationId: string; investigationQuery: string }[] = [];
    history.forEach(res => {
      if (res.output?.documents) {
        res.output.documents.forEach(d => {
          docs.push({
            doc: d,
            investigationId: res.id,
            investigationQuery: res.input.query
          });
        });
      }
    });
    return docs;
  }, [history]);

  // Unique types for filtering
  const types = useMemo(() => {
    const t = new Set<string>();
    allDocuments.forEach(item => {
      if (item.doc.type) t.add(item.doc.type);
    });
    return Array.from(t);
  }, [allDocuments]);

  // Filtered documents based on search and type
  const filteredDocs = useMemo(() => {
    return allDocuments.filter(item => {
      const matchesSearch = 
        item.doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.investigationQuery.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = activeType === 'ALL' || item.doc.type === activeType;
      
      return matchesSearch && matchesType;
    });
  }, [allDocuments, searchTerm, activeType]);

  return (
    <div className="flex flex-col h-full bg-[#121212] animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="p-8 border-b border-[#2D2D2D] bg-[#1E1E1E]/50 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-medium text-[#E3E3E3] flex items-center gap-3">
              <Database className="text-[#F2B8B5]" size={28} />
              Base de Données de l'Investigation
            </h2>
            <p className="text-[#8E918F] text-sm mt-1">
              Agrégation de {allDocuments.length} documents extraits à travers {history.length} sessions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757775] group-focus-within:text-[#F2B8B5] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher un document, un fait ou une affaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0F0F0F] border border-[#444746] rounded-full py-2.5 pl-10 pr-4 text-sm w-full sm:w-[350px] focus:outline-none focus:border-[#F2B8B5] focus:ring-1 focus:ring-[#F2B8B5] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-3 mt-8 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setActiveType('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
              activeType === 'ALL' 
                ? 'bg-[#F2B8B5] text-[#370003] border-[#F2B8B5] shadow-lg shadow-[#F2B8B5]/20' 
                : 'bg-transparent text-[#8E918F] border-[#444746] hover:border-[#8E918F]'
            }`}
          >
            Tous les Documents
          </button>
          {types.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
                activeType === type 
                  ? 'bg-[#8AB4F8] text-[#002B55] border-[#8AB4F8] shadow-lg shadow-[#8AB4F8]/20' 
                  : 'bg-transparent text-[#8E918F] border-[#444746] hover:border-[#8AB4F8]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content / Grid */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {filteredDocs.map((item, idx) => (
              <div key={`${item.investigationId}-${idx}`} className="group relative bg-[#1E1E1E] rounded-2xl border border-[#444746] hover:border-[#F2B8B5]/50 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1">
                
                {/* Doc Card Header */}
                <div className="p-5 border-b border-[#2D2D2D] bg-[#2B2B2B]/30">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#004A77] text-[#D3E3FD]">
                      {item.doc.type}
                    </span>
                    <button 
                      onClick={() => onOpenInvestigation(item.investigationId)}
                      className="text-[#8E918F] hover:text-[#F2B8B5] transition-colors p-1"
                      title="Aller à l'investigation source"
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                  <h3 className="text-[#E3E3E3] font-semibold text-lg line-clamp-2 leading-snug group-hover:text-[#F2B8B5] transition-colors">
                    {item.doc.title}
                  </h3>
                </div>

                {/* Doc Card Body */}
                <div className="p-5 space-y-4 flex-1">
                  <p className="text-[#C4C7C5] text-sm leading-relaxed line-clamp-3 italic">
                    {item.doc.description}
                  </p>

                  {item.doc.key_facts && item.doc.key_facts.length > 0 && (
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest text-[#757775] font-bold">Faits Saillants</label>
                       <ul className="space-y-1.5">
                         {item.doc.key_facts.slice(0, 2).map((fact, fidx) => (
                           <li key={fidx} className="flex items-start gap-2 text-xs text-[#E3E3E3]">
                              <span className="text-[#F2B8B5] mt-1 shrink-0">●</span>
                              <span className="line-clamp-2">{fact}</span>
                           </li>
                         ))}
                         {item.doc.key_facts.length > 2 && (
                           <li className="text-[10px] text-[#757775] italic ml-4">+{item.doc.key_facts.length - 2} autres faits...</li>
                         )}
                       </ul>
                    </div>
                  )}
                </div>

                {/* Quick Actions Footer */}
                <div className="p-4 bg-[#121212]/50 border-t border-[#2D2D2D] flex flex-wrap gap-2">
                  <button 
                    onClick={() => onDeepDive(item.doc.title, 'simple')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#2B2B2B] hover:bg-[#F2B8B5]/10 text-[#F2B8B5] py-2 rounded-lg border border-[#F2B8B5]/20 text-[10px] uppercase font-bold transition-all"
                  >
                    <BookOpen size={12} /> Simple
                  </button>
                  <button 
                    onClick={() => onDeepDive(item.doc.title, 'technical')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#2B2B2B] hover:bg-[#8AB4F8]/10 text-[#8AB4F8] py-2 rounded-lg border border-[#8AB4F8]/20 text-[10px] uppercase font-bold transition-all"
                  >
                    <GraduationCap size={12} /> Tech
                  </button>
                  <button 
                    onClick={() => onDeepDive(item.doc.title, 'standard')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#370003] hover:bg-[#601410] text-[#F2B8B5] py-2 rounded-lg border border-[#601410] text-[10px] uppercase font-bold transition-all"
                  >
                    <Zap size={12} /> Profond
                  </button>
                </div>

                {/* Metadata overlay on hover */}
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                   <div className="bg-[#121212]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#444746] text-[10px] text-[#8E918F]">
                      Source: {item.investigationId}
                   </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-[#757775] text-center border-2 border-dashed border-[#2D2D2D] rounded-3xl">
             <Database size={64} className="mb-4 opacity-10" />
             <h3 className="text-xl font-medium text-[#E3E3E3]">Aucun résultat correspondant</h3>
             <p className="max-w-md mt-2">
               Affinez vos termes de recherche ou sélectionnez un autre filtre pour trouver ce que vous cherchez.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};
