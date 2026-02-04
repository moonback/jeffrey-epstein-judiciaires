
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, FileText, Grid, List, ExternalLink, Filter, ChevronLeft, ChevronRight, Folder, Zap, ShieldCheck, EyeOff, Eye, CheckSquare, Square, Image as ImageIcon } from 'lucide-react';
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
}

export const EpsteinArchiveView: React.FC<EpsteinArchiveViewProps> = ({ onAnalyze, onOpenAnalysis, analyzedFilePaths = new Set() }) => {
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

    // Preview Hover State
    const [hoveredFile, setHoveredFile] = useState<{ file: PdfFile, rect: DOMRect } | null>(null);
    const hoverTimeout = useRef<any>(null);

    const handleMouseEnter = (e: React.MouseEvent, file: PdfFile) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);

        hoverTimeout.current = setTimeout(() => {
            setHoveredFile({ file, rect });
        }, 200);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        setHoveredFile(null);
    };

    const getPreviewStyle = (rect: DOMRect) => {
        const PREVIEW_WIDTH = 280;
        const PREVIEW_HEIGHT = 400; // Estimated
        const PADDING = 15;

        // Position to the right of the card by default
        let left = rect.right + PADDING;
        let top = rect.top;

        // If not enough space on the right, show on the left
        if (left + PREVIEW_WIDTH > window.innerWidth) {
            left = rect.left - PREVIEW_WIDTH - PADDING;
        }

        // If not enough space on the left either, just use PADDING
        if (left < 0) {
            left = PADDING;
        }

        // Ensure vertical bounds
        if (top + PREVIEW_HEIGHT > window.innerHeight) {
            top = Math.max(PADDING, window.innerHeight - PREVIEW_HEIGHT - PADDING);
        }

        return { top, left };
    };

    useEffect(() => {
        fetch('/epstein-index.json')
            .then(res => res.json())
            .then(data => {
                setFiles(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load index", err);
                setLoading(false);
            });

        // Load metadata from database
        storageService.getAllFileMetadata().then(metadata => {
            if (metadata && metadata.length > 0) {
                const newTypes = new Map();
                const newSelected = new Set();
                metadata.forEach(item => {
                    if (item.file_type) newTypes.set(item.path, item.file_type);
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Folder size={48} className="mb-4 opacity-50" />
                        <p className="font-bold uppercase tracking-wider">Aucun document trouvé</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
                        {currentFiles.map((file) => (
                            <a
                                key={file.path}
                                href={file.path}
                                target="_blank"
                                rel="noreferrer"
                                onMouseEnter={(e) => handleMouseEnter(e, file)}
                                onMouseLeave={handleMouseLeave}
                                className="group bg-white p-6 rounded-2xl border border-slate-100 hover:border-[#B91C1C] hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col"
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

                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <FileText size={60} />
                                </div>

                                <div className="mb-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${getFileType(file.path) === 'image' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-[#B91C1C]'}`}>
                                        {getFileType(file.path) === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#B91C1C] transition-colors break-words">
                                        {file.name}
                                    </h3>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col gap-3">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                        <span>{formatSize(file.size)}</span>
                                        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-slate-300 group-hover:text-[#B91C1C]">
                                            Ouvrir <ExternalLink size={10} />
                                        </span>
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
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onAnalyze(file);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 py-2 bg-[#B91C1C] hover:bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/10 active:scale-95 group/btn"
                                            >
                                                <Zap size={12} className="group-hover/btn:rotate-12 transition-transform" />
                                                Analyser avec l'IA
                                            </button>
                                        )
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {currentFiles.map((file) => (
                            <div
                                key={file.path}
                                className="flex items-center p-4 bg-white rounded-xl border border-slate-100 hover:border-[#B91C1C] hover:shadow-md transition-all group"
                                onMouseEnter={(e) => handleMouseEnter(e, file)}
                                onMouseLeave={handleMouseLeave}
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
                                    <a
                                        href={file.path}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-bold text-slate-800 truncate group-hover:text-[#B91C1C] transition-colors block"
                                    >
                                        {file.name}
                                    </a>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{file.directory !== 'root' ? file.directory : 'Racine'}</p>
                                </div>

                                <button
                                    onClick={() => toggleFileType(file.path)}
                                    className={`mr-8 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${getFileType(file.path) === 'image' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}
                                >
                                    {getFileType(file.path) === 'image' ? 'Image' : 'Document'}
                                </button>
                                <div className="text-[11px] font-mono font-bold text-slate-500 mr-8 w-20 text-right">
                                    {formatSize(file.size)}
                                </div>
                                <div className="flex items-center gap-2">
                                    {onAnalyze && (
                                        analyzedFilePaths.has(file.path) ? (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onOpenAnalysis?.(file.path);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-slate-200 hover:bg-white hover:text-[#B91C1C]"
                                                title="Ouvrir l'analyse existante"
                                            >
                                                <ShieldCheck size={12} className="text-emerald-500" />
                                                <span className="hidden sm:inline">Analysé</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onAnalyze(file);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-[#B91C1C] hover:bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/10 active:scale-95 group/btn"
                                                title="Analyser avec l'IA"
                                            >
                                                <Zap size={12} />
                                                <span className="hidden sm:inline">IA</span>
                                            </button>
                                        )
                                    )}
                                    <ExternalLink size={16} className="text-slate-300 group-hover:text-[#B91C1C] transition-colors ml-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <footer className="px-8 py-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Page {currentPage} sur {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </footer>
            )}

            {/* Floating Preview Portal */}
            {hoveredFile && createPortal(
                <div
                    className="fixed z-[1001] pointer-events-none transition-all duration-300"
                    style={{
                        ...getPreviewStyle(hoveredFile.rect),
                        opacity: 1,
                    }}
                >
                    <PdfHoverPreview url={hoveredFile.file.path} />
                </div>,
                document.body
            )}
        </div>
    );
}
