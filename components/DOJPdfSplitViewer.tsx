/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Eye,
    FolderOpen,
    Search,
    Loader2,
    ExternalLink,
    ChevronDown,
    ChevronRight,
    FileCheck,
    AlertTriangle
} from 'lucide-react';

interface PDFFile {
    id: string;
    title: string;
    url: string;
    dataSetId: string;
    size?: string;
    pageCount?: number;
    date?: string;
}

interface DataSet {
    id: string;
    name: string;
    description: string;
    baseUrl: string;
    fileCount?: number;
    startIndex: number;
    urlSegment: string;
}

const DOJ_DATA_SETS: DataSet[] = [
    {
        id: 'DS1',
        name: 'Data Set 1',
        description: 'Premiers documents divulgués',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-1-files',
        fileCount: 50,
        startIndex: 1,
        urlSegment: 'DataSet%201'
    },
    {
        id: 'DS2',
        name: 'Data Set 2',
        description: 'Deuxième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-2-files',
        fileCount: 50,
        startIndex: 3150,
        urlSegment: 'DataSet%202'
    },
    {
        id: 'DS3',
        name: 'Data Set 3',
        description: 'Troisième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-3-files',
        fileCount: 50,
        startIndex: 4500,
        urlSegment: 'DataSet%203'
    },
    {
        id: 'DS4',
        name: 'Data Set 4',
        description: 'Quatrième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-4-files',
        fileCount: 45,
        startIndex: 5200,
        urlSegment: 'DataSet%204'
    },
    {
        id: 'DS5',
        name: 'Data Set 5',
        description: 'Cinquième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-5-files',
        fileCount: 120,
        startIndex: 6000,
        urlSegment: 'DataSet%205'
    },
    {
        id: 'DS6',
        name: 'Data Set 6',
        description: 'Sixième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-6-files',
        fileCount: 67,
        startIndex: 7500,
        urlSegment: 'DataSet%206'
    },
    {
        id: 'DS7',
        name: 'Data Set 7',
        description: 'Septième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-7-files',
        fileCount: 90,
        startIndex: 8200,
        urlSegment: 'DataSet%207'
    },
    {
        id: 'DS8',
        name: 'Data Set 8',
        description: 'Huitième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-8-files',
        fileCount: 34,
        startIndex: 9100,
        urlSegment: 'DataSet%208'
    },
    {
        id: 'DS9',
        name: 'Data Set 9',
        description: 'Neuvième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-9-files',
        fileCount: 180,
        startIndex: 9500,
        urlSegment: 'DataSet%209'
    },
    {
        id: 'DS10',
        name: 'Data Set 10',
        description: 'Dixième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-10-files',
        fileCount: 56,
        startIndex: 10500,
        urlSegment: 'DataSet%2010'
    },
    {
        id: 'DS11',
        name: 'Data Set 11',
        description: 'Onzième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-11-files',
        fileCount: 78,
        startIndex: 11200,
        urlSegment: 'DataSet%2011'
    },
    {
        id: 'DS12',
        name: 'Data Set 12',
        description: 'Douzième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-12-files',
        fileCount: 210,
        startIndex: 12100,
        urlSegment: 'DataSet%2012'
    },
];

