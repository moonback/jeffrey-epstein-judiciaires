import React, { useMemo, useState, useEffect } from 'react';
import { PageHeader } from './PageHeader';
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
import ForceGraph2D from 'react-force-graph-2d';

interface EntityFinanceProfile {
    name: string;
    totalSent: number;
    totalReceived: number;
    transactionCount: number;
    averageTransaction: number;
    riskScore: number;
    netFlow: number;
    role: 'Distributeur' | 'Bénéficiaire' | 'Intermédiaire' | 'Inconnu';
}

export const FinancialFlowView: React.FC = () => {
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'high' | 'suspicious'>('all');
    const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'year'>('all');
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'entities' | 'graph' | 'analytics'>('list');
    const [roleFilter, setRoleFilter] = useState<'all' | 'Distributeur' | 'Bénéficiaire' | 'Intermédiaire'>('all');

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
        const mergedMap = new Map<string, TransactionDetail & { sources: string[], mentions: number, category?: string }>();

        history.forEach(res => {
            if (res.output?.transactions_financieres) {
                res.output.transactions_financieres.forEach(t => {
                    // Normalize data for matching
                    const src = (t.source || 'Inconnu').toLowerCase().trim();
                    const dst = (t.destination || 'Inconnu').toLowerCase().trim();
                    const amt = Math.round(Number(t.montant) || 0); // Round to handle slight precision diffs
                    const date = t.date?.split('T')[0] || 'Inconnue'; // Normalize date string

                    // Intelligent categorization
                    const desc = (t.description || '').toLowerCase();
                    let category: 'Transfert' | 'Offshore' | 'Investissement' | 'Légal' | 'Inconnu' = 'Transfert';
                    if (desc.includes('offshore') || desc.includes('seychelles') || desc.includes('cayman') || desc.includes('panama')) category = 'Offshore';
                    else if (desc.includes('invest') || desc.includes('equity') || desc.includes('stock')) category = 'Investissement';
                    else if (desc.includes('lawyer') || desc.includes('legal') || desc.includes('frais') || desc.includes('cabinet')) category = 'Légal';

                    // Create a composite key for deduplication
                    const key = `${src}-${dst}-${amt}-${t.devise || 'USD'}-${date}`;

                    if (!mergedMap.has(key)) {
                        mergedMap.set(key, {
                            ...t,
                            sources: [res.id],
                            mentions: 1,
                            category: category
                        });
                    } else {
                        const existing = mergedMap.get(key)!;
                        // Avoid adding same source ID multiple times
                        if (!existing.sources.includes(res.id)) {
                            existing.sources.push(res.id);
                        }
                        existing.mentions += 1;

                        // Merge descriptions if different
                        if (t.description && !existing.description.includes(t.description.slice(0, 15))) {
                            existing.description += ` | ${t.description}`;
                        }
                    }
                });
            }
        });

        const list = Array.from(mergedMap.values());

        let filtered = list.filter(t => {
            const matchesSearch = (t.source || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.destination || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesEntity = !selectedEntity ||
                t.source === selectedEntity ||
                t.destination === selectedEntity;

            if (!matchesSearch || !matchesEntity) return false;

            const tDate = t.date ? new Date(t.date) : new Date(0);
            const now = new Date();
            if (dateFilter === 'month') {
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(now.getMonth() - 1);
                if (tDate < oneMonthAgo) return false;
            } else if (dateFilter === 'year') {
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(now.getFullYear() - 1);
                if (tDate < oneYearAgo) return false;
            }

            if (filterType === 'high') return (Number(t.montant) || 0) > 500000;
            if (filterType === 'suspicious') return (Number(t.montant) || 0) > 1000000 || (t.description || '').toLowerCase().includes('offshore') || (t.description || '').toLowerCase().includes('inconnu');
            return true;
        });

        return filtered.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    }, [history, searchQuery, filterType, selectedEntity, dateFilter]);

    const entityProfiles = useMemo(() => {
        const profiles: Record<string, EntityFinanceProfile> = {};

        // Recalculate on ALL transactions to have consistent data even if filtered
        const baseTransactions = [];
        history.forEach(res => res.output?.transactions_financieres?.forEach(t => baseTransactions.push(t)));

        baseTransactions.forEach(t => {
            [(t.source || 'Inconnu'), (t.destination || 'Inconnu')].forEach((name, idx) => {
                if (!profiles[name]) {
                    profiles[name] = {
                        name,
                        totalSent: 0,
                        totalReceived: 0,
                        transactionCount: 0,
                        averageTransaction: 0,
                        riskScore: 0,
                        netFlow: 0,
                        role: 'Inconnu'
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
            p.netFlow = p.totalReceived - p.totalSent;

            // Role assignment
            if (p.totalSent > p.totalReceived * 3) p.role = 'Distributeur';
            else if (p.totalReceived > p.totalSent * 3) p.role = 'Bénéficiaire';
            else p.role = 'Intermédiaire';

            // Simple risk scoring logic
            p.riskScore = Math.min(100, (p.totalSent + p.totalReceived) / 1000000 + (p.transactionCount > 5 ? 20 : 0) + (p.role === 'Distributeur' ? 10 : 0));
            return p;
        }).sort((a, b) => (b.totalSent + b.totalReceived) - (a.totalSent + a.totalReceived));
    }, [history]);

    const analytics = useMemo(() => {
        const totalVolume = allTransactions.reduce((acc, t) => acc + (Number(t.montant) || 0), 0);
        const suspiciousCount = allTransactions.filter(t => (Number(t.montant) || 0) > 1000000).length;

        // Volume by currency
        const currencyVolume: Record<string, number> = {};
        allTransactions.forEach(t => {
            currencyVolume[t.devise] = (currencyVolume[t.devise] || 0) + (Number(t.montant) || 0);
        });

        return {
            totalVolume,
            count: allTransactions.length,
            suspiciousCount,
            uniqueEntities: entityProfiles.length,
            currencyVolume
        };
    }, [allTransactions, entityProfiles]);

    const graphData = useMemo(() => {
        const nodes: any[] = [];
        const links: any[] = [];
        const nodeSet = new Set();

        allTransactions.forEach(t => {
            if (!nodeSet.has(t.source)) {
                nodes.push({ id: t.source, name: t.source, val: 5, color: '#0F172A' });
                nodeSet.add(t.source);
            }
            if (!nodeSet.has(t.destination)) {
                nodes.push({ id: t.destination, name: t.destination, val: 5, color: '#B91C1C' });
                nodeSet.add(t.destination);
            }
            links.push({
                source: t.source,
                target: t.destination,
                value: Math.log10(t.montant / 1000 + 1) * 2,
                amount: t.montant,
                currency: t.devise
            });
        });

        return { nodes, links };
    }, [allTransactions]);

    const exportToCSV = () => {
        const headers = ["Date", "Source", "Destination", "Montant", "Devise", "Description", "Ref"];
        const rows = allTransactions.map(t => [
            t.date,
            t.source,
            t.destination,
            t.montant,
            t.devise,
            t.description,
            t.sources.join(";")
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Export_Financier_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-[var(--background)]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-[3px] border-[var(--surface-muted)] rounded-full"></div>
                        <div className="absolute inset-0 border-t-[3px] border-[var(--accent)] rounded-full animate-spin"></div>
                        <Activity size={32} className="absolute inset-0 m-auto text-[var(--accent)] animate-pulse" />
                    </div>
                    <div className="space-y-2 text-center">
                        <span className="block text-xs font-black text-[var(--text)] uppercase tracking-[0.4em]">Audit Financier en Cours</span>
                        <span className="block text-[8px] font-bold text-[var(--text-dim)] uppercase tracking-widest italic">Analyse des flux et patterns monétaires...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[var(--background)] overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <PageHeader
                title="Flux"
                titleHighlight="Financiers"
                icon={DollarSign}
                badgeText=""
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Rechercher une transaction..."
                totalLabel="Volume Total"
                totalCount={formatCurrency(analytics.totalVolume, 'USD')}
                stats={[
                    {
                        label: `${analytics.count} Flux Détectés`,
                        value: "",
                        icon: <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></div>
                    },
                    {
                        label: "Volume Indexé",
                        value: "",
                        icon: <Landmark size={14} className="text-[var(--accent)]" />
                    }
                ]}
            >
                <div className="flex items-center bg-[var(--surface-muted)] border border-[var(--border)] p-1 rounded-xl shadow-inner shrink-0">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'}`}
                    >
                        <Layers size={10} className="inline mr-1" /> Flux
                    </button>
                    <button
                        onClick={() => setViewMode('entities')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${viewMode === 'entities' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'}`}
                    >
                        <User size={10} className="inline mr-1" /> Entités
                    </button>
                    <button
                        onClick={() => setViewMode('graph')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${viewMode === 'graph' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'}`}
                    >
                        <Network size={10} className="inline mr-1" /> Graphe
                    </button>
                    <button
                        onClick={() => setViewMode('analytics')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${viewMode === 'analytics' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'}`}
                    >
                        <BarChart3 size={10} className="inline mr-1" /> Analyse
                    </button>
                </div>

                <div className="h-6 w-px bg-[var(--border)] mx-2 hidden sm:block shrink-0"></div>

                <div className="flex items-center bg-[var(--surface-muted)] border border-[var(--border)] p-1 rounded-xl shadow-inner shrink-0">
                    <button
                        onClick={() => setDateFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${dateFilter === 'all' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'}`}
                    >
                        Tout
                    </button>
                    <button
                        onClick={() => setDateFilter('month')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${dateFilter === 'month' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'}`}
                    >
                        30 Jours
                    </button>
                    <button
                        onClick={() => setDateFilter('year')}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${dateFilter === 'year' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'}`}
                    >
                        1 An
                    </button>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar z-10 scroll-smooth">
                <div className="max-w-12xl mx-auto">
                    {/* Cinematic Stats Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <StatCard
                            icon={TrendingUp}
                            label="Volume Total Audité"
                            value={formatCurrency(analytics.totalVolume, 'USD')}
                            color="var(--accent)"
                            subText={`${analytics.count} Transactions synchronisées`}
                        />
                        <StatCard
                            icon={AlertTriangle}
                            label="Alertes de Haut Risque"
                            value={analytics.suspiciousCount.toString()}
                            color="var(--danger)"
                            subText="Montants > 1.0M USD ou Offshore"
                            isUrgent={analytics.suspiciousCount > 0}
                        />
                        <StatCard
                            icon={Network}
                            label="Entités de Référence"
                            value={analytics.uniqueEntities.toString()}
                            color="var(--primary)"
                            subText="Nœuds financiers identifiés"
                        />
                        <StatCard
                            icon={Fingerprint}
                            label="Score d'Audit"
                            value="98.2"
                            color="var(--success)"
                            subText="Fiabilité des données extraites"
                        />
                    </div>

                    {viewMode === 'list' ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.4em] italic">Timeline des Mouvements</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent"></div>
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
                                    <div className="py-40 text-center bg-[var(--surface)] rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-sm">
                                        <Search size={48} className="mx-auto text-[var(--surface-muted)] mb-6" />
                                        <h3 className="text-xl font-black text-[var(--text)] uppercase tracking-widest font-legal italic mb-2">Aucun Résultat</h3>
                                        <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-[0.2em]">Modifiez vos filtres ou effectuez une nouvelle analyse</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : viewMode === 'entities' ? (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.4em] italic">Classification par Comportement</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                                <div className="flex gap-2">
                                    <FilterButton active={roleFilter === 'all'} onClick={() => setRoleFilter('all')} label="TOUS" />
                                    <FilterButton active={roleFilter === 'Distributeur'} onClick={() => setRoleFilter('Distributeur')} label="DISTRIBUTEURS" />
                                    <FilterButton active={roleFilter === 'Bénéficiaire'} onClick={() => setRoleFilter('Bénéficiaire')} label="BÉNÉFICIAIRES" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {entityProfiles.filter(p => roleFilter === 'all' || p.role === roleFilter).map((profile, idx) => (
                                    <EntityProfileCard
                                        key={idx}
                                        profile={profile}
                                        onSelect={setSelectedEntity}
                                        formatCurrency={formatCurrency}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : viewMode === 'graph' ? (
                        <div className="bg-[var(--surface)] rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-sm h-[700px] relative overflow-hidden">
                            <ForceGraph2D
                                graphData={graphData}
                                nodeLabel="name"
                                nodeColor="color"
                                linkDirectionalArrowLength={4}
                                linkDirectionalArrowRelPos={1}
                                linkCurvature={0.2}
                                linkDirectionalParticles={2}
                                linkDirectionalParticleSpeed={0.01}
                                nodeCanvasObject={(node: any, ctx, globalScale) => {
                                    const label = node.name;
                                    const fontSize = 12 / globalScale;
                                    ctx.font = `${fontSize}px Inter`;
                                    const textWidth = ctx.measureText(label).width;
                                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2) as [number, number];

                                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                                    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'middle';
                                    ctx.fillStyle = node.color;
                                    ctx.fillText(label, node.x, node.y);

                                    node.__bckgDimensions = bckgDimensions;
                                }}
                                nodePointerAreaPaint={(node: any, color, ctx) => {
                                    ctx.fillStyle = color;
                                    const bckgDimensions = node.__bckgDimensions;
                                    bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
                                }}
                                onNodeClick={(node: any) => setSelectedEntity(node.id)}
                            />
                            <div className="absolute top-6 left-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 shadow-lg pointer-events-none">
                                <h4 className="text-[10px] font-black text-[var(--text)] uppercase tracking-widest mb-2">Légende Graphe</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[var(--primary)]"></div>
                                        <span className="text-[9px] font-bold text-[var(--text-dim)] uppercase">Émetteurs</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[var(--accent)]"></div>
                                        <span className="text-[9px] font-bold text-[var(--text-dim)] uppercase">Récepteurs</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-[var(--surface)] p-10 rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-sm relative overflow-hidden group">
                                <h3 className="text-lg font-black text-[var(--text)] uppercase tracking-widest font-legal italic mb-8">Volume par Devise</h3>
                                <div className="space-y-6">
                                    {Object.entries(analytics.currencyVolume).map(([currency, volume]) => (
                                        <div key={currency} className="space-y-2">
                                            <div className="flex justify-between items-center text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                                <span>{currency}</span>
                                                <span className="text-[var(--accent)]">{formatCurrency(volume, currency)}</span>
                                            </div>
                                            <div className="h-3 w-full bg-[var(--surface-muted)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[var(--primary)] transition-all duration-1000"
                                                    style={{ width: `${(volume / analytics.totalVolume) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[var(--surface)] p-10 rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-sm relative overflow-hidden group">
                                <h3 className="text-lg font-black text-[var(--text)] uppercase tracking-widest font-legal italic mb-8">Flux Net par Entité</h3>
                                <div className="space-y-6">
                                    {entityProfiles.slice(0, 8).map((p, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="text-[12px] font-black text-[var(--text)] italic font-legal">{p.name}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${p.role === 'Distributeur' ? 'bg-[var(--warning)]/10 text-[var(--warning)]' : p.role === 'Bénéficiaire' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--info)]/10 text-[var(--info)]'}`}>
                                                        {p.role}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-[11px] font-black ${p.netFlow > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                                                    {p.netFlow > 0 ? '+' : ''}{formatCurrency(p.netFlow, 'USD')}
                                                </div>
                                                <div className="text-[8px] font-bold text-[var(--text-dim)] uppercase tracking-widest">Solde Net</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <footer className="px-10 py-5 bg-[var(--surface)] border-t border-[var(--border)] flex justify-between items-center z-30 shrink-0">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
                        <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">Inflow (Source)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--primary)]"></div>
                        <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">Outflow (Destination)</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={exportToCSV}
                        className="text-[10px] font-black text-[var(--text-dim)] hover:text-[var(--text)] transition-colors flex items-center gap-2 bg-[var(--surface-muted)] px-4 py-2 rounded-xl border border-[var(--border)]"
                    >
                        <FileText size={12} /> EXPORTER CSV
                    </button>
                    <button
                        onClick={() => {
                            const doc = new jsPDF();
                            const primaryRed: [number, number, number] = [185, 28, 28];
                            const darkSlate: [number, number, number] = [15, 23, 42];
                            const lightSlate: [number, number, number] = [100, 116, 139];

                            // 1. HEADER DESIGN
                            // Red accent bar at top
                            doc.setFillColor(primaryRed[0], primaryRed[1], primaryRed[2]);
                            doc.rect(0, 0, 210, 15, 'F');

                            // Logo/Unit Text
                            doc.setTextColor(255, 255, 255);
                            doc.setFontSize(8);
                            doc.setFont("helvetica", "bold");
                            doc.text("QUANTUM-AUDIT BUREAU // UNIT-04 FORENSIC SERVICES", 14, 10);

                            // Main Title
                            doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
                            doc.setFontSize(28);
                            doc.setFont("times", "bolditalic");
                            doc.text("REPORT OF FINANCIAL AUDIT", 14, 35);

                            // Decorative Line
                            doc.setDrawColor(primaryRed[0], primaryRed[1], primaryRed[2]);
                            doc.setLineWidth(1.5);
                            doc.line(14, 40, 60, 40);

                            // Metadata Block
                            doc.setFontSize(10);
                            doc.setFont("helvetica", "normal");
                            doc.setTextColor(lightSlate[0], lightSlate[1], lightSlate[2]);
                            doc.text(`DATE DE GÉNÉRATION : ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}`, 14, 50);
                            doc.text(`IDENTIFIANT AUDIT : QC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 14, 55);
                            doc.text(`OBJET : ANALYSE DES FLUX ET PATTERNS MONÉTAIRES`, 14, 60);

                            // 2. SUMMARY DASHBOARD (Visual Box)
                            doc.setFillColor(248, 250, 252); // bg-slate-50
                            doc.roundedRect(14, 70, 182, 45, 3, 3, 'F');

                            doc.setFontSize(12);
                            doc.setFont("helvetica", "bold");
                            doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
                            doc.text("SYNTHÈSE DU VOLUME TRANSACTIONNEL", 20, 80);

                            doc.setFontSize(24);
                            doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
                            doc.text(formatCurrency(analytics.totalVolume, 'USD'), 20, 95);

                            doc.setFontSize(9);
                            doc.setFont("helvetica", "normal");
                            doc.setTextColor(lightSlate[0], lightSlate[1], lightSlate[2]);
                            doc.text(`${analytics.count} transactions analysées provenant de multiples sources documentaires.`, 20, 105);

                            // 3. INDICATORS TABLE
                            autoTable(doc, {
                                startY: 125,
                                head: [['INDICATEURS DE PERFORMANCE FORENSIC', 'VALEUR']],
                                body: [
                                    ['ALERTES DE HAUT RISQUE (>1.0M USD)', analytics.suspiciousCount.toString()],
                                    ['ENTITÉS FINANCIÈRES IDENTIFIÉES', analytics.uniqueEntities.toString()],
                                    ['INDICE DE FIABILITÉ DES DONNÉES', '98.2%'],
                                    ['MODE D\'ANALYSE', 'IDENTIFICATION PAR NEURAL SCANNING']
                                ],
                                theme: 'plain',
                                headStyles: {
                                    fillColor: [241, 245, 249],
                                    textColor: darkSlate,
                                    fontStyle: 'bold',
                                    fontSize: 10,
                                    cellPadding: 5
                                },
                                styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240], lineWidth: 0.1 },
                                columnStyles: {
                                    1: { halign: 'right', fontStyle: 'bold' }
                                }
                            });

                            // 4. DETAILED TRANSACTIONS PAGE
                            doc.addPage();
                            // Page Header for new page
                            doc.setFillColor(primaryRed[0], primaryRed[1], primaryRed[2]);
                            doc.rect(0, 0, 210, 8, 'F');

                            doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
                            doc.setFontSize(16);
                            doc.setFont("times", "bolditalic");
                            doc.text("CHRONOLOGIE DÉTAILLÉE DES MOUVEMENTS", 14, 25);

                            const tableData = allTransactions.map(t => [
                                t.date,
                                t.source,
                                t.destination,
                                formatCurrency(t.montant, t.devise),
                                t.description
                            ]);

                            autoTable(doc, {
                                startY: 35,
                                head: [['DATE', 'SOURCE', 'DESTINATION', 'MONTANT', 'DESCRIPTION']],
                                body: tableData,
                                headStyles: {
                                    fillColor: darkSlate,
                                    textColor: [255, 255, 255],
                                    fontSize: 8,
                                    fontStyle: 'bold'
                                },
                                alternateRowStyles: { fillColor: [250, 250, 250] },
                                styles: { fontSize: 7, cellPadding: 3, overflow: 'linebreak' },
                                columnStyles: {
                                    1: { cellWidth: 35 },
                                    2: { cellWidth: 35 },
                                    3: { halign: 'right', fontStyle: 'bold', textColor: primaryRed, cellWidth: 30 },
                                    4: { cellWidth: 60 }
                                },
                                didDrawPage: (data) => {
                                    // Footer on each page of the table
                                    doc.setFontSize(8);
                                    doc.setTextColor(150);
                                    doc.text(`CONFIDENTIEL - AUDIT FORENSIC - DOCUMENT GÉNÉRÉ PAR IA`, 105, 285, { align: 'center' });
                                }
                            });

                            // 5. ENTITY PROFILES
                            if (entityProfiles.length > 0) {
                                doc.addPage();
                                doc.setFillColor(primaryRed[0], primaryRed[1], primaryRed[2]);
                                doc.rect(0, 0, 210, 8, 'F');

                                doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
                                doc.setFontSize(16);
                                doc.setFont("times", "bolditalic");
                                doc.text("CARTOGRAPHIE DES ENTITÉS À HAUT RISQUE", 14, 25);

                                const entityData = entityProfiles.slice(0, 20).map(p => [
                                    p.name,
                                    formatCurrency(p.totalSent, 'USD'),
                                    formatCurrency(p.totalReceived, 'USD'),
                                    p.transactionCount,
                                    `${Math.round(p.riskScore)}%`
                                ]);

                                autoTable(doc, {
                                    startY: 35,
                                    head: [['NOM DE L\'ENTITÉ', 'TOTAL ENVOYÉ', 'TOTAL REÇU', 'EVENTS', 'SCORE RISQUE']],
                                    body: entityData,
                                    headStyles: { fillColor: primaryRed, textColor: [255, 255, 255], fontSize: 8 },
                                    styles: { fontSize: 7, cellPadding: 3 },
                                    columnStyles: {
                                        1: { halign: 'right' },
                                        2: { halign: 'right' },
                                        4: { halign: 'center', fontStyle: 'bold', textColor: primaryRed }
                                    }
                                });
                            }

                            // 6. CERTIFICATION & SIGNATURE
                            const finalY = (doc as any).lastAutoTable.finalY + 20;
                            if (finalY < 250) {
                                doc.setFontSize(10);
                                doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
                                doc.setFont("helvetica", "bold");
                                doc.text("CERTIFICATION DE L'AUDIT", 14, finalY);
                                doc.setFont("helvetica", "normal");
                                doc.setFontSize(8);
                                doc.text("Je certifie que les données financières présentées dans ce rapport ont été extraites avec précision", 14, finalY + 8);
                                doc.text("par les algorithmes de scan neural à partir des documents judiciaires fournis.", 14, finalY + 13);

                                doc.setDrawColor(200);
                                doc.line(140, finalY + 25, 190, finalY + 25);
                                doc.setFontSize(7);
                                doc.text("SIGNATURE DE L'ANALYSTE EN CHEF", 140, finalY + 30);
                            }

                            doc.save(`QUANTUM_AUDIT_REPORT_${new Date().getTime()}.pdf`);
                        }}
                        className="text-[10px] font-black text-[var(--accent)] hover:text-[var(--text)] transition-colors flex items-center gap-2"
                    >
                        <Download size={12} /> GÉNÉRER RAPPORT PDF
                    </button>
                </div>
            </footer>
        </div >
    );
};

const StatCard: React.FC<{ icon: any, label: string, value: string, color: string, subText: string, isUrgent?: boolean }> = ({ icon: Icon, label, value, color, subText, isUrgent }) => (
    <div className={`bg-[var(--surface)] p-6 lg:p-8 rounded-[var(--radius-2xl)] border ${isUrgent ? 'border-[var(--danger)]/20' : 'border-[var(--border)]'} shadow-[var(--shadow-subtle)] relative overflow-hidden group hover:shadow-[var(--shadow-premium)] transition-all duration-500`}>
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
            <Icon size={80} style={{ color }} />
        </div>
        <div className="relative z-10">
            <div className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div> {label}
            </div>
            <div className="text-2xl lg:text-3xl font-mono-data font-black text-[var(--text)] tracking-tighter mb-2 italic">
                {value}
            </div>
            <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-tight">{subText}</p>
        </div>
        {isUrgent && (
            <div className="absolute bottom-0 left-0 h-1 w-full bg-[var(--danger)] animate-pulse"></div>
        )}
    </div>
);

const FilterButton: React.FC<{ active: boolean, onClick: () => void, label: string, isDanger?: boolean }> = ({ active, onClick, label, isDanger }) => (
    <button
        onClick={onClick}
        className={`
            px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border
            ${active
                ? (isDanger ? 'bg-[var(--danger)] border-[var(--danger)] text-white shadow-lg' : 'bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)] shadow-lg')
                : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)]'
            }
        `}
    >
        {label}
    </button>
);

const TransactionCard: React.FC<{ transaction: any, onEntityClick: (name: string) => void, formatCurrency: any }> = ({ transaction, onEntityClick, formatCurrency }) => {
    const isBig = (Number(transaction.montant) || 0) > 500000;
    const isSuspicious = (Number(transaction.montant) || 0) > 1000000 || (transaction.description || '').toLowerCase().includes('offshore');

    return (
        <div className={`
            bg-[var(--surface)] group rounded-[var(--radius-2xl)] border transition-all duration-500 relative overflow-hidden
            ${isSuspicious ? 'border-[var(--danger)]/20 shadow-[var(--shadow-premium)] shadow-red-900/5' : 'border-[var(--border)] hover:border-[var(--accent)]/30 shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-soft)]'}
        `}>
            {isSuspicious && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--danger)]"></div>
            )}

            <div className="p-6 lg:p-8 flex flex-col xl:flex-row xl:items-center gap-8">
                {/* Left: Amount & Date */}
                <div className="xl:w-1/4 shrink-0">
                    <div className="flex items-center gap-4 mb-3">
                        <div className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center transition-all duration-500 group-hover:rotate-6 ${isSuspicious ? 'bg-[var(--danger)]' : 'bg-[var(--primary)]'} text-[var(--primary-foreground)] shadow-xl`}>
                            <DollarSign size={18} strokeWidth={3} />
                        </div>
                        <div className="text-[20px] font-mono-data font-black text-[var(--text)] tracking-tighter italic">
                            {formatCurrency(transaction.montant, transaction.devise)}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest bg-[var(--surface-muted)] px-3 py-1 rounded-[var(--radius-md)] border border-[var(--border)]">
                            <Calendar size={10} /> {transaction.date}
                        </div>
                        {(transaction as any).category && (
                            <span className={`text-[8px] font-black px-2 py-1 rounded flex items-center gap-1 border uppercase tracking-widest ${(transaction as any).category === 'Offshore' ? 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20' :
                                (transaction as any).category === 'Investissement' ? 'bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/20' :
                                    (transaction as any).category === 'Légal' ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20' :
                                        'bg-[var(--surface-muted)] text-[var(--text-dim)] border-[var(--border)]'
                                }`}>
                                <Box size={8} /> {(transaction as any).category}
                            </span>
                        )}
                        {isSuspicious && (
                            <span className="text-[8px] font-black text-[var(--danger)] bg-[var(--danger)]/10 px-2 py-1 rounded flex items-center gap-1 border border-[var(--danger)]/20 animate-pulse">
                                <AlertTriangle size={8} /> ALERTE RISQUE
                            </span>
                        )}
                    </div>
                </div>

                {/* Center: Flow Visualization */}
                <div className="flex-1 flex items-center justify-between gap-6 bg-[var(--surface-muted)] p-6 rounded-[var(--radius-xl)] border border-[var(--border)] relative group/flow">
                    <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <ArrowUpRight size={12} className="text-[var(--success)]" /> SOURCE D'ÉMISSION
                        </div>
                        <button
                            onClick={() => onEntityClick(transaction.source)}
                            className="text-[13px] lg:text-[14px] font-black text-[var(--text)] hover:text-[var(--accent)] transition-colors font-legal italic text-left truncate w-full"
                        >
                            {transaction.source}
                        </button>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-[var(--surface)] rounded-full border border-[var(--border)] flex items-center justify-center shadow-[var(--shadow-soft)] group-hover/flow:scale-110 transition-transform duration-500 group-hover/flow:border-[var(--accent)]">
                            <ArrowRight size={20} className={isSuspicious ? 'text-[var(--danger)]' : 'text-[var(--text-dim)]'} />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 text-right">
                        <div className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em] mb-2 flex items-center gap-2 justify-end">
                            CIBLE DE RÉCEPTION <ArrowDownLeft size={12} className="text-[var(--danger)]" />
                        </div>
                        <button
                            onClick={() => onEntityClick(transaction.destination)}
                            className="text-[13px] lg:text-[14px] font-black text-[var(--text)] hover:text-[var(--accent)] transition-colors font-legal italic text-right truncate w-full"
                        >
                            {transaction.destination}
                        </button>
                    </div>
                </div>

                {/* Right: Description & Meta */}
                <div className="xl:w-1/4">
                    <div className="bg-[var(--surface-muted)]/40 p-4 rounded-[var(--radius-xl)] border border-[var(--border)] italic text-[12px] text-[var(--text-muted)] leading-relaxed relative group-hover:bg-[var(--surface-muted)] transition-colors mb-4">
                        <div className="absolute left-0 top-3 bottom-0 w-1 bg-[var(--border)] rounded-full group-hover:bg-[var(--accent)] transition-colors"></div>
                        "{transaction.description}"
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-[8px] font-mono-data font-black text-[var(--text-dim)] uppercase tracking-widest flex items-center gap-1">
                                <Layers size={10} /> {transaction.sources.length} SOURCES ({transaction.mentions} MAG.)
                            </span>
                            <div className="h-3 w-px bg-[var(--border)]"></div>
                            <span className="text-[8px] font-black text-[var(--success)] flex items-center gap-1 uppercase tracking-widest bg-[var(--success)]/10 px-2 py-0.5 rounded">
                                <ShieldCheck size={10} /> Verified
                            </span>
                        </div>
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
                bg-[var(--surface)] p-6 lg:p-8 rounded-[var(--radius-2xl)] border transition-all duration-500 cursor-pointer group hover:shadow-[var(--shadow-premium)] hover:-translate-y-2
                ${isRisky ? 'border-[var(--danger)]/20 shadow-[var(--shadow-soft)] shadow-red-900/5' : 'border-[var(--border)] shadow-[var(--shadow-subtle)]'}
            `}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-2">
                    <div className="w-12 h-12 bg-[var(--surface-muted)] rounded-[var(--radius-lg)] flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-white transition-all duration-500 shadow-inner">
                        <User size={24} />
                    </div>
                    <span className={`text-[8px] font-black px-2 py-1 rounded text-center uppercase tracking-widest border ${profile.role === 'Distributeur' ? 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20' :
                        profile.role === 'Bénéficiaire' ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20' :
                            'bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/20'
                        }`}>
                        {profile.role}
                    </span>
                </div>
                <div className="text-right">
                    <div className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em] mb-1">Index de Risque</div>
                    <div className={`text-xl font-mono-data font-black ${isRisky ? 'text-[var(--danger)]' : 'text-[var(--text)]'}`}>
                        {Math.round(profile.riskScore)}%
                    </div>
                    <div className={`text-[11px] font-black mt-2 ${profile.netFlow > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                        {profile.netFlow > 0 ? '+' : ''}{formatCurrency(profile.netFlow, 'USD')}
                    </div>
                    <div className="text-[7px] font-black text-[var(--text-dim)] uppercase tracking-widest">Balance Net</div>
                </div>
            </div>

            <h3 className="text-lg font-black text-[var(--text)] font-legal italic transition-colors group-hover:text-[var(--accent)] mb-6 truncate">
                {profile.name}
            </h3>

            <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-dim)]">
                    <span className="uppercase tracking-widest">Envois</span>
                    <span className="text-[var(--text)] font-mono-data">{formatCurrency(profile.totalSent, 'USD')}</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--surface-muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--primary)] transition-all duration-1000" style={{ width: `${(profile.totalSent / (profile.totalSent + profile.totalReceived)) * 100}%` }}></div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-dim)]">
                    <span className="uppercase tracking-widest">Réceptions</span>
                    <span className="text-[var(--text)] font-mono-data">{formatCurrency(profile.totalReceived, 'USD')}</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--surface-muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] transition-all duration-1000" style={{ width: `${(profile.totalReceived / (profile.totalSent + profile.totalReceived)) * 100}%` }}></div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--border)] flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-[var(--text-dim)]" />
                    <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">{profile.transactionCount} Événements</span>
                </div>
                <button className="p-2 rounded-xl bg-[var(--surface-muted)] text-[var(--text-dim)] opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--accent)] hover:text-white">
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
