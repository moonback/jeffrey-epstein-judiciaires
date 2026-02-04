/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { DisclosureAnalysis, ProcessedResult } from '../types';
import { Search, Calendar, Users, FileText, Link as LinkIcon, ShieldAlert, File, List, Zap, Scale, Download, BookOpen, GraduationCap, ArrowUpRight, Filter, Gavel, Award, Box, ShieldCheck, DollarSign, ArrowRightLeft, ArrowRight, Plus } from 'lucide-react';
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
                                <span className="px-2 py-0.5 bg-[#B91C1C]/5 text-[9px] font-black text-[#B91C1C] uppercase tracking-[0.3em] rounded-md border border-[#B91C1C]/10">Protocol v4.2</span>
                                <div className="h-[1px] w-6 bg-slate-200"></div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Classified Intelligence</span>
                                <div className="h-[1px] w-6 bg-slate-200"></div>

                            </div>

                            <h2 className="text-3xl font-black text-[#0F172A] font-serif-legal italic tracking-tight leading-none">
                                {data.investigationId || 'Dossier Analytique'}
                            </h2>

                        </div>

                        {/* Summary directly under Title */}
                        <div className="max-w-4xl relative">
                            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#B91C1C] via-slate-100 to-transparent rounded-full opacity-10"></div>
                            <div className="flex flex-col gap-2">
                                <p className={`text-slate-600 text-[13px] font-medium leading-relaxed font-serif-legal italic transition-all duration-500 ${isSummaryExpanded ? '' : 'line-clamp-2'}`}>
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

            <div className="p-8 lg:p-12 lg:px-24 flex flex-col gap-16 flex-1 relative z-10">
                {/* Evidence Documents Section */}
                <div className="space-y-12">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-slate-100 pb-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-[2px] bg-[#B91C1C]"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Index des Pièces</span>
                            </div>
                            <h3 className="text-3xl font-black text-[#0F172A] font-serif-legal italic">Archives Centralisées</h3>
                        </div>

                        {/* Filter System */}
                        <div className="flex items-center gap-2 p-2 bg-slate-50/80 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar max-w-full">
                            <button
                                onClick={() => setActiveFilter('ALL')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${activeFilter === 'ALL'
                                    ? 'bg-[#0F172A] text-white shadow-lg'
                                    : 'text-slate-400 hover:text-[#0F172A] hover:bg-white'
                                    }`}
                            >
                                Tous
                            </button>
                            {availableTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveFilter(type)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all whitespace-nowrap ${activeFilter === type
                                        ? 'bg-[#0F172A] text-white shadow-lg'
                                        : 'text-slate-400 hover:text-[#0F172A] hover:bg-white'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-12 relative pb-20">
                        {/* Vertical Timeline Thread */}
                        <div className="absolute left-[31px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-slate-100 via-slate-50 to-transparent hidden md:block"></div>

                        {filteredDocuments.map((doc, idx) => (
                            <div key={idx} className="relative group/doc animate-pro-reveal" style={{ animationDelay: `${idx * 0.05}s` }}>
                                {/* Timeline Node */}
                                <div className="absolute left-0 top-12 w-16 h-16 bg-white border border-slate-100 shadow-xl rounded-[1.5rem] hidden md:flex items-center justify-center font-black text-xl text-[#B91C1C] transition-all group-hover/doc:scale-110 group-hover/doc:bg-[#0F172A] group-hover/doc:text-white z-10 font-serif-legal italic border-b-4 border-b-[#B91C1C]">
                                    {String(idx + 1).padStart(2, '0')}
                                </div>

                                <div className="md:ml-24 bg-white rounded-[3rem] border border-slate-100 overflow-hidden hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] hover:border-[#B91C1C]/20 transition-all duration-700 flex flex-col xl:flex-row shadow-sm group/inner">
                                    {/* Sidebar Detail */}
                                    <div className="xl:w-64 bg-slate-50/30 p-10 border-b xl:border-b-0 xl:border-r border-slate-100 flex flex-col gap-10">
                                        <div className="space-y-8">
                                            <div>
                                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Classification</div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-[#B91C1C] animate-pulse"></div>
                                                    <span className="text-[12px] font-black uppercase text-slate-700">{doc.type || 'Standard'} Pieces</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-inner">
                                                <div className="text-[9px] font-black text-slate-200 uppercase tracking-[0.3em] mb-3">Release Date</div>
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={14} className="text-[#B91C1C]" />
                                                    <span className="text-[13px] font-mono-data font-black text-slate-500 tracking-tight">{doc.date}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {!isGuestMode && (
                                            <div className="mt-auto space-y-3">
                                                <button
                                                    onClick={() => onDeepDive(doc.title, 'simple')}
                                                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-[#F8FAFC] text-slate-600 py-3.5 rounded-2xl border border-slate-200 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95 group/btn"
                                                >
                                                    <BookOpen size={16} className="text-[#B91C1C]" /> Synthèse
                                                </button>
                                                <button
                                                    onClick={() => onDeepDive(doc.title, 'technical')}
                                                    className="w-full flex items-center justify-center gap-3 bg-[#0F172A] hover:bg-[#B91C1C] text-white py-3.5 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 group/btn border border-slate-800"
                                                >
                                                    <Zap size={16} className="text-yellow-400" /> Deep Dive
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Doc Body */}
                                    <div className="flex-1 p-10 lg:p-12 flex flex-col gap-10 relative">
                                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover/inner:opacity-[0.08] transition-all duration-700 pointer-events-none transform group-hover/inner:scale-110 origin-top-right">
                                            <FileText size={160} />
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-2xl lg:text-3xl font-black text-[#0F172A] font-serif-legal italic tracking-tight group-hover/doc:text-[#B91C1C] transition-colors duration-500 leading-tight pr-12">{doc.title}</h4>
                                            <div className="flex items-center gap-4">
                                                <div className="h-0.5 w-12 bg-[#B91C1C]"></div>
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Evidence Log_{idx + 1}</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100 relative group-hover/inner:bg-white group-hover/inner:shadow-inner transition-all duration-500">
                                            <div className="absolute top-0 right-0 p-6 flex gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                            </div>
                                            <p className="text-slate-600 text-lg lg:text-xl font-medium italic leading-[1.8] selection:bg-[#B91C1C]/10 border-l-4 border-slate-100 pl-8">
                                                "{doc.description}"
                                            </p>
                                        </div>

                                        {doc.key_facts && doc.key_facts.length > 0 && (
                                            <div className="space-y-8">
                                                <div className="flex items-center gap-6">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Extraits Factuels</span>
                                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {doc.key_facts.map((fact, k) => (
                                                        <div key={k} className="bg-white group-hover/inner:bg-slate-50/30 p-6 rounded-[2rem] border border-slate-100 hover:border-[#B91C1C]/20 transition-all flex items-start gap-5 group/fact shadow-sm">
                                                            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[12px] font-black text-white shrink-0 group-hover/fact:bg-[#B91C1C] group-hover/fact:scale-110 transition-all shadow-lg">
                                                                {String(k + 1).padStart(2, '0')}
                                                            </div>
                                                            <span className="text-slate-600 text-[14px] font-bold leading-relaxed group-hover:text-[#0F172A] transition-colors">{fact}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {doc.legal_implications && (
                                            <div className="flex items-start gap-6 text-[#0F4C81] bg-[#0F4C81]/5 p-8 rounded-[2rem] border border-[#0F4C81]/20 relative overflow-hidden group/legal">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0F4C81]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover/legal:scale-150 transition-transform duration-1000"></div>
                                                <Scale size={28} className="shrink-0 mt-1 relative z-10 text-[#0F4C81]" />
                                                <div className="space-y-2 relative z-10">
                                                    <div className="text-[9px] font-black uppercase tracking-[0.4em] text-[#0F4C81]/60">Analyse Juridique Officielle</div>
                                                    <p className="font-bold text-lg lg:text-xl leading-relaxed italic font-serif-legal text-[#0F172A]">{doc.legal_implications}</p>
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
                    <div className="space-y-12 animate-pro-reveal mt-12 bg-[#F8FAFC]/50 p-12 rounded-[4rem] border border-slate-100">
                        <div className="flex items-center gap-6 mb-4">
                            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-md">
                                <DollarSign size={20} className="text-[#B91C1C]" />
                            </div>
                            <div className="space-y-1">
                                <h5 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#B91C1C]">Resonance Monétaire</h5>
                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Traçabilité des Actifs en Session</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {data.transactions_financieres.map((t, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group/finance relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#B91C1C]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover/finance:scale-150 transition-transform"></div>
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="bg-[#0F172A] px-5 py-2 rounded-xl border border-slate-800 shadow-xl text-[14px] font-mono-data font-black text-white group-hover:bg-[#B91C1C] transition-colors">
                                            {t.montant.toLocaleString()} {t.devise}
                                        </div>
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-md border border-slate-100">{t.date}</span>
                                    </div>
                                    <div className="flex items-center gap-5 mb-8 relative z-10">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-2 px-2 border-l-2 border-slate-100">Expéditeur</div>
                                            <div className="text-[13px] font-black text-[#0F172A] truncate italic font-serif-legal group-hover:text-[#B91C1C] transition-colors">{t.source}</div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <ArrowRight size={14} className="text-[#B91C1C] animate-pulse" />
                                        </div>
                                        <div className="flex-1 min-w-0 text-right">
                                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-2 px-2 border-r-2 border-slate-100">Cible</div>
                                            <div className="text-[13px] font-black text-[#0F172A] truncate italic font-serif-legal group-hover:text-[#B91C1C] transition-colors">{t.destination}</div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 relative z-10">
                                        <p className="text-[12px] text-slate-600 font-bold italic leading-relaxed">"{t.description}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Intelligence Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-20 border-t border-slate-100">
                    {/* Entity Extraction */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
                                <Users size={18} className="text-[#B91C1C]" />
                            </div>
                            <h5 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#0F172A]">Réseau d'Influence</h5>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {data.entites_cles?.map((entity, i) => (
                                <button
                                    key={i}
                                    onClick={() => onEntityClick(entity)}
                                    className="group flex items-center gap-4 px-6 py-3 rounded-2xl bg-white text-slate-500 text-[13px] font-black border border-slate-100 hover:border-[#B91C1C] hover:text-[#B91C1C] hover:shadow-2xl transition-all duration-300 active:scale-90 shadow-sm"
                                >
                                    <span className="italic font-serif-legal">{entity}</span>
                                    <ArrowUpRight size={16} className="text-[#B91C1C] opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Source Verification */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-xl bg-[#0F4C81] border border-slate-800 flex items-center justify-center shadow-lg">
                                <LinkIcon size={18} className="text-white" />
                            </div>
                            <h5 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#0F4C81]">Liaison Sources</h5>
                        </div>
                        <div className="flex flex-col gap-4">
                            {sources.map((source, i) => (
                                <a
                                    key={i}
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between group p-6 rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 hover:border-[#0F4C81] transition-all duration-300 shadow-sm"
                                >
                                    <div className="flex items-center gap-5 min-w-0">
                                        <div className="w-12 h-12 rounded-[1.2rem] bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-[#0F4C81] group-hover:text-white transition-all shadow-inner">
                                            <File size={18} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[15px] font-black text-slate-700 group-hover:text-[#0F172A] transition-colors truncate font-serif-legal italic mb-1">{source.title}</span>
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                                <ShieldCheck size={10} className="text-emerald-500" /> Gov_Verified_Sync
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-[#0F4C81] opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
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
