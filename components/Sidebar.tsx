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
    Activity,
    Search,
    BookOpen
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
            className={`bg-[#080808] border-r border-[#1A1A1A] flex flex-col h-screen sticky top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'w-20' : 'w-20 lg:w-[260px]'
                }`}
        >
            {/* COLLAPSE TOGGLE */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full hidden lg:flex items-center justify-center text-[#555] hover:text-white transition-all z-[60] shadow-lg hover:border-[#F2B8B5]/40"
            >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>

            {/* LOGO AREA */}
            <div className={`p-6 transition-all duration-500 ${isCollapsed ? 'px-4' : 'px-6'}`}>
                <div className="flex items-center gap-3 mb-10 group cursor-pointer whitespace-nowrap px-2">
                    <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-[#F2B8B5] blur-lg opacity-10 group-hover:opacity-30 transition-opacity"></div>
                        <div className="relative w-10 h-10 bg-[#121212] rounded-xl flex items-center justify-center border border-[#2A2A2A] group-hover:border-[#F2B8B5]/50 transition-colors">
                            <ShieldCheck className="text-[#F2B8B5]" size={20} />
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="hidden lg:block animate-in fade-in slide-in-from-left-2">
                            <h1 className="font-bold text-white tracking-wider text-lg uppercase leading-none">
                                DOJ <span className="text-[#F2B8B5]/80 font-normal">Forensic</span>
                            </h1>
                            <span className="text-[9px] font-medium text-[#555] uppercase tracking-[0.2em] mt-1 block">Analytical Unit</span>
                        </div>
                    )}
                </div>

                {/* ACTION BUTTON */}
                <button
                    onClick={onNewAnalysis}
                    className="w-full mb-8 group relative px-1"
                >
                    <div className="absolute inset-0 bg-[#F2B8B5] blur-md opacity-0 group-hover:opacity-10 transition-opacity rounded-xl"></div>
                    <div className={`relative w-full flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start lg:px-4'} h-12 bg-[#121212] hover:bg-[#1A1A1A] text-white rounded-xl transition-all duration-300 border border-[#2A2A2A] group-hover:border-[#F2B8B5]/40 active:scale-95`}>
                        <Plus size={18} className="text-[#F2B8B5] shrink-0" />
                        {!isCollapsed && <span className="hidden lg:block font-bold text-[11px] uppercase tracking-widest ml-3 animate-in fade-in whitespace-nowrap">Démarrer Analyse</span>}
                    </div>
                </button>

                {/* NAVIGATION */}
                <nav className="space-y-1.5 px-1">
                    <div className={`text-[10px] font-bold text-[#333] uppercase tracking-[0.2em] mb-4 ml-3 ${isCollapsed ? 'hidden' : 'hidden lg:block'}`}>Investigation</div>
                    {menuItems.map((item) => {
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id as ViewType)}
                                className={`w-full relative flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start lg:px-4'} h-11 rounded-xl transition-all duration-300 group ${isActive
                                    ? 'bg-[#121212] text-white border border-[#2A2A2A]'
                                    : 'text-[#666] hover:text-[#BBB] hover:bg-[#121212]/50'}`}
                                title={isCollapsed ? item.label : ''}
                            >
                                {isActive && (
                                    <div className="absolute left-[-4px] w-1 h-4 bg-[#F2B8B5] rounded-full shadow-[0_0_8px_#F2B8B5]"></div>
                                )}
                                <item.icon
                                    size={18}
                                    className={`shrink-0 transition-colors duration-300 ${isActive ? item.color : 'group-hover:text-[#AAA]'}`}
                                />
                                {!isCollapsed && (
                                    <span className={`hidden lg:block text-[13px] font-medium tracking-tight ml-3 transition-all duration-200 ${isActive ? 'text-white' : 'opacity-80'}`}>
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* FOOTER */}
            <div className={`mt-auto p-4 transition-all duration-500 overflow-hidden ${isCollapsed ? 'px-4' : 'px-6'} pb-8`}>
                <div className={`text-[10px] font-bold text-[#333] uppercase tracking-[0.2em] mb-4 ml-3 ${isCollapsed ? 'hidden' : 'hidden lg:block'}`}>Système</div>
                <div className="space-y-1.5">
                    <button
                        onClick={onToggleLogs}
                        className={`w-full flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start lg:px-4'} h-11 rounded-xl text-[#555] hover:bg-[#121212] hover:text-[#6DD58C] transition-all group border border-transparent`}
                        title={isCollapsed ? 'Console Système' : ''}
                    >
                        <Activity
                            size={16}
                            className={`group-hover:animate-pulse transition-all shrink-0`}
                        />
                        {!isCollapsed && <span className="hidden lg:block text-[11px] font-bold uppercase tracking-widest ml-3 animate-in fade-in">Console</span>}
                    </button>

                    <button
                        onClick={onOpenSettings}
                        className={`w-full flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start lg:px-4'} h-11 rounded-xl text-[#555] hover:bg-[#121212] hover:text-white transition-all group border border-transparent`}
                        title={isCollapsed ? 'Paramètres' : ''}
                    >
                        <Settings
                            size={16}
                            className="group-hover:rotate-90 transition-transform duration-500 shrink-0"
                        />
                        {!isCollapsed && <span className="hidden lg:block text-[11px] font-bold uppercase tracking-widest ml-3 animate-in fade-in">Configuration</span>}
                    </button>
                </div>

                {!isCollapsed && (
                    <div className="hidden lg:flex mt-6 items-center gap-3 px-4 py-3 bg-[#0D0D0D] rounded-xl border border-[#1A1A1A] animate-in fade-in">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6DD58C] shadow-[0_0_8px_rgba(109,213,140,0.4)]"></div>
                        <span className="text-[9px] font-bold text-[#444] uppercase tracking-[0.1em]">Node Intel Active</span>
                    </div>
                )}
            </div>
        </aside>
    );
};

