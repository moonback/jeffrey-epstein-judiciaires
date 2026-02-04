/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { ProcessedResult, TransactionDetail } from '../types';
import {
    DollarSign,
    ArrowRightLeft,
    TrendingUp,
    Landmark,
    Calendar,
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    ShieldCheck,
    Zap,
    AlertTriangle,
    Fingerprint,
    Network,
    Filter,
    Activity,
    Box,
    FileText
} from 'lucide-react';

export const FinancialFlowView: React.FC = () => {
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'high' | 'suspicious'>('all');

    const formatCurrency = (amount: number, currency: string) => {
        try {
            if (/^[A-Z]{3}$/.test(currency)) {
                return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
            }
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
        const list: (TransactionDetail & { parentId: string, parentTitle: string })[] = [];
        history.forEach(res => {
            if (res.output?.transactions_financieres) {
                res.output.transactions_financieres.forEach(t => {
                    list.push({
                        ...t,
                        parentId: res.id,
                        parentTitle: res.input.query || "Analyse Sans Titre"
                    });
                });
            }
        });

        return list
            .filter(t => {
                const matchesSearch = t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.description.toLowerCase().includes(searchQuery.toLowerCase());

                if (filterType === 'high') return matchesSearch && t.montant > 100000;
                if (filterType === 'suspicious') return matchesSearch && (t.montant > 1000000 || t.source.includes('Offshore') || t.destination.includes('Offshore'));
                return matchesSearch;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [history, searchQuery, filterType]);

    const analytics = useMemo(() => {
        const entityMap: Record<string, { sent: number, received: number, count: number }> = {};

        allTransactions.forEach(t => {
            if (!entityMap[t.source]) entityMap[t.source] = { sent: 0, received: 0, count: 0 };
            if (!entityMap[t.destination]) entityMap[t.destination] = { sent: 0, received: 0, count: 0 };

            entityMap[t.source].sent += t.montant;
            entityMap[t.source].count += 1;
            entityMap[t.destination].received += t.montant;
            entityMap[t.destination].count += 1;
        });

        const topEntities = Object.entries(entityMap)
            .sort(([, a], [, b]) => (b.sent + b.received) - (a.sent + a.received))
            .slice(0, 6);

        const totalVolume = allTransactions.reduce((acc, t) => acc + t.montant, 0);
        const suspiciousCount = allTransactions.filter(t => t.montant > 500000).length;

        return {
            topEntities,
            totalVolume,
            count: allTransactions.length,
            suspiciousCount,
            uniqueEntities: Object.keys(entityMap).length
        };
    }, [allTransactions]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-[3px] border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-t-[3px] border-red-600 rounded-full animate-spin"></div>
                        <Activity size={32} className="absolute inset-0 m-auto text-red-600 animate-pulse" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse italic">Reconstruction des Flux Monétaires</span>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1 h-1 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1 h-1 bg-red-600 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] report-paper pointer-events-none"></div>

            {/* Background Grid Decoration */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

            <header className="px-8 py-6 border-b border-slate-200 bg-white/95 backdrop-blur-xl z-30 shrink-0 shadow-sm relative">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-2xl shadow-black/10 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                            <Network size={24} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase italic font-serif-legal tracking-tighter leading-none">Mapping <span className="text-[#B91C1C]">Transactionnel</span></h2>
                                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[8px] font-black uppercase rounded border border-red-100 italic">V4.8 Forensic</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <ShieldCheck size={12} className="text-emerald-500" /> Cluster de Surveillance Monétaire
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Tous
                            </button>
                            <button
                                onClick={() => setFilterType('high')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'high' ? 'bg-white text-[#B91C1C] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {'>'} 100K
                            </button>
                            <button
                                onClick={() => setFilterType('suspicious')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterType === 'suspicious' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Suspects
                            </button>
                        </div>

                        <div className="relative group w-full lg:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#B91C1C] transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Rechercher entité ou motif..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-[1rem] py-2.5 pl-11 pr-4 text-[13px] text-slate-900 focus:border-[#B91C1C] focus:bg-white outline-none transition-all w-full shadow-inner placeholder-slate-300 font-bold"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar z-10 relative">

                {/* Analytics Dashboard Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-12 max-w-[1400px] mx-auto">

                    {/* Main Stats */}
                    <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                                <TrendingUp size={100} />
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]"></div> Flux Total Détecté
                            </div>
                            <div className="text-2xl font-mono-data font-black text-slate-900 leading-none mb-3">
                                {formatCurrency(analytics.totalVolume, 'USD')}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-red-600 uppercase bg-red-50 w-fit px-3 py-1 rounded-full border border-red-100">
                                <Zap size={10} strokeWidth={3} /> Exposition Critique Identifiée
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                                <Box size={100} />
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div> Masse Transactionnelle
                            </div>
                            <div className="text-2xl font-mono-data font-black text-slate-900 leading-none mb-3">{analytics.count}</div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                                <FileText size={10} /> {analytics.uniqueEntities} Entités de Référence
                            </div>
                        </div>

                        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:bg-black transition-all duration-500">
                            <div className="absolute -top-10 -right-10 p-8 opacity-[0.1] group-hover:scale-150 transition-transform duration-1000 text-white">
                                <AlertTriangle size={150} />
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div> Alertes Forensiques
                            </div>
                            <div className="text-2xl font-mono-data font-black text-white leading-none mb-3">{analytics.suspiciousCount}</div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase">
                                <Fingerprint size={12} /> Analyse de Comportements Atypiques
                            </div>
                        </div>
                    </div>

                    {/* Top Entities Sidebar */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">Top Entités</h4>
                            <Activity size={16} className="text-slate-300" />
                        </div>
                        <div className="space-y-6">
                            {analytics.topEntities.map(([name, data], idx) => (
                                <div key={idx} className="group cursor-pointer">
                                    <div className="flex justify-between items-end mb-1.5">
                                        <span className="text-[10px] font-black text-slate-700 truncate max-w-[120px] group-hover:text-[#B91C1C] transition-colors">{name}</span>
                                        <span className="text-[9px] font-mono-data font-bold text-slate-400">{Math.round((data.sent + data.received) / analytics.totalVolume * 100)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden flex shadow-inner">
                                        <div
                                            className="h-full bg-slate-900 transition-all duration-1000"
                                            style={{ width: `${(data.sent / (data.sent + data.received)) * 100}%` }}
                                        ></div>
                                        <div
                                            className="h-full bg-red-600 transition-all duration-1000"
                                            style={{ width: `${(data.received / (data.sent + data.received)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mapping Grid Visualization */}
                <div className="max-w-[1400px] mx-auto mb-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-1 bg-slate-200"></div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic">Grand Livre de l'Investigation</span>
                        <div className="h-px flex-1 bg-slate-200"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {allTransactions.map((t, i) => (
                            <div
                                key={i}
                                className={`
                                    bg-white hover:bg-white rounded-[2rem] border transition-all duration-300 flex flex-col xl:flex-row xl:items-center gap-6 p-6 group relative overflow-hidden
                                    ${t.montant > 500000 ? 'border-red-200 shadow-xl shadow-red-500/5 bg-red-50/10' : 'border-slate-100 hover:shadow-2xl hover:border-slate-300 shadow-sm'}
                                `}
                            >
                                {/* Left: ID & Amount */}
                                <div className="flex items-center gap-6 xl:w-1/4 shrink-0 relative z-10">
                                    <div className={`
                                        w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6
                                        ${t.montant > 500000 ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-slate-900 text-white shadow-lg'}
                                    `}>
                                        <DollarSign size={20} strokeWidth={2.5} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[16px] font-black text-slate-900 truncate italic font-serif-legal leading-none mb-1.5">
                                            {formatCurrency(t.montant, t.devise)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono-data font-black text-slate-400 uppercase">{t.date}</span>
                                            {t.montant > 500000 && (
                                                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-red-600 animate-pulse">
                                                    <AlertTriangle size={10} /> High Risk
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Center: The Flow */}
                                <div className="flex-1 flex items-center justify-between gap-8 bg-slate-50/50 p-5 rounded-[1.5rem] border border-slate-100 group-hover:bg-slate-100/50 transition-colors relative z-10">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <ArrowUpRight size={12} strokeWidth={3} className="text-slate-300" /> Origine
                                        </div>
                                        <div className="text-[12px] font-black text-slate-700 truncate italic font-serif-legal group-hover:text-slate-900 transition-colors">{t.source}</div>
                                    </div>

                                    <div className="flex flex-col items-center shrink-0">
                                        <div className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <ArrowRightLeft size={16} className={`transition-colors ${t.montant > 500000 ? 'text-red-600' : 'text-slate-400'}`} />
                                        </div>
                                        <div className="h-6 w-[1.5px] bg-slate-200 mt-2"></div>
                                    </div>

                                    <div className="flex-1 min-w-0 text-right">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2 justify-end">
                                            Cible <ArrowDownLeft size={12} strokeWidth={3} className="text-red-300" />
                                        </div>
                                        <div className="text-[12px] font-black text-red-700 truncate italic font-serif-legal group-hover:text-[#B91C1C] transition-colors">{t.destination}</div>
                                    </div>
                                </div>

                                {/* Right: Metadata & Context */}
                                <div className="xl:w-1/3 flex flex-col gap-3 relative z-10">
                                    <div className="text-[12px] text-slate-500 font-medium italic leading-relaxed line-clamp-2 pl-4 border-l-2 border-slate-200 group-hover:border-red-600 transition-colors">
                                        "{t.description}"
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black uppercase rounded tracking-widest flex items-center gap-1.5">
                                            <ShieldCheck size={10} /> Source: {t.parentId}
                                        </span>
                                    </div>
                                </div>

                                {/* High Risk Background Decoration */}
                                {t.montant > 500000 && (
                                    <div className="absolute top-0 right-0 h-full w-48 bg-gradient-to-l from-red-600/[0.03] to-transparent pointer-events-none"></div>
                                )}
                            </div>
                        ))}

                        {allTransactions.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border border-slate-100 shadow-sm border-dashed">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                    <Search size={32} className="text-slate-200" />
                                </div>
                                <span className="text-[12px] font-black text-slate-300 uppercase tracking-[0.5em] italic">Archive Blanche : Aucune Anomalie</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Tech Bar */}
            <footer className="px-8 py-4 bg-white border-t border-slate-200 flex justify-between items-center z-30 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Calcul Neural Actif</span>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-200"></div>
                    <span className="text-[9px] font-mono-data text-slate-300">ISO-FLUX-VERIFIED-L3</span>
                </div>
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] italic">
                    Unit Financial intelligence Bureau
                </div>
            </footer>

            {/* Side Labels */}
            <div className="absolute top-1/2 -right-12 -translate-y-1/2 rotate-90 origin-center pointer-events-none opacity-[0.05]">
                <span className="text-[10px] font-black text-black uppercase tracking-[1.5em] whitespace-nowrap italic">QUANTUM FINANCIAL TRACKER</span>
            </div>
        </div>
    );
};
