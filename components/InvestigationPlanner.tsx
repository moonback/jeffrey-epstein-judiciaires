/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Folder, FileSearch, Database, Shield, FileText, ChevronRight, Play, Info, Cpu, Zap, ShieldCheck } from 'lucide-react';
import { InputData } from '../types';

interface InvestigationPlannerProps {
    onStartInvestigation: (query: string, source: string) => void;
}

const DOJ_SOURCES = [
    { id: 'DS1-4', name: 'Data Sets 1-4', description: 'Documents initiaux et archives du FBI.' },
    { id: 'DS5-8', name: 'Data Sets 5-8', description: 'Transcriptions judiciaires Florida.' },
    { id: 'DS9-12', name: 'Data Sets 9-12', description: 'Divulgations Ghislaine Maxwell.' },
    { id: 'MEMO', name: 'Memoranda & Correspondence', description: 'Mémos internes DOJ.' },
    { id: 'ALL', name: 'Full Archive', description: 'Analyse transversale (3.5M pages).' }
];

const QUICK_QUERIES = [
    { label: 'Analyse Financière', query: 'Extraire tous les transferts de fonds suspects mentionnés et les entités bancaires impliquées.' },
    { label: 'Réseau d\'Influence', query: 'Identifier les noms de personnalités publiques cités dans les dépositions et la nature de leur lien.' },
    { label: 'Preuves Matérielles', query: 'Lister les descriptions de preuves physiques (disques durs, photos, journaux de bord) saisies.' },
    { label: 'Témoignages Victimes', query: 'Synthétiser les déclarations clés des Jane Doe concernant les lieux de recrutement.' }
];