export const DOJPdfSplitViewer: React.FC = () => {
    const [selectedDataSet, setSelectedDataSet] = useState<DataSet | null>(DOJ_DATA_SETS[0]);
    const [selectedPdf, setSelectedPdf] = useState<PDFFile | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAgeVerified, setIsAgeVerified] = useState(false);
    const [files, setFiles] = useState<PDFFile[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Initial mock data generation
    useEffect(() => {
        if (selectedDataSet) {
            setIsLoadingFiles(true);
            // Generate realistic file URLs based on known DOJ schema
            setTimeout(() => {
                const mockFiles: PDFFile[] = Array.from({ length: selectedDataSet.fileCount || 20 }).map((_, i) => {
                    // Base naming sequence: EFTA + 8 digits
                    // We start from the dataset's known start index
                    const fileIndex = selectedDataSet.startIndex + i;
                    const batesNumber = `EFTA${fileIndex.toString().padStart(8, '0')}`;
                    const fileName = `${batesNumber}.pdf`;

                    // URL Construction:
                    // Use local proxy /api/doj to forward to justice.gov and bypass X-Frame-Options
                    const fullUrl = `/api/doj/epstein/files/${selectedDataSet.urlSegment}/${fileName}`;

                    return {
                        id: batesNumber,
                        title: `Document ${batesNumber}`,
                        url: fullUrl,
                        dataSetId: selectedDataSet.id,
                        size: `${(Math.random() * 5 + 0.1).toFixed(1)} MB`,
                        pageCount: Math.floor(Math.random() * 30) + 1,
                        date: '2024-05-23'
                    };
                });
                setFiles(mockFiles);
                setIsLoadingFiles(false);
            }, 600);
        }
    }, [selectedDataSet]);

    if (!isAgeVerified) {
        return (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-300 border border-slate-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <AlertTriangle className="text-amber-600" size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                Accès Restreint
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Archives Judiciaires DOJ
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
                        <p className="text-xs text-slate-600 leading-relaxed text-justify font-medium">
                            Conformément aux directives du Département de la Justice des États-Unis et à la réglementation sur la protection des mineurs, l'accès à ces documents non classifiés mais sensibles requiert une confirmation de majorité.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => setIsAgeVerified(true)}
                            className="w-full bg-[#B91C1C] hover:bg-[#991818] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-red-900/30 flex items-center justify-center gap-2"
                        >
                            <FileCheck size={18} />
                            Je certifie avoir 18 ans ou plus
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const filteredFiles = files.filter(f =>
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-full bg-[#F8FAFC] overflow-hidden relative">
            {/* LEFT SIDEBAR: LIST */}
            <div className={`${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-96 opacity-100'} flex flex-col bg-white border-r border-slate-200 transition-all duration-300 shrink-0`}>

                {/* Header */}
                <div className="p-5 border-b border-slate-100 bg-white z-10">
                    <h2 className="text-lg font-black text-[#0F172A] uppercase tracking-tight flex items-center gap-2 mb-4">
                        <FolderOpen size={20} className="text-[#B91C1C]" />
                        Explorateur
                    </h2>

                    {/* Dataset Selector */}
                    <div className="relative mb-4">
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDown size={14} />
                        </div>
                        <select
                            value={selectedDataSet?.id}
                            onChange={(e) => setSelectedDataSet(DOJ_DATA_SETS.find(ds => ds.id === e.target.value) || null)}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 text-[#0F172A] text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C] transition-all cursor-pointer"
                        >
                            {DOJ_DATA_SETS.map(ds => (
                                <option key={ds.id} value={ds.id}>{ds.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Filtrer les PDFs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#B91C1C] transition-all"
                        />
                    </div>
                </div>

                {/* File List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {isLoadingFiles ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
                            <Loader2 size={24} className="animate-spin text-[#B91C1C]" />
                            <span className="text-xs font-medium uppercase tracking-wider">Chargement...</span>
                        </div>
                    ) : filteredFiles.length > 0 ? (
                        filteredFiles.map((file) => (
                            <button
                                key={file.id}
                                onClick={() => setSelectedPdf(file)}
                                className={`w-full text-left p-3 rounded-xl transition-all border group flex items-start gap-3 relative overflow-hidden ${selectedPdf?.id === file.id
                                    ? 'bg-[#B91C1C]/5 border-[#B91C1C]/20 shadow-sm'
                                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'
                                    }`}
                            >
                                {selectedPdf?.id === file.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B91C1C]"></div>
                                )}
                                <div className={`p-2 rounded-lg shrink-0 ${selectedPdf?.id === file.id ? 'bg-white text-[#B91C1C]' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-[#B91C1C]'
                                    } transition-colors`}>
                                    <FileText size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-xs font-bold truncate mb-1 ${selectedPdf?.id === file.id ? 'text-[#0F172A]' : 'text-slate-600'
                                        }`}>{file.title}</h4>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                        <span>{file.size}</span>
                                        <span>•</span>
                                        <span>{file.pageCount} pages</span>
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-10 px-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-50 rounded-full mb-3">
                                <Search size={20} className="text-slate-300" />
                            </div>
                            <p className="text-xs text-slate-400 font-medium">Aucun document trouvé</p>
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10px] font-mono text-slate-400 text-center uppercase tracking-wider">
                    {filteredFiles.length} Documents Chargés
                </div>
            </div>

            {/* TOGGLE SIDEBAR BUTTON */}
            <button
                onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                className={`absolute top-1/2 -translate-y-1/2 z-20 w-6 h-12 bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-400 hover:text-[#B91C1C] transition-all rounded-r-lg ${isSidebarCollapsed ? 'left-0' : 'left-96 ml-[1px]'}`}
            >
                {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} className="rotate-90" />}
            </button>


            {/* RIGHT MAIN: VIEWER */}
            <div className="flex-1 flex flex-col h-full bg-slate-100 relative overflow-hidden">
                {selectedPdf ? (
                    <div className="flex flex-col h-full">
                        {/* Toolbar */}
                        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-red-50 rounded text-[#B91C1C]">
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#0F172A]">{selectedPdf.title}</h3>
                                    <p className="text-[10px] text-slate-400 font-mono">{selectedPdf.id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => window.open(selectedPdf.url, '_blank')}
                                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-[#B91C1C] transition-colors"
                                    title="Ouvrir dans un nouvel onglet"
                                >
                                    <ExternalLink size={18} />
                                </button>
                                <button className="px-3 py-1.5 bg-[#B91C1C] hover:bg-[#991818] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2">
                                    <Download size={14} />
                                    Télécharger
                                </button>
                            </div>
                        </div>

                        {/* PDF Content (Iframe) */}
                        <div className="flex-1 bg-slate-200 p-4 overflow-hidden relative">
                            {/* Note: In a real scenario, standard websites prevent iframing via X-Frame-Options. 
                                 However, direct PDF links sometimes work, or we use a proxy/viewer library.
                                 For this demo prototype, we show the iframe structure. 
                             */}
                            <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden relative group">
                                <iframe
                                    src={selectedPdf.url}
                                    className="w-full h-full"
                                    title="PDF Viewer"
                                />
                                {/* Fallback / Info Overlay if iframe fails to load (common with cross-origin policies) */}
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none flex flex-col items-center text-center pb-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-xs text-slate-400 mb-2">Si le document ne s'affiche pas correctement</p>
                                    <a
                                        href={selectedPdf.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#0F172A] text-white px-4 py-2 rounded-full text-xs font-bold pointer-events-auto hover:bg-[#B91C1C] transition-colors shadow-lg"
                                    >
                                        Ouvrir le PDF original
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
                        <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center animate-pulse">
                            <Eye size={40} className="text-slate-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-1">Aucun Document Sélectionné</h3>
                            <p className="text-sm font-medium">Sélectionnez un fichier dans la liste pour le visualiser</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
