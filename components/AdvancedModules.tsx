/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from './PageHeader';
import { storageService } from '../services/storageService';
import { ProcessedResult, DocumentDetail } from '../types';
import { AlertTriangle, Users, ArrowLeftRight, Zap, Loader2, CheckCircle2, ShieldAlert, Target, Fingerprint, Shield, Activity, Search, Database, ChevronRight, ArrowUpRight, ShieldCheck, Cpu, Lock } from 'lucide-react';
import { mergeDataWithFlash, detectContradictions } from '../services/openRouterService';

interface ContradictionsViewProps {
    onDeepDive: (docTitle: string, style: 'standard' | 'simple' | 'technical') => void;
    isGuestMode?: boolean;
}

export const ContradictionsView: React.FC<ContradictionsViewProps> = ({ onDeepDive, isGuestMode }) => {
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [doc1, setDoc1] = useState<string>('');
    const [doc2, setDoc2] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<string | null>(null);

    useEffect(() => {
        storageService.getAllResults().then(data => {
            setHistory(data);
            // Auto-select the last two documents if available to speed up workflow
            const allDocs = data.flatMap(h => (h.output?.documents || []).map(d => d.title));
            if (allDocs.length >= 2) {
                setDoc1(allDocs[0]); // Most recent usually first or last depending on API, assuming flatMap keeps order
                setDoc2(allDocs[1]);
            }
        });
    }, []);

    const allDocs = history.flatMap(h => (h.output?.documents || []).map(d => ({ ...d, investigationId: h.id })));

    const handleAnalyze = async () => {
        if (!doc1 || !doc2) return;
        setIsAnalyzing(true);

        const d1 = allDocs.find(d => d.title === doc1);
        const d2 = allDocs.find(d => d.title === doc2);

        if (!d1 || !d2) {
            setResults("Erreur : Impossible de récupérer le contenu source des documents sélectionnés.");
            setIsAnalyzing(false);
            return;
        }

        try {
            // Use specialized contradiction detection service
            const analysis = await detectContradictions(JSON.stringify(d1), JSON.stringify(d2));
            setResults(analysis);
        } catch (e) {
            setResults("Erreur critique : Échec de l'accès au moteur neuronal de comparaison.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[var(--background)] overflow-hidden relative font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <PageHeader
                title="Détecteur de"
                titleHighlight="Contradictions"
                icon={AlertTriangle}
                badgeText="Moteur de Comparaison Neural v4.2 Actif"
            />

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar z-10 scroll-smooth">
                <div className="max-w-6xl mx-auto space-y-10 pb-20">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[var(--surface)] p-10 lg:p-12 rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-[var(--shadow-premium)] relative overflow-hidden animate-pro-reveal">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--danger)]/5 to-transparent opacity-40"></div>

                        <div className="lg:col-span-12 mb-2">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-[1px] w-8 bg-[var(--accent)]"></div>
                                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--accent)]">Configuration du Cross-Check Forensique</h3>
                            </div>
                        </div>

                        <div className="lg:col-span-5 space-y-5 relative">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[10px] font-black text-[var(--danger)] shadow-sm font-legal italic">01</span>
                                <label className="text-[9px] uppercase font-black text-[var(--text-dim)] tracking-[0.3em]">Source Alpha</label>
                            </div>
                            <div className="relative group">
                                <select
                                    value={doc1}
                                    onChange={e => setDoc1(e.target.value)}
                                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl p-5 pr-12 text-[13px] font-bold text-[var(--text)] focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:outline-none transition-all shadow-inner appearance-none cursor-pointer"
                                >
                                    <option value="">Sélectionner une source...</option>
                                    {allDocs.map((d, i) => <option key={i} value={d.title}>{d.title}</option>)}
                                </select>
                                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] rotate-90 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div className="lg:col-span-2 flex flex-col items-center justify-center relative">
                            <div className="w-14 h-14 bg-[var(--surface)] rounded-xl flex items-center justify-center border border-[var(--border)] shadow-[var(--shadow-soft)] rotate-45 group hover:rotate-180 transition-all duration-1000 active:scale-90">
                                <ArrowLeftRight size={22} className="text-[var(--warning)] -rotate-45 group-hover:rotate-[-180deg] transition-all duration-1000" />
                            </div>
                        </div>

                        <div className="lg:col-span-5 space-y-5 relative">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[10px] font-black text-[var(--danger)] shadow-sm font-legal italic">02</span>
                                <label className="text-[9px] uppercase font-black text-[var(--text-dim)] tracking-[0.3em]">Source Beta</label>
                            </div>
                            <div className="relative group">
                                <select
                                    value={doc2}
                                    onChange={e => setDoc2(e.target.value)}
                                    className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl p-5 pr-12 text-[13px] font-bold text-[var(--text)] focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:outline-none transition-all shadow-inner appearance-none cursor-pointer"
                                >
                                    <option value="">Sélectionner une source...</option>
                                    {allDocs.map((d, i) => <option key={i} value={d.title}>{d.title}</option>)}
                                </select>
                                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] rotate-90 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div className="lg:col-span-12 pt-10">
                            <button
                                disabled={!doc1 || !doc2 || isAnalyzing || isGuestMode}
                                onClick={handleAnalyze}
                                className="w-full relative group"
                            >
                                <div className="absolute inset-0 bg-[var(--accent)] blur-2xl opacity-5 group-hover:opacity-15 transition-opacity rounded-xl"></div>
                                <div className="relative flex items-center justify-center gap-4 bg-[var(--primary)] hover:bg-[var(--accent)] text-[var(--primary-foreground)] font-black uppercase tracking-[0.3em] text-[11px] py-6 rounded-xl shadow-[var(--shadow-soft)] transition-all duration-500 transform active:scale-[0.98] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-dim)]">
                                    {isAnalyzing ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : isGuestMode ? (
                                        <div className="flex items-center gap-4">
                                            <Lock size={20} />
                                            Analyse Croisée (Mode Public Restreint)
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <Cpu size={20} className="group-hover:rotate-180 transition-transform duration-1000" />
                                            Exécuter l'Analyse Croisée Forensique
                                        </div>
                                    )}
                                </div>
                            </button>
                            <div className="mt-6 flex items-center justify-center gap-3 opacity-30 select-none">
                                <div className="h-px w-8 bg-[var(--border)]"></div>
                                <span className="text-[8px] font-black uppercase tracking-[0.5em] text-[var(--text-dim)]">Algorithmic Integrity Guaranteed</span>
                                <div className="h-px w-8 bg-[var(--border)]"></div>
                            </div>
                        </div>
                    </div>

                    {results && (
                        <div className="bg-[var(--surface)] rounded-[var(--radius-2xl)] border border-[var(--border)] p-10 lg:p-12 animate-pro-reveal shadow-[var(--shadow-premium)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                                <ShieldAlert size={160} className="text-[var(--danger)]" />
                            </div>

                            <div className="flex items-center justify-between mb-10 pb-8 border-b border-[var(--border)] relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-[var(--danger)]/5 rounded-xl flex items-center justify-center border border-[var(--danger)]/20 shadow-sm transition-transform hover:scale-110">
                                        <ShieldAlert className="text-[var(--danger)]" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black italic tracking-tight text-[var(--text)] font-legal">Rapport d'Incohérence Critique</h3>
                                        <div className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest mt-1 italic">Généré par Neural Engine v4.2</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setResults(null)}
                                    className="px-5 py-2 rounded-xl bg-[var(--surface-muted)] text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] hover:text-[var(--danger)] hover:bg-[var(--surface)] transition-all border border-[var(--border)] active:scale-95 shadow-sm"
                                >
                                    Ignorer l'Alerte
                                </button>
                            </div>
                            <div className="bg-[var(--surface-muted)]/50 p-8 lg:p-10 rounded-xl border border-[var(--border)]/50 font-mono-data text-[13px] leading-relaxed text-[var(--text-muted)] whitespace-pre-wrap shadow-inner relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--danger)]/10 group-hover:bg-[var(--danger)]/20 transition-all"></div>
                                <p className="relative z-10 selection:bg-[var(--danger)]/10 font-medium italic">"{results}"</p>
                            </div>
                        </div>
                    )}

                    {!results && !isAnalyzing && (
                        <div className="text-center py-40 animate-pro-reveal">
                            <div className="w-24 h-24 bg-[var(--surface)] rounded-xl flex items-center justify-center mx-auto mb-10 border border-[var(--border)] shadow-[var(--shadow-premium)] relative group hover:scale-110 transition-transform">
                                <div className="absolute inset-0 bg-[var(--accent)]/5 blur-[80px] opacity-10 animate-pulse"></div>
                                <Fingerprint size={36} className="text-[var(--surface-muted)] group-hover:text-[var(--accent)] transition-colors relative" strokeWidth={1} />
                            </div>
                            <h3 className="text-lg font-black text-[var(--text)] uppercase tracking-[0.4em] mb-3 italic font-legal">Sources en Attente</h3>
                            <p className="text-[var(--text-dim)] font-black uppercase tracking-[0.3em] text-[9px]">Liez manuellement deux flux pour initialiser le cycle d'analyse</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface POIViewProps {
    onDeepDive: (docTitle: string, style: 'standard' | 'simple' | 'technical') => void;
    isGuestMode?: boolean;
}

export const POIView: React.FC<POIViewProps> = ({ onDeepDive, isGuestMode }) => {
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        storageService.getAllResults().then(setHistory);
    }, []);

    // Help with normalization for matching in filters
    const normalize = (name: any): string => {
        if (!name) return "";
        const target = typeof name === 'string' ? name : ((name as any).nom || (name as any).name || String(name));
        return target.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const entities = useMemo(() => {
        const map = new Map<string, { key: string, displayName: string, docs: number, events: number }>();

        history.forEach(res => {
            const currentResEntities = new Set<string>();

            res.output?.entites_cles?.forEach(ent => {
                const key = normalize(ent);
                if (!key) return;

                if (!map.has(key)) {
                    const displayName = typeof ent === 'string' ? ent : ((ent as any).nom || (ent as any).name || String(ent));
                    map.set(key, { key, displayName, docs: 0, events: 0 });
                }
                currentResEntities.add(key);
            });

            currentResEntities.forEach(key => {
                const stats = map.get(key)!;
                stats.docs++;
            });

            res.output?.documents?.forEach(doc => {
                if (Array.isArray(doc.key_facts)) {
                    doc.key_facts.forEach(fact => {
                        if (typeof fact !== 'string') return;
                        const lowerFact = fact.toLowerCase();

                        currentResEntities.forEach(key => {
                            const stats = map.get(key)!;
                            if (lowerFact.includes(stats.displayName.toLowerCase())) {
                                stats.events++;
                            }
                        });
                    });
                }
            });
        });

        return Array.from(map.values())
            .filter(e => e.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => b.docs - a.docs);
    }, [history, searchQuery]);

    const selectedEntityData = useMemo(() => {
        if (!selectedEntity) return null;
        return entities.find(e => e.key === selectedEntity) || null;
    }, [selectedEntity, entities]);

    return (
        <div className="h-full flex flex-col bg-[var(--background)] overflow-hidden relative font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <PageHeader
                title="Index des"
                titleHighlight="Cibles"
                icon={Users}
                badgeText="Classified Intelligence Clustering Protocol"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Rechercher une cible..."
                totalLabel="Profils"
                totalCount={entities.length}
            />

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row z-20">
                {/* Entity List Sidebar */}
                <div className="w-full lg:w-[320px] border-r border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-xl overflow-y-auto custom-scrollbar shadow-[var(--shadow-premium)] z-20 transition-all">
                    <div className="p-4 lg:p-6 space-y-2">
                        <div className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em] mb-2 ml-2">Cibles Identifiées</div>
                        {entities.map((entity) => (
                            <button
                                key={entity.key}
                                onClick={() => setSelectedEntity(entity.key)}
                                className={`w-full text-left p-4 rounded-xl transition-all duration-300 relative overflow-hidden group border ${selectedEntity === entity.key
                                    ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)] shadow-lg'
                                    : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] shadow-sm'
                                    }`}
                            >
                                <div className="relative z-10 font-black text-[13px] mb-1 truncate italic font-legal group-hover:text-[var(--accent)] transition-colors">{entity.displayName}</div>
                                <div className={`relative z-10 text-[8px] flex gap-3 uppercase font-black tracking-[0.1em] font-mono-data ${selectedEntity === entity.key ? 'opacity-80' : 'opacity-40'}`}>
                                    <span className="flex items-center gap-1"><Database size={8} /> {entity.docs} D</span>
                                    <span className="flex items-center gap-1"><Activity size={8} /> {entity.events} E</span>
                                </div>
                                {selectedEntity === entity.key && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 animate-pulse">
                                        <ChevronRight size={18} />
                                    </div>
                                )}
                            </button>
                        ))}

                        {entities.length === 0 && (
                            <div className="text-center py-20 opacity-30 italic text-[11px] font-black uppercase tracking-widest">Archive Stérile</div>
                        )}
                    </div>
                </div>

                {/* Profiling Detail */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar bg-[var(--background)]/50 scroll-smooth">
                    {selectedEntityData ? (
                        <div className="animate-pro-reveal max-w-4xl mx-auto pb-10">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-8 mb-10 bg-[var(--surface)] p-8 lg:p-10 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-premium)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.01] pointer-events-none">
                                    <Fingerprint size={120} className="text-black" />
                                </div>
                                <div className="relative group shrink-0 z-10">
                                    <div className="absolute inset-0 bg-[var(--accent)] blur-[30px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                    <div className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-[var(--primary)] to-black flex items-center justify-center text-3xl font-black text-white shadow-xl border-2 border-white transform rotate-2 group-hover:rotate-0 transition-all duration-700 font-legal italic">
                                        {selectedEntityData.displayName?.[0] || '?'}
                                    </div>
                                </div>
                                <div className="space-y-2 flex-1 z-10">
                                    <h3 className="text-3xl lg:text-4xl font-black text-[var(--text)] tracking-tighter italic font-legal mb-1 selection:bg-[var(--accent)]/10 leading-tight">{selectedEntityData.displayName}</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <span className="flex items-center gap-2.5 px-4 py-2 bg-[var(--danger)]/5 border border-[var(--danger)]/20 rounded-xl text-[10px] text-[var(--danger)] font-black uppercase tracking-[0.2em] shadow-sm">
                                            <Target size={14} className="animate-pulse" /> High Priority Target
                                        </span>
                                        <span className="flex items-center gap-2.5 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[10px] text-[var(--text-dim)] font-black uppercase tracking-[0.2em] shadow-sm">
                                            <ShieldCheck size={14} className="text-[var(--warning)]" /> Class-4 Clearance
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] p-6 lg:p-8 border border-[var(--border)] shadow-[var(--shadow-soft)] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] transition-transform group-hover:scale-110 duration-1000">
                                        <Database size={80} className="text-[var(--text)]" />
                                    </div>
                                    <div className="flex items-center justify-between mb-6 border-b border-[var(--border)]/50 pb-4 relative z-10">
                                        <h4 className="text-[9px] font-black text-[var(--danger)] uppercase tracking-[0.3em] flex items-center gap-2">
                                            <Activity size={14} /> Archive Resilience
                                        </h4>
                                        <span className="px-2 py-0.5 bg-[var(--surface-muted)] text-[var(--text-dim)] text-[8px] font-black rounded text-[8px] border border-[var(--border)] font-mono-data">
                                            {history.filter(h => (h.output?.entites_cles || []).some(ent => normalize(ent) === selectedEntity)).length} REF
                                        </span>
                                    </div>
                                    <div className="space-y-4 relative z-10">
                                        {history.filter(h => (h.output?.entites_cles || []).some(ent => normalize(ent) === selectedEntity)).slice(0, 5).map((h, i) => (
                                            <div key={i} className="p-6 bg-[var(--surface-muted)] group-hover:bg-[var(--surface)] rounded-xl border border-[var(--border)]/50 hover:border-[var(--accent)]/20 transition-all duration-300 group/item">
                                                <div className="text-[var(--text)] font-black text-[13px] mb-2 italic font-legal group-hover/item:text-[var(--danger)] transition-colors leading-snug">"{h.input.query}"</div>
                                                <div className="text-[var(--text-muted)] text-[12px] leading-relaxed font-medium line-clamp-2 italic">"{h.output?.context_general}"</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] p-6 lg:p-8 border border-[var(--border)] shadow-[var(--shadow-soft)] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] transition-transform group-hover:scale-110 duration-1000">
                                        <CheckCircle2 size={80} className="text-[var(--text)]" />
                                    </div>
                                    <div className="flex items-center justify-between mb-6 border-b border-[var(--border)]/50 pb-4 relative z-10">
                                        <h4 className="text-[9px] font-black text-[var(--accent)] uppercase tracking-[0.3em] flex items-center gap-2">
                                            <Shield size={14} /> Action History
                                        </h4>
                                    </div>
                                    <div className="space-y-6 relative z-10">
                                        {history.flatMap(h => h.output?.documents || [])
                                            .filter(d => Array.isArray(d.key_facts) && d.key_facts.some(f => typeof f === 'string' && f.toLowerCase().includes(selectedEntityData.displayName.toLowerCase())))
                                            .slice(0, 8)
                                            .map((d, i) => (
                                                <div key={i} className="text-[13px] text-[var(--text-muted)] leading-relaxed border-b border-[var(--border)]/50 pb-6 last:border-0 relative pl-8 group/item font-medium">
                                                    <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-[var(--accent)] shadow-sm animate-pulse"></div>
                                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                                        <div className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest font-mono-data">{d.title}</div>
                                                        {!isGuestMode && (
                                                            <button
                                                                onClick={() => onDeepDive(d.title, 'technical')}
                                                                className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1.5 text-[9px] font-black text-[var(--accent)] uppercase tracking-widest transition-all hover:text-[var(--danger)] bg-[var(--accent)]/5 px-3 py-1.5 rounded-lg active:scale-95 shadow-sm"
                                                            >
                                                                Deep Dive <ArrowUpRight size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="italic text-[var(--text-muted)] leading-relaxed font-legal">"{Array.isArray(d.key_facts) ? d.key_facts.find(f => typeof f === 'string' && f.toLowerCase().includes(selectedEntityData.displayName.toLowerCase())) : ""}"</div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center animate-pro-reveal relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--danger)]/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-2000 pointer-events-none"></div>
                            <div className="relative mb-12">
                                <div className="absolute inset-0 bg-[var(--danger)]/10 blur-[100px] opacity-10"></div>
                                <div className="relative w-32 h-32 bg-[var(--surface)] rounded-[var(--radius-xl)] flex items-center justify-center shadow-inner border border-[var(--border)]">
                                    <Users size={64} className="text-[var(--surface-muted)]" strokeWidth={0.5} />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-[var(--text)] uppercase tracking-[0.5em] italic font-legal opacity-30">Investigation Target Required</h3>
                            <p className="mt-6 text-[var(--text-dim)] font-black text-[9px] uppercase tracking-[0.3em] text-center leading-relaxed">
                                Sélectionnez un profil dans l'index latéral pour <br /> initialiser la séquence de profilage forensique.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Side Label Decoration */}
            <div className="hidden 2xl:block fixed right-4 top-1/2 -translate-y-1/2 -rotate-90 origin-right pointer-events-none z-10">
                <span className="text-[8px] font-black text-[var(--border-strong)] uppercase tracking-[1.5em] whitespace-nowrap">CLASSIFIED INTELLIGENCE CLUSTERING PROTOCOL 8.4</span>
            </div>
        </div>
    );
};
