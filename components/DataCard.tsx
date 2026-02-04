/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { DisclosureAnalysis, ProcessedResult } from '../types';
import { Search, Calendar, Users, FileText, Link as LinkIcon, ShieldAlert, File, List, Zap, Scale, Download, BookOpen, GraduationCap, ArrowUpRight, Filter, Gavel, Award, Box, ShieldCheck, DollarSign, ArrowRightLeft } from 'lucide-react';
import { ExportMenu } from './ExportMenu';

interface DataCardProps {
    result: ProcessedResult;
    loading: boolean;
    onDeepDive: (docTitle: string, style: 'standard' | 'simple' | 'technical') => void;
    onDownload: () => void;
    onEntityClick: (entityName: string) => void;
}

export const DataCard: React.FC<DataCardProps> = ({ result, loading, onDeepDive, onDownload, onEntityClick }) => {
    const data = result.output;
    const sources = result.sources;
    const [activeFilter, setActiveFilter] = useState<string>('ALL');

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
                    <button onClick={() => window.location.reload()} className="mt-4 px-8 py-3 bg-[#0F172A] text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#B91C1C] transition-all shadow-lg active:scale-95">
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
            <div className="bg-white/80 backdrop-blur-3xl px-8 lg:px-12 py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 gap-6 relative z-10">
                <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none opacity-50"></div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 bg-[#B91C1C] rounded-[1.2rem] flex items-center justify-center shadow-2xl shadow-red-900/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Gavel size={24} className="text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black text-[#B91C1C] uppercase tracking-[0.3em]">Module Analytique v4.2</span>
                            <div className="h-0.5 w-4 bg-slate-100"></div>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">SECURED DATA</span>
                        </div>
                        <h2 className="text-2xl font-black text-[#0F172A] font-serif-legal italic tracking-tight">{data.investigationId || 'Dossier Analytique'}</h2>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10 scale-90 sm:scale-100 origin-right">
                    <div className="flex flex-col items-end mr-2 hidden md:flex">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Clearance Level</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase">Verified</span>
                        </div>
                    </div>
                    <ExportMenu result={result} />
                    <div className="h-8 w-[1px] bg-slate-100"></div>
                    <div className="bg-[#F8FAFC] border border-slate-50 px-4 py-2 rounded-xl">
                        <span className="text-slate-400 font-mono-data text-sm font-black uppercase tracking-tighter">{data.contexte_juridique || 'LITIGATION'}</span>
                    </div>
                </div>
            </div>

            <div className="p-8 lg:p-14 lg:px-20 flex flex-col gap-16 flex-1 relative z-10">

                {/* Executive Summary Section */}
                <div className="relative">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="h-[1px] flex-1 bg-slate-50"></div>
                        <div className="px-5 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                            <label className="text-[9px] uppercase font-black tracking-[0.4em] text-[#B91C1C] flex items-center gap-3">
                                <Award size={12} /> Synthèse Forensique
                            </label>
                        </div>
                        <div className="h-[1px] flex-1 bg-slate-50"></div>
                    </div>

                    <div className="max-w-4xl mx-auto relative group/summary">
                        <div className="absolute -left-10 top-0 bottom-0 w-[1px] bg-slate-50 group-hover/summary:bg-[#B91C1C]/10 transition-colors"></div>
                        <div className="absolute -left-[49px] top-6 w-5 h-5 rounded-full bg-white border border-[#B91C1C] shadow-lg flex items-center justify-center font-black text-[9px] text-[#B91C1C] group-hover/summary:scale-125 transition-transform">S</div>
                        <p className="font-serif-legal italic leading-relaxed text-xl lg:text-2xl text-[#1E293B] first-letter:text-6xl first-letter:font-black first-letter:mr-4 first-letter:float-left first-letter:text-[#B91C1C] first-letter:leading-none">
                            {data.context_general}
                        </p>
                    </div>
                </div>

                {/* Evidence Documents Section */}
                <div className="space-y-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-50 pb-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Box size={14} className="text-[#B91C1C]" />
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Index des Pièces</span>
                            </div>
                            <h3 className="text-2xl font-black text-[#0F172A] font-serif-legal italic">Archives Qualifiées</h3>
                        </div>

                        {/* Filter System */}
                        <div className="flex items-center gap-2 p-1.5 bg-[#F8FAFC] rounded-xl border border-slate-50 overflow-x-auto no-scrollbar max-w-full">
                            <button
                                onClick={() => setActiveFilter('ALL')}
                                className={`px-5 py-2 rounded-lg text-[9px] uppercase font-black tracking-widest transition-all ${activeFilter === 'ALL'
                                    ? 'bg-white text-[#B91C1C] shadow-sm border border-slate-100'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                All
                            </button>
                            {availableTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveFilter(type)}
                                    className={`px-5 py-2 rounded-lg text-[9px] uppercase font-black tracking-widest transition-all whitespace-nowrap ${activeFilter === type
                                        ? 'bg-white text-[#B91C1C] shadow-sm border border-slate-100'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-12 relative pb-20">
                        {/* Vertical Timeline Thread */}
                        <div className="absolute left-[31px] top-6 bottom-6 w-[1px] bg-slate-50 hidden md:block"></div>

                        {filteredDocuments.map((doc, idx) => (
                            <div key={idx} className="relative group/doc animate-pro-reveal" style={{ animationDelay: `${idx * 0.05}s` }}>
                                {/* Timeline Node */}
                                <div className="absolute left-0 top-10 w-16 h-16 bg-white border border-slate-50 shadow-lg rounded-[1.5rem] hidden md:flex items-center justify-center font-black text-lg text-[#B91C1C] transition-all group-hover/doc:scale-110 group-hover/doc:rotate-3 z-10 font-serif-legal italic">
                                    {String(idx + 1).padStart(2, '0')}
                                </div>

                                <div className="md:ml-24 bg-white rounded-[2.5rem] border border-slate-50 overflow-hidden hover:shadow-2xl hover:border-[#B91C1C]/10 transition-all duration-700 flex flex-col xl:flex-row shadow-sm">
                                    {/* Sidebar Detail */}
                                    <div className="xl:w-72 bg-[#F8FAFC]/50 p-8 border-b xl:border-b-0 xl:border-r border-slate-50 flex flex-col gap-8">
                                        <div className="space-y-5">
                                            <div>
                                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-3">Classification</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]"></div>
                                                    <span className="text-[11px] font-black uppercase text-slate-600">{doc.type || 'Standard'} Pieces</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-slate-50 shadow-sm">
                                                <div className="text-[9px] font-black text-slate-200 uppercase tracking-[0.3em] mb-2">Authenticity Date</div>
                                                <div className="flex items-center gap-2.5">
                                                    <Calendar size={12} className="text-[#B91C1C]" />
                                                    <span className="text-[12px] font-mono-data font-black text-slate-500">{doc.date}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto space-y-2">
                                            <button
                                                onClick={() => onDeepDive(doc.title, 'simple')}
                                                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-[#0F172A] hover:text-white text-slate-500 py-3 rounded-xl border border-slate-100 transition-all text-[9px] font-black uppercase tracking-widest shadow-sm active:scale-95 group/btn"
                                            >
                                                <BookOpen size={14} className="group-hover/btn:scale-110 transition-transform" /> Summarize
                                            </button>
                                            <button
                                                onClick={() => onDeepDive(doc.title, 'technical')}
                                                className="w-full flex items-center justify-center gap-3 bg-[#0F172A] hover:bg-[#B91C1C] text-white py-3 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 group/btn"
                                            >
                                                <Zap size={14} className="group-hover/btn:rotate-12 transition-transform" /> Neural Dive
                                            </button>
                                        </div>
                                    </div>

                                    {/* Main Doc Body */}
                                    <div className="flex-1 p-8 lg:p-10 flex flex-col gap-8 relative">
                                        <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover/doc:opacity-[0.05] transition-opacity pointer-events-none">
                                            <FileText size={120} />
                                        </div>

                                        <h4 className="text-xl lg:text-2xl font-black text-[#0F172A] font-serif-legal italic tracking-tight group-hover/doc:text-[#B91C1C] transition-colors duration-500">{doc.title}</h4>

                                        <div className="bg-[#FFFFF0]/40 p-8 rounded-[2rem] border border-yellow-100 relative shadow-inner">
                                            <p className="text-slate-600 text-[15px] lg:text-[16px] font-medium italic leading-relaxed selection:bg-yellow-50">
                                                "{doc.description}"
                                            </p>
                                        </div>

                                        {doc.key_facts && doc.key_facts.length > 0 && (
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-200">Verified Insights</span>
                                                    <div className="h-[1px] flex-1 bg-slate-50"></div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {doc.key_facts.map((fact, k) => (
                                                        <div key={k} className="bg-slate-50 group-hover:bg-white p-5 rounded-2xl border border-slate-50 hover:border-[#B91C1C]/10 transition-all flex items-start gap-4 group/fact">
                                                            <div className="w-6 h-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-[#B91C1C] shrink-0 group-hover/fact:bg-[#B91C1C] group-hover/fact:text-white transition-all">
                                                                {k + 1}
                                                            </div>
                                                            <span className="text-slate-500 text-[13px] font-bold leading-relaxed group-hover:text-black transition-colors">{fact}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {doc.legal_implications && (
                                            <div className="flex items-start gap-5 text-[#0F4C81] bg-[#0F4C81]/5 p-6 rounded-[1.5rem] border border-[#0F4C81]/10">
                                                <Scale size={20} className="shrink-0 mt-1" />
                                                <div className="space-y-1">
                                                    <div className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60">Professional Legal Opinion</div>
                                                    <p className="font-bold text-base leading-relaxed italic font-serif-legal">{doc.legal_implications}</p>
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
                    <div className="space-y-8 animate-pro-reveal mt-10">
                        <div className="flex items-center gap-4 mb-4">
                            <DollarSign size={16} className="text-[#B91C1C]" />
                            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Resonance Monétaire</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {data.transactions_financieres.map((t, idx) => (
                                <div key={idx} className="bg-[#F8FAFC] p-6 rounded-[2rem] border border-slate-50 hover:bg-white hover:shadow-xl transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm text-[12px] font-mono-data font-black text-[#B91C1C]">
                                            {t.montant} {t.devise}
                                        </div>
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{t.date}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">From</div>
                                            <div className="text-[11px] font-black text-[#0F172A] truncate italic font-serif-legal">{t.source}</div>
                                        </div>
                                        <ArrowRightLeft size={10} className="text-[#B91C1C] opacity-30" />
                                        <div className="flex-1 min-w-0 text-right">
                                            <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">To</div>
                                            <div className="text-[11px] font-black text-[#0F172A] truncate italic font-serif-legal">{t.destination}</div>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium italic border-t border-slate-100 pt-3">"{t.description}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Intelligence Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 border-t border-slate-50">
                    {/* Entity Extraction */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Users size={16} className="text-[#B91C1C]" />
                            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Réseau d'Influence</h5>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {data.entites_cles?.map((entity, i) => (
                                <button
                                    key={i}
                                    onClick={() => onEntityClick(entity)}
                                    className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-500 text-[12px] font-black border border-slate-50 hover:border-[#B91C1C] hover:bg-white hover:shadow-xl transition-all active:scale-90"
                                >
                                    <span className="group-hover:text-[#B91C1C] transition-colors italic font-serif-legal">{entity}</span>
                                    <ArrowUpRight size={14} className="text-[#B91C1C] opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Source Verification */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <LinkIcon size={16} className="text-[#0F4C81]" />
                            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Liaison Sources</h5>
                        </div>
                        <div className="flex flex-col gap-3">
                            {sources.map((source, i) => (
                                <a
                                    key={i}
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between group p-5 rounded-xl bg-white border border-slate-50 hover:bg-[#F8FAFC] hover:border-[#0F4C81]/20 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-[#0F4C81] group-hover:text-white transition-all">
                                            <File size={14} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[13px] font-black text-slate-500 group-hover:text-[#0F172A] transition-colors truncate font-serif-legal italic leading-none mb-1">{source.title}</span>
                                            <span className="text-[8px] font-black text-slate-200 uppercase tracking-widest">Gov_Verified_Sync</span>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={14} className="text-[#0F4C81] opacity-0 group-hover:opacity-100 transition-all" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Side Label */}
            <div className="absolute bottom-10 -left-6 rotate-90 origin-left pointer-events-none opacity-[0.05]">
                <span className="text-[10px] font-black text-black uppercase tracking-[1em] whitespace-nowrap">AUTHENTICITY VERIFIED BY NEURAL AGENT</span>
            </div>
        </div>
    );
};
