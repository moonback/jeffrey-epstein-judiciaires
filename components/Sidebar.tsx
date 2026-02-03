import React, { useState } from 'react';
import {
    Terminal,
    Database,
    Share2,
    Clock,
    AlertTriangle,
    Users,
    Settings,
    Plus,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Activity
} from 'lucide-react';

export type ViewType = 'lab' | 'database' | 'network' | 'timeline' | 'contradictions' | 'poi';

interface SidebarProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    onOpenSettings: () => void;
    onNewAnalysis: () => void;
    onToggleLogs: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    currentView,
    onViewChange,
    onOpenSettings,
    onNewAnalysis,
    onToggleLogs
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { id: 'lab', label: 'Laboratoire', icon: Terminal, color: 'text-[#F2B8B5]' },
        { id: 'database', label: 'Base de Données', icon: Database, color: 'text-[#8AB4F8]' },
        { id: 'network', label: 'Réseau d\'Influence', icon: Share2, color: 'text-[#C6A7FB]' },
        { id: 'timeline', label: 'Chronologie', icon: Clock, color: 'text-[#FFD54F]' },
        { id: 'contradictions', label: 'Détecteur Dev', icon: AlertTriangle, color: 'text-[#F44336]' },
        { id: 'poi', label: 'Cibles (POI)', icon: Users, color: 'text-[#4DB6AC]' },
    ];

    return (
        <aside
            className={`bg-[#0A0A0A] border-r border-[#1F1F1F] flex flex-col h-screen sticky top-0 z-50 transition-all duration-500 ease-in-out ${isCollapsed ? 'w-20' : 'w-20 lg:w-[280px]'
                }`}
        >
            {/* COLLAPSE TOGGLE BUGTON */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-24 w-6 h-6 bg-[#1F1F1F] border border-[#2D2D2D] rounded-full hidden lg:flex items-center justify-center text-[#757775] hover:text-white transition-all z-[60] shadow-xl"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* LOGO AREA */}
            <div className={`p-8 pb-4 transition-all duration-500 overflow-hidden ${isCollapsed ? 'px-4' : ''}`}>
                <div className="flex items-center gap-4 mb-10 group cursor-pointer whitespace-nowrap">
                    <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-[#F2B8B5] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-br from-[#F2B8B5] to-[#601410] rounded-[18px] flex items-center justify-center border border-white/10 shadow-2xl">
                            <ShieldCheck className="text-white" size={24} />
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="hidden lg:block animate-in fade-in slide-in-from-left-2">
                            <h1 className="font-black text-white tracking-tighter text-2xl leading-none">
                                DOJ<span className="text-[#F2B8B5]">Forensic</span>
                            </h1>
                            <span className="text-[10px] font-black text-[#757775] uppercase tracking-[0.3em] mt-1 block">Advanced Analyzer</span>
                        </div>
                    )}
                </div>

                {/* ACTION BUTTON */}
                <button
                    onClick={onNewAnalysis}
                    className="w-full mb-10 group relative"
                >
                    <div className="absolute inset-0 bg-[#F2B8B5] blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl"></div>
                    <div className={`relative w-full flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start'} gap-4 bg-[#F2B8B5] hover:bg-white text-[#370003] p-4 rounded-2xl transition-all duration-300 transform active:scale-95 border border-white/20`}>
                        <Plus size={20} className="stroke-[3] shrink-0" />
                        {!isCollapsed && <span className="hidden lg:block font-black text-[12px] uppercase tracking-[0.15em] whitespace-nowrap animate-in fade-in">Nouvelle Analyse</span>}
                    </div>
                </button>

                {/* NAVIGATION */}
                <nav className="space-y-2">
                    {menuItems.map((item) => {
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id as ViewType)}
                                className={`w-full relative flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start'} gap-5 p-4 rounded-2xl transition-all duration-300 group ${isActive
                                    ? 'bg-[#1A1A1A] text-white shadow-xl border border-white/5'
                                    : 'text-[#757775] hover:text-white hover:bg-white/5'}`}
                                title={isCollapsed ? item.label : ''}
                            >
                                {isActive && (
                                    <div className="absolute left-0 w-1.5 h-6 bg-[#F2B8B5] rounded-r-full shadow-[0_0_15px_#F2B8B5]"></div>
                                )}
                                <item.icon
                                    size={20}
                                    className={`shrink-0 transition-colors duration-300 ${isActive ? item.color : 'group-hover:text-white'}`}
                                />
                                {!isCollapsed && (
                                    <span className={`hidden lg:block text-sm font-bold tracking-tight transition-all duration-300 whitespace-nowrap animate-in fade-in ${isActive ? 'translate-x-1' : 'opacity-80 group-hover:opacity-100'}`}>
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* FOOTER */}
            <div className={`mt-auto p-8 transition-all duration-500 overflow-hidden ${isCollapsed ? 'px-4' : ''} space-y-2`}>
                <button
                    onClick={onToggleLogs}
                    className={`w-full flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start'} gap-5 p-4 rounded-2xl text-[#757775] hover:bg-white/5 hover:text-[#6DD58C] transition-all group border border-transparent hover:border-[#6DD58C]/20`}
                    title={isCollapsed ? 'Console Système' : ''}
                >
                    <Activity
                        size={20}
                        className="group-hover:animate-pulse transition-all shrink-0"
                    />
                    {!isCollapsed && <span className="hidden lg:block text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap animate-in fade-in">Console Système</span>}
                </button>

                <button
                    onClick={onOpenSettings}
                    className={`w-full flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start'} gap-5 p-4 rounded-2xl text-[#757775] hover:bg-white/5 hover:text-white transition-all group border border-transparent hover:border-white/5`}
                    title={isCollapsed ? 'Paramètres' : ''}
                >
                    <Settings
                        size={20}
                        className="group-hover:rotate-90 transition-transform duration-500 shrink-0"
                    />
                    {!isCollapsed && <span className="hidden lg:block text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap animate-in fade-in">Paramètres</span>}
                </button>

                <div className={`mt-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4 py-3'} bg-[#1A1A1A]/30 rounded-2xl border border-white/5 min-h-[44px]`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6DD58C] shadow-[0_0_8px_#6DD58C] shrink-0"></div>
                    {!isCollapsed && <span className="hidden lg:block text-[11px] font-bold text-[#757775] uppercase tracking-widest whitespace-nowrap animate-in fade-in">Sys. Integrity OK</span>}
                </div>
            </div>
        </aside>
    );
};
