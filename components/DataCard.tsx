/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { DisclosureAnalysis, ProcessedResult } from '../types';
import { Search, Calendar, Users, FileText, Link as LinkIcon, ShieldAlert, File, List, Zap, Scale, Download, BookOpen, GraduationCap, ArrowUpRight, Filter, Gavel, Award, Box, ShieldCheck, DollarSign, ArrowRightLeft, ArrowRight, Plus, Plane } from 'lucide-react';
import { ExportMenu } from './ExportMenu';

interface DataCardProps {
    result: ProcessedResult;
    loading: boolean;
    onDeepDive: (docTitle: string, style: 'standard' | 'simple' | 'technical') => void;
    onDownload: () => void;
    onEntityClick: (entityName: string) => void;
    onRetry?: () => void;
    isGuestMode?: boolean;
}

export const DataCard: React.FC<DataCardProps> = ({ result, loading, onDeepDive, onDownload, onEntityClick, onRetry, isGuestMode }) => {
    const data = result.output;
    const sources = result.sources;
    const [activeFilter, setActiveFilter] = useState<string>('ALL');
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

    const availableTypes = useMemo(() => {
        if (!data?.documents) return [];
        const types = data.documents.map(doc => doc.type).filter(Boolean);
        return Array.from(new Set(types));
    }, [data]);

    const filteredDocuments = useMemo(() => {
        if (!data?.documents) return [];
        if (activeFilter === 'ALL') return data.documents;
        return data.documents.filter(doc => doc.type === activeFilter);
    }, [data, activeFilter]);

    if (loading) {
        return (
            <div className="w-full bg-white rounded-[3rem] p-12 lg:p-16 border border-slate-100 flex flex-col items-center justify-center min-h-[500px] gap-8 shadow-2xl animate-pro-reveal relative overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.2] report-paper"></div>
                <div className="relative w-24 h-24 z-10">
                    <div className="absolute inset-0 rounded-full border-[2px] border-slate-50"></div>
                    <div className="absolute inset-0 rounded-full border-[2px] border-[#B91C1C] border-t-transparent animate-spin"></div>
                    <ShieldCheck size={32} className="absolute inset-0 m-auto text-[#B91C1C] animate-pulse" />
                </div>
                <div className="text-center space-y-3 z-10">
                    <p className="text-[#B91C1C] font-black tracking-[0.5em] uppercase text-[10px]">Neural Forensic Extraction</p>
                    <div className="flex items-center gap-3 justify-center">
                        <div className="h-[1px] w-8 bg-slate-100"></div>
                        <p className="text-slate-400 text-[12px] font-bold italic font-serif-legal">Compiling Judicial Feed...</p>
                        <div className="h-[1px] w-8 bg-slate-100"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data && !loading) {
        return (
            <div className="w-full bg-[#FEF2F2]/50 rounded-[3rem] p-12 lg:p-16 border border-red-50 flex flex-col items-center justify-center min-h-[500px] gap-6 text-center shadow-2xl animate-pro-reveal relative overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.2] report-paper"></div>
                <div className="p-6 bg-white rounded-2xl shadow-xl text-[#B91C1C] border border-red-50 z-10">
                    <ShieldAlert size={48} />
                </div>
                <div className="space-y-3 z-10">
                    <h3 className="text-[#0F172A] font-black uppercase tracking-[0.3em] text-xl font-serif-legal italic">Flux Interrompu</h3>
                    <p className="text-slate-400 text-[13px] max-w-md font-medium leading-relaxed italic">
                        L'intégrité de la session analytique a été compromise. Le moteur de décryptage demande une réinitialisation.
                    </p>
                    <button onClick={onRetry} className="mt-4 px-8 py-3 bg-[#0F172A] text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#B91C1C] transition-all shadow-lg active:scale-95">
                        Relancer la Liaison
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-premium transition-all duration-700 flex flex-col animate-pro-reveal relative group/card">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            {/* Header / Meta Info */}
            <div className="bg-white/90 backdrop-blur-2xl px-8 lg:px-16 py-10 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100/80 gap-8 relative z-10">
                <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-slate-50/50 to-transparent pointer-events-none"></div>

                <div className="flex items-center gap-8 relative z-10 flex-1 min-w-0">
                    <div className="relative group shrink-0">
                        <div className="absolute -inset-2 bg-[#B91C1C]/5 rounded-[1.5rem] scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                        <div className="w-16 h-16 bg-[#0F172A] rounded-[1.2rem] flex items-center justify-center shadow-2xl shadow-slate-900/20 transform -rotate-2 group-hover:rotate-0 transition-all duration-500 border border-slate-800">
                            <Gavel size={28} className="text-white" />
                        </div>
                    </div>
                    <div className="space-y-4 flex-1 min-w-0">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                                <span className="badge-forensic bg-red-50 text-[#DC2626] border-[#DC2626]/10">Protocol v5.0</span>
                                <div className="h-[1px] w-8 bg-slate-200"></div>
                                <span className="badge-forensic bg-slate-50 text-slate-400 border-slate-200">Neural Forensic Intelligence</span>
                            </div>

                            <h2 className="text-1xl lg:text-2xl font-black text-[#020617] font-display tracking-tight leading-tight">
                                {result.id || 'Dossier Analytique'}
                            </h2>

                        </div>

                        {/* Summary directly under Title */}
                        <div className="max-w-4xl relative">
                            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#B91C1C] via-slate-100 to-transparent rounded-full opacity-10"></div>
                            <div className="flex flex-col gap-2">
                                <p className={`text-slate-600 text-[15px] font-medium leading-[1.8] font-serif-legal italic transition-all duration-700 ${isSummaryExpanded ? '' : 'line-clamp-2'}`}>
                                    {data.context_general}
                                </p>
                                <button
                                    onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                                    className="flex items-center gap-2 text-[9px] font-black text-[#B91C1C] uppercase tracking-widest hover:opacity-70 transition-opacity w-fit mt-1"
                                >
                                    <div className="w-4 h-4 rounded-full bg-[#B91C1C]/10 flex items-center justify-center">
                                        <Plus size={8} className={`transition-transform duration-300 ${isSummaryExpanded ? 'rotate-45' : ''}`} />
                                    </div>
                                    {isSummaryExpanded ? 'Réduire la synthèse' : 'Ouvrir la synthèse complète'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 relative z-10 shrink-0">
                    <div className="hidden xl:flex flex-col items-end border-r border-slate-100 pr-6">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Integrity Status</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Verified Stream</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ExportMenu result={result} />
                    </div>
                </div>
            </div>

            <div className="p-6 lg:p-8 lg:px-12 flex flex-col gap-10 flex-1 relative z-10">
                {/* Evidence Documents Section */}
                <div className="space-y-12">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-slate-100 pb-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-[2px] bg-[#DC2626]"></div>
                                <span className="badge-forensic text-slate-400 border-transparent p-0 text-[8px]">Index des Pièces</span>
                            </div>
                            <h3 className="text-xl lg:text-2xl font-black text-[#020617] font-display">Archives <span className="text-slate-300">Centralisées</span></h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Registre des preuves indexées</p>
                        </div>

                        {/* Filter System */}
                        <div className="flex items-center gap-2 p-2 bg-slate-50/80 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar max-w-full">
                            <button
                                onClick={() => setActiveFilter('ALL')}
                                className={`px-4 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-widest transition-all ${activeFilter === 'ALL'
                                    ? 'bg-[#020617] text-white shadow-md'
                                    : 'text-slate-400 hover:text-[#020617] hover:bg-white'
                                    }`}
                            >
                                Tous
                            </button>
                            {availableTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveFilter(type)}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-widest transition-all whitespace-nowrap ${activeFilter === type
                                        ? 'bg-[#020617] text-white shadow-md'
                                        : 'text-slate-400 hover:text-[#020617] hover:bg-white'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-12 relative pb-20">
                        {/* Vertical Timeline Thread */}
                        <div className="absolute left-[8px] top-6 bottom-6 w-[1.5px] bg-gradient-to-b from-slate-100 via-slate-50 to-transparent hidden md:block"></div>

                        {filteredDocuments.map((doc, idx) => (
                            <div key={idx} className="relative group/doc animate-pro-reveal" style={{ animationDelay: `${idx * 0.05}s` }}>
                                {/* Timeline Node Compact */}
                                <div className="absolute left-0 top-10 w-12 h-12 bg-white border border-slate-100 shadow-lg rounded-xl hidden md:flex items-center justify-center font-black text-sm text-[#DC2626] transition-all group-hover/doc:scale-105 group-hover/doc:bg-[#020617] group-hover/doc:text-white z-10 font-serif-legal italic border-b-2 border-b-[#DC2626]">
                                    {String(idx + 1).padStart(2, '0')}
                                </div>

                                <div className="md:ml-16 bg-white rounded-3xl border border-slate-100/80 overflow-hidden hover:shadow-lg hover:border-[#DC2626]/20 transition-all duration-700 flex flex-col xl:flex-row group/inner">
                                    {/* Sidebar Detail Compact */}
                                    <div className="xl:w-56 bg-slate-50/30 p-6 border-b xl:border-b-0 xl:border-r border-slate-100 flex flex-col gap-6">
                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Classification</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></div>
                                                    <span className="text-[10px] font-black uppercase text-slate-700">{doc.type || 'Standard'}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-inner">
                                                <div className="text-[8px] font-black text-slate-200 uppercase tracking-[0.2em] mb-2">Release Date</div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} className="text-[#DC2626]" />
                                                    <span className="text-[11px] font-mono-data font-black text-slate-500 tracking-tight">{doc.date}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {!isGuestMode && (
                                            <div className="mt-auto space-y-2">
                                                <button
                                                    onClick={() => onDeepDive(doc.title, 'simple')}
                                                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#F8FAFC] text-slate-600 py-2 rounded-xl border border-slate-200 transition-all text-[9px] font-black uppercase tracking-widest shadow-sm active:scale-95 group/btn"
                                                >
                                                    <BookOpen size={14} className="text-[#DC2626]" /> Synthèse
                                                </button>
                                                <button
                                                    onClick={() => onDeepDive(doc.title, 'technical')}
                                                    className="w-full flex items-center justify-center gap-2 bg-[#020617] hover:bg-[#DC2626] text-white py-2 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95 group/btn border border-slate-800"
                                                >
                                                    <Zap size={14} className="text-yellow-400" /> Deep Dive
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Doc Body */}
                                    <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6 relative">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover/inner:opacity-[0.05] transition-all duration-700 pointer-events-none transform group-hover/inner:scale-105 origin-top-right">
                                            <FileText size={120} />
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-xl lg:text-xl font-black text-[#020617] font-serif-legal italic tracking-tight group-hover/doc:text-[#DC2626] transition-colors duration-500 leading-tight pr-10">{doc.title}</h4>
                                            <div className="flex items-center gap-3">
                                                <div className="h-0.5 w-8 bg-[#DC2626]"></div>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Piece ID_{idx + 1}</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/50 p-8 lg:p-10 rounded-3xl border border-slate-100 relative group-hover/inner:bg-white group-hover/inner:shadow-inner transition-all duration-700 glow-blue/5">
                                            <div className="absolute top-0 right-0 p-6 flex gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                            </div>
                                            <p className="text-slate-700 text-lg lg:text-xl font-medium italic leading-[1.6] selection:bg-[#DC2626]/10 border-l-4 border-[#DC2626]/10 pl-8 font-serif-legal">
                                                "{doc.description}"
                                            </p>
                                        </div>

                                        {doc.key_facts && doc.key_facts.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Points Factuels</span>
                                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {Array.isArray(doc.key_facts) && doc.key_facts.map((fact, k) => (
                                                        <div key={k} className="bg-white group-hover/inner:bg-slate-50/20 p-4 rounded-2xl border border-slate-100 hover:border-[#DC2626]/20 transition-all flex items-start gap-4 group/fact shadow-sm">
                                                            <div className="w-6 h-6 rounded-lg bg-[#020617] flex items-center justify-center text-[10px] font-black text-white shrink-0 group-hover/fact:bg-[#DC2626] transition-all">
                                                                {String(k + 1).padStart(2, '0')}
                                                            </div>
                                                            <span className="text-slate-600 text-[13px] font-bold leading-relaxed">{fact}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {doc.legal_implications && (
                                            <div className="flex items-start gap-4 text-[#0F4C81] bg-[#0F4C81]/5 p-5 rounded-2xl border border-[#0F4C81]/20 relative overflow-hidden group/legal">
                                                <Scale size={20} className="shrink-0 mt-0.5 relative z-10" />
                                                <div className="space-y-1 relative z-10">
                                                    <div className="text-[8px] font-black uppercase tracking-[0.3em] text-[#0F4C81]/60">Analyse Juridique</div>
                                                    <p className="font-bold text-base leading-relaxed italic font-serif-legal text-[#020617]">{doc.legal_implications}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financial Flows Section */}
                {data.transactions_financieres && data.transactions_financieres.length > 0 && (
                    <div className="space-y-8 animate-pro-reveal mt-6 bg-[#F8FAFC]/50 p-8 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-6 mb-2">
                            <div className="w-12 h-12 rounded-xl bg-[#020617] flex items-center justify-center shadow-lg rotate-2">
                                <DollarSign size={20} className="text-white" />
                            </div>
                            <div className="space-y-1">
                                <h5 className="text-xl font-black text-[#020617] font-display italic">Resonance <span className="text-[#DC2626]">Monétaire</span></h5>
                                <div className="badge-forensic text-slate-400 border-none p-0 text-[8px]">Flux financiers croisés</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {data.transactions_financieres.map((t, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-xl hover:border-[#DC2626]/10 transition-all duration-500 group/finance relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="bg-[#020617] px-3 py-1 rounded-lg border border-slate-800 shadow-md text-[12px] font-mono-data font-black text-white group-hover:bg-[#DC2626] transition-colors">
                                            {t.montant.toLocaleString()} {t.devise}
                                        </div>
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{t.date}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-4 relative z-10">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] font-black text-[#020617] truncate italic font-serif-legal group-hover:text-[#DC2626] transition-colors">{t.source}</div>
                                        </div>
                                        <ArrowRight size={12} className="text-[#DC2626] opacity-30" />
                                        <div className="flex-1 min-w-0 text-right">
                                            <div className="text-[11px] font-black text-[#020617] truncate italic font-serif-legal group-hover:text-[#DC2626] transition-colors">{t.destination}</div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 relative z-10">
                                        <p className="text-[10px] text-slate-500 font-bold italic leading-relaxed line-clamp-2">"{t.description}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Flight Logs Section */}
                {data.journaux_de_vol && data.journaux_de_vol.length > 0 && (
                    <div className="space-y-8 animate-pro-reveal mt-6 bg-[#020617] p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#DC2626]/5 rounded-full blur-[80px] -mr-16 -mt-16"></div>
                        <div className="flex items-center gap-6 mb-2 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg -rotate-1">
                                <Plane size={24} className="text-[#DC2626]" />
                            </div>
                            <div className="space-y-1">
                                <h5 className="text-xl font-black text-white font-display italic">Manifestes <span className="text-slate-500 font-normal">de Bord</span></h5>
                                <div className="badge-forensic text-slate-500 border-none p-0 text-[8px]">Journaux aériens tracés</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
                            {data.journaux_de_vol.map((f, idx) => (
                                <div key={idx} className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 group/flight overflow-hidden relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-[12px] font-mono-data font-black text-white italic">{f.date}</div>
                                        <span className="text-[7px] font-black text-[#DC2626] uppercase tracking-widest bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">{f.source}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] font-black text-white italic font-serif-legal truncate">{f.depart}</div>
                                        </div>
                                        <ArrowRight size={10} className="text-slate-600" />
                                        <div className="flex-1 min-w-0 text-right">
                                            <div className="text-[11px] font-black text-white italic font-serif-legal truncate">{f.destination}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-auto">
                                        {f.passagers.slice(0, 3).map((p: any, pi) => (
                                            <span
                                                key={pi}
                                                onClick={() => onEntityClick(typeof p === 'string' ? p : p.nom || 'Inconnu')}
                                                className="px-1.5 py-0.5 bg-white/5 rounded-md text-[8px] font-black text-slate-400 hover:text-white hover:bg-[#DC2626] transition-all cursor-pointer font-serif-legal"
                                            >
                                                {typeof p === 'string' ? p : p.nom || 'Inconnu'}
                                            </span>
                                        ))}
                                        {f.passagers.length > 3 && <span className="text-[8px] text-slate-600 font-black">+{f.passagers.length - 3}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Intelligence Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-10 border-t border-slate-100">
                    {/* Entity Extraction Compact */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-[#020617] flex items-center justify-center shadow-md">
                                <Users size={16} className="text-[#DC2626]" />
                            </div>
                            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F172A]">Réseau d'Influence</h5>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {data.entites_cles?.map((entity: any, i) => (
                                <button
                                    key={i}
                                    onClick={() => onEntityClick(typeof entity === 'string' ? entity : entity.nom || 'Inconnu')}
                                    className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-white text-slate-500 text-[11px] font-black border border-slate-100 hover:border-[#DC2626] hover:text-[#DC2626] hover:shadow-lg transition-all active:scale-95 shadow-sm"
                                >
                                    <span className="italic font-serif-legal">{typeof entity === 'string' ? entity : entity.nom || 'Inconnu'}</span>
                                    <ArrowUpRight size={12} className="text-[#DC2626] opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Source Verification Compact */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-[#0F4C81] flex items-center justify-center shadow-md">
                                <LinkIcon size={16} className="text-white" />
                            </div>
                            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F4C81]">Liaison Sources</h5>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {sources.map((source, i) => (
                                <a
                                    key={i}
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between group p-4 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 hover:border-[#0F4C81] transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-[#0F4C81] group-hover:text-white transition-all">
                                            <File size={14} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[12px] font-black text-slate-700 truncate font-serif-legal italic">{source.title}</span>
                                            <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                                <ShieldCheck size={8} className="text-emerald-500" /> SECURE_SYNC
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={12} className="text-[#0F4C81] opacity-0 group-hover:opacity-100 transition-all" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Side Label */}
            <div className="absolute bottom-10 -left-10 rotate-90 origin-left pointer-events-none opacity-[0.05] z-0">
                <span className="text-[12px] font-black text-black uppercase tracking-[1.5em] whitespace-nowrap italic">NEURAL FORENSIC ENGINE // CLASSIFIED INTEL // UNIT 04</span>
            </div>
        </div>
    );
};
