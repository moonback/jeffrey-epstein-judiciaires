/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { PageHeader } from './PageHeader';
import {
    Folder,
    Play,
    FileText,
    CheckCircle2,
    Clock,
    Loader2,
    AlertCircle,
    Search,
    ChevronRight,
    Cpu,
    Zap,
    History
} from 'lucide-react';
import { FileProcessingService } from '../services/fileProcessingService';
import { mergeDataWithFlash } from '../services/openRouterService';
import { storageService } from '../services/storageService';
import { ProcessedResult, InputData } from '../types';

export interface FileTask {
    file: File;
    status: 'idle' | 'extracting' | 'analyzing' | 'completed' | 'error';
    progress: number;
    resultId?: string;
    error?: string;
    publicPath?: string;
}

interface BackgroundAIViewProps {
    onOpenAnalysis?: (id: string) => void;
    tasks: FileTask[];
    setTasks: React.Dispatch<React.SetStateAction<FileTask[]>>;
    isProcessing: boolean;
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
    stats: { total: number; completed: number; failed: number };
    setStats: React.Dispatch<React.SetStateAction<{ total: number; completed: number; failed: number }>>;
    analyzedTargets: Set<string>;
}

export const BackgroundAIView: React.FC<BackgroundAIViewProps> = ({
    onOpenAnalysis,
    tasks,
    setTasks,
    isProcessing,
    setIsProcessing,
    stats,
    setStats,
    analyzedTargets
}) => {
    const [availableDirs, setAvailableDirs] = useState<string[]>([]);
    const [selectedDir, setSelectedDir] = useState<string>("");
    const [allPublicFiles, setAllPublicFiles] = useState<any[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [batchLimit, setBatchLimit] = useState<number>(10);

    // Load available directories from the public index
    React.useEffect(() => {
        const fetchIndex = async () => {
            try {
                const res = await fetch('/epstein-index.json');
                const files = await res.json();
                setAllPublicFiles(files);
                const dirs = Array.from(new Set(files.map((f: any) => f.directory))).sort() as string[];
                setAvailableDirs(dirs);
                if (dirs.length > 0) setSelectedDir(dirs[0]);
            } catch (e) {
                console.error("Failed to load epstein index", e);
            }
        };
        fetchIndex();
    }, []);

    // Load existing background analysis results specifically ONLY IF tasks is empty
    React.useEffect(() => {
        if (tasks.length > 0) return;

        const loadHistory = async () => {
            const allResults = await storageService.getAllResults();
            const bgResults = allResults.filter(r => r.id.startsWith('BG-'));

            if (bgResults.length > 0) {
                const historyTasks: FileTask[] = bgResults.map(r => ({
                    file: new File([], r.sources[0]?.title || 'Unknown'),
                    status: 'completed',
                    progress: 100,
                    resultId: r.id,
                    publicPath: r.input.targetUrl.startsWith('LOCAL_FILE') ? undefined : r.input.targetUrl
                }));

                setTasks(historyTasks);
                setStats({
                    total: historyTasks.length,
                    completed: historyTasks.length,
                    failed: 0
                });
            }
        };
        loadHistory();
    }, []);

    const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const filteredFiles = Array.from(files)
            .filter(f => {
                const isSupported = f.type === 'application/pdf' || f.type.startsWith('image/') || f.type === 'text/plain';
                const alreadyAnalyzed = analyzedTargets.has(`LOCAL_FILE: ${f.name}`);
                return isSupported && !alreadyAnalyzed;
            });

        const targetFiles = batchLimit > 0 ? filteredFiles.slice(0, batchLimit) : filteredFiles;

        const newTasks: FileTask[] = targetFiles.map(f => ({
            file: f,
            status: 'idle',
            progress: 0
        }));

        if (newTasks.length === 0 && filteredFiles.length > 0) {
            alert("Tous les fichiers sélectionnés ont déjà été analysés.");
            return;
        }

        setTasks(prev => [...prev, ...newTasks]);
        setStats(prev => ({ ...prev, total: prev.total + newTasks.length }));
    };

    const importPublicArchives = async () => {
        if (!selectedDir) return;

        try {
            const targetFiles = allPublicFiles.filter(f => f.directory === selectedDir);

            // Avoid duplicates and already analyzed files
            const currentTaskPaths = new Set(tasks.map(t => t.publicPath));
            const filtered = targetFiles.filter(f =>
                !currentTaskPaths.has(f.path) && !analyzedTargets.has(f.path)
            );

            // Apply batch limit if not 0 (0 = all)
            const sliced = batchLimit > 0 ? filtered.slice(0, batchLimit) : filtered;

            const newTasks: FileTask[] = sliced.map((f: any) => ({
                file: new File([], f.name),
                status: 'idle',
                progress: 0,
                publicPath: f.path
            }));

            if (newTasks.length === 0 && targetFiles.length > 0) {
                alert("Tous les fichiers de ce dossier ont déjà été analysés ou sont dans la file.");
                return;
            }

            setTasks(prev => [...prev, ...newTasks]);
            setStats(prev => ({ ...prev, total: prev.total + newTasks.length }));
        } catch (error) {
            console.error("Failed to import public archives", error);
        }
    };

    const startSequencialAnalysis = () => {
        if (isProcessing) return;
        setIsProcessing(true);
    };

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC] animate-pro-reveal">
            <PageHeader
                title="Analyseur"
                titleHighlight="Automatique"
                icon={Cpu}
                badgeText="Background Intelligence"
                stats={[
                    { label: "Moteur", value: "Gemini 2.0 Flash", icon: <Zap size={10} className="text-[#B91C1C]" /> },
                    { label: "Status", value: isProcessing ? "Actif" : "En veille", icon: <Loader2 size={10} className={isProcessing ? "animate-spin" : ""} /> },
                    { label: "Fichiers", value: stats.total, icon: <FileText size={10} /> }
                ]}
            >
                <div className="flex items-center gap-3">
                    {/* Directory Selector for Public Archives */}
                    <div className="flex flex-col gap-1.5 min-w-[200px]">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Dossier Public Cible</label>
                        <select
                            value={selectedDir}
                            onChange={(e) => setSelectedDir(e.target.value)}
                            className="px-4 py-2.5 bg-white border-2 border-slate-100 rounded-2xl text-[11px] font-bold text-slate-700 focus:border-[#B91C1C] outline-none transition-all shadow-sm"
                        >
                            {availableDirs.map(dir => (
                                <option key={dir} value={dir}>{dir}</option>
                            ))}
                        </select>
                    </div>

                    {/* Batch Limit Selector */}
                    <div className="flex flex-col gap-1.5 min-w-[120px]">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Limite (Fichiers)</label>
                        <select
                            value={batchLimit}
                            onChange={(e) => setBatchLimit(Number(e.target.value))}
                            className="px-4 py-2.5 bg-white border-2 border-slate-100 rounded-2xl text-[11px] font-bold text-slate-700 focus:border-[#B91C1C] outline-none transition-all shadow-sm"
                        >
                            <option value={10}>10 Fichiers</option>
                            <option value={20}>20 Fichiers</option>
                            <option value={50}>50 Fichiers</option>
                            <option value={100}>100 Fichiers</option>
                            <option value={0}>Tout le dossier</option>
                        </select>
                    </div>

                    <button
                        onClick={importPublicArchives}
                        disabled={isProcessing || !selectedDir}
                        className="flex items-center gap-3 px-4 py-2.5 bg-white border-2 border-slate-200 mt-5 hover:border-[#B91C1C] hover:bg-[#B91C1C]/5 rounded-2xl cursor-pointer transition-all group shrink-0"
                        title="Charger les fichiers du dossier sélectionné"
                    >
                        <Zap size={16} className="text-slate-400 group-hover:text-[#B91C1C]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-[#B91C1C] hidden lg:inline">Charger</span>
                    </button>

                    <label className="flex items-center gap-3 px-4 py-2.5 bg-white border-2 border-dashed border-slate-200 mt-5 hover:border-[#B91C1C] hover:bg-[#B91C1C]/5 rounded-2xl cursor-pointer transition-all group shrink-0">
                        <Folder size={16} className="text-slate-400 group-hover:text-[#B91C1C]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-[#B91C1C] hidden lg:inline">Local</span>
                        <input
                            type="file"
                            className="hidden"
                            // @ts-ignore
                            webkitdirectory=""
                            directory=""
                            multiple
                            onChange={handleFolderSelect}
                        />
                    </label>

                    <button
                        onClick={startSequencialAnalysis}
                        disabled={isProcessing || tasks.filter(t => t.status === 'idle' || t.status === 'error').length === 0}
                        className={`flex items-center gap-3 px-6 py-2.5 mt-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${isProcessing || tasks.filter(t => t.status === 'idle' || t.status === 'error').length === 0
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            : 'bg-[#B91C1C] text-white shadow-xl shadow-red-900/20 hover:bg-[#0F172A] hover:scale-105 active:scale-95'
                            }`}
                    >
                        {isProcessing ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Play size={16} />
                        )}
                        <span className="hidden lg:inline">Lancer ({tasks.filter(t => t.status === 'idle' || t.status === 'error').length})</span>
                    </button>

                    <button
                        onClick={() => {
                            if (window.confirm("Vider toute la file d'attente ?")) {
                                setTasks([]);
                                setStats({ total: 0, completed: 0, failed: 0 });
                            }
                        }}
                        className="flex items-center justify-center w-10 h-10 mt-5 bg-white border-2 border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-100 rounded-2xl transition-all"
                        title="Vider la file d'attente"
                    >
                        <History size={16} />
                    </button>
                </div>
            </PageHeader>

            {/* Stats Dashboard */}
            {tasks.length > 0 && (
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Progression Totale</span>
                            <div className="flex items-end gap-3">
                                <div className="text-3xl font-black text-[#0F172A]">{Math.round((stats.completed / (stats.total || 1)) * 100)}%</div>
                                <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">{stats.completed}/{stats.total} Fichiers</div>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                                <div
                                    className="h-full bg-[#B91C1C] transition-all duration-500"
                                    style={{ width: `${(stats.completed / (stats.total || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                </div>
                                <span className="text-2xl font-black text-emerald-600">{stats.completed}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Analyses Terminées</span>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <AlertCircle size={16} className="text-red-500" />
                                </div>
                                <span className="text-2xl font-black text-red-600">{stats.failed}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Échecs</span>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Zap size={16} className="text-blue-500" />
                                </div>
                                <span className="text-2xl font-black text-blue-600">{isProcessing ? 'Actif' : 'En veille'}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Moteur IA</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Task List */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto">
                    {tasks.length === 0 ? (
                        <div className="h-96 flex flex-col items-center justify-center text-slate-300">
                            <Folder size={64} className="mb-6 opacity-20" />
                            <p className="text-lg font-bold italic font-serif-legal">Aucun dossier sélectionné</p>
                            <p className="text-[10px] uppercase tracking-widest mt-2">En attente de documents judiciaires...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {tasks.map((task, idx) => (
                                <div
                                    key={idx}
                                    className={`bg-white border rounded-2xl p-4 flex items-center gap-6 transition-all group hover:shadow-lg ${task.status === 'completed' ? 'border-emerald-100' :
                                        task.status === 'error' ? 'border-red-100' : 'border-slate-100'
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl shrink-0 ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-500' :
                                        task.status === 'error' ? 'bg-red-50 text-red-500' :
                                            task.status === 'idle' ? 'bg-slate-50 text-slate-400' : 'bg-blue-50 text-blue-500 animate-pulse'
                                        }`}>
                                        <FileText size={20} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-[13px] font-bold text-[#0F172A] truncate font-serif-legal italic">
                                                {task.file.name}
                                            </h3>
                                            <span className="text-[9px] text-slate-300 font-mono-data">
                                                {(task.file.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                                                {task.status === 'idle' && <span className="text-slate-400">En attente</span>}
                                                {task.status === 'extracting' && <span className="text-blue-500">Extraction Texte...</span>}
                                                {task.status === 'analyzing' && <span className="text-purple-500">Analyse IA Flash...</span>}
                                                {task.status === 'completed' && <span className="text-emerald-600">Terminé</span>}
                                                {task.status === 'error' && <span className="text-red-600">Erreur : {task.error}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-48 hidden md:block">
                                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${task.status === 'completed' ? 'bg-emerald-500' :
                                                    task.status === 'error' ? 'bg-red-500' : 'bg-[#B91C1C]'
                                                    }`}
                                                style={{ width: `${task.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {task.status === 'completed' && task.resultId && (
                                            <button
                                                onClick={() => onOpenAnalysis?.(task.resultId!)}
                                                className="p-2 text-slate-400 hover:text-[#B91C1C] bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-[#B91C1C]/20"
                                                title="Voir l'analyse"
                                            >
                                                <History size={16} />
                                            </button>
                                        )}
                                        <div className="w-8 h-8 flex items-center justify-center">
                                            {task.status === 'completed' ? <CheckCircle2 size={18} className="text-emerald-500" /> :
                                                task.status === 'error' ? <AlertCircle size={18} className="text-red-500" /> :
                                                    (task.status !== 'idle' && <Loader2 size={18} className="text-[#B91C1C] animate-spin" />)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};
