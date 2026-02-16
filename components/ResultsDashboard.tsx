/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PageHeader } from './PageHeader';
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
    <div className="flex flex-col h-full bg-[var(--background)] overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

      <PageHeader
        title="Archives"
        titleHighlight="Centrales"
        icon={DatabaseIcon}
        badgeText=""
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        totalLabel="Base Documentaire"
        totalCount={filteredDocs.length}
        stats={[
          { label: "Indexation Forensique", value: "", icon: <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></div> },
          { label: "Niveau 5", value: "", icon: <ShieldCheck size={12} className="text-[var(--accent)]" /> }
        ]}
      >
        <button
          onClick={() => setActiveType('ALL')}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${activeType === 'ALL'
            ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-[var(--shadow-soft)]'
            : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
            }`}
        >
          Tout ({allDocuments.length})
        </button>
        {types.map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${activeType === type
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-[var(--shadow-soft)]'
              : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
              }`}
          >
            {type}
          </button>
        ))}
      </PageHeader>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar z-10 scroll-smooth">
        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 max-w-[2400px] mx-auto pb-20">
            {filteredDocs.map((item, idx) => (
              <div
                key={`${item.investigationId}-${idx}`}
                className="group relative bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--border)] hover:border-[var(--accent)]/20 transition-all duration-500 flex flex-col overflow-hidden shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-premium)] animate-reveal"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* ID Background Decoration Compact */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity pointer-events-none">
                  <Cpu size={60} className="text-[var(--text)]" />
                </div>

                <div className="p-5 pb-2 relative border-b border-[var(--surface-muted)]">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] text-[9px] font-black uppercase tracking-wider shadow-sm">
                        {item.doc.type || 'ST'}
                      </span>
                      {item.doc.date && (
                        <span className="px-2.5 py-1 rounded-md bg-[var(--surface-muted)] text-[var(--text-muted)] text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Calendar size={10} /> {item.doc.date}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onOpenInvestigation(item.investigationId)}
                      className="w-8 h-8 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--accent)] flex items-center justify-center text-[var(--text-dim)] hover:text-white transition-all shadow-sm"
                      title="Ouvrir le dossier complet"
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                  <h3 className="text-[var(--text)] font-bold text-lg leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2 font-display mb-1">
                    {item.doc.title}
                  </h3>
                  <div className="text-[10px] text-[var(--text-dim)] font-mono-data uppercase tracking-tight">
                    REF: {item.investigationId.split('-')[1]} • SRCE: {item.investigationQuery.substring(0, 15)}...
                  </div>
                </div>

                <div className="px-5 py-4 space-y-4 flex-1 relative">
                  <div className="relative">
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed line-clamp-3 font-medium font-legal">
                      "{item.doc.description}"
                    </p>
                  </div>

                  {Array.isArray(item.doc.key_facts) && item.doc.key_facts.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest flex items-center gap-2">
                        <Activity size={10} /> Points Clés
                      </div>
                      <ul className="space-y-2">
                        {item.doc.key_facts.slice(0, 3).map((fact, fidx) => (
                          <li key={fidx} className="flex items-start gap-2.5 text-xs text-[var(--text-muted)] leading-snug">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/60 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(220,38,38,0.2)]"></span>
                            <span className="line-clamp-2">{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="p-4 pt-0 mt-auto">
                  {!isGuestMode && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onDeepDive(item.doc.title, 'simple')}
                        className="flex-1 py-2.5 bg-[var(--surface-muted)] hover:bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]/20 text-[var(--text-muted)] hover:text-[var(--accent)] rounded-[var(--radius-md)] text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 group/btn"
                        title="Résumé simple pour compréhension rapide"
                      >
                        <BookOpen size={12} className="opacity-50 group-hover/btn:opacity-100" />
                        <span>Synthèse</span>
                      </button>
                      <button
                        onClick={() => onDeepDive(item.doc.title, 'technical')}
                        className="flex-1 py-2.5 bg-[var(--surface-muted)] hover:bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--info)]/20 text-[var(--text-muted)] hover:text-[var(--info)] rounded-[var(--radius-md)] text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 group/btn"
                        title="Analyse technique et juridique détaillée"
                      >
                        <GraduationCap size={12} className="opacity-50 group-hover/btn:opacity-100" />
                        <span>Expert</span>
                      </button>
                      <button
                        onClick={() => onDeepDive(item.doc.title, 'standard')}
                        className="flex-1 py-2.5 bg-[var(--accent)] hover:opacity-90 text-[var(--accent-foreground)] rounded-[var(--radius-md)] text-[9px] font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        title="Analyse approfondie par l'IA"
                      >
                        <Zap size={12} fill="currentColor" />
                        <span>Neural</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[500px] border border-[var(--border)] rounded-[var(--radius-2xl)] bg-[var(--surface)] animate-reveal relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--accent)]/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-2000 pointer-events-none"></div>
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[var(--accent)] blur-[60px] opacity-10"></div>
              <div className="relative w-24 h-24 bg-[var(--surface-muted)] rounded-[var(--radius-xl)] flex items-center justify-center shadow-inner">
                <DatabaseIcon size={40} className="text-[var(--text-dim)]" strokeWidth={1} />
              </div>
            </div>
            <h3 className="text-xl font-black text-[var(--text)] uppercase tracking-[0.4em] italic font-legal">Archives Standby</h3>
            <p className="max-w-md mt-4 text-[var(--text-dim)] font-black text-[9px] uppercase tracking-widest text-center leading-relaxed">
              Le moteur d'indexation n'a détecté aucun flux compatible. <br />Initialisation requise.
            </p>
          </div>
        )}
      </div>

      {/* Side Label */}
      <div className="hidden 2xl:block fixed right-4 top-1/2 -translate-y-1/2 -rotate-90 origin-right pointer-events-none z-10">
        <span className="text-[9px] font-black text-[var(--text-dim)]/20 uppercase tracking-[1em] whitespace-nowrap">SECURED DATABASE ACCESS PROTOCOL 5.0</span>
      </div>
    </div>
  );
};
