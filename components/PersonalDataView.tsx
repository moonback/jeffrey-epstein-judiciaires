import React, { useMemo, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { ProcessedResult, PIIDetail } from '../types';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Fingerprint,
    Shield,
    Search,
    Filter,
    ArrowRight,
    Copy,
    Check,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';

export const PersonalDataView: React.FC = () => {
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSensible, setShowSensible] = useState(false);
    const [copiedValue, setCopiedValue] = useState<string | null>(null);

    useEffect(() => {
        storageService.getAllResults().then(data => {
            setHistory(data);
            setLoading(false);
        });
    }, []);

    const allData = useMemo(() => {
        const list: (PIIDetail & { sourceId: string })[] = [];

        history.forEach(res => {
            if (res.output?.donnees_personnelles) {
                res.output.donnees_personnelles.forEach(d => {
                    list.push({ ...d, sourceId: res.id });
                });
            }
        });

        return list.filter(d =>
            d.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.context || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [history, searchQuery]);

    const groupedByOwner = useMemo(() => {
        const groups: Record<string, typeof allData> = {};
        allData.forEach(d => {
            if (!groups[d.owner]) groups[d.owner] = [];
            groups[d.owner].push(d);
        });
        return groups;
    }, [allData]);

    const handleCopy = (value: string) => {
        navigator.clipboard.writeText(value);
        setCopiedValue(value);
        setTimeout(() => setCopiedValue(null), 2000);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-[#0F172A]">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-2 border-slate-700 border-t-red-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Extraction des données PII...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden relative font-sans">
            <header className="px-10 py-8 border-b border-slate-100 bg-white z-30 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-white shadow-2xl rotate-2">
                            <Fingerprint size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase italic font-serif-legal tracking-tight">
                                Données <span className="text-[#B91C1C]">Personnelles</span>
                            </h2>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">PII Extraction & OSINT Intelligence</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowSensible(!showSensible)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${showSensible ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
                        >
                            {showSensible ? <Eye size={14} /> : <EyeOff size={14} />}
                            {showSensible ? 'Masquer Sensible' : 'Afficher Sensible'}
                        </button>

                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un nom, email..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="bg-slate-50 border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-xs font-medium w-64 focus:w-80 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#F8FAFC]">
                <div className="max-w-6xl mx-auto space-y-12">
                    {Object.keys(groupedByOwner).length > 0 ? (
                        Object.entries(groupedByOwner).map(([owner, items]) => (
                            <section key={owner} className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm">
                                        <User size={18} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 font-serif-legal italic uppercase">{owner}</h3>
                                    <div className="h-px flex-1 bg-slate-200"></div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">
                                        {items.length} Entrées trouvées
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {items.map((item, idx) => (
                                        <DataCard
                                            key={idx}
                                            item={item}
                                            showSensible={showSensible}
                                            onCopy={handleCopy}
                                            isCopied={copiedValue === item.value}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))
                    ) : (
                        <div className="py-20 text-center">
                            <Shield size={48} className="mx-auto text-slate-200 mb-6" />
                            <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest font-serif-legal italic">Aucune donnée personnelle identifiée</h3>
                            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-2">Le scan PII n'a retourné aucun résultat probant</p>
                        </div>
                    )}
                </div>
            </main>

            <footer className="px-10 py-4 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Lock size={12} className="text-emerald-500" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocole de Sécurité PII-Alpha</span>
                    </div>
                </div>
                <div className="text-[8px] font-black text-slate-200 uppercase tracking-[0.5em]">Forensic Privacy Unit</div>
            </footer>
        </div>
    );
};

const DataCard: React.FC<{
    item: PIIDetail,
    showSensible: boolean,
    onCopy: (val: string) => void,
    isCopied: boolean
}> = ({ item, showSensible, onCopy, isCopied }) => {

    const getTypeInfo = (type: string) => {
        switch (type) {
            case 'email': return { icon: Mail, color: 'text-blue-500 bg-blue-50', label: 'Email' };
            case 'phone': return { icon: Phone, color: 'text-emerald-500 bg-emerald-50', label: 'Téléphone' };
            case 'address': return { icon: MapPin, color: 'text-amber-500 bg-amber-50', label: 'Adresse' };
            case 'passport': return { icon: Shield, color: 'text-purple-500 bg-purple-50', label: 'Passeport' };
            case 'ssn': return { icon: Lock, color: 'text-red-500 bg-red-50', label: 'N° Sécurité Soc.' };
            default: return { icon: Fingerprint, color: 'text-slate-500 bg-slate-50', label: 'Information' };
        }
    };

    const info = getTypeInfo(item.type);
    const Icon = info.icon;

    const isSensible = ['passport', 'ssn'].includes(item.type);
    const displayValue = (isSensible && !showSensible)
        ? '•••• •••• ••••'
        : item.value;

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${info.color}`}>
                    <Icon size={14} />
                </div>
                <button
                    onClick={() => onCopy(item.value)}
                    className={`text-slate-300 hover:text-slate-600 transition-colors p-1.5 rounded-md hover:bg-slate-50 ${isCopied ? 'text-emerald-500' : ''}`}
                >
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>

            <div className="space-y-1">
                <div className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">{info.label}</div>
                <div className={`text-sm font-black font-mono-data tracking-tight truncate ${isSensible && !showSensible ? 'opacity-20 select-none' : 'text-slate-800'}`}>
                    {displayValue}
                </div>
            </div>

            {item.context && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                    <p className="text-[10px] text-slate-400 italic leading-relaxed line-clamp-2">
                        "{item.context}"
                    </p>
                </div>
            )}
        </div>
    );
};
