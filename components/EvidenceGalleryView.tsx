/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { ProcessedResult, DocumentDetail, PhotoDetail } from '../types';
import { DOJImportService } from '../services/dojImportService';
import {
    FileText,
    Image as ImageIcon,
    Search,
    Filter,
    Download,
    Maximize2,
    ExternalLink,
    Calendar,
    MapPin,
    Folder,
    ShieldCheck,
    Eye,
    Grid,
    Layout,
    Archive,
    X,
    Upload,
    AlertCircle,
    CheckCircle2,
    Loader2
} from 'lucide-react';

interface EvidenceItem {
    id: string;
    parentId: string;
    parentTitle: string;
    type: 'DOCUMENT' | 'PHOTO';
    title: string;
    description: string;
    date?: string;
    location?: string;
    tags?: string[];
    rawType?: string;
    isDOJ?: boolean;
}

export const EvidenceGalleryView: React.FC = () => {
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'DOCUMENT' | 'PHOTO'>('ALL');
    const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);

    // DOJ Import states
    const [showDOJImport, setShowDOJImport] = useState(false);
    const [dojUrl, setDojUrl] = useState('');
    const [ageVerified, setAgeVerified] = useState(false);
    const [analyzeWithAI, setAnalyzeWithAI] = useState(true);
    const [importProgress, setImportProgress] = useState('');
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const [importSuccess, setImportSuccess] = useState(false);

    const refreshHistory = useCallback(() => {
        storageService.getAllResults().then(data => {
            setHistory(data);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        refreshHistory();
    }, [refreshHistory]);

    const handleDOJImport = useCallback(async () => {
        if (!ageVerified) {
            setImportError('Vous devez confirmer avoir 18 ans ou plus.');
            return;
        }

        if (!dojUrl.trim()) {
            setImportError('Veuillez entrer une URL de document DOJ.');
            return;
        }

        if (!DOJImportService.isValidDOJUrl(dojUrl)) {
            setImportError('L\'URL doit être un document PDF du site justice.gov');
            return;
        }

        setImporting(true);
        setImportError('');
        setImportSuccess(false);
        setImportProgress('Démarrage de l\'importation...');

        try {
            await DOJImportService.importDOJDocument(dojUrl, {
                analyzeWithAI,
                onProgress: (msg) => setImportProgress(msg),
                onError: (err) => setImportError(err)
            });

            setImportSuccess(true);
            setImportProgress('✅ Importation réussie!');

            // Refresh the gallery
            setTimeout(() => {
                refreshHistory();
                // Reset form after 2 seconds
                setTimeout(() => {
                    setShowDOJImport(false);
                    setDojUrl('');
                    setAgeVerified(false);
                    setImportProgress('');
                    setImportSuccess(false);
                }, 2000);
            }, 500);
        } catch (error) {
            setImportError(error instanceof Error ? error.message : 'Erreur lors de l\'importation');
        } finally {
            setImporting(false);
        }
    }, [dojUrl, ageVerified, analyzeWithAI, refreshHistory]);

    const allEvidence = useMemo(() => {
        const list: EvidenceItem[] = [];

        history.forEach(res => {
            if (!res.output) return;

            // Add Documents
            if (res.output.documents) {
                res.output.documents.forEach((doc, idx) => {
                    // Detect DOJ imports by checking ID prefix or document type
                    const isDOJ = res.id.startsWith('doj-') || doc.type === 'DOJ_DISCLOSURE';

                    list.push({
                        id: `${res.id}-doc-${idx}`,
                        parentId: res.id,
                        parentTitle: res.input.query,
                        type: 'DOCUMENT',
                        title: doc.title,
                        description: doc.description,
                        date: doc.date,
                        rawType: doc.type,
                        isDOJ
                    });
                });
            }

            // Add Photos
            if (res.output.photos) {
                res.output.photos.forEach((photo, idx) => {
                    list.push({
                        id: `${res.id}-photo-${idx}`,
                        parentId: res.id,
                        parentTitle: res.input.query,
                        type: 'PHOTO',
                        title: photo.titre,
                        description: photo.description,
                        date: photo.date,
                        location: photo.localisation
                    });
                });
            }
        });

        return list.filter(item => {
            const matchesSearch =
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.parentTitle.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = filterType === 'ALL' || item.type === filterType;

            return matchesSearch && matchesType;
        });
    }, [history, searchQuery, filterType]);

    const handleDownload = useCallback((item: EvidenceItem) => {
        if (!item) return;

        const parent = history.find(h => h.id === item.parentId);
        const sourceInfo = parent?.sources.map(s => `Source: ${s.title} (${s.uri})`).join('\n') || 'Source non spécifiée';

        const content = `
ANALYSES FORENSIQUE - PIÈCE À CONVICTION
=========================================
ID Pièce: ${item.id}
Titre: ${item.title}
Type: ${item.type}
Date: ${item.date || 'Non spécifiée'}
Localisation: ${item.location || 'Non spécifiée'}
Dossier Source: ${item.parentTitle}

DESCRIPTION & ANALYSE:
----------------------
${item.description}

RÉFÉRENCES SOURCES:
-------------------
${sourceInfo}

CLASSIFICATION: CONFIDENTIEL / DOJ FORENSIC UNIT
Généré le: ${new Date().toLocaleString()}
`.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Forensic-${item.type}-${item.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [history]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-[2px] border-slate-50 rounded-full"></div>
                        <div className="absolute inset-0 border-t-[2px] border-[#B91C1C] rounded-full animate-spin"></div>
                        <Archive size={24} className="absolute inset-0 m-auto text-[#B91C1C] animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Indexation des Pièces...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            {/* DOJ IMPORT MODAL */}
            {showDOJImport && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-20">
                    <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !importing && setShowDOJImport(false)}></div>
                    <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => !importing && setShowDOJImport(false)}
                            disabled={importing}
                            className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-[#B91C1C] transition-all z-20 shadow-xl border border-slate-100 active:scale-95 disabled:opacity-50"
                        >
                            <X size={24} />
                        </button>

                        <div className="p-8 lg:p-12">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#B91C1C] to-red-800 rounded-2xl flex items-center justify-center shadow-xl">
                                    <Upload className="text-white" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl lg:text-3xl font-black text-[#0F172A] uppercase italic font-serif-legal">
                                        Import DOJ <span className="text-[#B91C1C]">Epstein</span>
                                    </h2>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-1">Department of Justice • Public Disclosures</p>
                                </div>
                            </div>

                            {/* Age Verification */}
                            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
                                <div className="flex items-start gap-4">
                                    <AlertCircle className="text-amber-600 mt-1 flex-shrink-0" size={24} />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-black text-amber-900 uppercase tracking-wide mb-2">Vérification d'âge requise</h3>
                                        <p className="text-xs text-amber-800 mb-4 leading-relaxed">
                                            Ce contenu provient des divulgations DOJ relatives à l'affaire Epstein.
                                            Vous devez avoir 18 ans ou plus pour accéder à ces documents.
                                        </p>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={ageVerified}
                                                onChange={(e) => setAgeVerified(e.target.checked)}
                                                disabled={importing}
                                                className="w-5 h-5 rounded border-2 border-amber-400 text-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C] disabled:opacity-50"
                                            />
                                            <span className="text-xs font-bold text-amber-900 group-hover:text-amber-700 transition-colors">
                                                Je confirme avoir 18 ans ou plus
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* URL Input */}
                            <div className="mb-6">
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-3">
                                    URL du Document PDF
                                </label>
                                <input
                                    type="url"
                                    value={dojUrl}
                                    onChange={(e) => setDojUrl(e.target.value)}
                                    disabled={importing}
                                    placeholder="https://www.justice.gov/d9/2025-01/EFTA00005386.pdf"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:border-[#B91C1C] focus:bg-white transition-all outline-none disabled:opacity-50"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                    Exemple: https://www.justice.gov/d9/2025-01/EFTA00005386.pdf
                                </p>
                            </div>

                            {/* Alternative: Manual File Upload */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-px flex-1 bg-slate-200"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ou</span>
                                    <div className="h-px flex-1 bg-slate-200"></div>
                                </div>
                                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                                    <p className="text-xs text-slate-600 font-bold mb-3">
                                        Si le téléchargement automatique échoue (CORS), vous pouvez:
                                    </p>
                                    <ol className="text-[10px] text-slate-500 text-left space-y-1 mb-4 max-w-md mx-auto">
                                        <li>1. Ouvrir l'URL dans un nouvel onglet</li>
                                        <li>2. Télécharger le PDF manuellement</li>
                                        <li>3. Utiliser l'onglet "Lab" pour importer le fichier téléchargé</li>
                                    </ol>
                                    <a
                                        href={dojUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors"
                                    >
                                        <ExternalLink size={14} />
                                        Ouvrir dans un nouvel onglet
                                    </a>
                                </div>
                            </div>

                            {/* AI Analysis Option */}
                            <div className="mb-6">
                                <label className="flex items-center gap-3 cursor-pointer group p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={analyzeWithAI}
                                        onChange={(e) => setAnalyzeWithAI(e.target.checked)}
                                        disabled={importing}
                                        className="w-5 h-5 rounded border-2 border-slate-300 text-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C] disabled:opacity-50"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-black text-slate-700 block">Analyser avec IA</span>
                                        <span className="text-[10px] text-slate-500 font-medium">Extraction automatique des entités, transactions et contexte juridique</span>
                                    </div>
                                </label>
                            </div>

                            {/* Progress */}
                            {importProgress && (
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        {importing ? (
                                            <Loader2 className="text-blue-600 animate-spin" size={20} />
                                        ) : importSuccess ? (
                                            <CheckCircle2 className="text-emerald-600" size={20} />
                                        ) : null}
                                        <span className="text-xs font-bold text-blue-900">{importProgress}</span>
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {importError && (
                                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                        <span className="text-xs font-bold text-red-900">{importError}</span>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDOJImport(false)}
                                    disabled={importing}
                                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDOJImport}
                                    disabled={importing || !ageVerified || !dojUrl.trim()}
                                    className="flex-1 py-4 bg-[#B91C1C] hover:bg-[#7F1D1D] text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {importing ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Importation...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={16} />
                                            Importer le Document
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAIL MODAL */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-20">
                    <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedItem(null)}></div>
                    <div className="bg-white w-full max-w-6xl h-full max-h-[900px] rounded-[2rem] lg:rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col lg:flex-row animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-6 right-6 lg:top-8 lg:right-8 w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-[#B91C1C] transition-all z-20 shadow-xl border border-slate-100 active:scale-95"
                        >
                            <X size={24} />
                        </button>

                        {/* Visual Section */}
                        <div className={`flex-1 flex items-center justify-center p-8 lg:p-20 ${selectedItem.type === 'DOCUMENT' ? 'bg-slate-50' : 'bg-[#0F172A]'}`}>
                            {selectedItem.type === 'DOCUMENT' ? (
                                <div className="flex flex-col items-center gap-8 lg:gap-12">
                                    <div className="relative w-40 lg:w-56 h-56 lg:h-72 bg-white rounded-xl lg:rounded-2xl shadow-2xl border border-slate-100 p-6 lg:p-10 flex flex-col gap-6">
                                        <div className="absolute top-0 left-0 right-0 h-8 bg-slate-50/50 border-b border-slate-100"></div>
                                        <div className="mt-8 space-y-4">
                                            <div className="h-2 w-3/4 bg-slate-100 rounded"></div>
                                            <div className="h-2 w-full bg-slate-50 rounded"></div>
                                            <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
                                        </div>
                                        <div className="mt-auto flex justify-center opacity-10">
                                            <FileText size={80} className="text-[#B91C1C]" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Forensic Document Entry</span>
                                        <div className="flex gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C] animate-pulse"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C] animate-pulse delay-75"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C] animate-pulse delay-150"></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-10 w-full h-full relative">
                                    <div className="flex-1 w-full bg-slate-800/30 rounded-[2rem] border border-white/5 shadow-inner flex items-center justify-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-[#B91C1C]/10 via-transparent to-transparent"></div>
                                        <div className="relative scale-75 lg:scale-100">
                                            <div className="w-72 h-72 rotate-3 bg-white p-4 shadow-2xl transform hover:rotate-0 transition-transform duration-700">
                                                <div className="w-full h-full bg-slate-100 flex items-center justify-center relative overflow-hidden group/img">
                                                    <ImageIcon size={80} className="text-slate-200 group-hover:scale-110 transition-transform duration-1000" />
                                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity"></div>
                                                </div>
                                                <div className="mt-4 flex flex-col gap-1">
                                                    <div className="h-1.5 w-1/2 bg-slate-100 rounded"></div>
                                                    <div className="h-1 w-1/4 bg-slate-50 rounded"></div>
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/10 blur-3xl rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Analysis Section */}
                        <div className="w-full lg:w-[480px] bg-white border-l border-slate-100 p-8 lg:p-14 overflow-y-auto custom-scrollbar flex flex-col shrink-0">
                            <div className="flex items-center gap-3 mb-8 lg:mb-12">
                                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${selectedItem.type === 'DOCUMENT' ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-amber-600 bg-amber-50 border-amber-100'} uppercase tracking-[0.2em]`}>
                                    {selectedItem.type}
                                </span>
                                <div className="h-px flex-1 bg-slate-100"></div>
                                <span className="text-[11px] font-mono-data font-black text-slate-300 uppercase tracking-widest">{selectedItem.id.split('-').pop()}</span>
                            </div>

                            <h3 className="text-3xl lg:text-4xl font-black text-[#0F172A] font-serif-legal italic leading-tight mb-8">
                                {selectedItem.title}
                            </h3>

                            <div className="bg-slate-50/50 p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 mb-10 relative group/desc">
                                <div className="absolute -left-1 top-10 bottom-10 w-1 bg-[#B91C1C] rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">Analyse de Contenu</div>
                                <p className="text-slate-600 text-[16px] font-bold italic leading-relaxed selection:bg-[#B91C1C]/10">
                                    "{selectedItem.description}"
                                </p>
                            </div>

                            <div className="space-y-4 mb-12">
                                <DetailRow icon={Calendar} label="Date d'Indexation" value={selectedItem.date || 'Non spécifiée'} color="text-[#B91C1C]" />
                                {selectedItem.location && (
                                    <DetailRow icon={MapPin} label="Localisation" value={selectedItem.location} color="text-blue-600" />
                                )}
                                <DetailRow icon={Folder} label="Dossier Source" value={selectedItem.parentTitle} color="text-slate-400" isItalic />
                            </div>

                            <div className="mt-auto flex flex-col gap-3">
                                <button
                                    onClick={() => handleDownload(selectedItem)}
                                    className="w-full py-4.5 bg-[#0F172A] hover:bg-[#B91C1C] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 group"
                                >
                                    <Download size={16} className="group-hover:-translate-y-1 transition-transform" /> Télécharger la Pièce
                                </button>
                                <div className="flex items-center justify-center gap-3 py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest border border-dashed border-slate-100 rounded-2xl">
                                    <ShieldCheck size={14} className="text-emerald-500" /> Forensic Verification Active
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <header className="px-6 lg:px-10 py-6 bg-white border-b border-slate-100 z-30 shadow-sm relative shrink-0">
                <div className="max-w-12xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0F172A] to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl rotate-3">
                            <Archive className="text-white" size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl lg:text-2xl font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight leading-none">
                                    Médiathèque de <span className="text-[#B91C1C]">Preuves</span>
                                </h2>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Evidence-Archive-01</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                    {allEvidence.length} Pièces Indexées
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center bg-slate-50 border border-slate-100 p-1 rounded-xl shadow-inner">
                            <button
                                onClick={() => setFilterType('ALL')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filterType === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Tous
                            </button>
                            <button
                                onClick={() => setFilterType('DOCUMENT')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filterType === 'DOCUMENT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <FileText size={12} className="inline mr-2" /> PDF
                            </button>
                            <button
                                onClick={() => setFilterType('PHOTO')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filterType === 'PHOTO' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <ImageIcon size={12} className="inline mr-2" /> Photos
                            </button>
                        </div>

                        <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>

                        <div className="relative group">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#B91C1C] transition-colors" />
                            <input
                                type="text"
                                placeholder="Rechercher une pièce..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium w-64 focus:w-80 transition-all duration-300 outline-none"
                            />
                        </div>

                        <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>

                        {/* DOJ Import Button */}
                        <button
                            onClick={() => setShowDOJImport(true)}
                            className="px-4 py-2.5 bg-gradient-to-r from-[#B91C1C] to-red-800 hover:from-[#7F1D1D] hover:to-red-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center gap-2"
                        >
                            <Upload size={14} />
                            <span className="hidden sm:inline">Importer DOJ</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar z-10 scroll-smooth">
                <div className="max-w-12xl mx-auto pb-20">
                    {allEvidence.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                            {allEvidence.map((item) => (
                                <EvidenceCard key={item.id} item={item} onOpen={() => setSelectedItem(item)} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-40 text-center bg-white rounded-[4rem] border border-slate-100 shadow-sm border-dashed flex flex-col items-center">
                            <Archive size={64} className="text-slate-100 mb-8" strokeWidth={1} />
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest font-serif-legal italic mb-4">Médiathèque Vide</h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] max-w-sm leading-relaxed">
                                Aucune pièce PDF ou photographique n'a été identifiée.<br />
                                Utilisez l'import de documents ou l'extraction dynamique pour alimenter la base.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <footer className="px-10 py-5 bg-white border-t border-slate-100 flex justify-between items-center z-30 shrink-0">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stockage Local Sécurisé</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] italic">Forensic-Asset-Scanner // Media.Unit</span>
                    <div className="h-4 w-px bg-slate-100"></div>
                    <button className="text-[10px] font-black text-[#B91C1C] hover:text-[#7F1D1D] transition-colors flex items-center gap-2">
                        <Download size={12} /> EXPORTER L'INDEX
                    </button>
                </div>
            </footer>
        </div>
    );
};

const EvidenceCard: React.FC<{ item: EvidenceItem, onOpen: () => void }> = ({ item, onOpen }) => {
    return (
        <div
            onClick={onOpen}
            className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden flex flex-col cursor-pointer"
        >
            {/* Visual Header */}
            <div className={`h-48 relative overflow-hidden flex items-center justify-center ${item.type === 'DOCUMENT' ? 'bg-slate-50' : 'bg-[#0F172A]'}`}>
                {item.type === 'DOCUMENT' ? (
                    <div className="flex flex-col items-center gap-4 group-hover:scale-110 transition-transform duration-700">
                        <div className="w-16 h-20 bg-white border border-slate-200 rounded-lg shadow-lg relative flex items-center justify-center p-4">
                            <FileText size={32} className="text-slate-100" />
                            <div className="absolute top-0 left-0 right-0 h-4 bg-slate-50 border-b border-slate-100 animate-pulse"></div>
                            <div className="absolute bottom-4 left-4 right-4 h-1 bg-slate-100"></div>
                            <div className="absolute bottom-6 left-4 right-8 h-1 bg-slate-100"></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">PDF DOCUMENT</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 group-hover:scale-110 transition-transform duration-700">
                        <div className="w-32 h-32 bg-white p-2 shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-500">
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center relative overflow-hidden">
                                <ImageIcon size={40} className="text-slate-200" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#B91C1C]/10 to-transparent"></div>
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">PHOTO EVIDENCE</span>
                    </div>
                )}

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <div className="p-3 bg-white rounded-xl text-[#0F172A] group-hover:bg-[#B91C1C] group-hover:text-white transition-all scale-75 group-hover:scale-100 duration-500">
                        <Maximize2 size={18} />
                    </div>
                </div>
            </div>

            {/* Info Body */}
            <div className="p-6 lg:p-8 flex flex-col gap-4 flex-1">
                <div className="flex items-center gap-3">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${item.type === 'DOCUMENT' ? 'text-blue-500 bg-blue-50 border-blue-100' : 'text-amber-500 bg-amber-50 border-amber-100'} uppercase tracking-widest`}>
                        {item.type}
                    </span>
                    {item.isDOJ && (
                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-[#B91C1C] text-white uppercase tracking-widest">
                            DOJ
                        </span>
                    )}
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest truncate flex-1">
                        Ref: {item.id.split('-').pop()}
                    </span>
                </div>

                <h4 className="text-[15px] font-black text-[#0F172A] font-serif-legal italic leading-tight group-hover:text-[#B91C1C] transition-colors line-clamp-2">
                    {item.title}
                </h4>

                <p className="text-[11px] text-slate-500 leading-relaxed italic line-clamp-3">
                    "{item.description}"
                </p>

                <div className="mt-auto pt-6 border-t border-slate-50 space-y-3">
                    <div className="flex items-center gap-3">
                        <Calendar size={12} className="text-slate-300" />
                        <span className="text-[10px] font-bold text-slate-400 capitalize">{item.date || 'Date Inconnue'}</span>
                    </div>
                    {item.location && (
                        <div className="flex items-center gap-3">
                            <MapPin size={12} className="text-slate-300" />
                            <span className="text-[10px] font-bold text-slate-400 capitalize">{item.location}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <Folder size={12} className="text-slate-300" />
                        <span className="text-[9px] font-black text-[#B91C1C] uppercase tracking-tighter truncate max-w-[150px]">
                            {item.parentTitle}
                        </span>
                    </div>
                </div>
            </div>

            {/* Decoration */}
            <div className="absolute top-4 right-4 z-10">
                <ShieldCheck size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    );
};

const DetailRow: React.FC<{ icon: any, label: string, value: string, color: string, isItalic?: boolean }> = ({ icon: Icon, label, value, color, isItalic }) => (
    <div className="flex items-center gap-5 p-4 hover:bg-slate-50 rounded-2xl transition-colors group/row">
        <div className={`w-11 h-11 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center ${color} group-hover/row:scale-110 transition-transform`}>
            <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{label}</div>
            <div className={`text-[14px] font-black text-slate-700 truncate ${isItalic ? 'italic font-serif-legal' : ''}`}>{value}</div>
        </div>
    </div>
);
