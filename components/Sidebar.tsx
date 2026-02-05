/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
    BookOpen,
    Archive,
    Lock,
    Cpu,
    ShieldAlert,
    DollarSign,
    Link2,
    Mic,
    Briefcase,
    Plane
} from 'lucide-react';

export type ViewType = 'lab' | 'database' | 'network' | 'timeline' | 'contradictions' | 'poi' | 'finance' | 'assets' | 'cross' | 'voice' | 'epstein_docs' | 'flights';

interface SidebarProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    onOpenSettings: () => void;
    onNewAnalysis: () => void;
    onToggleLogs: () => void;
    onLogout: () => void;
    isGuestMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
    currentView,
    onViewChange,
    onOpenSettings,
    onNewAnalysis,
    onToggleLogs,
    onLogout,
    isGuestMode
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { id: 'lab', label: 'Laboratoire', icon: Terminal, color: 'text-[#B91C1C]', adminOnly: true },
        { id: 'database', label: 'Archives Centrales', icon: Database, color: 'text-[#0F4C81]' },
        { id: 'epstein_docs', label: 'Archives Epstein', icon: Briefcase, color: 'text-[#B91C1C]', adminOnly: true },
        { id: 'network', label: 'Cartographie', icon: Share2, color: 'text-[#0F4C81]' },
        { id: 'timeline', label: 'Chronologie', icon: Clock, color: 'text-[#B91C1C]' },
        { id: 'finance', label: 'Flux Financiers', icon: DollarSign, color: 'text-[#B91C1C]' },
        { id: 'assets', label: 'Patrimoine', icon: Archive, color: 'text-[#B91C1C]' },
        { id: 'cross', label: 'Intelligence Croisée', icon: Link2, color: 'text-[#0F4C81]' },
        { id: 'contradictions', label: 'Contradictions', icon: ShieldAlert, color: 'text-[#0F4C81]' },
        { id: 'poi', label: 'Index des Cibles', icon: Users, color: 'text-[#B91C1C]' },
        { id: 'flights', label: 'Vols & Manifestes', icon: Plane, color: 'text-[#B91C1C]' },
        { id: 'voice', label: 'Assistant Vocal', icon: Mic, color: 'text-[#B91C1C]', adminOnly: true },
    ].filter(item => !isGuestMode || !item.adminOnly);

    return (
        <aside
            className={`bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl relative ${isCollapsed ? 'w-16' : 'w-16 lg:w-[240px]'
                }`}
        >
            {/* COLLAPSE TOGGLE */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 w-7 h-7 bg-white border border-slate-100 rounded-full hidden lg:flex items-center justify-center text-slate-300 hover:text-[#B91C1C] transition-all z-[60] shadow-xl hover:scale-110 active:scale-95"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* SCROLLABLE AREA: LOGO + ACTION + NAV */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar pt-4 pb-2 transition-all duration-500 ${isCollapsed ? 'px-3' : 'px-5'}`}>
                <div className="flex items-center gap-4 mb-6 group cursor-pointer whitespace-nowrap" onClick={() => !isGuestMode && onViewChange('lab')}>
                    <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-[#B91C1C] blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        <div className="relative w-11 h-11 bg-black rounded-[1rem] flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:bg-[#B91C1C] group-hover:rotate-[360deg]">
                            <ShieldCheck className="text-white" size={20} />
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="hidden lg:block animate-pro-reveal duration-500">
                            <h1 className="font-black text-[#0F172A] tracking-tighter text-lg uppercase leading-none font-serif-legal italic">
                                DOJ <span className="text-[#B91C1C]">Forensic</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">Analytical Unit 4.2</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ACTION BUTTON - PREMIUM */}
                {!isGuestMode && (
                    <button
                        onClick={onNewAnalysis}
                        className="w-full mb-6 group relative"
                    >
                        <div className={`relative w-full flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start lg:px-5'} h-10 bg-[#B91C1C] hover:bg-[#0F172A] text-white rounded-xl transition-all duration-500 shadow-xl shadow-red-900/10 hover:shadow-slate-900/20 active:scale-95 overflow-hidden`}>
                            <div className="absolute inset-x-0 h-px top-0 bg-white/20"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <Plus size={18} className="shrink-0 group-hover:rotate-90 transition-transform duration-500" />
                            {!isCollapsed && <span className="hidden lg:block font-black text-[9px] uppercase tracking-[0.3em] ml-4 transition-all whitespace-nowrap">Nouvelle Investigation</span>}
                        </div>
                    </button>
                )}

                {/* NAVIGATION */}
                <nav className="space-y-1 pb-2" aria-label="Menu principal d'investigation">
                    <div className={`text-[8px] font-black text-slate-200 uppercase tracking-[0.5em] mb-2 ml-4 ${isCollapsed ? 'hidden' : 'hidden lg:block'}`}>Investigation Suite</div>
                    {menuItems.map((item) => {
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id as ViewType)}
                                className={`w-full relative flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start lg:px-5'} h-10 rounded-xl transition-all duration-500 group ${isActive
                                    ? 'bg-[#F8FAFC] text-[#0F172A] shadow-inner border border-slate-50'
                                    : 'text-slate-400 hover:text-[#B91C1C] hover:bg-slate-50/50'}`}
                                title={isCollapsed ? item.label : ''}
                                aria-label={item.label}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {isActive && (
                                    <div className="absolute left-0 w-1 h-5 bg-[#B91C1C] rounded-r-full shadow-[0_0_8px_rgba(185,28,28,0.3)]"></div>
                                )}
                                <item.icon
                                    size={18}
                                    className={`shrink-0 transition-all duration-500 ${isActive ? item.color : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}
                                    aria-hidden="true"
                                />
                                {!isCollapsed && (
                                    <span className={`hidden lg:block text-[13px] font-black tracking-tight ml-4 transition-all duration-300 font-serif-legal italic ${isActive ? 'translate-x-1' : 'opacity-60 group-hover:opacity-100'}`}>
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* FOOTER */}
            <div className={`mt-auto p-4 transition-all duration-500 overflow-hidden ${isCollapsed ? 'px-2' : 'px-4'} pb-4`}>
                <div className="space-y-0.5">
                    <button
                        onClick={onToggleLogs}
                        className={`w-full flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start lg:px-4'} h-8 rounded-lg text-slate-300 hover:bg-slate-50 hover:text-[#0F4C81] transition-all group border border-transparent`}
                        title={isCollapsed ? 'Console Système' : ''}
                    >
                        <Activity
                            size={14}
                            className={`group-hover:animate-pulse transition-all shrink-0`}
                        />
                        {!isCollapsed && <span className="hidden lg:block text-[9px] font-black uppercase tracking-[0.3em] ml-3 transition-all duration-300">Console Monitor</span>}
                    </button>

                    <button
                        onClick={onOpenSettings}
                        className={`w-full flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start lg:px-4'} h-8 rounded-lg text-slate-300 hover:bg-slate-50 hover:text-[#B91C1C] transition-all group border border-transparent`}
                        title={isCollapsed ? 'Paramètres' : ''}
                    >
                        <Settings
                            size={14}
                            className="group-hover:rotate-180 transition-transform duration-700 shrink-0"
                        />
                        {!isCollapsed && <span className="hidden lg:block text-[9px] font-black uppercase tracking-[0.3em] ml-3 transition-all duration-300">Protocole Config</span>}
                    </button>

                    {/* NEW LOGIN/LOGOUT BUTTON */}
                    <button
                        onClick={onLogout}
                        className={`w-full mt-2 flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start lg:px-4'} h-10 rounded-xl transition-all group border ${isGuestMode
                            ? 'bg-[#B91C1C] text-white border-red-700 shadow-lg shadow-red-900/20 hover:bg-[#0F172A]'
                            : 'bg-white text-slate-400 border-slate-100 hover:text-[#B91C1C] hover:border-[#B91C1C]'}`}
                        title={isCollapsed ? (isGuestMode ? 'Connexion' : 'Déconnexion') : ''}
                    >
                        <Lock
                            size={16}
                            className={`${isGuestMode ? 'text-white' : 'group-hover:text-[#B91C1C]'} transition-colors shrink-0`}
                        />
                        {!isCollapsed && (
                            <span className={`hidden lg:block text-[10px] font-black uppercase tracking-[0.3em] ml-3 transition-all duration-300 ${isGuestMode ? 'text-white' : ''}`}>
                                {isGuestMode ? 'Connexion Analyste' : 'Clôturer Session'}
                            </span>
                        )}
                    </button>
                </div>

                {!isCollapsed && (
                    <div className="hidden lg:flex mt-3 items-center gap-2 px-3 py-2 bg-[#F8FAFC] rounded-xl border border-slate-50 group cursor-help transition-all hover:bg-white hover:shadow-xl">
                        <div className="relative shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse"></div>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[8px] font-black text-[#0F172A] uppercase tracking-wider truncate leading-none mb-0.5">Node_01_SECURE</span>
                            <div className="flex items-center gap-1">
                                <Lock size={6} className="text-emerald-600 shrink-0" />
                                <span className="text-[6px] text-slate-300 font-bold uppercase tracking-widest leading-none">TLS 1.3 ENABLED</span>
                            </div>
                        </div>
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <Cpu size={10} className="text-slate-200" />
                        </div>
                    </div>
                )}
            </div>

            {/* Side Accent */}
            <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-[#B91C1C]/10 to-transparent"></div>
        </aside>
    );
};
