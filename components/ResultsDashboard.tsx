/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ProcessedResult, DocumentDetail } from '../types';
import { Search, Database, FileText, Calendar, Filter, ArrowUpRight, BookOpen, GraduationCap, Zap, Download, Database as DatabaseIcon, Shield, Activity, ListFilter, ShieldCheck, Cpu } from 'lucide-react';

interface ResultsDashboardProps {
  history: ProcessedResult[];
  onDeepDive: (docTitle: string, style: 'standard' | 'simple' | 'technical') => void;
  onOpenInvestigation: (id: string) => void;
  isGuestMode?: boolean;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ history, onDeepDive, onOpenInvestigation, isGuestMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState<string>('ALL');

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

  const types = useMemo(() => {
    const t = new Set<string>();
    allDocuments.forEach(item => {
      if (item.doc.type) t.add(item.doc.type);
    });
    return Array.from(t).sort();
  }, [allDocuments]);

  const filteredDocs = useMemo(() => {
    return allDocuments.filter(item => {
      const matchesSearch =
        (item.doc?.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.doc?.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.investigationQuery?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      const matchesType = activeType === 'ALL' || item.doc.type === activeType;

      return matchesSearch && matchesType;
    });
  }, [allDocuments, searchTerm, activeType]);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

      <header className="px-6 lg:px-8 py-5 border-b border-slate-100 bg-white/95 backdrop-blur-2xl z-40 shadow-sm relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-slate-50/50 to-transparent pointer-events-none opacity-30"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-[#020617] rounded-xl flex items-center justify-center shadow-xl group transition-all hover:rotate-6">
              <DatabaseIcon className="text-white group-hover:scale-110 transition-transform" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl lg:text-2xl font-black text-[#020617] font-display tracking-tight leading-none">
                  Archives <span className="text-[#DC2626]">Centrales</span>
                </h2>
                <span className="badge-forensic bg-slate-50 text-slate-300 border-slate-100 px-2 py-0.5 text-[8px]">Vault_Sync_ v4.0</span>
              </div>
              <div className="flex items-center gap-4 mt-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Indexation Forensique</span>
                </div>
                <div className="h-3 w-px bg-slate-100"></div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={12} className="text-[#DC2626]" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Niveau 5</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group w-full lg:w-[350px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#DC2626] transition-colors" size={16} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-12 pr-6 text-[13px] text-[#020617] w-full focus:bg-white focus:border-[#DC2626] outline-none transition-all shadow-inner placeholder-slate-300 font-bold"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6 relative z-10">
          <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-100 shadow-sm overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setActiveType('ALL')}
              className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${activeType === 'ALL'
                ? 'bg-[#020617] text-white shadow-md'
                : 'text-slate-400 hover:text-[#020617]'
                }`}
            >
              Toutes les Pièces
            </button>
            {types.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeType === type
                  ? 'bg-[#020617] text-white shadow-md'
                  : 'text-slate-400 hover:text-[#020617]'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="sm:ml-auto flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.1em]">Volume Indexé</span>
              <span className="text-[12px] font-mono-data font-black text-[#020617] tracking-tight">{allDocuments.length} Documents</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar z-10 scroll-smooth">
        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 max-w-[2400px] mx-auto pb-20">
            {filteredDocs.map((item, idx) => (
              <div
                key={`${item.investigationId}-${idx}`}
                className="group relative bg-white rounded-2xl border border-slate-100 hover:border-[#DC2626]/20 transition-all duration-500 flex flex-col overflow-hidden shadow-sm hover:shadow-lg animate-pro-reveal"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* ID Background Decoration Compact */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity pointer-events-none">
                  <Cpu size={60} className="text-black" />
                </div>

                <div className="p-4 pb-1 relative">
                  <div className="flex justify-between items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-[#DC2626]"></div>
                      <span className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 text-[7px] font-black uppercase tracking-tight border border-slate-100">
                        {item.doc.type || 'Standard'}
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenInvestigation(item.investigationId)}
                      className="w-6 h-6 rounded bg-white flex items-center justify-center text-slate-300 hover:text-[#DC2626] border border-slate-100 transition-all active:scale-90"
                    >
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                  <h3 className="text-[#020617] font-black text-sm italic leading-tight group-hover:text-[#DC2626] transition-colors h-10 line-clamp-2 font-serif-legal">
                    {item.doc.title}
                  </h3>
                </div>

                <div className="px-4 py-3 space-y-3 flex-1 relative">
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-50 group-hover:bg-[#DC2626]/10 rounded-full transition-all"></div>
                    <p className="text-slate-600 text-[12px] leading-relaxed line-clamp-3 italic pl-4 font-medium font-serif-legal">
                      "{item.doc.description}"
                    </p>
                  </div>

                  {Array.isArray(item.doc.key_facts) && item.doc.key_facts.length > 0 && (
                    <div className="space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100 group-hover:bg-white transition-all">
                      <ul className="space-y-1.5">
                        {item.doc.key_facts.slice(0, 2).map((fact, fidx) => (
                          <li key={fidx} className="flex items-start gap-2 text-[10px] text-slate-500 leading-snug font-bold">
                            <span className="w-1 h-1 rounded-full bg-[#DC2626]/40 mt-1 shrink-0"></span>
                            <span className="line-clamp-2">{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="p-4 pt-0">
                  {!isGuestMode && (
                    <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                      <button
                        onClick={() => onDeepDive(item.doc.title, 'simple')}
                        className="py-1.5 bg-white hover:bg-[#020617] hover:text-white text-slate-500 border border-slate-50 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all"
                      >
                        Synthèse
                      </button>
                      <button
                        onClick={() => onDeepDive(item.doc.title, 'technical')}
                        className="py-1.5 bg-white hover:bg-[#0F4C81] hover:text-white text-slate-500 border border-slate-50 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all"
                      >
                        Expert
                      </button>
                      <button
                        onClick={() => onDeepDive(item.doc.title, 'standard')}
                        className="py-1.5 bg-[#DC2626] hover:bg-[#020617] text-white rounded-lg text-[7px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                      >
                        Neural
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[500px] border border-slate-100 rounded-3xl bg-white animate-pro-reveal relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#DC2626]/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-2000 pointer-events-none"></div>
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#DC2626] blur-[60px] opacity-10"></div>
              <div className="relative w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center shadow-inner">
                <DatabaseIcon size={40} className="text-slate-200" strokeWidth={1} />
              </div>
            </div>
            <h3 className="text-xl font-black text-[#020617] uppercase tracking-[0.4em] italic font-serif-legal">Archives Standby</h3>
            <p className="max-w-md mt-4 text-slate-400 font-black text-[9px] uppercase tracking-widest text-center leading-relaxed">
              Le moteur d'indexation n'a détecté aucun flux compatible. <br />Initialisation requise.
            </p>
          </div>
        )}
      </div>

      {/* Side Label */}
      <div className="hidden 2xl:block fixed right-4 top-1/2 -translate-y-1/2 -rotate-90 origin-right pointer-events-none z-10">
        <span className="text-[9px] font-black text-slate-200 uppercase tracking-[1em] whitespace-nowrap">SECURED DATABASE ACCESS PROTOCOL 4.0</span>
      </div>
    </div>
  );
};
