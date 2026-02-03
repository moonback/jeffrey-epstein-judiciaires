/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ProcessedResult, DocumentDetail } from '../types';
import { Search, Database, FileText, Calendar, Filter, ArrowUpRight, BookOpen, GraduationCap, Zap, Download, Database as DatabaseIcon, Shield, Activity, ListFilter } from 'lucide-react';

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
    return Array.from(t);
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
    <div className="flex flex-col h-full bg-[#0A0A0A] overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.2]"
        style={{ backgroundImage: 'linear-gradient(to right, #1F1F1F 1px, transparent 1px), linear-gradient(to bottom, #1F1F1F 1px, transparent 1px)', backgroundSize: '64px 64px' }}>
      </div>

      <header className="p-10 border-b border-[#1F1F1F] bg-[#0F0F0F]/50 backdrop-blur-3xl z-40">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2.5 bg-[#8AB4F8]/10 rounded-xl border border-[#8AB4F8]/20">
                <DatabaseIcon className="text-[#8AB4F8]" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Central Evidence Vault</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8AB4F8] animate-pulse"></span>
                  <span className="text-[10px] font-bold text-[#757775] uppercase tracking-[0.2em]">Restricted Access Database</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group w-full lg:w-[450px]">
            <div className="absolute inset-0 bg-[#8AB4F8] blur-xl opacity-10 group-focus-within:opacity-20 transition-opacity"></div>
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#444746] group-focus-within:text-[#8AB4F8] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search evidence titles, facts, or patterns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#161616] border border-[#2D2D2D] rounded-[24px] py-4 pl-14 pr-6 text-sm text-white w-full focus:border-[#8AB4F8] focus:outline-none transition-all shadow-2xl"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-10 overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-3 bg-[#161616] px-4 py-2 rounded-2xl border border-[#1F1F1F]">
            <ListFilter size={14} className="text-[#757775]" />
            <button
              onClick={() => setActiveType('ALL')}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeType === 'ALL'
                  ? 'bg-[#8AB4F8] text-[#002B55]'
                  : 'text-[#757775] hover:text-white'
                }`}
            >
              All Entities
            </button>
            {types.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeType === type
                    ? 'bg-[#8AB4F8] text-[#002B55]'
                    : 'text-[#757775] hover:text-white'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="ml-auto hidden xl:flex items-center gap-4">
            <span className="text-[10px] font-black text-[#444746] uppercase tracking-widest">
              System Capacity: <span className="text-[#8AB4F8]">{allDocuments.length} Objects</span>
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar z-10 lg:p-16">
        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-10">
            {filteredDocs.map((item, idx) => (
              <div
                key={`${item.investigationId}-${idx}`}
                className="group relative bg-[#161616] rounded-[48px] border border-[#1F1F1F] hover:border-[#8AB4F8]/30 transition-all duration-500 flex flex-col overflow-hidden shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:-translate-y-2"
              >

                <div className="p-8 pb-4">
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#004A77] text-[#D3E3FD] border border-white/5 shadow-lg">
                      {item.doc.type}
                    </span>
                    <button
                      onClick={() => onOpenInvestigation(item.investigationId)}
                      className="w-10 h-10 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-[#444746] hover:text-[#8AB4F8] hover:border-[#8AB4F8]/30 border border-[#1F1F1F] transition-all"
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                  <h3 className="text-white font-black text-xl italic leading-tight group-hover:text-[#8AB4F8] transition-colors h-14 line-clamp-2">
                    {item.doc.title}
                  </h3>
                </div>

                <div className="px-8 py-4 space-y-6 flex-1">
                  <div className="relative">
                    <p className="text-[#8E918F] text-xs leading-relaxed line-clamp-3 italic pl-4 border-l-2 border-[#1F1F1F] group-hover:border-[#8AB4F8]/30 transition-all">
                      {item.doc.description}
                    </p>
                  </div>

                  {item.doc.key_facts && item.doc.key_facts.length > 0 && (
                    <div className="space-y-3 bg-[#0A0A0A] p-5 rounded-[32px] border border-[#1F1F1F]">
                      <label className="text-[9px] uppercase font-black tracking-[0.2em] text-[#444746] flex items-center gap-2">
                        <Activity size={10} className="text-[#8AB4F8]" /> Verified Findings
                      </label>
                      <ul className="space-y-3">
                        {item.doc.key_facts.slice(0, 2).map((fact, fidx) => (
                          <li key={fidx} className="flex items-start gap-3 text-[11px] text-[#C4C7C5] leading-snug">
                            <span className="w-1 h-1 rounded-full bg-[#8AB4F8] mt-1.5 shrink-0"></span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="p-6 pt-0">
                  <div className="grid grid-cols-3 gap-2 p-2 bg-black rounded-[28px] border border-[#1F1F1F]">
                    <button
                      onClick={() => onDeepDive(item.doc.title, 'simple')}
                      className="flex items-center justify-center gap-1.5 py-3 hover:bg-[#8AB4F8] hover:text-[#002B55] text-[#8AB4F8] rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      <BookOpen size={12} /> Simple
                    </button>
                    <button
                      onClick={() => onDeepDive(item.doc.title, 'technical')}
                      className="flex items-center justify-center gap-1.5 py-3 hover:bg-[#D3E3FD] hover:text-[#002B55] text-[#C4C7C5] rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      <Shield size={12} /> Tech
                    </button>
                    <button
                      onClick={() => onDeepDive(item.doc.title, 'standard')}
                      className="flex items-center justify-center gap-1.5 py-3 bg-[#370003] hover:bg-[#F2B8B5] hover:text-[#370003] text-[#F2B8B5] rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      <Zap size={12} /> Neural
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed border-[#1F1F1F] rounded-[60px]">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#8AB4F8] blur-3xl opacity-5 animate-pulse"></div>
              <DatabaseIcon size={80} className="text-[#1F1F1F] relative" strokeWidth={0.5} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-[0.5em] italic">No Matches Found</h3>
            <p className="max-w-md mt-4 text-[#444746] font-bold text-xs uppercase tracking-widest">
              Adjust clearance level or refine search parameters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
