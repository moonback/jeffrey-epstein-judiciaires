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
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <PageHeader
                title="Détecteur de"
                titleHighlight="Contradictions"
                icon={AlertTriangle}
                badgeText="Moteur de Comparaison Neural v4.2 Actif"
            />

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar z-10 scroll-smooth">
                <div className="max-w-6xl mx-auto space-y-10 pb-20">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-10 lg:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden animate-pro-reveal">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-50/20 to-transparent opacity-40"></div>

                        <div className="lg:col-span-12 mb-2">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-[1px] w-8 bg-[#B91C1C]"></div>
                                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-[#B91C1C]">Configuration du Cross-Check Forensique</h3>
                            </div>
                        </div>

                        <div className="lg:col-span-5 space-y-5 relative">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-[#B91C1C] shadow-sm font-serif-legal italic">01</span>
                                <label className="text-[9px] uppercase font-black text-slate-300 tracking-[0.3em]">Source Alpha</label>
                            </div>
                            <div className="relative group">
                                <select
                                    value={doc1}
                                    onChange={e => setDoc1(e.target.value)}
                                    className="w-full bg-[#F8FAFC] border border-slate-100 rounded-2xl p-5 pr-12 text-[13px] font-bold text-[#0F172A] focus:border-[#B91C1C] focus:bg-white focus:outline-none transition-all shadow-inner appearance-none cursor-pointer"
                                >
                                    <option value="">Sélectionner une source...</option>
                                    {allDocs.map((d, i) => <option key={i} value={d.title}>{d.title}</option>)}
                                </select>
                                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div className="lg:col-span-2 flex flex-col items-center justify-center relative">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-xl rotate-45 group hover:rotate-180 transition-all duration-1000 active:scale-90">
                                <ArrowLeftRight size={22} className="text-[#B5965D] -rotate-45 group-hover:rotate-[-180deg] transition-all duration-1000" />
                            </div>
                        </div>

                        <div className="lg:col-span-5 space-y-5 relative">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-[#B91C1C] shadow-sm font-serif-legal italic">02</span>
                                <label className="text-[9px] uppercase font-black text-slate-300 tracking-[0.3em]">Source Beta</label>
                            </div>
                            <div className="relative group">
                                <select
                                    value={doc2}
                                    onChange={e => setDoc2(e.target.value)}
                                    className="w-full bg-[#F8FAFC] border border-slate-100 rounded-2xl p-5 pr-12 text-[13px] font-bold text-[#0F172A] focus:border-[#B91C1C] focus:bg-white focus:outline-none transition-all shadow-inner appearance-none cursor-pointer"
                                >
                                    <option value="">Sélectionner une source...</option>
                                    {allDocs.map((d, i) => <option key={i} value={d.title}>{d.title}</option>)}
                                </select>
                                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div className="lg:col-span-12 pt-10">
                            <button
                                disabled={!doc1 || !doc2 || isAnalyzing || isGuestMode}
                                onClick={handleAnalyze}
                                className="w-full relative group"
                            >
                                <div className="absolute inset-0 bg-[#B91C1C] blur-2xl opacity-5 group-hover:opacity-15 transition-opacity rounded-2xl"></div>
                                <div className="relative flex items-center justify-center gap-4 bg-[#0F172A] hover:bg-[#B91C1C] text-white font-black uppercase tracking-[0.3em] text-[11px] py-6 rounded-2xl shadow-xl transition-all duration-500 transform active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-300">
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
                                <div className="h-px w-8 bg-slate-200"></div>
                                <span className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-400">Algorithmic Integrity Guaranteed</span>
                                <div className="h-px w-8 bg-slate-200"></div>
                            </div>
                        </div>
                    </div>

                    {results && (
                        <div className="bg-white rounded-[3.5rem] border border-slate-100 p-10 lg:p-12 animate-pro-reveal shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                                <ShieldAlert size={160} className="text-[#B91C1C]" />
                            </div>

                            <div className="flex items-center justify-between mb-10 pb-8 border-b border-slate-50 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-red-50 rounded-[1.2rem] flex items-center justify-center border border-red-100/50 shadow-sm transition-transform hover:scale-110">
                                        <ShieldAlert className="text-[#B91C1C]" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black italic tracking-tight text-[#0F172A] font-serif-legal">Rapport d'Incohérence Critique</h3>
                                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1 italic">Généré par Neural Engine v4.2</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setResults(null)}
                                    className="px-5 py-2 rounded-xl bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-[#B91C1C] hover:bg-white transition-all border border-slate-100 active:scale-95 shadow-sm"
                                >
                                    Ignorer l'Alerte
                                </button>
                            </div>
                            <div className="bg-[#F8FAFC]/50 p-8 lg:p-10 rounded-[2.5rem] border border-slate-50 font-mono-data text-[13px] leading-relaxed text-slate-600 whitespace-pre-wrap shadow-inner relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B91C1C]/10 group-hover:bg-[#B91C1C]/20 transition-all"></div>
                                <p className="relative z-10 selection:bg-red-50 font-medium italic">"{results}"</p>
                            </div>
                        </div>
                    )}

                    {!results && !isAnalyzing && (
                        <div className="text-center py-40 animate-pro-reveal">
                            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-slate-50 shadow-2xl relative group hover:scale-110 transition-transform">
                                <div className="absolute inset-0 bg-[#B91C1C]/5 blur-[80px] opacity-10 animate-pulse"></div>
                                <Fingerprint size={36} className="text-slate-200 group-hover:text-[#B91C1C] transition-colors relative" strokeWidth={1} />
                            </div>
                            <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-[0.4em] mb-3 italic font-serif-legal">Sources en Attente</h3>
                            <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[9px]">Liez manuellement deux flux pour initialiser le cycle d'analyse</p>
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
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative font-sans">
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
                <div className="w-full lg:w-[320px] border-r border-slate-100 bg-white/60 backdrop-blur-xl overflow-y-auto custom-scrollbar shadow-xl z-20 transition-all">
                    <div className="p-4 lg:p-6 space-y-2">
                        <div className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 ml-2">Cibles Identifiées</div>
                        {entities.map((entity) => (
                            <button
                                key={entity.key}
                                onClick={() => setSelectedEntity(entity.key)}
                                className={`w-full text-left p-4 rounded-xl transition-all duration-300 relative overflow-hidden group border ${selectedEntity === entity.key
                                    ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg'
                                    : 'bg-white border-slate-50 text-slate-400 hover:bg-slate-50 hover:border-slate-200 shadow-sm'
                                    }`}
                            >
                                <div className="relative z-10 font-black text-[13px] mb-1 truncate italic font-serif-legal group-hover:text-[#B91C1C] transition-colors">{entity.displayName}</div>
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
                <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar bg-[#F8FAFC]/50 scroll-smooth">
                    {selectedEntityData ? (
                        <div className="animate-pro-reveal max-w-4xl mx-auto pb-10">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-8 mb-10 bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.01] pointer-events-none">
                                    <Fingerprint size={120} className="text-black" />
                                </div>
                                <div className="relative group shrink-0 z-10">
                                    <div className="absolute inset-0 bg-[#B91C1C] blur-[30px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0F172A] to-black flex items-center justify-center text-3xl font-black text-white shadow-xl border-2 border-white transform rotate-2 group-hover:rotate-0 transition-all duration-700 font-serif-legal italic">
                                        {selectedEntityData.displayName?.[0] || '?'}
                                    </div>
                                </div>
                                <div className="space-y-2 flex-1 z-10">
                                    <h3 className="text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tighter italic font-serif-legal mb-1 selection:bg-red-50 leading-tight">{selectedEntityData.displayName}</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <span className="flex items-center gap-2.5 px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-[10px] text-[#B91C1C] font-black uppercase tracking-[0.2em] shadow-sm">
                                            <Target size={14} className="animate-pulse" /> High Priority Target
                                        </span>
                                        <span className="flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] shadow-sm">
                                            <ShieldCheck size={14} className="text-[#B5965D]" /> Class-4 Clearance
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-slate-100 shadow-lg relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] transition-transform group-hover:scale-110 duration-1000">
                                        <Database size={80} />
                                    </div>
                                    <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4 relative z-10">
                                        <h4 className="text-[9px] font-black text-[#B91C1C] uppercase tracking-[0.3em] flex items-center gap-2">
                                            <Activity size={14} /> Archive Resilience
                                        </h4>
                                        <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-black rounded text-[8px] border border-slate-100 font-mono-data">
                                            {history.filter(h => (h.output?.entites_cles || []).some(ent => normalize(ent) === selectedEntity)).length} REF
                                        </span>
                                    </div>
                                    <div className="space-y-4 relative z-10">
                                        {history.filter(h => (h.output?.entites_cles || []).some(ent => normalize(ent) === selectedEntity)).slice(0, 5).map((h, i) => (
                                            <div key={i} className="p-6 bg-slate-50 group-hover:bg-[#F8FAFC] rounded-[1.5rem] border border-slate-50 hover:border-[#B91C1C]/20 transition-all duration-300 group/item">
                                                <div className="text-[#0F172A] font-black text-[13px] mb-2 italic font-serif-legal group-hover/item:text-[#B91C1C] transition-colors leading-snug">"{h.input.query}"</div>
                                                <div className="text-slate-500 text-[12px] leading-relaxed font-medium line-clamp-2 italic">"{h.output?.context_general}"</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-slate-100 shadow-lg relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] transition-transform group-hover:scale-110 duration-1000">
                                        <CheckCircle2 size={80} />
                                    </div>
                                    <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4 relative z-10">
                                        <h4 className="text-[9px] font-black text-[#0F4C81] uppercase tracking-[0.3em] flex items-center gap-2">
                                            <Shield size={14} /> Action History
                                        </h4>
                                    </div>
                                    <div className="space-y-6 relative z-10">
                                        {history.flatMap(h => h.output?.documents || [])
                                            .filter(d => Array.isArray(d.key_facts) && d.key_facts.some(f => typeof f === 'string' && f.toLowerCase().includes(selectedEntityData.displayName.toLowerCase())))
                                            .slice(0, 8)
                                            .map((d, i) => (
                                                <div key={i} className="text-[13px] text-slate-500 leading-relaxed border-b border-slate-50 pb-6 last:border-0 relative pl-8 group/item font-medium">
                                                    <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-[#0F4C81] shadow-sm animate-pulse"></div>
                                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest font-mono-data">{d.title}</div>
                                                        {!isGuestMode && (
                                                            <button
                                                                onClick={() => onDeepDive(d.title, 'technical')}
                                                                className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1.5 text-[9px] font-black text-[#0F4C81] uppercase tracking-widest transition-all hover:text-[#B91C1C] bg-blue-50/50 px-3 py-1.5 rounded-lg active:scale-95 shadow-sm"
                                                            >
                                                                Deep Dive <ArrowUpRight size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="italic text-slate-600 leading-relaxed font-serif-legal">"{Array.isArray(d.key_facts) ? d.key_facts.find(f => typeof f === 'string' && f.toLowerCase().includes(selectedEntityData.displayName.toLowerCase())) : ""}"</div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center animate-pro-reveal relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#B91C1C]/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-2000 pointer-events-none"></div>
                            <div className="relative mb-12">
                                <div className="absolute inset-0 bg-[#B91C1C] blur-[100px] opacity-10"></div>
                                <div className="relative w-32 h-32 bg-white rounded-[3rem] flex items-center justify-center shadow-inner border border-slate-50">
                                    <Users size={64} className="text-slate-100" strokeWidth={0.5} />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-[0.5em] italic font-serif-legal opacity-30">Investigation Target Required</h3>
                            <p className="mt-6 text-slate-300 font-black text-[9px] uppercase tracking-[0.3em] text-center leading-relaxed">
                                Sélectionnez un profil dans l'index latéral pour <br /> initialiser la séquence de profilage forensique.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Side Label Decoration */}
            <div className="hidden 2xl:block fixed right-4 top-1/2 -translate-y-1/2 -rotate-90 origin-right pointer-events-none z-10">
                <span className="text-[8px] font-black text-slate-200 uppercase tracking-[1.5em] whitespace-nowrap">CLASSIFIED INTELLIGENCE CLUSTERING PROTOCOL 8.4</span>
            </div>
        </div>
    );
};
