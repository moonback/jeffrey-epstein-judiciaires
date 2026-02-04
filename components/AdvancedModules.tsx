/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { ProcessedResult, DocumentDetail } from '../types';
import { AlertTriangle, Users, ArrowLeftRight, Zap, Loader2, CheckCircle2, ShieldAlert, Target, Fingerprint, Shield, Activity, Search, Database, ChevronRight, ArrowUpRight, ShieldCheck, Cpu } from 'lucide-react';
import { mergeDataWithFlash, detectContradictions } from '../services/openRouterService';

interface ContradictionsViewProps {
    onDeepDive: (docTitle: string, style: 'standard' | 'simple' | 'technical') => void;
}

export const ContradictionsView: React.FC<ContradictionsViewProps> = ({ onDeepDive }) => {
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

            <header className="px-6 lg:px-12 py-6 lg:py-8 border-b border-slate-100 bg-white/90 backdrop-blur-xl z-20 shadow-sm relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none opacity-50"></div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-12 h-12 bg-black rounded-[1.2rem] flex items-center justify-center shadow-xl group transition-all">
                        <AlertTriangle className="text-white group-hover:rotate-12 transition-transform" size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-[#0F172A] tracking-tight uppercase italic font-serif-legal leading-tight">Détecteur de <span className="text-[#B91C1C]">Contradictions</span></h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C] animate-pulse shadow-sm"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Moteur de Comparaison Neural v4.2 Actif</span>
                        </div>
                    </div>
                </div>
            </header>

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
                                disabled={!doc1 || !doc2 || isAnalyzing}
                                onClick={handleAnalyze}
                                className="w-full relative group"
                            >
                                <div className="absolute inset-0 bg-[#B91C1C] blur-2xl opacity-5 group-hover:opacity-15 transition-opacity rounded-2xl"></div>
                                <div className="relative flex items-center justify-center gap-4 bg-[#0F172A] hover:bg-[#B91C1C] text-white font-black uppercase tracking-[0.3em] text-[11px] py-6 rounded-2xl shadow-xl transition-all duration-500 transform active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-300">
                                    {isAnalyzing ? (
                                        <Loader2 className="animate-spin" size={20} />
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
}

export const POIView: React.FC<POIViewProps> = ({ onDeepDive }) => {
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        storageService.getAllResults().then(setHistory);
    }, []);

    const entities = useMemo(() => {
        const map = new Map<string, { docs: number, events: number }>();
        history.forEach(res => {
            res.output?.entites_cles?.forEach(ent => {
                const stats = map.get(ent) || { docs: 0, events: 0 };
                stats.docs++;
                map.set(ent, stats);
            });
            res.output?.documents?.forEach(doc => {
                doc.key_facts.forEach(fact => {
                    res.output?.entites_cles?.forEach(ent => {
                        if (fact.includes(ent)) {
                            const stats = map.get(ent)!;
                            stats.events++;
                            map.set(ent, stats);
                        }
                    });
                });
            });
        });
        return Array.from(map.entries())
            .filter(([name]) => name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => b[1].docs - a[1].docs);
    }, [history, searchQuery]);

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <header className="px-6 lg:px-12 py-6 lg:py-8 border-b border-slate-100 bg-white/90 backdrop-blur-xl z-30 shrink-0 shadow-sm relative">
                <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none opacity-50"></div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-black rounded-[1.2rem] flex items-center justify-center shadow-xl group transition-all">
                            <Users size={22} className="text-white group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[#0F172A] tracking-tight uppercase italic font-serif-legal leading-tight">Index des <span className="text-[#B91C1C]">Cibles</span></h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{entities.length} Profils Répertoriés</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative group w-full lg:w-96">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#B91C1C] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un profil..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-[#F8FAFC] border border-slate-100 rounded-2xl py-3 pl-14 pr-6 text-[13px] text-[#0F172A] focus:border-[#B91C1C] focus:bg-white outline-none transition-all w-full shadow-inner placeholder-slate-300 font-medium"
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row z-20">
                {/* Entity List Sidebar */}
                <div className="w-full lg:w-[360px] lg:w-[400px] border-r border-slate-100 bg-white/60 backdrop-blur-xl overflow-y-auto custom-scrollbar shadow-xl z-20 transition-all">
                    <div className="p-8 lg:p-10 space-y-4">
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4 ml-4">Classification Criminelle</div>
                        {entities.map(([name, stats]) => (
                            <button
                                key={name}
                                onClick={() => setSelectedEntity(name)}
                                className={`w-full text-left p-6 rounded-[2rem] transition-all duration-500 relative overflow-hidden group border ${selectedEntity === name
                                    ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-2xl'
                                    : 'bg-white border-slate-50 text-slate-400 hover:bg-slate-50 hover:border-slate-200 shadow-sm'
                                    }`}
                            >
                                <div className="relative z-10 font-black text-[14px] mb-2 truncate italic font-serif-legal group-hover:text-[#B91C1C] transition-colors">{name}</div>
                                <div className={`relative z-10 text-[9px] flex gap-5 uppercase font-black tracking-[0.2em] font-mono-data ${selectedEntity === name ? 'opacity-80' : 'opacity-40'}`}>
                                    <span className="flex items-center gap-1.5"><Database size={10} /> {stats.docs} DOCS</span>
                                    <span className="flex items-center gap-1.5"><Activity size={10} /> {stats.events} EVENTS</span>
                                </div>
                                {selectedEntity === name && (
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 animate-pulse">
                                        <ChevronRight size={24} />
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
                <div className="flex-1 overflow-y-auto p-8 lg:p-16 custom-scrollbar bg-[#F8FAFC]/50 scroll-smooth">
                    {selectedEntity ? (
                        <div className="animate-pro-reveal max-w-5xl mx-auto pb-20">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-10 mb-16 bg-white p-10 lg:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                                    <Fingerprint size={180} className="text-black" />
                                </div>
                                <div className="relative group shrink-0 z-10">
                                    <div className="absolute inset-0 bg-[#B91C1C] blur-[50px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                    <div className="relative w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#0F172A] to-black flex items-center justify-center text-5xl font-black text-white shadow-2xl border-[3px] border-white transform rotate-3 group-hover:rotate-0 transition-all duration-700 font-serif-legal italic">
                                        {selectedEntity[0]}
                                    </div>
                                </div>
                                <div className="space-y-4 flex-1 z-10">
                                    <h3 className="text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tighter italic font-serif-legal mb-2 selection:bg-red-50 leading-tight">{selectedEntity}</h3>
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
                                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] transition-transform group-hover:scale-110 duration-1000">
                                        <Database size={100} />
                                    </div>
                                    <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6 relative z-10">
                                        <h4 className="text-[10px] font-black text-[#B91C1C] uppercase tracking-[0.4em] flex items-center gap-3">
                                            <Activity size={16} /> Archive Resonance
                                        </h4>
                                        <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black rounded-lg border border-slate-100 font-mono-data">{history.filter(h => h.output?.entites_cles?.includes(selectedEntity)).length} REF</span>
                                    </div>
                                    <div className="space-y-4 relative z-10">
                                        {history.filter(h => h.output?.entites_cles?.includes(selectedEntity)).slice(0, 5).map((h, i) => (
                                            <div key={i} className="p-6 bg-slate-50 group-hover:bg-[#F8FAFC] rounded-[1.5rem] border border-slate-50 hover:border-[#B91C1C]/20 transition-all duration-300 group/item">
                                                <div className="text-[#0F172A] font-black text-[13px] mb-2 italic font-serif-legal group-hover/item:text-[#B91C1C] transition-colors leading-snug">"{h.input.query}"</div>
                                                <div className="text-slate-500 text-[12px] leading-relaxed font-medium line-clamp-2 italic">"{h.output?.context_general}"</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] transition-transform group-hover:scale-110 duration-1000">
                                        <CheckCircle2 size={100} />
                                    </div>
                                    <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6 relative z-10">
                                        <h4 className="text-[10px] font-black text-[#0F4C81] uppercase tracking-[0.4em] flex items-center gap-3">
                                            <Shield size={16} /> Action History
                                        </h4>
                                    </div>
                                    <div className="space-y-6 relative z-10">
                                        {history.flatMap(h => h.output?.documents || [])
                                            .filter(d => d.key_facts.some(f => f.includes(selectedEntity!)))
                                            .slice(0, 8)
                                            .map((d, i) => (
                                                <div key={i} className="text-[13px] text-slate-500 leading-relaxed border-b border-slate-50 pb-6 last:border-0 relative pl-8 group/item font-medium">
                                                    <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-[#0F4C81] shadow-sm animate-pulse"></div>
                                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest font-mono-data">{d.title}</div>
                                                        <button
                                                            onClick={() => onDeepDive(d.title, 'technical')}
                                                            className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1.5 text-[9px] font-black text-[#0F4C81] uppercase tracking-widest transition-all hover:text-[#B91C1C] bg-blue-50/50 px-3 py-1.5 rounded-lg active:scale-95 shadow-sm"
                                                        >
                                                            Deep Dive <ArrowUpRight size={12} />
                                                        </button>
                                                    </div>
                                                    <div className="italic text-slate-600 leading-relaxed font-serif-legal">"{d.key_facts.find(f => f.includes(selectedEntity!))}"</div>
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
