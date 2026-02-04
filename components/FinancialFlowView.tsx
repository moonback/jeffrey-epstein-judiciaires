/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { ProcessedResult, TransactionDetail } from '../types';
import { DollarSign, ArrowRightLeft, TrendingUp, Landmark, Calendar, Search, ArrowUpRight, ArrowDownLeft, Wallet, ShieldCheck, Zap } from 'lucide-react';

export const FinancialFlowView: React.FC = () => {
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const formatCurrency = (amount: number, currency: string) => {
        try {
            // Check if currency looks like a valid ISO code (3 letters)
            if (/^[A-Z]{3}$/.test(currency)) {
                return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
            }
            // Fallback for non-standard currency labels like "[NON MENTIONNÉ]" or "USD?"
            return `${amount.toLocaleString('fr-FR')} ${currency}`;
        } catch (e) {
            return `${amount.toLocaleString('fr-FR')} ${currency}`;
        }
    };

    useEffect(() => {
        storageService.getAllResults().then(data => {
            setHistory(data);
            setLoading(false);
        });
    }, []);

    const allTransactions = useMemo(() => {
        const list: TransactionDetail[] = [];
        history.forEach(res => {
            if (res.output?.transactions_financieres) {
                list.push(...res.output.transactions_financieres);
            }
        });
        return list
            .filter(t =>
                t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [history, searchQuery]);

    const stats = useMemo(() => {
        const total = allTransactions.reduce((acc, t) => acc + t.montant, 0);
        const uniqueEntities = new Set([
            ...allTransactions.map(t => t.source),
            ...allTransactions.map(t => t.destination)
        ]);
        return {
            total,
            count: allTransactions.length,
            entities: uniqueEntities.size
        };
    }, [allTransactions]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-white animate-pro-reveal">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-[2px] border-slate-50 rounded-full"></div>
                        <div className="absolute inset-0 border-t-[2px] border-[#B91C1C] rounded-full animate-spin"></div>
                        <DollarSign size={24} className="absolute inset-0 m-auto text-[#B91C1C] animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">Scanning Monetary Networks...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <header className="px-6 lg:px-10 py-5 lg:py-6 border-b border-slate-100 bg-white/90 backdrop-blur-xl z-20 shrink-0 shadow-sm relative">
                <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none opacity-50"></div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#B91C1C] rounded-xl flex items-center justify-center shadow-lg shadow-red-900/10 transition-transform hover:rotate-6">
                            <DollarSign size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg lg:text-xl font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight leading-tight">Flux <span className="text-[#B91C1C]">Financiers</span></h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Mapping Transactionnel Forensique</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative group w-full lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#B91C1C] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Cible, Montant, Banque..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-[#F8FAFC] border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-[12px] text-[#0F172A] focus:border-[#B91C1C] focus:bg-white outline-none transition-all w-full shadow-inner placeholder-slate-300 font-medium"
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar z-10 relative">

                {/* Executive Stats Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-6xl mx-auto">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-110 transition-all duration-700">
                            <TrendingUp size={80} />
                        </div>
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Volume Total Détecté</div>
                        <div className="text-3xl font-mono-data font-black text-[#B91C1C] leading-none mb-2">
                            {formatCurrency(stats.total, 'USD')}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-[#0F4C81] uppercase">
                            <Zap size={10} /> Resonance Economique
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-110 transition-all duration-700">
                            <ArrowRightLeft size={80} />
                        </div>
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Transactions Marquantes</div>
                        <div className="text-3xl font-mono-data font-black text-[#0F172A] leading-none mb-2">{stats.count}</div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400">
                            <Calendar size={10} /> Base Archive
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-110 transition-all duration-700">
                            <Landmark size={80} />
                        </div>
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Entités Bancaires/Cibles</div>
                        <div className="text-3xl font-mono-data font-black text-[#0F4C81] leading-none mb-2">{stats.entities}</div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg w-fit">
                            <ShieldCheck size={10} /> Vérifié Forensique
                        </div>
                    </div>
                </div>

                {/* Transaction Ledger */}
                <div className="max-w-6xl mx-auto space-y-4 pb-20">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Grand Livre Transactionnel</span>
                        <div className="h-px flex-1 bg-slate-50"></div>
                    </div>

                    {allTransactions.map((t, i) => (
                        <div key={i} className="bg-white/70 hover:bg-white backdrop-blur-sm p-5 lg:p-6 rounded-[2rem] border border-slate-50 hover:border-[#B91C1C]/10 transition-all duration-500 shadow-sm hover:shadow-2xl flex flex-col lg:flex-row lg:items-center gap-6 group">

                            <div className="flex items-center gap-5 lg:w-1/4 shrink-0">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-[#B91C1C]/5 group-hover:border-[#B91C1C]/20 transition-all">
                                    <Wallet size={20} className="text-[#B91C1C] opacity-40 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[14px] font-black text-[#0F172A] truncate italic font-serif-legal mb-1">
                                        {formatCurrency(t.montant, t.devise)}
                                    </div>
                                    <div className="text-[9px] font-mono-data text-slate-300 font-black uppercase tracking-widest">{t.date}</div>
                                </div>
                            </div>

                            <div className="flex-1 flex items-center justify-between gap-6 bg-[#F8FAFC]/50 p-4 rounded-2xl border border-slate-50 group-hover:bg-white transition-colors">
                                <div className="flex-1 min-w-0">
                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Source Transfert</div>
                                    <div className="text-[12px] font-black text-[#0F4C81] truncate italic font-serif-legal">{t.source}</div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="h-4 w-4 bg-white rounded-full border border-slate-100 flex items-center justify-center shadow-sm">
                                        <ArrowRightLeft size={8} className="text-[#B91C1C] animate-pulse" />
                                    </div>
                                    <div className="h-4 w-px bg-slate-100"></div>
                                </div>
                                <div className="flex-1 min-w-0 text-right">
                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Cible Réceptrice</div>
                                    <div className="text-[12px] font-black text-[#B91C1C] truncate italic font-serif-legal">{t.destination}</div>
                                </div>
                            </div>

                            <div className="lg:w-1/3 flex flex-col gap-2">
                                <div className="text-[12px] text-slate-500 font-medium italic leading-relaxed line-clamp-2 pl-4 border-l-2 border-slate-50 group-hover:border-[#B91C1C]/20 transition-colors">
                                    "{t.description}"
                                </div>
                            </div>
                        </div>
                    ))}

                    {allTransactions.length === 0 && (
                        <div className="text-center py-40 opacity-30 italic text-[11px] font-black uppercase tracking-widest animate-pro-reveal">
                            Aucune anomalie monétaire détectée dans le flux
                        </div>
                    )}
                </div>
            </div>

            {/* Decoration */}
            <div className="absolute bottom-10 -left-10 rotate-90 origin-left pointer-events-none opacity-[0.02]">
                <span className="text-[12px] font-black text-black uppercase tracking-[1em] whitespace-nowrap italic">MONETARY FLOW ANALYTICS UNIT</span>
            </div>
        </div>
    );
};
