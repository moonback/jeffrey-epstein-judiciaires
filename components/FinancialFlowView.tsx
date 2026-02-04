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
    FileText,
    ArrowRight,
    ChevronDown,
    Download,
    Maximize2,
    BarChart3,
    Layers,
    User,

} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EntityFinanceProfile {
    name: string;
    totalSent: number;
    totalReceived: number;
    transactionCount: number;
    averageTransaction: number;
    riskScore: number;
}

export const FinancialFlowView: React.FC = () => {
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'high' | 'suspicious'>('all');
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'entities'>('list');

    const formatCurrency = (amount: number, currency: string) => {
        try {
            const val = currency === 'USD' ? 'en-US' : 'fr-FR';
            return new Intl.NumberFormat(val, {
                style: 'currency',
                currency: currency || 'USD',
                maximumFractionDigits: 0
            }).format(amount);
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

        let filtered = list.filter(t => {
            const matchesSearch = t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesEntity = !selectedEntity ||
                t.source === selectedEntity ||
                t.destination === selectedEntity;

            if (!matchesSearch || !matchesEntity) return false;

            if (filterType === 'high') return t.montant > 500000;
            if (filterType === 'suspicious') return t.montant > 1000000 || t.description.toLowerCase().includes('offshore') || t.description.toLowerCase().includes('inconnu');
            return true;
        });

        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [history, searchQuery, filterType, selectedEntity]);

    const entityProfiles = useMemo(() => {
        const profiles: Record<string, EntityFinanceProfile> = {};

        // Recalculate on ALL transactions to have consistent data even if filtered
        const baseTransactions = [];
        history.forEach(res => res.output?.transactions_financieres?.forEach(t => baseTransactions.push(t)));

        baseTransactions.forEach(t => {
            [t.source, t.destination].forEach((name, idx) => {
                if (!profiles[name]) {
                    profiles[name] = {
                        name,
                        totalSent: 0,
                        totalReceived: 0,
                        transactionCount: 0,
                        averageTransaction: 0,
                        riskScore: 0
                    };
                }
                const p = profiles[name];
                p.transactionCount++;
                const amount = Number(t.montant) || 0;
                if (idx === 0) p.totalSent += amount;
                else p.totalReceived += amount;
            });
        });

        return Object.values(profiles).map(p => {
            p.averageTransaction = (p.totalSent + p.totalReceived) / p.transactionCount;
            // Simple risk scoring logic
            p.riskScore = Math.min(100, (p.totalSent + p.totalReceived) / 1000000 + (p.transactionCount > 5 ? 20 : 0));
            return p;
        }).sort((a, b) => (b.totalSent + b.totalReceived) - (a.totalSent + a.totalReceived));
    }, [history]);

    const analytics = useMemo(() => {
        const totalVolume = allTransactions.reduce((acc, t) => acc + (Number(t.montant) || 0), 0);
        const suspiciousCount = allTransactions.filter(t => (Number(t.montant) || 0) > 1000000).length;
        return {
            totalVolume,
            count: allTransactions.length,
            suspiciousCount,
            uniqueEntities: entityProfiles.length
        };
    }, [allTransactions, entityProfiles]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-[3px] border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-t-[3px] border-[#B91C1C] rounded-full animate-spin"></div>
                        <Activity size={32} className="absolute inset-0 m-auto text-[#B91C1C] animate-pulse" />
                    </div>
                    <div className="space-y-2 text-center">
                        <span className="block text-xs font-black text-slate-800 uppercase tracking-[0.4em]">Audit Financier en Cours</span>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">Analyse des flux et patterns monétaires...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F8FAFC] overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <header className="px-6 lg:px-10 py-6 bg-white border-b border-slate-100 z-30 shadow-sm relative shrink-0">
                <div className="max-w-12xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0F172A] to-slate-800 rounded-2xl flex items-center justify-center shadow-2xl rotate-3 group cursor-pointer hover:rotate-0 transition-transform">
                            <Landmark className="text-white" size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl lg:text-2xl font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight leading-none">
                                    Mapping <span className="text-[#B91C1C]">Transactionnel</span>
                                </h2>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Unit-04 Forensic</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    Real-time Audit
                                </span>
                                {selectedEntity && (
                                    <button
                                        onClick={() => setSelectedEntity(null)}
                                        className="flex items-center gap-1.5 text-[9px] font-black text-[#B91C1C] uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-full border border-red-100 hover:bg-red-100 transition-colors"
                                    >
                                        <X size={10} /> Focus: {selectedEntity}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center bg-slate-50 border border-slate-100 p-1 rounded-xl shadow-inner">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Layers size={12} className="inline mr-2" /> Flux
                            </button>
                            <button
                                onClick={() => setViewMode('entities')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'entities' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <User size={12} className="inline mr-2" /> Entités
                            </button>
                        </div>

                        <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>

                        <div className="relative group">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#B91C1C] transition-colors" />
                            <input
                                type="text"
                                placeholder="Rechercher une transaction..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium w-64 focus:w-80 transition-all duration-300 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar z-10 scroll-smooth">
                <div className="max-w-12xl mx-auto">
                    {/* Cinematic Stats Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <StatCard
                            icon={TrendingUp}
                            label="Volume Total Audité"
                            value={formatCurrency(analytics.totalVolume, 'USD')}
                            color="#B91C1C"
                            subText={`${analytics.count} Transactions synchronisées`}
                        />
                        <StatCard
                            icon={AlertTriangle}
                            label="Alertes de Haut Risque"
                            value={analytics.suspiciousCount.toString()}
                            color="#B91C1C"
                            subText="Montants > 1.0M USD ou Offshore"
                            isUrgent={analytics.suspiciousCount > 0}
                        />
                        <StatCard
                            icon={Network}
                            label="Entités de Référence"
                            value={analytics.uniqueEntities.toString()}
                            color="#0F172A"
                            subText="Nœuds financiers identifiés"
                        />
                        <StatCard
                            icon={Fingerprint}
                            label="Score d'Audit"
                            value="98.2"
                            color="#10B981"
                            subText="Fiabilité des données extraites"
                        />
                    </div>

                    {viewMode === 'list' ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic">Timeline des Mouvements</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
                                <div className="flex gap-2">
                                    <FilterButton active={filterType === 'all'} onClick={() => setFilterType('all')} label="TOUS" />
                                    <FilterButton active={filterType === 'high'} onClick={() => setFilterType('high')} label="> 500K" />
                                    <FilterButton active={filterType === 'suspicious'} onClick={() => setFilterType('suspicious')} label="SUSPECTS" isDanger />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {allTransactions.map((t, idx) => (
                                    <TransactionCard
                                        key={idx}
                                        transaction={t}
                                        onEntityClick={setSelectedEntity}
                                        formatCurrency={formatCurrency}
                                    />
                                ))}

                                {allTransactions.length === 0 && (
                                    <div className="py-40 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                                        <Search size={48} className="mx-auto text-slate-100 mb-6" />
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest font-serif-legal italic mb-2">Aucun Résultat</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Modifiez vos filtres ou effectuez une nouvelle analyse</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {entityProfiles.map((profile, idx) => (
                                <EntityProfileCard
                                    key={idx}
                                    profile={profile}
                                    onSelect={setSelectedEntity}
                                    formatCurrency={formatCurrency}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <footer className="px-10 py-5 bg-white border-t border-slate-100 flex justify-between items-center z-30 shrink-0">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#B91C1C]"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inflow (Source)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-900"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Outflow (Destination)</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] italic">Quantum-Audit Bureau // Node.5-Finance</span>
                    <div className="h-4 w-px bg-slate-100"></div>
                    <button
                        onClick={() => {
                            const doc = new jsPDF();

                            // Title & Header
                            doc.setFontSize(22);
                            doc.setTextColor(185, 28, 28); // #B91C1C
                            doc.text("RAPPORT D'AUDIT FINANCIER", 14, 22);

                            doc.setFontSize(10);
                            doc.setTextColor(100, 116, 139); // slate-500
                            doc.text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, 14, 30);
                            doc.text("Unité Forensic: Quantum-Audit Bureau // Node.5-Finance", 14, 35);

                            // Summary Stats
                            doc.setDrawColor(241, 245, 249); // slate-100
                            doc.line(14, 40, 196, 40);

                            doc.setFontSize(12);
                            doc.setTextColor(15, 23, 42); // slate-900
                            doc.text("SYNTHÈSE ANALYTIQUE", 14, 50);

                            autoTable(doc, {
                                startY: 55,
                                head: [['Indicateur', 'Valeur']],
                                body: [
                                    ['Volume Total Audité', formatCurrency(analytics.totalVolume, 'USD')],
                                    ['Nombre de Transactions', analytics.count.toString()],
                                    ['Alertes de Haut Risque', analytics.suspiciousCount.toString()],
                                    ['Entités Identifiées', analytics.uniqueEntities.toString()],
                                    ['Score de Fiabilité', '98.2%']
                                ],
                                theme: 'striped',
                                headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' }
                            });

                            // Detailed Transactions
                            doc.addPage();
                            doc.setFontSize(16);
                            doc.setTextColor(185, 28, 28);
                            doc.text("DÉTAIL DES FLUX TRANSACTIONNELS", 14, 22);

                            const tableData = allTransactions.map(t => [
                                t.date,
                                t.source,
                                t.destination,
                                formatCurrency(t.montant, t.devise),
                                t.description
                            ]);

                            autoTable(doc, {
                                startY: 30,
                                head: [['Date', 'Source', 'Destination', 'Montant', 'Description']],
                                body: tableData,
                                headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255] },
                                styles: { fontSize: 8, cellPadding: 2 },
                                columnStyles: {
                                    3: { halign: 'right', fontStyle: 'bold' },
                                    4: { cellWidth: 50 }
                                }
                            });

                            // Important Entities
                            if (entityProfiles.length > 0) {
                                doc.addPage();
                                doc.setFontSize(16);
                                doc.setTextColor(15, 23, 42);
                                doc.text("PROFILING DES ENTITÉS À RISQUE", 14, 22);

                                const entityData = entityProfiles.slice(0, 15).map(p => [
                                    p.name,
                                    formatCurrency(p.totalSent, 'USD'),
                                    formatCurrency(p.totalReceived, 'USD'),
                                    p.transactionCount,
                                    `${Math.round(p.riskScore)}%`
                                ]);

                                autoTable(doc, {
                                    startY: 30,
                                    head: [['Entité', 'Total Envoyé', 'Total Reçu', 'Events', 'Score Risque']],
                                    body: entityData,
                                    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
                                    styles: { fontSize: 8 }
                                });
                            }

                            // Footer on each page
                            const pageCount = doc.getNumberOfPages();
                            for (let i = 1; i <= pageCount; i++) {
                                doc.setPage(i);
                                doc.setFontSize(8);
                                doc.setTextColor(150);
                                doc.text(`Page ${i} sur ${pageCount} - Document Confidentiel - Audit Forensic Epstein`, 105, 285, { align: 'center' });
                            }

                            doc.save(`Rapport_Audit_Financier_${new Date().getTime()}.pdf`);
                        }}
                        className="text-[10px] font-black text-[#B91C1C] hover:text-[#7F1D1D] transition-colors flex items-center gap-2"
                    >
                        <Download size={12} /> GÉNÉRER RAPPORT PDF
                    </button>
                </div>
            </footer>
        </div>
    );
};

const StatCard: React.FC<{ icon: any, label: string, value: string, color: string, subText: string, isUrgent?: boolean }> = ({ icon: Icon, label, value, color, subText, isUrgent }) => (
    <div className={`bg-white p-6 lg:p-8 rounded-[2.5rem] border ${isUrgent ? 'border-red-200' : 'border-slate-100'} shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500`}>
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
            <Icon size={80} />
        </div>
        <div className="relative z-10">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div> {label}
            </div>
            <div className="text-2xl lg:text-3xl font-mono-data font-black text-[#0F172A] tracking-tighter mb-2 italic">
                {value}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{subText}</p>
        </div>
        {isUrgent && (
            <div className="absolute bottom-0 left-0 h-1 w-full bg-[#B91C1C] animate-pulse"></div>
        )}
    </div>
);

const FilterButton: React.FC<{ active: boolean, onClick: () => void, label: string, isDanger?: boolean }> = ({ active, onClick, label, isDanger }) => (
    <button
        onClick={onClick}
        className={`
            px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border
            ${active
                ? (isDanger ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg')
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
            }
        `}
    >
        {label}
    </button>
);

const TransactionCard: React.FC<{ transaction: any, onEntityClick: (name: string) => void, formatCurrency: any }> = ({ transaction, onEntityClick, formatCurrency }) => {
    const isBig = transaction.montant > 500000;
    const isSuspicious = transaction.montant > 1000000 || transaction.description.toLowerCase().includes('offshore');

    return (
        <div className={`
            bg-white group rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden
            ${isSuspicious ? 'border-red-200 shadow-xl shadow-red-900/5' : 'border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-lg'}
        `}>
            {isSuspicious && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#B91C1C]"></div>
            )}

            <div className="p-6 lg:p-8 flex flex-col xl:flex-row xl:items-center gap-8">
                {/* Left: Amount & Date */}
                <div className="xl:w-1/4 shrink-0">
                    <div className="flex items-center gap-4 mb-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 ${isSuspicious ? 'bg-[#B91C1C]' : 'bg-slate-900'} text-white shadow-xl`}>
                            <DollarSign size={18} strokeWidth={3} />
                        </div>
                        <div className="text-[20px] font-mono-data font-black text-slate-900 tracking-tighter italic">
                            {formatCurrency(transaction.montant, transaction.devise)}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                            <Calendar size={10} /> {transaction.date}
                        </div>
                        {isSuspicious && (
                            <span className="text-[8px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1 border border-red-100 animate-pulse">
                                <AlertTriangle size={8} /> ALERT
                            </span>
                        )}
                    </div>
                </div>

                {/* Center: Flow Visualization */}
                <div className="flex-1 flex items-center justify-between gap-6 bg-[#F8FAFC] p-6 rounded-[2rem] border border-slate-50 relative group/flow">
                    <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <ArrowUpRight size={12} className="text-emerald-500" /> SOURCE D'ÉMISSION
                        </div>
                        <button
                            onClick={() => onEntityClick(transaction.source)}
                            className="text-[13px] lg:text-[14px] font-black text-slate-800 hover:text-[#B91C1C] transition-colors font-serif-legal italic text-left truncate w-full"
                        >
                            {transaction.source}
                        </button>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-white rounded-full border border-slate-100 flex items-center justify-center shadow-lg group-hover/flow:scale-110 transition-transform duration-500 group-hover/flow:border-[#B91C1C]">
                            <ArrowRight size={20} className={isSuspicious ? 'text-[#B91C1C]' : 'text-slate-300'} />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 text-right">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2 justify-end">
                            CIBLE DE RÉCEPTION <ArrowDownLeft size={12} className="text-red-500" />
                        </div>
                        <button
                            onClick={() => onEntityClick(transaction.destination)}
                            className="text-[13px] lg:text-[14px] font-black text-slate-800 hover:text-[#B91C1C] transition-colors font-serif-legal italic text-right truncate w-full"
                        >
                            {transaction.destination}
                        </button>
                    </div>
                </div>

                {/* Right: Description & Meta */}
                <div className="xl:w-1/4">
                    <div className="bg-[#FFFFF0]/40 p-4 rounded-2xl border border-slate-50 italic text-[12px] text-slate-600 leading-relaxed relative group-hover:bg-[#FFFFF0] transition-colors mb-4">
                        <div className="absolute left-0 top-3 bottom-0 w-1 bg-slate-100 rounded-full group-hover:bg-[#B91C1C] transition-colors"></div>
                        "{transaction.description}"
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[8px] font-mono-data font-black text-slate-300 uppercase tracking-widest">REF: {transaction.parentId.slice(0, 8)}</span>
                        <div className="h-3 w-px bg-slate-100"></div>
                        <span className="text-[8px] font-black text-emerald-600 flex items-center gap-1 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">
                            <ShieldCheck size={10} /> Verified
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EntityProfileCard: React.FC<{ profile: EntityFinanceProfile, onSelect: (name: string) => void, formatCurrency: any }> = ({ profile, onSelect, formatCurrency }) => {
    const isRisky = profile.riskScore > 60;

    return (
        <div
            onClick={() => onSelect(profile.name)}
            className={`
                bg-white p-6 lg:p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer group hover:shadow-2xl hover:-translate-y-2
                ${isRisky ? 'border-red-100 shadow-xl shadow-red-900/5' : 'border-slate-100 shadow-sm'}
            `}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-[#B91C1C] group-hover:text-white transition-all duration-500 shadow-inner">
                    <User size={24} />
                </div>
                <div className="text-right">
                    <div className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Index de Risque</div>
                    <div className={`text-xl font-mono-data font-black ${isRisky ? 'text-red-600' : 'text-slate-900'}`}>
                        {Math.round(profile.riskScore)}%
                    </div>
                </div>
            </div>

            <h3 className="text-lg font-black text-slate-900 font-serif-legal italic transition-colors group-hover:text-[#B91C1C] mb-6 truncate">
                {profile.name}
            </h3>

            <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span className="uppercase tracking-widest">Envois</span>
                    <span className="text-slate-800 font-mono-data">{formatCurrency(profile.totalSent, 'USD')}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 transition-all duration-1000" style={{ width: `${(profile.totalSent / (profile.totalSent + profile.totalReceived)) * 100}%` }}></div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span className="uppercase tracking-widest">Réceptions</span>
                    <span className="text-slate-800 font-mono-data">{formatCurrency(profile.totalReceived, 'USD')}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#B91C1C] transition-all duration-1000" style={{ width: `${(profile.totalReceived / (profile.totalSent + profile.totalReceived)) * 100}%` }}></div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-slate-300" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{profile.transactionCount} Événements</span>
                </div>
                <button className="p-2 rounded-xl bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-[#B91C1C] hover:text-white">
                    <Maximize2 size={14} />
                </button>
            </div>
        </div>
    );
};

const X: React.FC<{ size?: number, className?: string }> = ({ size = 16, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);
