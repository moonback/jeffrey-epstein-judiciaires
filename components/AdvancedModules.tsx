import React, { useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { ProcessedResult, DocumentDetail } from '../types';
import { AlertTriangle, Users, ArrowLeftRight, Zap, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { mergeDataWithFlash } from '../services/openRouterService';

export const ContradictionsView: React.FC = () => {
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

        const prompt = `COMPARAISON FORENSIQUE : Analysez ces deux documents pour détecter des contradictions, des incohérences factuelles ou des changements de version.
    
    DOCUMENT 1 : ${JSON.stringify(d1)}
    DOCUMENT 2 : ${JSON.stringify(d2)}
    
    Identifiez précisément les points de divergence.`;

        try {
            // Reusing the same service but with a direct comparison prompt
            // We'll wrap it in a mock InputData
            const res = await mergeDataWithFlash({
                id: 'COMPARE',
                query: prompt,
                targetUrl: 'Internal Forensic Comparison',
                timestamp: Date.now()
            });
            setResults(res.logs.join('\n')); // Using logs or a dedicated field if we updated the service
        } catch (e) {
            setResults("Erreur lors de l'analyse comparative.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0F0F0F] overflow-hidden">
            <header className="p-8 border-b border-[#2D2D2D]">
                <h2 className="text-2xl font-bold text-[#E3E3E3] flex items-center gap-3">
                    <AlertTriangle className="text-[#F44336]" size={28} />
                    Détecteur de Contradictions
                </h2>
                <p className="text-[#8E918F] text-sm mt-1">
                    Identifiez les parjures et les incohérences entre différentes dépositions.
                </p>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-5xl mx-auto space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#1A1A1A] p-8 rounded-[40px] border border-[#2D2D2D]">
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase font-black text-[#757775] tracking-widest px-1">Source Alpha</label>
                            <select
                                value={doc1}
                                onChange={e => setDoc1(e.target.value)}
                                className="w-full bg-[#121212] border border-[#444746] rounded-2xl p-4 text-xs text-[#E3E3E3] focus:border-[#F44336] focus:outline-none"
                            >
                                <option value="">Sélectionner un document...</option>
                                {allDocs.map((d, i) => <option key={i} value={d.title}>{d.title}</option>)}
                            </select>
                        </div>

                        <div className="hidden md:flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-[#F44336]/10 rounded-full flex items-center justify-center border border-[#F44336]/20">
                                <ArrowLeftRight size={20} className="text-[#F44336]" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] uppercase font-black text-[#757775] tracking-widest px-1">Source Bêta</label>
                            <select
                                value={doc2}
                                onChange={e => setDoc2(e.target.value)}
                                className="w-full bg-[#121212] border border-[#444746] rounded-2xl p-4 text-xs text-[#E3E3E3] focus:border-[#F44336] focus:outline-none"
                            >
                                <option value="">Sélectionner un document...</option>
                                {allDocs.map((d, i) => <option key={i} value={d.title}>{d.title}</option>)}
                            </select>
                        </div>

                        <div className="md:col-span-2 pt-4">
                            <button
                                disabled={!doc1 || !doc2 || isAnalyzing}
                                onClick={handleAnalyze}
                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#F44336] to-[#B71C1C] text-white font-bold uppercase tracking-widest text-xs py-4 rounded-2xl shadow-lg hover:shadow-[#F44336]/20 transition-all disabled:opacity-20 translate-y-0 active:translate-y-1"
                            >
                                {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                                Lancez l'Analyse Comparée
                            </button>
                        </div>
                    </div>

                    {results && (
                        <div className="bg-[#1A1A1A] rounded-[40px] border border-[#2D2D2D] p-8 animate-in fade-in slide-in-from-bottom-5">
                            <div className="flex items-center gap-3 mb-6">
                                <ShieldAlert className="text-[#F44336]" />
                                <h3 className="text-xl font-bold">Rapport d'Incohérences</h3>
                            </div>
                            <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-[#2D2D2D] font-mono text-xs leading-relaxed text-[#C4C7C5] whitespace-pre-wrap">
                                {results}
                            </div>
                        </div>
                    )}

                    {!results && !isAnalyzing && (
                        <div className="text-center py-20 opacity-20">
                            <AlertTriangle size={64} className="mx-auto mb-4" />
                            <p>Sélectionnez deux documents pour démarrer la recherche forensic de contradictions.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const POIView: React.FC = () => {
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

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
        return Array.from(map.entries()).sort((a, b) => b[1].docs - a[1].docs);
    }, [history]);

    return (
        <div className="h-full flex flex-col bg-[#0F0F0F] overflow-hidden">
            <header className="p-8 border-b border-[#2D2D2D]">
                <h2 className="text-2xl font-bold text-[#E3E3E3] flex items-center gap-3">
                    <Users className="text-[#4DB6AC]" size={28} />
                    Profilage POI (Person of Interest)
                </h2>
                <p className="text-[#8E918F] text-sm mt-1">
                    Dossiers individuels agrégés à partir de toutes les investigations.
                </p>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Entity List Sidebar */}
                <div className="w-full md:w-80 border-r border-[#2D2D2D] bg-[#121212] overflow-y-auto custom-scrollbar">
                    <div className="p-6 space-y-2">
                        {entities.map(([name, stats]) => (
                            <button
                                key={name}
                                onClick={() => setSelectedEntity(name)}
                                className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedEntity === name ? 'bg-[#4DB6AC]/10 border-[#4DB6AC] text-[#4DB6AC]' : 'bg-transparent border-transparent text-[#757775] hover:bg-[#1A1A1A]'
                                    }`}
                            >
                                <div className="font-bold text-sm mb-1 truncate">{name}</div>
                                <div className="text-[10px] flex gap-3 uppercase font-black opacity-60 tracking-widest">
                                    <span>{stats.docs} DOCS</span>
                                    <span>{stats.events} FAITS</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Profiling Detail */}
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    {selectedEntity ? (
                        <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                            <div className="flex items-end gap-6 mb-12">
                                <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-[#4DB6AC] to-[#00695C] flex items-center justify-center text-4xl font-black text-white shadow-2xl">
                                    {selectedEntity[0]}
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black text-[#E3E3E3] tracking-tighter mb-2">{selectedEntity}</h3>
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-[#4DB6AC]/10 border border-[#4DB6AC]/20 rounded-full text-xs text-[#4DB6AC] font-bold">
                                            <CheckCircle2 size={14} /> CIBLE PRIORITAIRE
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <div className="bg-[#1A1A1A] rounded-[40px] p-8 border border-[#2D2D2D]">
                                    <h4 className="text-xs font-black text-[#757775] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                        <ArrowLeftRight size={14} /> Connexions Détectées
                                    </h4>
                                    <div className="space-y-4">
                                        {history.filter(h => h.output?.entites_cles?.includes(selectedEntity)).slice(0, 5).map((h, i) => (
                                            <div key={i} className="p-4 bg-[#121212] rounded-2xl border border-[#2D2D2D] text-xs">
                                                <div className="text-[#4DB6AC] font-bold mb-1 italic">"{h.input.query}"</div>
                                                <div className="text-[#8E918F]">{h.output?.context_general}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-[#1A1A1A] rounded-[40px] p-8 border border-[#2D2D2D]">
                                    <h4 className="text-xs font-black text-[#757775] uppercase tracking-[0.2em] mb-6">Actions & Faits Clés</h4>
                                    <div className="space-y-4">
                                        {history.flatMap(h => h.output?.documents || [])
                                            .filter(d => d.key_facts.some(f => f.includes(selectedEntity)))
                                            .slice(0, 8)
                                            .map((d, i) => (
                                                <div key={i} className="text-xs text-[#C4C7C5] leading-relaxed border-b border-[#2D2D2D] pb-3 last:border-0">
                                                    <span className="text-[#4DB6AC] font-black mr-2">DOC:</span>
                                                    {d.key_facts.find(f => f.includes(selectedEntity))}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-10">
                            <Users size={128} />
                            <h3 className="text-2xl mt-4">Sélectionnez un profil pour générer le dossier POI</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
