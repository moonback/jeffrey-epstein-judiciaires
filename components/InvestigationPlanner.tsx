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
        <div className="bg-[#1E1E1E] rounded-[32px] border border-[#444746] overflow-hidden shadow-2xl flex flex-col h-full">
            {/* Header */}
            <div className="p-8 bg-gradient-to-br from-[#1E1E1E] to-[#2B2B2B] border-b border-[#444746]">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-[#370003] rounded-2xl border border-[#601410]">
                        <FileSearch className="text-[#F2B8B5]" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-[#E3E3E3]">Planificateur d'Investigation</h2>
                </div>
                <p className="text-[#C4C7C5] text-sm">Précisez la source et l'objectif de l'analyse IA parmi les 3.5M de documents.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Source Selection */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Database size={18} className="text-[#F2B8B5]" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#8E918F]">1. Sélection du Data Set DOJ</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {DOJ_SOURCES.map((source) => (
                            <button
                                key={source.id}
                                onClick={() => setSelectedSource(source.id)}
                                className={`flex flex-col p-4 rounded-2xl border transition-all text-left ${selectedSource === source.id
                                    ? 'bg-[#370003] border-[#F2B8B5] shadow-lg shadow-[#F2B8B5]/5'
                                    : 'bg-[#121212] border-[#444746] hover:border-[#F2B8B5]/30'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-sm font-bold ${selectedSource === source.id ? 'text-[#F2B8B5]' : 'text-[#E3E3E3]'}`}>
                                        {source.name}
                                    </span>
                                    {selectedSource === source.id && <Shield size={14} className="text-[#F2B8B5]" />}
                                </div>
                                <span className="text-[10px] text-[#C4C7C5] leading-relaxed">{source.description}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Query Input */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText size={18} className="text-[#F2B8B5]" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#8E918F]">2. Objectif de Recherche</h3>
                    </div>

                    <div className="bg-[#121212] rounded-2xl border border-[#444746] p-4 space-y-4">
                        <div className="flex gap-2 p-1 bg-[#1E1E1E] rounded-xl w-fit">
                            <button
                                onClick={() => setActiveTab('dataset')}
                                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'dataset' ? 'bg-[#2B2B2B] text-[#F2B8B5] shadow-sm' : 'text-[#757775] hover:text-[#E3E3E3]'}`}
                            >
                                Modèles Prédéfinis
                            </button>
                            <button
                                onClick={() => setActiveTab('custom')}
                                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'custom' ? 'bg-[#2B2B2B] text-[#F2B8B5] shadow-sm' : 'text-[#757775] hover:text-[#E3E3E3]'}`}
                            >
                                Requête Libre
                            </button>
                        </div>

                        {activeTab === 'dataset' ? (
                            <div className="grid grid-cols-1 gap-2">
                                {QUERIES_LIST.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCustomQuery(q.query)}
                                        className={`flex items-center justify-between p-3 rounded-xl border border-[#444746] text-left transition-all ${customQuery === q.query ? 'bg-[#F2B8B5]/10 border-[#F2B8B5]/50' : 'hover:bg-[#1E1E1E]'
                                            }`}
                                    >
                                        <span className="text-sm text-[#E3E3E3]">{q.label}</span>
                                        <ChevronRight size={14} className="text-[#757775]" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                value={customQuery}
                                onChange={(e) => setCustomQuery(e.target.value)}
                                placeholder="Ex: 'Listez toutes les mentions de l'île Little St. James entre 2004 et 2006...'"
                                className="w-full h-32 bg-[#0F0F0F] rounded-xl p-4 text-sm text-[#E3E3E3] border border-[#444746] focus:border-[#F2B8B5] transition-all outline-none resize-none placeholder-[#444746]"
                            />
                        )}
                    </div>
                </section>

                {/* Warning / Info */}
                <div className="p-4 bg-[#002B55]/20 border border-[#004A77]/50 rounded-2xl flex gap-3">
                    <Info size={18} className="text-[#8AB4F8] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#D3E3FD] leading-relaxed">
                        <strong>Note de l'Agent :</strong> L'analyse d'archives massives via Grok/Gemini nécessite des requêtes précises pour éviter la dilution des informations. Privilégiez des noms propres ou des dates spécifiques.
                    </p>
                </div>
            </div>

            {/* Footer / Submit */}
            <div className="p-8 bg-[#1E1E1E] border-t border-[#444746]">
                <button
                    onClick={handleStart}
                    disabled={activeTab === 'custom' && !customQuery}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all shadow-xl ${activeTab === 'custom' && !customQuery
                        ? 'bg-[#2B2B2B] text-[#757775] cursor-not-allowed'
                        : 'bg-[#F2B8B5] text-[#370003] hover:bg-[#F9DEDC] hover:scale-[1.02] active:scale-95 shadow-[#F2B8B5]/20'
                        }`}
                >
                    <Play size={20} fill="currentColor" />
                    Lancer l'Analyse du Dossier
                </button>
            </div>
        </div>
    );
};

const QUERIES_LIST = QUICK_QUERIES;
