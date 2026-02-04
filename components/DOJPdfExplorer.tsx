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
    Filter,
    Loader2,
    ExternalLink,
    X,
    ChevronDown,
    FileCheck,
    AlertTriangle
} from 'lucide-react';

interface PDFFile {
    id: string;
    title: string;
    url: string;
    dataSet: string;
    size?: string;
    pageCount?: number;
}

interface DataSet {
    id: string;
    name: string;
    description: string;
    baseUrl: string;
    files?: PDFFile[];
}

const DOJ_DATA_SETS: DataSet[] = [
    {
        id: 'DS1',
        name: 'Data Set 1',
        description: 'Premiers documents divulgués',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-1-files',
    },
    {
        id: 'DS2',
        name: 'Data Set 2',
        description: 'Deuxième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-2-files',
    },
    {
        id: 'DS3',
        name: 'Data Set 3',
        description: 'Troisième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-3-files',
    },
    {
        id: 'DS4',
        name: 'Data Set 4',
        description: 'Quatrième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-4-files',
    },
    {
        id: 'DS5',
        name: 'Data Set 5',
        description: 'Cinquième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-5-files',
    },
    {
        id: 'DS6',
        name: 'Data Set 6',
        description: 'Sixième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-6-files',
    },
    {
        id: 'DS7',
        name: 'Data Set 7',
        description: 'Septième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-7-files',
    },
    {
        id: 'DS8',
        name: 'Data Set 8',
        description: 'Huitième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-8-files',
    },
    {
        id: 'DS9',
        name: 'Data Set 9',
        description: 'Neuvième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-9-files',
    },
    {
        id: 'DS10',
        name: 'Data Set 10',
        description: 'Dixième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-10-files',
    },
    {
        id: 'DS11',
        name: 'Data Set 11',
        description: 'Onzième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-11-files',
    },
    {
        id: 'DS12',
        name: 'Data Set 12',
        description: 'Douzième série de documents',
        baseUrl: 'https://www.justice.gov/epstein/doj-disclosures/data-set-12-files',
    },
];

export const DOJPdfExplorer: React.FC = () => {
    const [selectedDataSet, setSelectedDataSet] = useState<DataSet | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingPdf, setViewingPdf] = useState<PDFFile | null>(null);
    const [expandedDataSets, setExpandedDataSets] = useState<Set<string>>(new Set());
    const [ageVerified, setAgeVerified] = useState(false);

    // Age verification modal
    if (!ageVerified) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <AlertTriangle className="text-amber-600" size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                Vérification d'Âge
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Contenu réglementé DOJ
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Ces documents contiennent des informations sensibles relatives à des affaires judiciaires.
                            Conformément aux directives du Département de la Justice, vous devez avoir{' '}
                            <span className="font-bold text-slate-900">18 ans ou plus</span> pour accéder à ce contenu.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => setAgeVerified(true)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-600/30 flex items-center justify-center gap-2"
                        >
                            <FileCheck size={18} />
                            Oui, j'ai 18 ans ou plus
                        </button>

                        <button
                            onClick={() => window.history.back()}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <X size={18} />
                            Quitter
                        </button>
                    </div>

                    <p className="text-xs text-slate-400 mt-6 text-center">
                        En confirmant, vous certifiez avoir l'âge minimum requis.
                    </p>
                </div>
            </div>
        );
    }

    const toggleDataSet = (dataSetId: string) => {
        const newExpanded = new Set(expandedDataSets);
        if (newExpanded.has(dataSetId)) {
            newExpanded.delete(dataSetId);
        } else {
            newExpanded.add(dataSetId);
        }
        setExpandedDataSets(newExpanded);
    };

    const openPdfViewer = (dataSet: DataSet) => {
        // Open the PDF listing page in a new window
        window.open(dataSet.baseUrl, '_blank', 'noopener,noreferrer');
    };

    const openPdfInNewWindow = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const filteredDataSets = DOJ_DATA_SETS.filter(
        (ds) =>
            ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ds.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-5 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-[#B91C1C] rounded-xl shadow-lg shadow-red-900/10">
                            <FolderOpen className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[#0F172A] uppercase tracking-tight">
                                DOJ Epstein{' '}
                                <span className="text-[#B91C1C] font-serif">Archive Explorer</span>
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Explorateur de documents judiciaires • 12 Data Sets disponibles
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Rechercher dans les Data Sets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C] transition-all"
                    />
                </div>
            </div>

            {/* Data Sets Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDataSets.map((dataSet) => (
                            <div
                                key={dataSet.id}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#B91C1C]/20 transition-all duration-300 overflow-hidden group"
                            >
                                {/* Card Header */}
                                <div className="bg-gradient-to-br from-slate-50 to-white p-5 border-b border-slate-100">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#B91C1C]/5 rounded-lg group-hover:bg-[#B91C1C]/10 transition-colors">
                                                <FileText className="text-[#B91C1C]" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-[#0F172A] uppercase tracking-tight">
                                                    {dataSet.name}
                                                </h3>
                                                <p className="text-xs text-slate-400 font-mono mt-0.5">
                                                    {dataSet.id}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {dataSet.description}
                                    </p>
                                </div>

                                {/* Card Actions */}
                                <div className="p-4 bg-white space-y-2">
                                    <button
                                        onClick={() => openPdfViewer(dataSet)}
                                        className="w-full bg-[#B91C1C] hover:bg-[#991818] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-red-900/20 flex items-center justify-center gap-2 group"
                                    >
                                        <Eye size={16} />
                                        <span>Voir les Fichiers</span>
                                        <ExternalLink
                                            size={14}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                    </button>

                                    <button
                                        onClick={() => openPdfViewer(dataSet)}
                                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <FolderOpen size={14} />
                                        <span>Ouvrir dans un nouvel onglet</span>
                                    </button>
                                </div>

                                {/* Stats Footer */}
                                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-medium">
                                            Source : justice.gov
                                        </span>
                                        <div className="flex items-center gap-1 text-emerald-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="font-bold">Accessible</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredDataSets.length === 0 && (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                                <Search className="text-slate-400" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-600 mb-2">
                                Aucun résultat trouvé
                            </h3>
                            <p className="text-sm text-slate-400">
                                Essayez d'autres termes de recherche
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Footer */}
            <div className="bg-white border-t border-slate-200 px-6 py-4 shrink-0">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-slate-600 font-medium">
                                Connexion sécurisée DOJ.gov
                            </span>
                        </div>
                        <div className="text-slate-400">
                            Les documents s'ouvrent dans un nouvel onglet pour consultation
                        </div>
                    </div>
                    <div className="text-slate-500 font-mono">
                        {filteredDataSets.length} / {DOJ_DATA_SETS.length} Data Sets
                    </div>
                </div>
            </div>

            {/* PDF Viewer Modal would go here if needed */}
            {viewingPdf && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
                            <div className="flex items-center gap-3">
                                <FileText className="text-[#B91C1C]" size={20} />
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        {viewingPdf.title}
                                    </h3>
                                    <p className="text-xs text-slate-500">{viewingPdf.dataSet}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewingPdf(null)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-slate-600" />
                            </button>
                        </div>

                        {/* PDF Iframe */}
                        <div className="flex-1 overflow-hidden">
                            <iframe
                                src={viewingPdf.url}
                                className="w-full h-full"
                                title={viewingPdf.title}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
