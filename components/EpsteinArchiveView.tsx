
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, FileText, Grid, List, ExternalLink, Filter, ChevronLeft, ChevronRight, Folder, Zap, ShieldCheck, EyeOff, Eye, CheckSquare, Square, Image as ImageIcon, Lock } from 'lucide-react';
import { PdfHoverPreview } from './PdfHoverPreview';
import { storageService } from '../services/storageService';

interface PdfFile {
    name: string;
    path: string;
    directory: string;
    size: number;
}

interface EpsteinArchiveViewProps {
    onAnalyze?: (file: PdfFile) => void;
    onOpenAnalysis?: (path: string) => void;
    analyzedFilePaths?: Set<string>;
    isGuestMode?: boolean;
}

export const EpsteinArchiveView: React.FC<EpsteinArchiveViewProps> = ({ onAnalyze, onOpenAnalysis, analyzedFilePaths = new Set(), isGuestMode }) => {
    const [files, setFiles] = useState<PdfFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(24);
    const [selectedDir, setSelectedDir] = useState<string>('all');
    const [hideAnalyzed, setHideAnalyzed] = useState(false);
    const [typeFilter, setTypeFilter] = useState<'all' | 'doc' | 'image'>('all');
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
    const [fileTypes, setFileTypes] = useState<Map<string, 'doc' | 'image'>>(new Map());
    const [activeFile, setActiveFile] = useState<PdfFile | null>(null);

    useEffect(() => {
        fetch('/epstein-index.json')
            .then(res => res.json())
            .then(data => {
                setFiles(data);
                setLoading(false);
                if (data.length > 0) setActiveFile(data[0]);
            })
            .catch(err => {
                console.error("Failed to load index", err);
                setLoading(false);
            });

        // Load metadata from database
        storageService.getAllFileMetadata().then(metadata => {
            if (metadata && metadata.length > 0) {
                const newTypes = new Map<string, 'doc' | 'image'>();
                const newSelected = new Set<string>();
                metadata.forEach(item => {
                    if (item.file_type) newTypes.set(item.path, item.file_type as any);
                    if (item.is_selected) newSelected.add(item.path);
                });
                setFileTypes(newTypes);
                setSelectedPaths(newSelected);
            }
        });
    }, []);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileType = (path: string) => {
        return fileTypes.get(path) || (path.includes('/IMAGES/') ? 'image' : 'doc');
    };

    const toggleSelection = (path: string) => {
        const newSelected = new Set(selectedPaths);
        const isNowSelected = !newSelected.has(path);
        if (newSelected.has(path)) {
            newSelected.delete(path);
        } else {
            newSelected.add(path);
        }
        setSelectedPaths(newSelected);
        storageService.saveFileMetadata(path, { selected: isNowSelected });
    };

    const toggleFileType = (path: string) => {
        const newTypes = new Map(fileTypes);
        const current = newTypes.get(path) || (path.includes('/IMAGES/') ? 'image' : 'doc');
        const next = current === 'doc' ? 'image' : 'doc';
        newTypes.set(path, next);
        setFileTypes(newTypes);
        storageService.saveFileMetadata(path, { type: next });
    };

    const directories = useMemo(() => {
        const dirs = new Set(files.map(f => f.directory));
        return Array.from(dirs).sort();
    }, [files]);

    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDir = selectedDir === 'all' || file.directory === selectedDir;
            const matchesAnalyzed = !hideAnalyzed || !analyzedFilePaths.has(file.path);
            const matchesType = typeFilter === 'all' || getFileType(file.path) === typeFilter;
            return matchesSearch && matchesDir && matchesAnalyzed && matchesType;
        });
    }, [files, searchTerm, selectedDir, hideAnalyzed, analyzedFilePaths, typeFilter, fileTypes]);

    const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
    const currentFiles = filteredFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!activeFile || filteredFiles.length === 0) return;

            // Don't navigate if typing in search
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') return;

            const currentIndex = currentFiles.findIndex(f => f.path === activeFile.path);
            if (currentIndex === -1) return;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % currentFiles.length;
                setActiveFile(currentFiles[nextIndex]);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + currentFiles.length) % currentFiles.length;
                setActiveFile(currentFiles[prevIndex]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeFile, currentFiles, filteredFiles]);

    useEffect(() => {
        if (activeFile) {
            const element = document.getElementById(`file-${activeFile.path.replace(/[^a-zA-Z0-9]/g, '-')}`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [activeFile]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B91C1C]"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
            {/* Header */}
            <header className="px-6 py-3 bg-white border-b border-slate-200 z-10 shadow-sm shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-black text-[#0F172A] uppercase italic font-serif-legal whitespace-nowrap">
                            Archives <span className="text-[#B91C1C]">Epstein</span>
                        </h2>
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                {files.length} Docs
                            </span>
                            {selectedPaths.size > 0 && (
                                <span className="bg-red-100 text-[#B91C1C] px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider animate-pulse">
                                    {selectedPaths.size} Sél.
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative group w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#B91C1C] transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-9 pr-3 text-xs font-medium focus:outline-none focus:border-[#B91C1C] transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select
                                className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                                value={selectedDir}
                                onChange={(e) => { setSelectedDir(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="all">Dossiers</option>
                                {directories.map(dir => (
                                    <option key={dir} value={dir}>{dir}</option>
                                ))}
                            </select>

                            <select
                                className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                                value={typeFilter}
                                onChange={(e) => { setTypeFilter(e.target.value as any); setCurrentPage(1); }}
                            >
                                <option value="all">Tous types</option>
                                <option value="doc">PDF</option>
                                <option value="image">Images</option>
                            </select>

                            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                <button
                                    onClick={() => setHideAnalyzed(!hideAnalyzed)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all text-[9px] font-black uppercase tracking-widest ${hideAnalyzed ? 'bg-[#B91C1C] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    title={hideAnalyzed ? "Afficher les documents analysés" : "Cacher les documents analysés"}
                                >
                                    {hideAnalyzed ? <Eye size={12} /> : <EyeOff size={12} />}
                                    <span className="hidden lg:inline">{hideAnalyzed ? "Voir Analysés" : "Cacher Analysés"}</span>
                                </button>
                                <div className="w-px h-4 bg-slate-200 mx-0.5 self-center"></div>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-[#B91C1C] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Grid size={14} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-[#B91C1C] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <List size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Layout: Browser + Preview */}
            <div className="flex-1 flex overflow-hidden">
                {/* Browser Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar relative">
                    {filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <Folder size={48} className="mb-4 opacity-50" />
                            <p className="font-bold uppercase tracking-wider">Aucun document trouvé</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {currentFiles.map((file) => (
                                <div
                                    key={file.path}
                                    id={`file-${file.path.replace(/[^a-zA-Z0-9]/g, '-')}`}
                                    onClick={() => setActiveFile(file)}
                                    className={`group bg-white p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col cursor-pointer ${activeFile?.path === file.path ? 'border-[#B91C1C] shadow-lg ring-1 ring-[#B91C1C]/20' : 'border-slate-100 hover:border-[#B91C1C]/50 hover:shadow-md'}`}
                                >
                                    <div className="absolute top-2 right-2 flex gap-2 z-20">
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFileType(file.path); }}
                                            className={`p-1.5 rounded-lg transition-all ${getFileType(file.path) === 'image' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}
                                            title={getFileType(file.path) === 'image' ? "Type: Image" : "Type: Document"}
                                        >
                                            {getFileType(file.path) === 'image' ? <ImageIcon size={14} /> : <FileText size={14} />}
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelection(file.path); }}
                                            className={`p-1.5 rounded-lg transition-all ${selectedPaths.has(file.path) ? 'bg-[#B91C1C] text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:text-[#B91C1C]'}`}
                                            title={selectedPaths.has(file.path) ? "Déslectionner" : "Sélectionner"}
                                        >
                                            {selectedPaths.has(file.path) ? <CheckSquare size={14} /> : <Square size={14} />}
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${getFileType(file.path) === 'image' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-[#B91C1C]'}`}>
                                            {getFileType(file.path) === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                                        </div>
                                        <h3 className={`text-sm font-bold line-clamp-2 leading-tight transition-colors break-words ${activeFile?.path === file.path ? 'text-[#B91C1C]' : 'text-slate-800'}`}>
                                            {file.name}
                                        </h3>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col gap-3">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                            <span>{formatSize(file.size)}</span>
                                            <a
                                                href={file.path}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-slate-300 hover:text-[#B91C1C]"
                                            >
                                                Ouvrir <ExternalLink size={10} />
                                            </a>
                                        </div>
                                        {onAnalyze && (
                                            analyzedFilePaths.has(file.path) ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        onOpenAnalysis?.(file.path);
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-slate-200 hover:bg-white hover:text-[#B91C1C] hover:border-[#B91C1C]"
                                                >
                                                    <ShieldCheck size={12} className="text-emerald-500" />
                                                    Dossier Existant
                                                </button>
                                            ) : !isGuestMode ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        onAnalyze(file);
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 py-2 bg-[#B91C1C] hover:bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/10 active:scale-95 group/btn"
                                                >
                                                    <Zap size={12} className="group-hover/btn:rotate-12 transition-transform" />
                                                    Analyser
                                                </button>
                                            ) : (
                                                <div className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100">
                                                    <Lock size={12} />
                                                    Accès Restreint
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {currentFiles.map((file) => (
                                <div
                                    key={file.path}
                                    id={`file-${file.path.replace(/[^a-zA-Z0-9]/g, '-')}`}
                                    onClick={() => setActiveFile(file)}
                                    className={`flex items-center p-4 bg-white rounded-xl border transition-all group cursor-pointer ${activeFile?.path === file.path ? 'border-[#B91C1C] shadow-md ring-1 ring-[#B91C1C]/10' : 'border-slate-100 hover:border-[#B91C1C]/30'}`}
                                >
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelection(file.path); }}
                                        className={`mr-4 p-2 rounded-lg transition-all ${selectedPaths.has(file.path) ? 'text-[#B91C1C]' : 'text-slate-300 hover:text-[#B91C1C]'}`}
                                    >
                                        {selectedPaths.has(file.path) ? <CheckSquare size={20} /> : <Square size={20} />}
                                    </button>

                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${getFileType(file.path) === 'image' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-[#B91C1C]'}`}>
                                        {getFileType(file.path) === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                                    </div>

                                    <div className="flex-1 min-w-0 mr-4">
                                        <span className={`text-sm font-bold truncate transition-colors block ${activeFile?.path === file.path ? 'text-[#B91C1C]' : 'text-slate-800'}`}>
                                            {file.name}
                                        </span>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{file.directory !== 'root' ? file.directory : 'Racine'}</p>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFileType(file.path); }}
                                        className={`mr-8 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${getFileType(file.path) === 'image' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}
                                    >
                                        {getFileType(file.path) === 'image' ? 'Image' : 'PDF'}
                                    </button>
                                    <div className="text-[11px] font-mono font-bold text-slate-500 mr-8 w-20 text-right">
                                        {formatSize(file.size)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a href={file.path} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-300 hover:text-[#B91C1C]">
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-10 mb-20 flex items-center justify-between">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Page {currentPage} sur {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Constant Preview Pane */}
                <div className="hidden xl:flex w-[450px] bg-white border-l border-slate-200 flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-20">
                    <div className="p-6 border-b border-slate-100 bg-[#F8FAFC]/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 rounded-full bg-[#B91C1C] animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Module de Visualisation</span>
                        </div>
                        {activeFile ? (
                            <div>
                                <h3 className="text-sm font-black text-[#0F172A] font-serif-legal line-clamp-2 leading-tight mb-2 italic">
                                    "{activeFile.name}"
                                </h3>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Folder size={12} /> {activeFile.directory}</span>
                                    <span>{formatSize(activeFile.size)}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Sélectionnez un document</p>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar flex flex-col items-center">
                        {activeFile ? (
                            <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
                                <PdfHoverPreview url={activeFile.path} width={400} />

                                <div className="mt-8 space-y-4">
                                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                <ShieldCheck size={16} className="text-emerald-600" />
                                            </div>
                                            <span className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider italic">Prêt pour Analyse</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                            Ce document peut être traité par le moteur IA pour extraire les entités, les transactions et la chronologie des faits.
                                        </p>
                                    </div>

                                    {!isGuestMode && (
                                        <button
                                            onClick={() => onAnalyze?.(activeFile)}
                                            className="w-full py-4 bg-[#B91C1C] hover:bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-red-900/10 active:scale-x-95 flex items-center justify-center gap-3 group"
                                        >
                                            <Zap size={16} className="group-hover:rotate-12 transition-transform" />
                                            Lancer l'Analyse Forensique
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 opacity-50 text-center px-10">
                                <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center mb-6">
                                    <FileText size={32} />
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">En attente de sélection</h4>
                                <p className="mt-2 text-[9px] font-medium leading-relaxed">Parcourez les archives et sélectionnez un dossier pour un aperçu immédiat.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-white">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Focus Mode: ON</span>
                            <div className="flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                <div className="w-1 h-1 rounded-full bg-[#B91C1C]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

