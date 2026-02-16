/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Folder, FileSearch, Database, Shield, FileText, ChevronRight, Play, Info, Cpu, Zap, ShieldCheck, Upload, X, File as FileIcon } from 'lucide-react';
import { InputData } from '../types';

interface InvestigationPlannerProps {
    onStartInvestigation: (query: string, source: string, file?: File) => void;
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
    { label: 'Témoignages Victimes', query: 'Synthétiser les déclarations clés des Jane Doe concernant les lieux de recrutement.' },
    { label: 'Chronologie Critique', query: 'Établir une chronologie détaillée des événements majeurs cités, triée par date.' },
    { label: 'Logs de Vol', query: 'Extraire et structurer toutes les mentions de déplacements aériens, passagers et destinations.' },
    { label: 'Coordonnées (PII)', query: 'Extraire exhaustivement toutes les données personnelles (emails, numéros de téléphone, adresses physiques, numéros de passeport) identifiées pour chaque personne citée.' },
    { label: 'Inventaire du Patrimoine', query: 'Recenser tous les actifs (immobilier, véhicules, comptes, sociétés) mentionnés, avec leur valeur estimée et propriétaire.' },
    { label: 'Structure Hiérarchique', query: 'Identifier la structure organisationnelle, les rôles des employés et les chaînes de commandement.' },
    { label: 'Analyse des Lieux', query: 'Recenser toutes les propriétés immobilières mentionnées et les événements qui s\'y sont déroulés.' }
];

