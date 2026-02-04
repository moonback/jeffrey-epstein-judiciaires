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
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ history, onDeepDive, onOpenInvestigation }) => {
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
        item.doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.investigationQuery.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = activeType === 'ALL' || item.doc.type === activeType;

      return matchesSearch && matchesType;
    });
  }, [allDocuments, searchTerm, activeType]);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

      <header className="px-6 lg:px-12 py-6 lg:py-8 border-b border-slate-100 bg-white/90 backdrop-blur-xl z-40 shadow-sm relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none opacity-50"></div>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-black rounded-[1.2rem] flex items-center justify-center shadow-2xl group transition-all">
              <DatabaseIcon className="text-white group-hover:scale-110 transition-transform" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight leading-tight">Archives <span className="text-[#B91C1C]">Centrales</span></h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C] animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Unité d'Indexation Forensique</span>
              </div>
            </div>
          </div>

          <div className="relative group w-full xl:w-[500px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#B91C1C] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Rechercher une déposition ou un indice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#F8FAFC] border border-slate-100 rounded-2xl py-3 pl-14 pr-6 text-sm text-[#0F172A] w-full focus:bg-white focus:border-[#B91C1C] focus:ring-4 focus:ring-red-900/5 outline-none transition-all shadow-inner placeholder-slate-300 font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-8 overflow-x-auto no-scrollbar pb-1 relative z-10">
          <div className="flex items-center gap-2 p-1.5 bg-[#F8FAFC] rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-8 flex items-center justify-center pointer-events-none">
              <ListFilter size={14} className="text-slate-200" />
            </div>
            <button
              onClick={() => setActiveType('ALL')}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeType === 'ALL'
                ? 'bg-white text-[#B91C1C] shadow-md border border-slate-50'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              All Pieces
            </button>
            {types.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeType === type
                  ? 'bg-white text-[#B91C1C] shadow-md border border-slate-50'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="ml-auto hidden xl:flex items-center gap-4">
            <div className="h-8 w-px bg-slate-100 mx-2"></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#B5965D]" />
              Indexed Piece Count: <span className="text-[#0F172A] font-mono-data font-black">{allDocuments.length}</span>
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar z-10 scroll-smooth">
        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8 max-w-[1900px] mx-auto pb-40">
            {filteredDocs.map((item, idx) => (
              <div
                key={`${item.investigationId}-${idx}`}
                className="group relative bg-white rounded-[2.5rem] border border-slate-100 hover:border-[#B91C1C]/10 transition-all duration-700 flex flex-col overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 animate-pro-reveal"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* ID Background Decoration */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                  <Cpu size={120} className="text-black" />
                </div>

                <div className="p-8 pb-4 relative">
                  <div className="flex justify-between items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#B91C1C]"></div>
                      <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-50 text-[#0F172A] border border-slate-100 shadow-sm">
                        {item.doc.type || 'Standard'}
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenInvestigation(item.investigationId)}
                      className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-300 hover:text-[#B91C1C] hover:border-[#B91C1C] border border-slate-100 transition-all shadow-sm hover:shadow-md active:scale-90"
                      title="Open full investigation"
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                  <h3 className="text-[#0F172A] font-black text-lg italic leading-tight group-hover:text-[#B91C1C] transition-colors h-14 line-clamp-2 font-serif-legal">
                    {item.doc.title}
                  </h3>
                </div>

                <div className="px-8 py-4 space-y-6 flex-1 relative">
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-50 group-hover:bg-[#B91C1C]/10 rounded-full transition-all"></div>
                    <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-3 italic pl-6 font-medium selection:bg-red-50">
                      "{item.doc.description}"
                    </p>
                  </div>

                  {item.doc.key_facts && item.doc.key_facts.length > 0 && (
                    <div className="space-y-4 bg-[#F8FAFC]/50 p-6 rounded-[2rem] border border-slate-50 group-hover:bg-white group-hover:border-slate-100 transition-all">
                      <label className="text-[9px] uppercase font-black tracking-[0.3em] text-slate-300 flex items-center gap-2">
                        <Activity size={12} className="text-[#B91C1C]" /> Verified Insight
                      </label>
                      <ul className="space-y-3">
                        {item.doc.key_facts.slice(0, 2).map((fact, fidx) => (
                          <li key={fidx} className="flex items-start gap-4 text-[12px] text-slate-600 leading-snug font-bold group/li">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/li:bg-[#B91C1C] mt-1.5 shrink-0 transition-colors"></span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="p-8 pt-0">
                  <div className="grid grid-cols-3 gap-3 p-2 bg-[#F8FAFC] rounded-[2rem] border border-slate-50 shadow-inner">
                    <button
                      onClick={() => onDeepDive(item.doc.title, 'simple')}
                      className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-black hover:text-white text-slate-500 border border-slate-100 shadow-sm rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all group/btn"
                    >
                      <BookOpen size={14} className="group-hover/btn:scale-110 transition-transform" /> Summary
                    </button>
                    <button
                      onClick={() => onDeepDive(item.doc.title, 'technical')}
                      className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-[#0F4C81] hover:text-white text-slate-500 border border-slate-100 shadow-sm rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all group/btn"
                    >
                      <Shield size={14} className="group-hover/btn:scale-110 transition-transform" /> Expert
                    </button>
                    <button
                      onClick={() => onDeepDive(item.doc.title, 'standard')}
                      className="flex items-center justify-center gap-2 py-3 bg-[#B91C1C] hover:bg-black text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/10 active:scale-95 group/btn"
                    >
                      <Zap size={14} className="group-hover/btn:rotate-12 transition-transform" /> Neural
                    </button>
                  </div>

                  <div className="flex items-center justify-center mt-6 gap-2 opacity-0 group-hover:opacity-100 transition-all duration-700">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Source Link Synchronized</span>
                    <div className="h-0.5 w-6 bg-slate-50 rounded-full"></div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed border-slate-100 rounded-[4rem] bg-white animate-pro-reveal relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#B91C1C]/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-2000 pointer-events-none"></div>
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-[#B91C1C] blur-[80px] opacity-10"></div>
              <div className="relative w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center shadow-inner">
                <DatabaseIcon size={64} className="text-slate-200" strokeWidth={1} />
              </div>
            </div>
            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-[0.5em] italic font-serif-legal">Archives Standby</h3>
            <p className="max-w-md mt-6 text-slate-400 font-black text-[10px] uppercase tracking-widest text-center leading-relaxed">
              Le moteur d'indexation n'a détecté aucun flux compatible. <br />Veuillez initialiser une nouvelle investigation.
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
