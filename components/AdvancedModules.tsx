import React, { useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { ProcessedResult, DocumentDetail } from '../types';
import { AlertTriangle, Users, ArrowLeftRight, Zap, Loader2, CheckCircle2, ShieldAlert, Target, Fingerprint, Shield, Activity, Search, Database, ChevronRight } from 'lucide-react';
import { mergeDataWithFlash } from '../services/openRouterService';

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
        storageService.getAllResults().then(setHistory);
    }, []);

    const allDocs = history.flatMap(h => (h.output?.documents || []).map(d => ({ ...d, investigationId: h.id })));

    const handleAnalyze = async () => {
        if (!doc1 || !doc2) return;
        setIsAnalyzing(true);

        const d1 = allDocs.find(d => d.title === doc1);
        const d2 = allDocs.find(d => d.title === doc2);

        const prompt = `COMPARAISON FORENSIQUE CRITIQUE : Analysez les divergences factuelles strictes entre ces deux documents.
        Focus: Dates, montants, noms cités, lieux et actions.
        
        DOC A: ${JSON.stringify(d1)}
        DOC B: ${JSON.stringify(d2)}
        
        Identifiez les contradictions logiques ou les changements de version. Soyez précis et implacable.`;

        try {
            const res = await mergeDataWithFlash({
                id: 'COMPARE',
                query: prompt,
                targetUrl: 'Internal Forensic Comparison Engine',
                timestamp: Date.now()
            });
            setResults(res.logs.join('\n'));
        } catch (e) {
            setResults("Erreur critique : Échec de l'accès au moteur neuronal de comparaison.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0A0A0A] overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.2]"
                style={{ backgroundImage: 'linear-gradient(to right, #1F1F1F 1px, transparent 1px), linear-gradient(to bottom, #1F1F1F 1px, transparent 1px)', backgroundSize: '64px 64px' }}>
            </div>

            <header className="p-10 border-b border-[#1F1F1F] bg-[#0F0F0F]/50 backdrop-blur-3xl z-10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-2.5 bg-[#F44336]/10 rounded-xl border border-[#F44336]/20">
                        <AlertTriangle className="text-[#F44336]" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Neural Contradiction Detector</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F44336] animate-pulse"></span>
                            <span className="text-[10px] font-bold text-[#757775] uppercase tracking-[0.2em]">Source Comparison Engine Active</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar z-10">
                <div className="max-w-6xl mx-auto space-y-12">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#161616] p-10 rounded-[48px] border border-[#1F1F1F] shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#F44336]/5 to-transparent opacity-30"></div>

                        <div className="lg:col-span-5 space-y-6 relative">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black border border-[#2D2D2D] text-[10px] font-black font-mono">01</span>
                                <label className="text-[10px] uppercase font-black text-[#757775] tracking-[0.2em]">Source Alpha Stream</label>
                            </div>
                            <select
                                value={doc1}
                                onChange={e => setDoc1(e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-[#2D2D2D] rounded-3xl p-6 text-sm text-white focus:border-[#F44336] focus:outline-none transition-all shadow-inner"
                            >
                                <option value="">Sélectionner une source...</option>
                                {allDocs.map((d, i) => <option key={i} value={d.title}>{d.title}</option>)}
                            </select>
                        </div>

                        <div className="lg:col-span-2 flex flex-col items-center justify-center relative">
                            <div className="w-16 h-16 bg-[#0A0A0A] rounded-[24px] flex items-center justify-center border border-[#1F1F1F] shadow-2xl rotate-45 group hover:rotate-0 transition-transform duration-500">
                                <ArrowLeftRight size={24} className="text-[#F44336] -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                            </div>
                        </div>

                        <div className="lg:col-span-5 space-y-6 relative">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black border border-[#2D2D2D] text-[10px] font-black font-mono">02</span>
                                <label className="text-[10px] uppercase font-black text-[#757775] tracking-[0.2em]">Source Beta Stream</label>
                            </div>
                            <select
                                value={doc2}
                                onChange={e => setDoc2(e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-[#2D2D2D] rounded-3xl p-6 text-sm text-white focus:border-[#F44336] focus:outline-none transition-all shadow-inner"
                            >
                                <option value="">Sélectionner une source...</option>
                                {allDocs.map((d, i) => <option key={i} value={d.title}>{d.title}</option>)}
                            </select>
                        </div>

                        <div className="lg:col-span-12 pt-10">
                            <button
                                disabled={!doc1 || !doc2 || isAnalyzing}
                                onClick={handleAnalyze}
                                className="w-full relative group"
                            >
                                <div className="absolute inset-0 bg-[#F44336] blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-3xl"></div>
                                <div className="relative flex items-center justify-center gap-4 bg-gradient-to-r from-[#F44336] to-[#601410] text-white font-black uppercase tracking-[0.3em] text-[10px] py-6 rounded-[32px] shadow-2xl transition-all duration-300 transform active:scale-[0.98] disabled:opacity-30">
                                    {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="animate-pulse" />}
                                    Execute Multi-Source Sync & Cross-Check
                                </div>
                            </button>
                        </div>
                    </div>

                    {results && (
                        <div className="bg-[#161616] rounded-[60px] border border-[#1F1F1F] p-12 animate-in fade-in slide-in-from-bottom-10 shadow-3xl">
                            <div className="flex items-center justify-between mb-10 pb-6 border-b border-[#1F1F1F]">
                                <div className="flex items-center gap-4">
                                    <ShieldAlert className="text-[#F44336]" size={32} />
                                    <div>
                                        <h3 className="text-2xl font-black italic tracking-tight">Forensic Discrepancy Report</h3>
                                        <div className="text-[10px] font-bold text-[#757775] uppercase tracking-widest mt-1 italic">Calculated by Neural Engine v4.0</div>
                                    </div>
                                </div>
                                <button onClick={() => setResults(null)} className="text-[10px] font-black uppercase tracking-widest text-[#757775] hover:text-white transition-colors">Dismiss Report</button>
                            </div>
                            <div className="bg-black p-10 rounded-[40px] border border-[#2D2D2D] font-mono text-sm leading-relaxed text-[#C4C7C5] whitespace-pre-wrap shadow-inner overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <ShieldAlert size={120} />
                                </div>
                                <p className="relative z-10 selection:bg-[#F44336]/30">{results}</p>
                            </div>
                        </div>
                    )}

                    {!results && !isAnalyzing && (
                        <div className="text-center py-40">
                            <div className="w-24 h-24 bg-[#161616] rounded-[48px] flex items-center justify-center mx-auto mb-8 border border-[#1F1F1F] shadow-2xl relative">
                                <div className="absolute inset-0 bg-[#F44336]/5 blur-xl animate-pulse"></div>
                                <Fingerprint size={40} className="text-[#444746] relative" />
                            </div>
                            <p className="text-[#757775] font-black uppercase tracking-[0.4em] text-[10px]">Awaiting Manual Source Linking...</p>
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
        <div className="h-full flex flex-col bg-[#0A0A0A] overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.2]"
                style={{ backgroundImage: 'linear-gradient(to right, #1F1F1F 1px, transparent 1px), linear-gradient(to bottom, #1F1F1F 1px, transparent 1px)', backgroundSize: '64px 64px' }}>
            </div>

            <header className="p-10 border-b border-[#1F1F1F] bg-[#0F0F0F]/50 backdrop-blur-3xl z-10 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-[#4DB6AC]/10 rounded-xl border border-[#4DB6AC]/20">
                            <Users className="text-[#4DB6AC]" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Neural POI Profiling</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#4DB6AC] animate-pulse"></span>
                                <span className="text-[10px] font-bold text-[#757775] uppercase tracking-[0.2em]">{entities.length} Targets Verified</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444746] group-focus-within:text-[#4DB6AC] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search Database..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-[#161616] border border-[#2D2D2D] rounded-2xl py-3 pl-12 pr-6 text-xs text-white focus:border-[#4DB6AC] focus:outline-none transition-all w-80 shadow-2xl"
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row z-10">
                {/* Entity List Sidebar */}
                <div className="w-full lg:w-96 border-r border-[#1F1F1F] bg-[#0F0F0F]/50 backdrop-blur-md overflow-y-auto custom-scrollbar shadow-3xl">
                    <div className="p-8 space-y-3">
                        {entities.map(([name, stats]) => (
                            <button
                                key={name}
                                onClick={() => setSelectedEntity(name)}
                                className={`w-full text-left p-6 rounded-[28px] transition-all duration-300 relative overflow-hidden group border ${selectedEntity === name
                                    ? 'bg-[#4DB6AC] border-[#4DB6AC] text-[#002D2A]'
                                    : 'bg-transparent border-[#1F1F1F] text-[#757775] hover:bg-white/5 hover:border-[#2D2D2D]'
                                    }`}
                            >
                                {selectedEntity === name && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
                                )}
                                <div className="relative z-10 font-black text-sm mb-2 truncate italic">{name}</div>
                                <div className={`relative z-10 text-[9px] flex gap-4 uppercase font-black tracking-[0.2em] ${selectedEntity === name ? 'opacity-100' : 'opacity-40'}`}>
                                    <span>{stats.docs} DOCS</span>
                                    <span>{stats.events} FAITS</span>
                                </div>
                            </button>
                        ))}

                        {entities.length === 0 && (
                            <div className="text-center py-20 opacity-20 italic text-xs">Aucune cible à ce nom.</div>
                        )}
                    </div>
                </div>

                {/* Profiling Detail */}
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar lg:p-16">
                    {selectedEntity ? (
                        <div className="animate-in fade-in slide-in-from-right-12 duration-1000 max-w-6xl mx-auto">
                            <div className="flex flex-col md:flex-row items-start md:items-end gap-10 mb-20">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-[#4DB6AC] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                    <div className="relative w-32 h-32 rounded-[48px] bg-gradient-to-br from-[#4DB6AC] to-[#00695C] flex items-center justify-center text-5xl font-black text-white shadow-3xl border border-white/20 transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                        {selectedEntity[0]}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-6xl font-black text-white tracking-tight italic mb-2 selection:bg-[#4DB6AC]/40">{selectedEntity}</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <span className="flex items-center gap-2 px-6 py-2 bg-[#4DB6AC]/10 border border-[#4DB6AC]/20 rounded-2xl text-[10px] text-[#4DB6AC] font-black uppercase tracking-[0.2em] shadow-lg">
                                            <Target size={14} className="animate-pulse" /> High Priority Target
                                        </span>
                                        <span className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] text-[#757775] font-black uppercase tracking-[0.2em]">
                                            <Shield size={14} /> Intelligence Level: Restricted
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                                <div className="bg-[#161616] rounded-[60px] p-12 border border-[#1F1F1F] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 transition-transform group-hover:scale-125 duration-1000">
                                        <Database size={100} />
                                    </div>
                                    <h4 className="text-[10px] font-black text-[#4DB6AC] uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                        <Activity size={16} /> Neural Resonance Track
                                    </h4>
                                    <div className="space-y-4">
                                        {history.filter(h => h.output?.entites_cles?.includes(selectedEntity)).slice(0, 5).map((h, i) => (
                                            <div key={i} className="p-6 bg-[#0A0A0A] rounded-[32px] border border-[#1F1F1F] hover:border-[#4DB6AC]/30 transition-all cursor-crosshair">
                                                <div className="text-[#4DB6AC] font-black text-xs mb-3 italic">"{h.input.query}"</div>
                                                <div className="text-[#8E918F] text-xs leading-relaxed">{h.output?.context_general}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-[#161616] rounded-[60px] p-12 border border-[#1F1F1F] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 transition-transform group-hover:scale-125 duration-1000">
                                        <Fingerprint size={100} />
                                    </div>
                                    <h4 className="text-[10px] font-black text-[#4DB6AC] uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                        <CheckCircle2 size={16} /> Critical Action Log
                                    </h4>
                                    <div className="space-y-6">
                                        {history.flatMap(h => h.output?.documents || [])
                                            .filter(d => d.key_facts.some(f => f.includes(selectedEntity)))
                                            .slice(0, 8)
                                            .map((d, i) => (
                                                <div key={i} className="text-xs text-[#C4C7C5] leading-relaxed border-b border-[#1F1F1F] pb-6 last:border-0 relative pl-8 group/item">
                                                    <div className="absolute left-0 top-1 w-1.5 h-1.5 rounded-full bg-[#4DB6AC]"></div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-[9px] font-black text-[#757775] uppercase tracking-widest">{d.title}</div>
                                                        <button
                                                            onClick={() => onDeepDive(d.title, 'technical')}
                                                            className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1 text-[9px] font-black text-[#4DB6AC] uppercase tracking-widest transition-all hover:underline"
                                                        >
                                                            Inspect Deep Dive <ChevronRight size={10} />
                                                        </button>
                                                    </div>
                                                    {d.key_facts.find(f => f.includes(selectedEntity))}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className="relative group grayscale hover:grayscale-0 transition-all duration-1000 cursor-help">
                                <div className="absolute inset-0 bg-[#4DB6AC] blur-[100px] opacity-10 animate-pulse"></div>
                                <Users size={160} className="text-[#1F1F1F] relative" strokeWidth={0.5} />
                            </div>
                            <h3 className="text-xl font-black text-[#1F1F1F] mt-10 uppercase tracking-[0.5em]">Identity Required</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