export const InvestigationPlanner: React.FC<InvestigationPlannerProps> = ({ onStartInvestigation }) => {
    const [selectedSource, setSelectedSource] = useState(DOJ_SOURCES[0].id);
    const [customQuery, setCustomQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'dataset' | 'custom' | 'upload'>('dataset');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleStart = () => {
        let finalQuery = customQuery;
        let sourceLabel = DOJ_SOURCES.find(s => s.id === selectedSource)?.name || "DOJ Archive";

        if (activeTab === 'dataset') {
            finalQuery = finalQuery || "Synthèse générale du dossier sélectionné.";
        } else if (activeTab === 'upload') {
            if (!uploadedFile) return;
            finalQuery = finalQuery || `Analyse complète du document importé : ${uploadedFile.name}`;
            sourceLabel = "Local Import";
        } else {
            if (!finalQuery) return;
        }

        onStartInvestigation(finalQuery, sourceLabel, uploadedFile || undefined);
        setCustomQuery('');
        setUploadedFile(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setUploadedFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="bg-[var(--surface)] rounded-[var(--radius-2xl)] border border-[var(--border)] overflow-hidden shadow-[var(--shadow-premium)] flex flex-col h-full animate-pro-reveal relative group/planner">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            {/* Header */}
            <div className="p-8 lg:p-10 bg-[var(--surface-muted)]/50 border-b border-[var(--border)] backdrop-blur-sm relative z-10">
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-xl group/icon transition-all">
                        <FileSearch size={22} className="text-[var(--primary-foreground)] group-hover/icon:scale-110 transition-transform" />
                    </div>
                    <div>
                        <h2 className="text-lg lg:text-xl font-black text-[var(--text)] italic uppercase font-legal tracking-tight">Poste de <span className="text-[var(--accent)]">Commande</span></h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse shadow-[0_0_8px_var(--success)]"></div>
                            <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em]">Agent Analytique Déployé v4.0</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-12 custom-scrollbar relative z-10">
                {/* Source Selection - ONLY IF NOT UPLOAD MODE */}
                {activeTab !== 'upload' && (
                    <section className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-[1px] w-8 bg-[var(--accent)]"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent)]">01. Périmètre de Recherche</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {DOJ_SOURCES.map((source) => (
                                <button
                                    key={source.id}
                                    onClick={() => setSelectedSource(source.id)}
                                    className={`flex flex-col p-5 rounded-xl border transition-all text-left relative group/source ${selectedSource === source.id
                                        ? 'bg-[var(--surface)] border-[var(--accent)] shadow-[var(--shadow-premium)] ring-1 ring-[var(--accent)]/10'
                                        : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)]'
                                        }`}
                                >
                                    {selectedSource === source.id && (
                                        <div className="absolute top-4 right-4 animate-in fade-in zoom-in">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]"></div>
                                        </div>
                                    )}
                                    <div className={`text-[12px] font-black mb-1.5 uppercase tracking-wide transition-colors italic font-legal ${selectedSource === source.id ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                                        {source.name}
                                    </div>
                                    <span className="text-[10px] text-[var(--text-dim)] font-bold leading-relaxed">{source.description}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Query Input */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-[1px] w-8 bg-[var(--accent)]"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent)]">
                            {activeTab === 'upload' ? '01. Import & Analyse' : '02. Paramètres du Neural Agent'}
                        </h3>
                    </div>

                    <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--border)] overflow-hidden shadow-[var(--shadow-subtle)]">
                        <div className="flex border-b border-[var(--border)] bg-[var(--surface-muted)]">
                            <button
                                onClick={() => setActiveTab('dataset')}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2 font-legal italic ${activeTab === 'dataset' ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--surface)]' : 'border-transparent text-[var(--text-dim)] hover:text-[var(--text-muted)]'}`}
                            >
                                Modèles Prédéfinis
                            </button>
                            <button
                                onClick={() => setActiveTab('custom')}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2 font-legal italic ${activeTab === 'custom' ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--surface)]' : 'border-transparent text-[var(--text-dim)] hover:text-[var(--text-muted)]'}`}
                            >
                                Requête Dynamique
                            </button>
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2 font-legal italic ${activeTab === 'upload' ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--surface)]' : 'border-transparent text-[var(--text-dim)] hover:text-[var(--text-muted)]'}`}
                            >
                                Import Direct PDF
                            </button>
                        </div>

                        <div className="p-8">
                            {activeTab === 'dataset' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-300">
                                    {QUICK_QUERIES.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCustomQuery(q.query)}
                                            className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all group/q ${customQuery === q.query
                                                ? 'bg-[var(--accent)]/5 border-[var(--accent)]'
                                                : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] shadow-sm'
                                                }`}
                                        >
                                            <span className={`text-[12px] font-bold tracking-tight ${customQuery === q.query ? 'text-[var(--accent)]' : 'text-[var(--text-dim)] group-hover/q:text-[var(--text)]'}`}>{q.label}</span>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${customQuery === q.query ? 'bg-[var(--accent)] text-white rotate-90 scale-110' : 'bg-[var(--surface-muted)] text-[var(--text-dim)]'}`}>
                                                <ChevronRight size={14} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : activeTab === 'upload' ? (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${uploadedFile ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--surface-muted)]'}`}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".pdf,.txt,.md,.jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                        />

                                        {uploadedFile ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg mb-4">
                                                    <FileIcon size={32} className="text-white" />
                                                </div>
                                                <h3 className="text-lg font-black text-[var(--text)] mb-1">{uploadedFile.name}</h3>
                                                <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-dim)]">
                                                    <span>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                                    <div className="w-1 h-1 rounded-full bg-[var(--border)]"></div>
                                                    <span className="uppercase">{uploadedFile.type || 'Fichier Inconnu'}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                                                    className="mt-6 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs font-bold text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
                                                >
                                                    Changer de fichier
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-48 h-12 bg-[var(--surface-muted)] rounded-full flex items-center justify-center mb-6 group-hover:bg-[var(--accent)]/10 transition-colors">
                                                    <Upload size={32} className="text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors" />
                                                </div>
                                                <h3 className="text-sm font-black text-[var(--text)] uppercase tracking-wider mb-2">Glisser-déposer le dossier PDF</h3>
                                                <p className="text-xs text-[var(--text-dim)] font-bold mb-6">ou cliquer pour parcourir les fichiers locaux</p>
                                                <div className="flex items-center gap-2 text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest border border-[var(--border)] px-3 py-1.5 rounded-lg bg-[var(--surface)]">
                                                    PDF • IMG • TXT • MD SUPPORTED
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="relative group/textarea">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] mb-2 block ml-2">Instructions d'analyse optionnelles</label>
                                        <textarea
                                            value={customQuery}
                                            onChange={(e) => setCustomQuery(e.target.value)}
                                            placeholder="Ex: Identifiez toutes les entités mentionnées et les dates clés..."
                                            className="w-full h-24 bg-[var(--surface-muted)] rounded-xl p-6 text-[14px] text-[var(--text)] border border-[var(--border)] focus:border-[var(--accent)] focus:bg-[var(--surface)] transition-all outline-none resize-none placeholder-[var(--text-dim)] font-medium leading-relaxed shadow-inner"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="relative group/textarea animate-in fade-in duration-300">
                                    <textarea
                                        value={customQuery}
                                        onChange={(e) => setCustomQuery(e.target.value)}
                                        placeholder="Saisissez vos mots-clés, noms de cibles ou contextes juridiques spécifiques..."
                                        className="w-full h-40 bg-[var(--surface-muted)] rounded-xl p-6 text-[14px] text-[var(--text)] border border-[var(--border)] focus:border-[var(--accent)] focus:bg-[var(--surface)] transition-all outline-none resize-none placeholder-[var(--text-dim)] font-medium leading-relaxed shadow-inner"
                                    />
                                    <div className="absolute bottom-6 right-8 opacity-[0.03] group-focus-within/textarea:opacity-[0.08] transition-opacity pointer-events-none">
                                        <ShieldCheck size={60} className="text-[var(--text)]" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Grounding Info - Hide for Upload mode to emphasize local analaysis */}
                {activeTab !== 'upload' && (
                    <div className="p-5 bg-[var(--success)]/5 border border-[var(--success)]/20 rounded-xl flex gap-5 items-center animate-in slide-in-from-bottom-4 duration-500">
                        <div className="w-10 h-10 bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm text-[var(--success)] shrink-0 flex items-center justify-center">
                            <Zap size={18} fill="currentColor" className="animate-pulse" />
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--success)] block mb-1">Grounding Architecture</span>
                            <p className="text-[12px] text-[var(--text-muted)] leading-relaxed font-bold italic">
                                Les résultats sont systématiquement croisés avec les sources officielles du Department of Justice pour garantir l'intégrité des preuves.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / Submit */}
            <div className="p-8 lg:p-10 bg-[var(--surface-muted)]/50 border-t border-[var(--border)] relative z-10 backdrop-blur-sm">
                <button
                    onClick={handleStart}
                    disabled={(activeTab === 'custom' && !customQuery) || (activeTab === 'upload' && !uploadedFile)}
                    className={`w-full h-14 flex items-center justify-center gap-4 rounded-xl font-black uppercase tracking-[0.3em] text-[11px] transition-all relative overflow-hidden group shadow-xl ${((activeTab === 'custom' && !customQuery) || (activeTab === 'upload' && !uploadedFile))
                        ? 'bg-[var(--surface-muted)] text-[var(--text-dim)] cursor-not-allowed shadow-none'
                        : 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent)] active:scale-[0.98] shadow-[var(--accent)]/10'
                        }`}
                >
                    <div className="relative z-10 flex items-center gap-3">
                        <Cpu size={16} className={`${((activeTab === 'custom' && !customQuery) || (activeTab === 'upload' && !uploadedFile)) ? '' : 'group-hover:rotate-180 transition-transform duration-1000'}`} />
                        {activeTab === 'upload' ? 'Lancer l\'Analyse Locale' : 'Lancer l\'Extraction Dynamique'}
                    </div>
                    {(activeTab === 'dataset' || customQuery) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    )}
                </button>
            </div>
        </div>
    );
};
