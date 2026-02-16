/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageHeader } from './PageHeader';
import { storageService } from '../services/storageService';
import { generateGlobalSummary } from '../services/openRouterService';
import { FileSignature, Loader2, RefreshCw, Download, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { jsPDF } from 'jspdf';

export const GlobalSummaryView: React.FC = () => {
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const allResults = await storageService.getAllResults();
            const validAnalyses = allResults
                .filter(r => r.output && r.status === 'completed')
                .map(r => r.output!);

            if (validAnalyses.length === 0) {
                setError("Aucune analyse complétée n'a été trouvée pour générer une synthèse.");
                setIsLoading(false);
                return;
            }

            const result = await generateGlobalSummary(validAnalyses);
            setSummary(result);
            localStorage.setItem('GLOBAL_SUMMARY_CACHE', result);
        } catch (e: any) {
            setError("Échec du moteur de synthèse neural.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const cached = localStorage.getItem('GLOBAL_SUMMARY_CACHE');
        if (cached) setSummary(cached);
    }, []);

    const handleExportPDF = () => {
        if (!summary) return;
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("DOJ Forensic - Synthèse Globale", 20, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Généré le: ${new Date().toLocaleString()}`, 20, 30);

        doc.setFontSize(12);
        doc.setTextColor(0);
        const splitText = doc.splitTextToSize(summary, 170);
        doc.text(splitText, 20, 45);
        doc.save(`DOJ_Global_Summary_${Date.now()}.pdf`);
    };

    return (
        <div className="h-full flex flex-col bg-[var(--background)] overflow-hidden relative font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <PageHeader
                title="Synthèse"
                titleHighlight="Globale"
                icon={FileSignature}
                badgeText="Rapport Exécutif Neural"
            />

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar z-10 scroll-smooth">
                <div className="max-w-5xl mx-auto space-y-10 pb-20">
                    {!summary && !isLoading && (
                        <div className="text-center py-40 bg-[var(--surface)] p-12 rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-[var(--shadow-premium)] animate-reveal">
                            <div className="w-24 h-24 bg-[var(--accent)]/5 rounded-[var(--radius-xl)] flex items-center justify-center mx-auto mb-10 border border-[var(--accent)]/10">
                                <Sparkles size={48} className="text-[var(--accent)] opacity-40 animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black text-[var(--text)] uppercase tracking-[0.3em] font-legal italic mb-6">Moteur de Synthèse Prêt</h3>
                            <p className="text-[var(--text-dim)] font-bold text-[11px] uppercase tracking-widest max-w-sm mx-auto mb-10 leading-relaxed">
                                Compilez l'ensemble des données extraites pour générer un rapport narratif et analytique complet de l'affaire.
                            </p>
                            <button
                                onClick={handleGenerateSummary}
                                className="flex items-center gap-4 bg-[var(--primary)] hover:bg-[var(--accent)] text-white px-10 py-5 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl hover:shadow-2xl active:scale-95 mx-auto group"
                            >
                                <Zap size={18} className="group-hover:rotate-12 transition-transform" />
                                Lancer la Compilation Neurale
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="text-center py-40 space-y-8 animate-reveal">
                            <div className="relative w-32 h-32 mx-auto">
                                <div className="absolute inset-0 border-4 border-[var(--border)] rounded-full border-t-[var(--accent)] animate-spin"></div>
                                <div className="absolute inset-4 border-4 border-[var(--border)] rounded-full border-b-[var(--accent)] animate-spin-slow"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-[var(--accent)]">
                                    <Loader2 size={32} className="animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-[14px] font-black text-[var(--primary)] uppercase tracking-[0.4em]">Séquençage Global...</h3>
                                <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest">Analyse transversale des archives en cours</p>
                            </div>
                        </div>
                    )}

                    {summary && !isLoading && (
                        <div className="space-y-8 animate-reveal">
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={handleGenerateSummary}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[var(--surface)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 rounded-xl transition-all shadow-sm group"
                                >
                                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
                                    Mettre à jour
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent)] rounded-xl transition-all shadow-lg active:scale-95"
                                >
                                    <Download size={14} />
                                    Exporter PDF
                                </button>
                            </div>

                            <div className="bg-[var(--surface)] p-12 lg:p-16 rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-[var(--shadow-premium)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-[3s]">
                                    <FileSignature size={200} className="text-black" />
                                </div>

                                <div className="flex items-center gap-4 mb-16 border-b border-[var(--border)] pb-8 relative z-10">
                                    <div className="w-2.5 h-10 bg-[var(--accent)] rounded-full shadow-[0_0_15px_var(--accent)]/30"></div>
                                    <h2 className="text-3xl font-black text-[var(--primary)] italic font-legal tracking-tighter">Rapport de Synthèse Forensique</h2>
                                </div>

                                <div className="relative z-10 prose prose-slate max-w-none">
                                    <div className="text-[15px] leading-[1.8] text-[var(--text-muted)] italic font-legal whitespace-pre-wrap selection:bg-[var(--accent)]/10 font-medium">
                                        {summary}
                                    </div>
                                </div>

                                <div className="mt-20 pt-10 border-t border-dashed border-[var(--border)] flex justify-between items-center relative z-10">
                                    <div className="flex items-center gap-4 text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">
                                        <ShieldCheck size={16} className="text-emerald-500" />
                                        Protocol Scanned & Verified
                                    </div>
                                    <span className="text-[9px] font-mono-data text-[var(--text-dim)] uppercase tracking-[0.4em] italic font-legal opacity-40">Global Synthesis Unit // Ref. 0X-8854</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-bold animate-reveal flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                                <RefreshCw className="text-red-600" size={20} />
                            </div>
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
