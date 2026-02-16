import React, { ReactNode } from 'react';
import { LucideIcon, ShieldCheck, Search } from 'lucide-react';

interface StatsItem {
    label: string;
    value: string | number;
    color?: string;
    icon?: ReactNode;
}

interface PageHeaderProps {
    title: string;
    titleHighlight: string;
    icon: LucideIcon;
    badgeText?: string;
    stats?: StatsItem[];
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
    searchPlaceholder?: string;
    children?: ReactNode; // For filters or extra actions
    totalLabel?: string;
    totalCount?: number | string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    titleHighlight,
    icon: Icon,
    badgeText = "",
    stats = [],
    searchQuery,
    onSearchChange,
    searchPlaceholder = "Rechercher...",
    children,
    totalLabel,
    totalCount
}) => {
    return (
        <header className="px-6 lg:px-8 py-5 border-b border-slate-100 bg-white/95 backdrop-blur-2xl z-40 shadow-sm relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-slate-50/50 to-transparent pointer-events-none opacity-30"></div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-[#020617] rounded-xl flex items-center justify-center shadow-xl group transition-all hover:rotate-6">
                        <Icon className="text-white group-hover:scale-110 transition-transform" size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl lg:text-2xl font-black text-[#020617] font-display tracking-tight leading-none">
                                {title} <span className="text-[#DC2626]">{titleHighlight}</span>
                            </h2>
                            <span className="badge-forensic bg-slate-50 text-slate-300 border-slate-100 px-2 py-0.5 text-[8px]">{badgeText}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 align-middle">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    {/* If it's the first item, show a pulse dot, otherwise just the icon or dot */}
                                    {idx === 0 && !stat.icon ? (
                                        <div className={`w-1.5 h-1.5 rounded-full ${stat.color || 'bg-[#DC2626]'} animate-pulse`}></div>
                                    ) : stat.icon}

                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pt-[2px]">{stat.value} {stat.label}</span>
                                    {idx < stats.length - 1 && <div className="h-3 w-px bg-slate-100 ml-2"></div>}
                                </div>
                            ))}

                            {/* Default stats if none provided, matching Archive Centrales look approximately */}
                            {stats.length === 0 && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse"></div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Indexation Forensique</span>
                                    </div>
                                    <div className="h-3 w-px bg-slate-100"></div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={12} className="text-[#DC2626]" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Niveau 5</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {onSearchChange && (
                    <div className="relative group w-full lg:w-[350px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#DC2626] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-12 pr-6 text-[13px] text-[#020617] w-full focus:bg-white focus:border-[#DC2626] outline-none transition-all shadow-inner placeholder-slate-300 font-bold"
                        />
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4 mt-8 relative z-10 w-full">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear-fade flex-1">
                    {children}
                </div>

                {(totalCount !== undefined) && (
                    <div className="hidden md:flex flex-col items-end shrink-0 pl-4 border-l border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{totalLabel || 'Total'}</span>
                        <span className="text-xl font-mono-data font-black text-[#DC2626] leading-none mt-0.5">{totalCount}</span>
                    </div>
                )}
            </div>
        </header>
    );
};
