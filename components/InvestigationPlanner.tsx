import React, { useState } from 'react';
import { Folder, FileSearch, Database, Shield, FileText, ChevronRight, Play, Info } from 'lucide-react';
import { InputData } from '../types';

interface InvestigationPlannerProps {
    onStartInvestigation: (query: string, source: string) => void;
}

const DOJ_SOURCES = [
    { id: 'DS1-4', name: 'Data Sets 1-4', description: 'Documents initiaux et archives du FBI.' },
    { id: 'DS5-8', name: 'Data Sets 5-8', description: 'Transcriptions judiciaires et pièces à convictions Florida.' },
    { id: 'DS9-12', name: 'Data Sets 9-12', description: 'Divulgations récentes (EFTA) et documents Ghislaine Maxwell.' },
    { id: 'MEMO', name: 'Memoranda & Correspondence', description: 'Échanges administratifs et mémos internes DOJ.' },
    { id: 'ALL', name: 'Full Archive', description: 'Analyse transversale de l\'ensemble des 3.5M de pages.' }
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
        <div className="bg-[#0D0D0D] rounded-xl border border-[#1A1A1A] overflow-hidden shadow-2xl flex flex-col h-full animate-in fade-in zoom-in-[0.99] duration-700">
            {/* Header */}
            <div className="p-6 md:p-8 bg-[#121212]/50 border-b border-[#1A1A1A]">
                <div className="flex items-center gap-4 mb-3">
                    <div className="p-2.5 bg-[#000] rounded-lg border border-[#2A2A2A]">
                        <FileSearch className="text-[#F2B8B5]" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#EEE] tracking-tight uppercase tracking-widest text-sm">Planificateur d'Opération</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1 h-1 rounded-full bg-[#6DD58C] animate-pulse"></div>
                            <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest">Interface Forensique Active</span>
                        </div>
                    </div>
                </div>
                <p className="text-[#888] text-[12px] leading-relaxed max-w-2xl font-light">Paramétrez les critères d'extraction pour le moteur de recherche à travers la base de données DOJ (3.5M documents).</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 custom-scrollbar report-paper">
                {/* Source Selection */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-[1px] w-8 bg-[#F2B8B5]/40"></div>
                        <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#F2B8B5]">01. Source de Données</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {DOJ_SOURCES.map((source) => (
                            <button
                                key={source.id}
                                onClick={() => setSelectedSource(source.id)}
                                className={`flex flex-col p-5 rounded-xl border transition-all text-left relative group ${selectedSource === source.id
                                    ? 'bg-[#121212] border-[#F2B8B5]/40 shadow-xl'
                                    : 'bg-[#0A0A0A] border-[#1A1A1A] hover:border-[#2A2A2A]'
                                    }`}
                            >
                                {selectedSource === source.id && (
                                    <div className="absolute top-3 right-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#F2B8B5] shadow-[0_0_8px_#F2B8B5]"></div>
                                    </div>
                                )}
                                <div className="text-[11px] font-bold text-[#EEE] mb-2 uppercase tracking-wide group-hover:text-[#F2B8B5] transition-colors">
                                    {source.name}
                                </div>
                                <span className="text-[10px] text-[#666] leading-relaxed group-hover:text-[#888] transition-colors">{source.description}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Query Input */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-[1px] w-8 bg-[#F2B8B5]/40"></div>
                        <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#F2B8B5]">02. Paramètres de Recherche</h3>
                    </div>

                    <div className="bg-[#0A0A0A] rounded-xl border border-[#1A1A1A] overflow-hidden">
                        <div className="flex border-b border-[#1A1A1A]">
                            <button
                                onClick={() => setActiveTab('dataset')}
                                className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'dataset' ? 'bg-[#121212] text-[#F2B8B5]' : 'text-[#444] hover:text-[#888]'}`}
                            >
                                Modèles de requête
                            </button>
                            <button
                                onClick={() => setActiveTab('custom')}
                                className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'custom' ? 'bg-[#121212] text-[#F2B8B5]' : 'text-[#444] hover:text-[#888]'}`}
                            >
                                Requête sur-mesure
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === 'dataset' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {QUERIES_LIST.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCustomQuery(q.query)}
                                            className={`flex items-center justify-between p-4 rounded-lg border text-left transition-all group ${customQuery === q.query
                                                ? 'bg-[#F2B8B5]/5 border-[#F2B8B5]/30'
                                                : 'bg-[#080808] border-[#1A1A1A] hover:border-[#2A2A2A]'
                                                }`}
                                        >
                                            <span className={`text-[11px] font-medium tracking-tight ${customQuery === q.query ? 'text-[#F2B8B5]' : 'text-[#888] group-hover:text-[#EEE]'}`}>{q.label}</span>
                                            <ChevronRight size={12} className={customQuery === q.query ? 'text-[#F2B8B5]' : 'text-[#333] group-hover:text-[#F2B8B5]'} />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="relative">
                                    <textarea
                                        value={customQuery}
                                        onChange={(e) => setCustomQuery(e.target.value)}
                                        placeholder="Saisissez vos mots-clés, noms de cibles ou dates précises..."
                                        className="w-full h-40 bg-[#080808] rounded-lg p-5 text-[13px] text-[#EEE] border border-[#1A1A1A] focus:border-[#F2B8B5]/50 transition-all outline-none resize-none placeholder-[#333] font-light leading-relaxed"
                                    />
                                    <div className="absolute bottom-4 right-4 opacity-20 pointer-events-none">
                                        <Shield size={40} className="text-[#333]" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Warning / Info */}
                <div className="p-5 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl flex gap-4">
                    <div className="p-2 bg-[#8AB4F8]/10 rounded border border-[#8AB4F8]/20 shrink-0 h-fit">
                        <Info size={14} className="text-[#8AB4F8]" />
                    </div>
                    <div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8AB4F8] block mb-1">Observation Intelligence Agent</span>
                        <p className="text-[11px] text-[#666] leading-relaxed font-light">
                            L'analyse approfondie nécessite une granularité élevée. Pour des résultats optimaux, spécifiez des entités nommées ou des références de dossiers spécifiques.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer / Submit */}
            <div className="p-6 md:p-8 bg-[#0D0D0D] border-t border-[#1A1A1A]">
                <button
                    onClick={handleStart}
                    disabled={activeTab === 'custom' && !customQuery}
                    className={`w-full h-14 flex items-center justify-center gap-3 rounded-xl font-bold uppercase tracking-[0.2em] text-[11px] transition-all relative overflow-hidden group ${activeTab === 'custom' && !customQuery
                        ? 'bg-[#1A1A1A] text-[#444] cursor-not-allowed border border-[#2A2A2A]'
                        : 'bg-[#F2B8B5] text-[#000] hover:bg-[#EEE] active:scale-[0.98] shadow-2xl shadow-[#F2B8B5]/10'
                        }`}
                >
                    <Play size={16} fill="currentColor" />
                    Initialiser la Requête Forensique
                    {(!customQuery && activeTab === 'custom') ? null : (
                        <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity"></div>
                    )}
                </button>
            </div>
        </div>
    );
};


const QUERIES_LIST = QUICK_QUERIES;
