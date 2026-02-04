import React, { useMemo, useState, useEffect } from 'react';
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
    X,
    LayoutGrid,
    AlignLeft
} from 'lucide-react';

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
        const list: (AssetDetail & { parentId: string })[] = [];
        history.forEach(res => {
            if (res.output?.actifs) {
                res.output.actifs.forEach(a => {
                    list.push({ ...a, parentId: res.id });
                });
            }
        });

        return list.filter(a => {
            const matchesSearch = a.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.proprietaire_declare.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (a.localisation || '').toLowerCase().includes(searchQuery.toLowerCase());

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
            case 'immobilier': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'vehicule': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'compte_bancaire': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'societe': return 'text-purple-600 bg-purple-50 border-purple-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

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
                        <span className="block text-xs font-black text-slate-800 uppercase tracking-[0.4em]">Audit Patrimonial en Cours</span>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">Recensement des actifs et propriétés...</span>
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
                            <Briefcase className="text-white" size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl lg:text-2xl font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight leading-none">
                                    Inventaire du <span className="text-[#B91C1C]">Patrimoine</span>
                                </h2>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Asset Unit-09</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    Wealth Audit Active
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center bg-slate-50 border border-slate-100 p-1 rounded-xl shadow-inner">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <LayoutGrid size={12} className="inline mr-2" /> Grille
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <AlignLeft size={12} className="inline mr-2" /> Liste
                            </button>
                        </div>

                        <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>

                        <div className="relative group">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#B91C1C] transition-colors" />
                            <input
                                type="text"
                                placeholder="Rechercher bien, propriétaire..."
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
                    {/* Patrimoine Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <StatCard
                            icon={DollarSign}
                            label="Patrimoine Total Estimé"
                            value={formatCurrency(stats.totalValue)}
                            color="#B91C1C"
                            subText={`${stats.count} Actifs identifiés`}
                        />
                        <StatCard
                            icon={Building2}
                            label="Actifs Immobiliers"
                            value={stats.typeCounts['immobilier']?.toString() || '0'}
                            color="#2563EB"
                            subText="Propriétés et terrains"
                        />
                        <StatCard
                            icon={Wallet}
                            label="Capitaux Bancaires"
                            value={stats.typeCounts['compte_bancaire']?.toString() || '0'}
                            color="#10B981"
                            subText="Comptes et placements"
                        />
                        <StatCard
                            icon={Globe}
                            label="Entités de Référence"
                            value={stats.typeCounts['societe']?.toString() || '0'}
                            color="#0F172A"
                            subText="Holdings et sociétés"
                        />
                    </div>

                    {/* Filter Bar */}
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic">Classification des Biens</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
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
                        <div className="py-40 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm border-dashed">
                            <Briefcase size={48} className="mx-auto text-slate-100 mb-6" />
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest font-serif-legal italic mb-2">Aucun Actif Trouvé</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Le patrimoine n'a pas encore été identifié dans les documents</p>
                        </div>
                    )}
                </div>
            </div>

            <footer className="px-10 py-5 bg-white border-t border-slate-100 flex justify-between items-center z-30 shrink-0">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#B91C1C]"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Calcul Neural Actif</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] italic">Forensic-Asset-Scanner // Unit.09</span>
                    <div className="h-4 w-px bg-slate-100"></div>
                    <button className="text-[10px] font-black text-[#B91C1C] hover:text-[#7F1D1D] transition-colors flex items-center gap-2">
                        <Download size={12} /> RAPPORT DE PATRIMOINE
                    </button>
                </div>
            </footer>
        </div>
    );
};

const StatCard: React.FC<{ icon: any, label: string, value: string, color: string, subText: string }> = ({ icon: Icon, label, value, color, subText }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
            <Icon size={80} />
        </div>
        <div className="relative z-10">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div> {label}
            </div>
            <div className="text-2xl font-mono-data font-black text-[#0F172A] tracking-tighter mb-2 italic">
                {value}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{subText}</p>
        </div>
    </div>
);

const FilterTypeButton: React.FC<{ active: boolean, onClick: () => void, label: string }> = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${active ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
    >
        {label}
    </button>
);

const AssetCard: React.FC<{ asset: any, formatCurrency: any, getTypeIcon: any, getTypeColor: any }> = ({ asset, formatCurrency, getTypeIcon, getTypeColor }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${getTypeColor(asset.type)} shadow-inner`}>
            {getTypeIcon(asset.type)}
        </div>

        <div className="mb-4">
            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{asset.type}</div>
            <h3 className="text-lg font-black text-slate-900 font-serif-legal italic truncate leading-tight group-hover:text-[#B91C1C] transition-colors">
                {asset.nom}
            </h3>
        </div>

        {asset.valeur_estimee && (
            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Valeur Estimée</div>
                <div className="text-xl font-mono-data font-black text-slate-900">
                    {formatCurrency(asset.valeur_estimee, asset.devise)}
                </div>
            </div>
        )}

        <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
                <User size={14} className="text-slate-300 shrink-0 mt-0.5" />
                <div className="min-w-0">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Propriétaire</div>
                    <div className="text-[11px] font-bold text-slate-700 truncate">{asset.proprietaire_declare}</div>
                </div>
            </div>
            {asset.localisation && (
                <div className="flex items-start gap-3">
                    <MapPin size={14} className="text-slate-300 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Localisation</div>
                        <div className="text-[11px] font-bold text-slate-700 truncate">{asset.localisation}</div>
                    </div>
                </div>
            )}
        </div>

        <div className="pt-6 border-t border-slate-50 relative">
            <p className="text-[11px] text-slate-500 italic leading-relaxed line-clamp-2">
                "{asset.description}"
            </p>
        </div>

        {/* Decoration */}
        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-slate-50 to-transparent pointer-events-none"></div>
    </div>
);

const AssetRow: React.FC<{ asset: any, formatCurrency: any, getTypeIcon: any, getTypeColor: any }> = ({ asset, formatCurrency, getTypeIcon, getTypeColor }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-8 group">
        <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all ${getTypeColor(asset.type)}`}>
            {getTypeIcon(asset.type)}
        </div>

        <div className="w-1/4">
            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{asset.type}</div>
            <h3 className="text-[14px] font-black text-slate-900 font-serif-legal italic truncate group-hover:text-[#B91C1C] transition-colors">
                {asset.nom}
            </h3>
        </div>

        <div className="w-1/6">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Valeur</div>
            <div className="text-[14px] font-mono-data font-black text-slate-900">
                {asset.valeur_estimee ? formatCurrency(asset.valeur_estimee, asset.devise) : 'N/A'}
            </div>
        </div>

        <div className="w-1/6">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Propriétaire</div>
            <div className="text-[11px] font-bold text-slate-700 truncate">{asset.proprietaire_declare}</div>
        </div>

        <div className="flex-1">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</div>
            <p className="text-[11px] text-slate-500 italic truncate italic">"{asset.description}"</p>
        </div>

        <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-[#B91C1C] hover:text-white transition-all opacity-0 group-hover:opacity-100">
            <Maximize2 size={16} />
        </button>
    </div>
);