export const InvestigationPlanner: React.FC<InvestigationPlannerProps> = ({ onStartInvestigation }) => {
    const [selectedSource, setSelectedSource] = useState(DOJ_SOURCES[0].id);
    const [customQuery, setCustomQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'dataset' | 'custom'>('dataset');

    const handleStart = () => {
        const finalQuery = customQuery || (activeTab === 'dataset' ? "Synthèse générale du dossier sélectionné." : "");
        if (!finalQuery && activeTab === 'custom') return;

        const sourceLabel = DOJ_SOURCES.find(s => s.id === selectedSource)?.name || "DOJ Archive";
        onStartInvestigation(finalQuery, sourceLabel);
        setCustomQuery('');
    };

    return (
        <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col h-full animate-pro-reveal relative group/planner">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            {/* Header */}
            <div className="p-8 lg:p-10 bg-[#F8FAFC]/50 border-b border-slate-100 backdrop-blur-sm relative z-10">
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-12 h-12 bg-black rounded-[1.2rem] flex items-center justify-center shadow-xl group/icon transition-all">
                        <FileSearch size={22} className="text-white group-hover/icon:scale-110 transition-transform" />
                    </div>
                    <div>
                        <h2 className="text-lg lg:text-xl font-black text-[#0F172A] italic uppercase font-serif-legal tracking-tight">Poste de <span className="text-[#B91C1C]">Commande</span></h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Agent Analytique Déployé v4.0</span>
                        </div>
                    </div>
                </div>
                <p className="text-slate-500 text-[13px] lg:text-[14px] leading-relaxed max-w-2xl font-medium italic">Configurez les paramètres d'extraction pour interroger la base de données DOJ. L'intelligence artificielle analysera les documents ciblés en temps réel avec un grounding haute fidélité.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-12 custom-scrollbar relative z-10">
                {/* Source Selection */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-[1px] w-8 bg-[#B91C1C]"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#B91C1C]">01. Périmètre de Recherche</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {DOJ_SOURCES.map((source) => (
                            <button
                                key={source.id}
                                onClick={() => setSelectedSource(source.id)}
                                className={`flex flex-col p-5 rounded-2xl border transition-all text-left relative group/source ${selectedSource === source.id
                                    ? 'bg-white border-[#B91C1C] shadow-xl shadow-red-900/5 ring-1 ring-[#B91C1C]/10'
                                    : 'bg-white border-slate-100 hover:bg-[#F8FAFC] hover:border-slate-300'
                                    }`}
                            >
                                {selectedSource === source.id && (
                                    <div className="absolute top-4 right-4 animate-in fade-in zoom-in">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#B91C1C] shadow-[0_0_12px_rgba(185,28,28,0.4)]"></div>
                                    </div>
                                )}
                                <div className={`text-[12px] font-black mb-1.5 uppercase tracking-wide transition-colors italic font-serif-legal ${selectedSource === source.id ? 'text-[#B91C1C]' : 'text-[#0F172A]'}`}>
                                    {source.name}
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold leading-relaxed">{source.description}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Query Input */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-[1px] w-8 bg-[#B91C1C]"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#B91C1C]">02. Paramètres du Neural Agent</h3>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                        <div className="flex border-b border-slate-100 bg-[#F8FAFC]">
                            <button
                                onClick={() => setActiveTab('dataset')}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2 font-serif-legal italic ${activeTab === 'dataset' ? 'border-[#B91C1C] text-[#B91C1C] bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                Modèles Prédéfinis
                            </button>
                            <button
                                onClick={() => setActiveTab('custom')}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2 font-serif-legal italic ${activeTab === 'custom' ? 'border-[#B91C1C] text-[#B91C1C] bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                Requête Dynamique
                            </button>
                        </div>

                        <div className="p-8">
                            {activeTab === 'dataset' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {QUICK_QUERIES.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCustomQuery(q.query)}
                                            className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all group/q ${customQuery === q.query
                                                ? 'bg-[#FEF2F2]/50 border-[#B91C1C]'
                                                : 'bg-white border-slate-100 hover:bg-[#F8FAFC] hover:border-slate-300 shadow-sm'
                                                }`}
                                        >
                                            <span className={`text-[12px] font-bold tracking-tight ${customQuery === q.query ? 'text-[#B91C1C]' : 'text-slate-600 group-hover/q:text-[#0F172A]'}`}>{q.label}</span>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${customQuery === q.query ? 'bg-[#B91C1C] text-white rotate-90 scale-110' : 'bg-slate-50 text-slate-300'}`}>
                                                <ChevronRight size={14} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="relative group/textarea">
                                    <textarea
                                        value={customQuery}
                                        onChange={(e) => setCustomQuery(e.target.value)}
                                        placeholder="Saisissez vos mots-clés, noms de cibles ou contextes juridiques spécifiques..."
                                        className="w-full h-40 bg-[#F8FAFC] rounded-[1.5rem] p-6 text-[14px] text-[#0F172A] border border-slate-100 focus:border-[#B91C1C] focus:bg-white transition-all outline-none resize-none placeholder-slate-300 font-medium leading-relaxed shadow-inner"
                                    />
                                    <div className="absolute bottom-6 right-8 opacity-[0.03] group-focus-within/textarea:opacity-[0.08] transition-opacity pointer-events-none">
                                        <ShieldCheck size={60} className="text-black" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Grounding Info */}
                <div className="p-5 bg-emerald-50/30 border border-emerald-100/50 rounded-[1.5rem] flex gap-5 items-center">
                    <div className="w-10 h-10 bg-white rounded-xl border border-emerald-100 shadow-sm text-emerald-600 shrink-0 flex items-center justify-center">
                        <Zap size={18} fill="currentColor" className="animate-pulse" />
                    </div>
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-700 block mb-1">Grounding Architecture</span>
                        <p className="text-[12px] text-emerald-800/80 leading-relaxed font-bold italic">
                            Les résultats sont systématiquement croisés avec les sources officielles du Department of Justice pour garantir l'intégrité des preuves.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer / Submit */}
            <div className="p-8 lg:p-10 bg-[#F8FAFC]/50 border-t border-slate-100 relative z-10 backdrop-blur-sm">
                <button
                    onClick={handleStart}
                    disabled={activeTab === 'custom' && !customQuery}
                    className={`w-full h-14 flex items-center justify-center gap-4 rounded-xl font-black uppercase tracking-[0.3em] text-[11px] transition-all relative overflow-hidden group shadow-xl ${activeTab === 'custom' && !customQuery
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                        : 'bg-[#0F172A] text-white hover:bg-[#B91C1C] active:scale-[0.98] shadow-red-900/10'
                        }`}
                >
                    <div className="relative z-10 flex items-center gap-3">
                        <Cpu size={16} className={`${activeTab === 'custom' && !customQuery ? '' : 'group-hover:rotate-180 transition-transform duration-1000'}`} />
                        Lancer l'Extraction Dynamique
                    </div>
                    {(activeTab === 'dataset' || customQuery) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    )}
                </button>
            </div>
        </div>
    );
};
