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
    Plane,
    Fingerprint,
    Network
} from 'lucide-react';

export type ViewType = 'lab' | 'database' | 'network' | 'timeline' | 'actors' | 'contradictions' | 'poi' | 'finance' | 'assets' | 'cross' | 'voice' | 'flights' | 'discovery' | 'background_ai';

interface SidebarProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    onOpenSettings: () => void;
    onNewAnalysis: () => void;
    onToggleLogs: () => void;
    onLogout: () => void;
    isGuestMode?: boolean;
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    currentView,
    onViewChange,
    onOpenSettings,
    onNewAnalysis,
    onToggleLogs,
    onLogout,
    isGuestMode,
    isMobileOpen,
    onMobileClose
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { id: 'lab', label: 'Laboratoire', icon: Terminal, color: 'text-[#B91C1C]', adminOnly: true },
        { id: 'database', label: 'Archives Centrales', icon: Database, color: 'text-[#0F4C81]' },
        { id: 'network', label: 'Cartographie', icon: Share2, color: 'text-[#0F4C81]' },
        { id: 'timeline', label: 'Chronologie', icon: Clock, color: 'text-[#B91C1C]' },
        { id: 'actors', label: 'Acteurs Clés', icon: Fingerprint, color: 'text-[#B91C1C]' },
        { id: 'finance', label: 'Flux Financiers', icon: DollarSign, color: 'text-[#B91C1C]' },
        { id: 'assets', label: 'Patrimoine', icon: Archive, color: 'text-[#B91C1C]' },
        { id: 'cross', label: 'Intelligence Croisée', icon: Link2, color: 'text-[#0F4C81]' },
        { id: 'contradictions', label: 'Contradictions', icon: ShieldAlert, color: 'text-[#0F4C81]' },
        { id: 'poi', label: 'Index des Cibles', icon: Users, color: 'text-[#B91C1C]' },
        { id: 'discovery', label: 'Découverte IA', icon: Network, color: 'text-[#B91C1C]', adminOnly: true },
        { id: 'background_ai', label: 'Intelligence Scan', icon: Cpu, color: 'text-[#B91C1C]', adminOnly: true },
        { id: 'flights', label: 'Vols & Manifestes', icon: Plane, color: 'text-[#B91C1C]' },
        { id: 'voice', label: 'Assistant Vocal', icon: Mic, color: 'text-[#B91C1C]', adminOnly: true },
    ].filter(item => !isGuestMode || !item.adminOnly);

    // Mobile Overlay
    const mobileOverlay = (
        <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            onClick={onMobileClose}
            aria-hidden="true"
        />
    );

    return (
        <>
            {mobileOverlay}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 bg-white/90 backdrop-blur-2xl border-r border-slate-200 shadow-2xl transition-all duration-300 ease-in-out
                    flex flex-col h-[100dvh]
                    lg:sticky lg:top-0 lg:h-screen lg:shadow-none lg:bg-white/80
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'}
                    w-[280px] sm:w-[320px] 
                `}
            >
                {/* COLLAPSE TOGGLE (Desktop Only) */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-[#B91C1C] transition-all z-[60] shadow-md hover:scale-110 active:scale-95"
                    aria-label={isCollapsed ? "Déplier le menu" : "Replier le menu"}
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* MOBILE CLOSE BUTTON */}
                <button
                    onClick={onMobileClose}
                    className="lg:hidden absolute right-4 top-4 p-2 text-slate-400 hover:text-[#B91C1C] transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>


                {/* SCROLLABLE AREA: LOGO + ACTION + NAV */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar pt-6 pb-4 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-5'}`}>
                    <div
                        className={`flex items-center gap-3 mb-8 group cursor-pointer whitespace-nowrap ${isCollapsed ? 'justify-center' : ''}`}
                        onClick={() => {
                            !isGuestMode && onViewChange('lab');
                            onMobileClose();
                        }}
                    >
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-[#DC2626] blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:bg-[#DC2626] group-hover:rotate-12 group-hover:scale-105">
                                <ShieldCheck className="text-white" size={24} />
                            </div>
                        </div>
                        {!isCollapsed && (
                            <div className="animate-pro-reveal duration-700">
                                <h1 className="font-black text-[#020617] tracking-tighter text-xl uppercase leading-none font-display">
                                    DOJ<span className="text-[#DC2626]">Epstein</span>
                                </h1>

                            </div>
                        )}
                    </div>

                    {/* ACTION BUTTON - PREMIUM */}

                    {!isGuestMode && (
                        <button
                            onClick={() => { onNewAnalysis(); onMobileClose(); }}
                            className={`w-full mb-6 group relative flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} h-10 bg-[#DC2626] hover:bg-[#020617] text-white rounded-xl transition-all duration-300 shadow-lg active:scale-95 overflow-hidden border border-red-500/10`}
                        >
                            <Plus size={18} className="shrink-0 group-hover:rotate-90 transition-transform duration-500" />
                            {!isCollapsed && (
                                <span className="ml-3 font-black text-[10px] uppercase tracking-wider whitespace-nowrap font-display">
                                    Nouvelle Analyse
                                </span>
                            )}
                        </button>
                    )}


                    {/* NAVIGATION */}
                    <nav className="space-y-1.5 pb-2" aria-label="Menu principal d'investigation">
                        {menuItems.map((item) => {
                            const isActive = currentView === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onViewChange(item.id as ViewType);
                                        onMobileClose();
                                    }}
                                    className={`w-full relative flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start lg:px-4'} h-11 md:h-10 rounded-xl transition-all duration-300 group select-none touch-manipulation my-1 ${isActive
                                        ? 'bg-slate-50 text-[#020617] shadow-inner'
                                        : 'text-slate-400 hover:text-[#DC2626] hover:bg-slate-50/50'}`}
                                    title={isCollapsed ? item.label : ''}
                                    aria-label={item.label}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 w-1.5 h-6 bg-[#DC2626] rounded-r-xl shadow-[0_0_15px_rgba(220,38,38,0.4)]"></div>
                                    )}
                                    <item.icon
                                        size={20}
                                        className={`shrink-0 transition-all duration-700 ${isActive ? 'text-[#DC2626]' : `${item.color} opacity-70 group-hover:opacity-100 group-hover:scale-110`}`}
                                        aria-hidden="true"
                                    />
                                    {!isCollapsed && (
                                        <span className={`text-[14px] font-bold tracking-tight ml-5 transition-all duration-500 font-serif-legal ${isActive ? 'translate-x-1 text-[#020617]' : 'opacity-60 group-hover:opacity-100 text-slate-500'}`}>
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
                            {!isCollapsed && <span className="text-[9px] font-black uppercase tracking-[0.3em] ml-3 transition-all duration-300">Console Monitor</span>}
                        </button>

                        <button
                            onClick={() => {
                                onOpenSettings();
                                onMobileClose();
                            }}
                            className={`w-full flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start lg:px-4'} h-10 lg:h-8 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-[#B91C1C] transition-all group border border-transparent`}
                            title={isCollapsed ? 'Paramètres' : ''}
                        >
                            <Settings
                                size={14}
                                className="group-hover:rotate-180 transition-transform duration-700 shrink-0"
                            />
                            {!isCollapsed && <span className="text-[9px] font-black uppercase tracking-[0.3em] ml-3 transition-all duration-300">Protocole Config</span>}
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
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ml-3 transition-all duration-300 ${isGuestMode ? 'text-white' : ''}`}>
                                    {isGuestMode ? 'Connexion Analyste' : 'Clôturer Session'}
                                </span>
                            )}
                        </button>
                    </div>

                    {!isCollapsed && (
                        <div className="flex mt-3 items-center gap-2 px-3 py-2 bg-[#F8FAFC] rounded-xl border border-slate-50 group cursor-help transition-all hover:bg-white hover:shadow-xl">
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
                <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-gradient-to-b from-[#B91C1C] via-[#B91C1C]/10 to-transparent opacity-0 lg:opacity-100"></div>
            </aside>
        </>
    );
};
