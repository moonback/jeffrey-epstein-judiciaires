import React, { useMemo, useState, useEffect } from 'react';
import { PageHeader } from './PageHeader';
import { storageService } from '../services/storageService';
import { ProcessedResult, AssetDetail } from '../types';
import {
    Home,
    Car,
    Wallet,
    Briefcase,
    Globe,
    Search,
    Filter,
    Activity,
    ShieldCheck,
    DollarSign,
    MapPin,
    User,
    Diamond,
    Building2,
    Calendar,
    Download,
    Maximize2,
    TrendingUp,
    ChevronDown,
    LayoutGrid,
    AlignLeft,
    Layers
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const AssetsView: React.FC = () => {
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        storageService.getAllResults().then(data => {
            setHistory(data);
            setLoading(false);
        });
    }, []);

    const allAssets = useMemo(() => {
        const canonicalAssets: (AssetDetail & { sources: string[], mentions: number, searchKey: string })[] = [];

        const getSearchKey = (name: string) => {
            return name.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                .replace(/[^a-z0-9]/g, " ")
                .split(/\s+/)
                .filter(w => w.length > 2)
                .sort()
                .join("");
        };

        history.forEach(res => {
            if (res.output?.actifs) {
                res.output.actifs.forEach(asset => {
                    const searchKey = getSearchKey(asset.nom);
                    const locationKey = asset.localisation ? getSearchKey(asset.localisation) : '';

                    // Try to find a match in existing canonical assets
                    const matchIndex = canonicalAssets.findIndex(existing => {
                        // 1. Must be same type
                        if (existing.type !== asset.type) return false;

                        // 2. Immediate key match
                        if (existing.searchKey === searchKey && searchKey.length > 0) return true;

                        // 3. Location collision + partial name match
                        if (locationKey.length > 3 && existing.localisation) {
                            const existingLocKey = getSearchKey(existing.localisation);
                            if (existingLocKey.includes(locationKey) || locationKey.includes(existingLocKey)) {
                                // Same location, check if name has a common word
                                const assetWords = asset.nom.toLowerCase().split(/\s+/).filter(w => w.length > 3);
                                const existingWords = existing.nom.toLowerCase().split(/\s+/).filter(w => w.length > 3);
                                if (assetWords.some(w => existingWords.includes(w))) return true;
                            }
                        }

                        return false;
                    });

                    if (matchIndex === -1) {
                        canonicalAssets.push({
                            ...asset,
                            sources: [res.id],
                            mentions: 1,
                            searchKey
                        });
                    } else {
                        const existing = canonicalAssets[matchIndex];

                        // Merge logic
                        if (!existing.valeur_estimee && asset.valeur_estimee) {
                            existing.valeur_estimee = asset.valeur_estimee;
                            existing.devise = asset.devise;
                        }
                        if ((!existing.localisation || existing.localisation.length < 5) && asset.localisation) {
                            existing.localisation = asset.localisation;
                        }
                        if (asset.description && !existing.description.includes(asset.description.slice(0, 15))) {
                            existing.description += ` | ${asset.description}`;
                        }

                        if (!existing.sources.includes(res.id)) {
                            existing.sources.push(res.id);
                        }
                        existing.mentions += 1;
                    }
                });
            }
        });

        return canonicalAssets.filter(a => {
            const lowQuery = searchQuery.toLowerCase();
            const matchesSearch = a.nom.toLowerCase().includes(lowQuery) ||
                a.description.toLowerCase().includes(lowQuery) ||
                a.proprietaire_declare.toLowerCase().includes(lowQuery) ||
                (a.localisation || '').toLowerCase().includes(lowQuery);

            const matchesType = filterType === 'all' || a.type === filterType;

            return matchesSearch && matchesType;
        });
    }, [history, searchQuery, filterType]);

    const stats = useMemo(() => {
        const totalValue = allAssets.reduce((acc, a) => acc + (Number(a.valeur_estimee) || 0), 0);
        const typeCounts = allAssets.reduce((acc, a) => {
            acc[a.type] = (acc[a.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalValue,
            count: allAssets.length,
            typeCounts
        };
    }, [allAssets]);

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        try {
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: currency,
                maximumFractionDigits: 0
            }).format(amount);
        } catch (e) {
            return `${amount.toLocaleString('fr-FR')} ${currency}`;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'immobilier': return <Home size={20} />;
            case 'vehicule': return <Car size={20} />;
            case 'compte_bancaire': return <Wallet size={20} />;
            case 'societe': return <Building2 size={20} />;
            default: return <Diamond size={20} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'immobilier': return 'text-[var(--info)] bg-[var(--info)]/10 border-[var(--info)]/20';
            case 'vehicule': return 'text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/20';
            case 'compte_bancaire': return 'text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/20';
            case 'societe': return 'text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20';
            default: return 'text-[var(--text-dim)] bg-[var(--surface-muted)] border-[var(--border)]';
        }
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
                        <span className="block text-xs font-black text-[var(--text)] uppercase tracking-[0.4em]">Audit Patrimonial en Cours</span>
                        <span className="block text-[8px] font-bold text-[var(--text-dim)] uppercase tracking-widest italic">Recensement des actifs et propriétés...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[var(--background)] overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            <PageHeader
                title="Inventaire du"
                titleHighlight="Patrimoine"
                icon={Briefcase}
                badgeText="Asset Unit-09"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Rechercher bien, propriétaire..."
                totalLabel="Actifs Identifiés"
                totalCount={allAssets.length}
                stats={[
                    {
                        label: "Wealth Audit",
                        value: "Active",
                        icon: <div className="w-1.5 h-1.5 bg-[var(--success)] rounded-full animate-pulse"></div>
                    }
                ]}
            >
                <div className="flex items-center bg-[var(--surface-muted)] border border-[var(--border)] p-1 rounded-xl shadow-inner">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'grid' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'}`}
                    >
                        <LayoutGrid size={12} className="inline mr-2" /> Grille
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'}`}
                    >
                        <AlignLeft size={12} className="inline mr-2" /> Liste
                    </button>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar z-10 scroll-smooth">
                <div className="max-w-12xl mx-auto">
                    {/* Patrimoine Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <StatCard
                            icon={DollarSign}
                            label="Patrimoine Total Estimé"
                            value={formatCurrency(stats.totalValue)}
                            color="var(--accent)"
                            subText={`${stats.count} Actifs identifiés`}
                        />
                        <StatCard
                            icon={Building2}
                            label="Actifs Immobiliers"
                            value={stats.typeCounts['immobilier']?.toString() || '0'}
                            color="var(--info)"
                            subText="Propriétés et terrains"
                        />
                        <StatCard
                            icon={Wallet}
                            label="Capitaux Bancaires"
                            value={stats.typeCounts['compte_bancaire']?.toString() || '0'}
                            color="var(--success)"
                            subText="Comptes et placements"
                        />
                        <StatCard
                            icon={Globe}
                            label="Entités de Référence"
                            value={stats.typeCounts['societe']?.toString() || '0'}
                            color="var(--primary)"
                            subText="Holdings et sociétés"
                        />
                    </div>

                    {/* Filter Bar */}
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.4em] italic">Classification des Biens</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent"></div>
                        <div className="flex gap-2">
                            <FilterTypeButton active={filterType === 'all'} onClick={() => setFilterType('all')} label="TOUS" />
                            <FilterTypeButton active={filterType === 'immobilier'} onClick={() => setFilterType('immobilier')} label="IMMOBILIER" />
                            <FilterTypeButton active={filterType === 'compte_bancaire'} onClick={() => setFilterType('compte_bancaire')} label="BANQUES" />
                            <FilterTypeButton active={filterType === 'societe'} onClick={() => setFilterType('societe')} label="SOCIÉTÉS" />
                            <FilterTypeButton active={filterType === 'vehicule'} onClick={() => setFilterType('vehicule')} label="VÉHICULES" />
                        </div>
                    </div>

                    {/* Assets Grid/List */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {allAssets.map((asset, idx) => (
                                <AssetCard key={idx} asset={asset} formatCurrency={formatCurrency} getTypeIcon={getTypeIcon} getTypeColor={getTypeColor} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {allAssets.map((asset, idx) => (
                                <AssetRow key={idx} asset={asset} formatCurrency={formatCurrency} getTypeIcon={getTypeIcon} getTypeColor={getTypeColor} />
                            ))}
                        </div>
                    )}

                    {allAssets.length === 0 && (
                        <div className="py-40 text-center bg-[var(--surface)] rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-sm border-dashed">
                            <Briefcase size={48} className="mx-auto text-[var(--surface-muted)] mb-6" />
                            <h3 className="text-xl font-black text-[var(--text)] uppercase tracking-widest font-legal italic mb-2">Aucun Actif Trouvé</h3>
                            <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-[0.2em]">Le patrimoine n'a pas encore été identifié dans les documents</p>
                        </div>
                    )}
                </div>
            </div>

            <footer className="px-10 py-5 bg-[var(--surface)] border-t border-[var(--border)] flex justify-between items-center z-30 shrink-0">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
                        <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">Calcul Neural Actif</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.4em] italic">Forensic-Asset-Scanner // Unit.09</span>
                    <div className="h-4 w-px bg-[var(--border)]"></div>
                    <button
                        onClick={() => {
                            const doc = new jsPDF();
                            const primaryRed: [number, number, number] = [185, 28, 28];
                            const darkSlate: [number, number, number] = [15, 23, 42];
                            const lightSlate: [number, number, number] = [100, 116, 139];

                            // 1. HEADER DESIGN
                            doc.setFillColor(primaryRed[0], primaryRed[1], primaryRed[2]);
                            doc.rect(0, 0, 210, 15, 'F');

                            doc.setTextColor(255, 255, 255);
                            doc.setFontSize(8);
                            doc.setFont("helvetica", "bold");
                            doc.text("FORENSIC-ASSET-SCANNER // UNIT.09 WEALTH ASSESSMENT", 14, 10);

                            doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
                            doc.setFontSize(28);
                            doc.setFont("times", "bolditalic");
                            doc.text("REPORT OF WEALTH ASSETS", 14, 35);

                            doc.setDrawColor(primaryRed[0], primaryRed[1], primaryRed[2]);
                            doc.setLineWidth(1.5);
                            doc.line(14, 40, 60, 40);

                            doc.setFontSize(10);
                            doc.setFont("helvetica", "normal");
                            doc.setTextColor(lightSlate[0], lightSlate[1], lightSlate[2]);
                            doc.text(`DATE DE GÉNÉRATION : ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}`, 14, 50);
                            doc.text(`ID CONTRÔLE : WA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 14, 55);
                            doc.text(`OBJET : INVENTAIRE ET ESTIMATION DU PATRIMOINE RÉPERTORIÉ`, 14, 60);

                            // 2. TOTAL VALUE DASHBOARD
                            doc.setFillColor(248, 250, 252);
                            doc.roundedRect(14, 70, 182, 45, 3, 3, 'F');

                            doc.setFontSize(12);
                            doc.setFont("helvetica", "bold");
                            doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
                            doc.text("PATRIMOINE TOTAL ESTIMÉ", 20, 80);

                            doc.setFontSize(24);
                            doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
                            doc.text(formatCurrency(stats.totalValue), 20, 95);

                            doc.setFontSize(9);
                            doc.setFont("helvetica", "normal");
                            doc.setTextColor(lightSlate[0], lightSlate[1], lightSlate[2]);
                            doc.text(`Analyse consolidée de ${stats.count} actifs matériels et financiers identifiés.`, 20, 105);

                            // 3. STATS SUMMARY TABLE
                            autoTable(doc, {
                                startY: 125,
                                head: [['CATÉGORIE D\'ACTIF', 'QUANTITÉ']],
                                body: [
                                    ['BIENS IMMOBILIERS (VILLAS, TERRAINS)', (stats.typeCounts['immobilier'] || 0).toString()],
                                    ['RETOUR SUR CAPITAUX & COMPTES', (stats.typeCounts['compte_bancaire'] || 0).toString()],
                                    ['SOCIÉTÉS, HOLDINGS & TRUSTS', (stats.typeCounts['societe'] || 0).toString()],
                                    ['VÉHICULES ET AUTRES BIENS', (stats.typeCounts['vehicule'] || 0).toString()]
                                ],
                                theme: 'plain',
                                headStyles: {
                                    fillColor: [241, 245, 249],
                                    textColor: darkSlate,
                                    fontStyle: 'bold',
                                    fontSize: 10
                                },
                                styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240], lineWidth: 0.1 }
                            });

                            // 4. DETAILED INVENTORY
                            doc.addPage();
                            doc.setFillColor(primaryRed[0], primaryRed[1], primaryRed[2]);
                            doc.rect(0, 0, 210, 8, 'F');

                            doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
                            doc.setFontSize(16);
                            doc.setFont("times", "bolditalic");
                            doc.text("INVENTAIRE NOMINAL ET LOCALISATION", 14, 25);

                            const tableData = allAssets.map(a => [
                                a.type.toUpperCase(),
                                a.nom,
                                a.proprietaire_declare,
                                a.localisation || 'N/A',
                                formatCurrency(a.valeur_estimee || 0, a.devise)
                            ]);

                            autoTable(doc, {
                                startY: 35,
                                head: [['TYPE', 'ACTIF', 'PROPRIÉTAIRE', 'LOCALISATION', 'VALEUR']],
                                body: tableData,
                                headStyles: { fillColor: darkSlate, textColor: [255, 255, 255], fontSize: 8 },
                                alternateRowStyles: { fillColor: [250, 250, 250] },
                                styles: { fontSize: 7, cellPadding: 3, overflow: 'linebreak' },
                                columnStyles: {
                                    4: { halign: 'right', fontStyle: 'bold', textColor: primaryRed }
                                },
                                didDrawPage: () => {
                                    doc.setFontSize(8);
                                    doc.setTextColor(150);
                                    doc.text(`CONFIDENTIEL - UNIT-09 ASSET MAPPING - GÉNÉRÉ PAR IA`, 105, 285, { align: 'center' });
                                }
                            });

                            // 5. LEGAL NOTICE
                            const finalY = (doc as any).lastAutoTable.finalY + 20;
                            if (finalY < 250) {
                                doc.setFontSize(10);
                                doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
                                doc.setFont("helvetica", "bold");
                                doc.text("CLAUSE DE RÉSERVE", 14, finalY);
                                doc.setFont("helvetica", "normal");
                                doc.setFontSize(8);
                                doc.text("Les valeurs estimées sont basées sur les données extraites des documents officiels.", 14, finalY + 8);
                                doc.text("Ce rapport constitue une base de travail pour l'investigation et n'a pas de valeur d'expertise légale unique.", 14, finalY + 13);
                            }

                            doc.save(`QUANTUM_ASSET_REPORT_${new Date().getTime()}.pdf`);
                        }}
                        className="text-[10px] font-black text-[var(--accent)] hover:text-[var(--text)] transition-colors flex items-center gap-2"
                    >
                        <Download size={12} /> RAPPORT DE PATRIMOINE
                    </button>
                </div>
            </footer>
        </div>
    );
};

const StatCard: React.FC<{ icon: any, label: string, value: string, color: string, subText: string }> = ({ icon: Icon, label, value, color, subText }) => (
    <div className="bg-[var(--surface)] p-8 rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-[var(--shadow-subtle)] relative overflow-hidden group hover:shadow-[var(--shadow-premium)] transition-all duration-500">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
            <Icon size={80} style={{ color }} />
        </div>
        <div className="relative z-10">
            <div className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div> {label}
            </div>
            <div className="text-2xl font-mono-data font-black text-[var(--text)] tracking-tighter mb-2 italic">
                {value}
            </div>
            <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-tight">{subText}</p>
        </div>
    </div>
);

const FilterTypeButton: React.FC<{ active: boolean, onClick: () => void, label: string }> = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${active ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)] shadow-lg' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)] hover:text-[var(--text)]'}`}
    >
        {label}
    </button>
);

const AssetCard: React.FC<{ asset: any, formatCurrency: any, getTypeIcon: any, getTypeColor: any }> = ({ asset, formatCurrency, getTypeIcon, getTypeColor }) => (
    <div className="bg-[var(--surface)] p-8 rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-premium)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
        <div className={`w-12 h-12 rounded-[var(--radius-xl)] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${getTypeColor(asset.type)} shadow-inner`}>
            {getTypeIcon(asset.type)}
        </div>

        <div className="mb-4">
            <div className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-1">{asset.type}</div>
            <h3 className="text-lg font-black text-[var(--text)] font-legal italic truncate leading-tight group-hover:text-[var(--accent)] transition-colors">
                {asset.nom}
            </h3>
        </div>

        {asset.valeur_estimee && (
            <div className="mb-6 p-4 bg-[var(--surface-muted)] rounded-[var(--radius-xl)] border border-[var(--border)]/50">
                <div className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-1">Valeur Estimée</div>
                <div className="text-xl font-mono-data font-black text-[var(--text)]">
                    {formatCurrency(asset.valeur_estimee, asset.devise)}
                </div>
            </div>
        )}

        <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
                <User size={14} className="text-[var(--text-dim)] shrink-0 mt-0.5" />
                <div className="min-w-0">
                    <div className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-widest leading-none mb-1">Propriétaire</div>
                    <div className="text-[11px] font-bold text-[var(--text-muted)] truncate">{asset.proprietaire_declare}</div>
                </div>
            </div>
            {asset.localisation && (
                <div className="flex items-start gap-3">
                    <MapPin size={14} className="text-[var(--text-dim)] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <div className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-widest leading-none mb-1">Localisation</div>
                        <div className="text-[11px] font-bold text-[var(--text-muted)] truncate">{asset.localisation}</div>
                    </div>
                </div>
            )}
            <div className="flex items-start gap-3">
                <Layers size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                <div className="min-w-0">
                    <div className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-widest leading-none mb-1">Sources Doc.</div>
                    <div className="text-[11px] font-black text-[var(--accent)] flex items-center gap-1">
                        {asset.sources.length} Dossiers <span className="opacity-40">({asset.mentions} mentions)</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="pt-6 border-t border-[var(--border)] relative">
            <p className="text-[11px] text-[var(--text-muted)] italic leading-relaxed line-clamp-2">
                "{asset.description}"
            </p>
        </div>

        {/* Decoration */}
        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-slate-50 to-transparent pointer-events-none"></div>
    </div>
);

const AssetRow: React.FC<{ asset: any, formatCurrency: any, getTypeIcon: any, getTypeColor: any }> = ({ asset, formatCurrency, getTypeIcon, getTypeColor }) => (
    <div className="bg-[var(--surface)] p-6 rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-soft)] transition-all duration-300 flex items-center gap-8 group">
        <div className={`w-12 h-12 shrink-0 rounded-[var(--radius-xl)] flex items-center justify-center transition-all ${getTypeColor(asset.type)}`}>
            {getTypeIcon(asset.type)}
        </div>

        <div className="w-1/4">
            <div className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-1">{asset.type}</div>
            <h3 className="text-[14px] font-black text-[var(--text)] font-legal italic truncate group-hover:text-[var(--accent)] transition-colors">
                {asset.nom}
            </h3>
        </div>

        <div className="w-1/6">
            <div className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-1">Valeur</div>
            <div className="text-[14px] font-mono-data font-black text-[var(--text)]">
                {asset.valeur_estimee ? formatCurrency(asset.valeur_estimee, asset.devise) : 'N/A'}
            </div>
        </div>

        <div className="w-1/6">
            <div className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-1">Propriétaire</div>
            <div className="text-[11px] font-bold text-[var(--text-muted)] truncate">{asset.proprietaire_declare}</div>
        </div>

        <div className="flex-1">
            <div className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-1">Description</div>
            <p className="text-[11px] text-[var(--text-muted)] italic truncate font-medium">"{asset.description}"</p>
        </div>

        <div className="w-24 text-right">
            <div className="text-[8px] font-black text-[var(--accent)] uppercase tracking-widest mb-1">Impact</div>
            <div className="text-[11px] font-black text-[var(--accent)]">{asset.sources.length} Sources</div>
        </div>

        <button className="w-10 h-10 rounded-xl bg-[var(--surface-muted)] text-[var(--text-dim)] flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-all opacity-0 group-hover:opacity-100">
            <Maximize2 size={16} />
        </button>
    </div>
);
