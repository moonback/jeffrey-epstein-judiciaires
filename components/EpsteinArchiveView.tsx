
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, FileText, Grid, List, ExternalLink, Filter, ChevronLeft, ChevronRight, Folder } from 'lucide-react';
import { PdfHoverPreview } from './PdfHoverPreview';

interface PdfFile {
    name: string;
    path: string;
    directory: string;
    size: number;
}

export const EpsteinArchiveView: React.FC = () => {
    const [files, setFiles] = useState<PdfFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(24);
    const [selectedDir, setSelectedDir] = useState<string>('all');

    // Preview Hover State
    const [hoveredFile, setHoveredFile] = useState<{ file: PdfFile, x: number, y: number } | null>(null);
    const hoverTimeout = useRef<any>(null);

    const handleMouseEnter = (e: React.MouseEvent, file: PdfFile) => {
        const { clientX, clientY } = e;
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);

        hoverTimeout.current = setTimeout(() => {
            setHoveredFile({ file, x: clientX, y: clientY });
        }, 500);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        setHoveredFile(null);
    };

    const getPreviewStyle = (x: number, y: number) => {
        const PREVIEW_WIDTH = 280;
        const PREVIEW_HEIGHT = 400; // Estimated
        const PADDING = 20;

        // Default: Bottom Right
        let left = x + PADDING;
        let top = y + PADDING;

        // Check Right Edge
        if (left + PREVIEW_WIDTH > window.innerWidth) {
            left = x - PREVIEW_WIDTH - PADDING;
        }

        // Check Bottom Edge
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
    }, []);

    const directories = useMemo(() => {
        const dirs = new Set(files.map(f => f.directory));
        return Array.from(dirs).sort();
    }, [files]);

    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDir = selectedDir === 'all' || file.directory === selectedDir;
            return matchesSearch && matchesDir;
        });
    }, [files, searchTerm, selectedDir]);

    const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
    const currentFiles = filteredFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

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
            <header className="px-8 py-6 bg-white border-b border-slate-200 z-10 shadow-sm shrink-0">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-[#0F172A] uppercase italic font-serif-legal">
                            Archives <span className="text-[#B91C1C]">Epstein</span>
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                {files.length} Documents Indexés
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#B91C1C] transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Rechercher un document..."
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-[#B91C1C] transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-700 focus:outline-none"
                                value={selectedDir}
                                onChange={(e) => { setSelectedDir(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="all">Tous les dossiers</option>
                                {directories.map(dir => (
                                    <option key={dir} value={dir}>{dir}</option>
                                ))}
                            </select>

                            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#B91C1C] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[#B91C1C] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <List size={18} />
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
                        {currentFiles.map((file, idx) => (
                            <a
                                key={idx}
                                href={file.path}
                                target="_blank"
                                rel="noreferrer"
                                onMouseEnter={(e) => handleMouseEnter(e, file)}
                                onMouseLeave={handleMouseLeave}
                                className="group bg-white p-6 rounded-2xl border border-slate-100 hover:border-[#B91C1C] hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <FileText size={60} />
                                </div>

                                <div className="mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-red-50 text-[#B91C1C] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <FileText size={20} />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#B91C1C] transition-colors break-words">
                                        {file.name}
                                    </h3>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                    <span>{formatSize(file.size)}</span>
                                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-slate-300 group-hover:text-[#B91C1C]">
                                        Ouvrir <ExternalLink size={10} />
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {currentFiles.map((file, idx) => (
                            <a
                                key={idx}
                                href={file.path}
                                target="_blank"
                                rel="noreferrer"
                                onMouseEnter={(e) => handleMouseEnter(e, file)}
                                onMouseLeave={handleMouseLeave}
                                className="flex items-center p-4 bg-white rounded-xl border border-slate-100 hover:border-[#B91C1C] hover:shadow-md transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-red-50 text-[#B91C1C] flex items-center justify-center mr-4">
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0 mr-4">
                                    <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-[#B91C1C] transition-colors">{file.name}</h3>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{file.directory !== 'root' ? file.directory : 'Racine'}</p>
                                </div>
                                <div className="text-[11px] font-mono font-bold text-slate-500 mr-8 w-20 text-right">
                                    {formatSize(file.size)}
                                </div>
                                <ExternalLink size={16} className="text-slate-300 group-hover:text-[#B91C1C] transition-colors" />
                            </a>
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
                    className="fixed z-[100] pointer-events-none transition-all duration-300 opacity-0 animate-in fade-in fill-mode-forwards"
                    style={getPreviewStyle(hoveredFile.x, hoveredFile.y)}
                >
                    <PdfHoverPreview url={hoveredFile.file.path} />
                </div>,
                document.body
            )}
        </div>
    );
}
