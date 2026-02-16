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

export type ViewType = 'lab' | 'database' | 'network' | 'summary' | 'timeline' | 'actors' | 'contradictions' | 'poi' | 'finance' | 'assets' | 'cross' | 'voice' | 'flights' | 'discovery' | 'background_ai';

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
        { id: 'lab', label: 'Laboratoire', icon: Terminal, color: 'text-[var(--accent)]', adminOnly: true },
        { id: 'database', label: 'Archives Centrales', icon: Database, color: 'text-[var(--color-slate-600)]' },
        { id: 'network', label: 'Cartographie', icon: Share2, color: 'text-[var(--color-slate-600)]' },
        { id: 'summary', label: 'Synthèse Globale', icon: BookOpen, color: 'text-[var(--accent)]' },
        { id: 'timeline', label: 'Chronologie', icon: Clock, color: 'text-[var(--accent)]' },
        { id: 'actors', label: 'Acteurs Clés', icon: Fingerprint, color: 'text-[var(--accent)]' },
        { id: 'finance', label: 'Flux Financiers', icon: DollarSign, color: 'text-[var(--accent)]' },
        { id: 'assets', label: 'Patrimoine', icon: Archive, color: 'text-[var(--accent)]' },
        { id: 'cross', label: 'Intelligence Croisée', icon: Link2, color: 'text-[var(--color-slate-600)]' },
        { id: 'contradictions', label: 'Contradictions', icon: ShieldAlert, color: 'text-[var(--color-slate-600)]' },
        { id: 'poi', label: 'Index des Cibles', icon: Users, color: 'text-[var(--accent)]' },
        { id: 'discovery', label: 'Découverte IA', icon: Network, color: 'text-[var(--accent)]', adminOnly: true },
        { id: 'background_ai', label: 'Intelligence Scan', icon: Cpu, color: 'text-[var(--accent)]', adminOnly: true },
        { id: 'flights', label: 'Vols & Manifestes', icon: Plane, color: 'text-[var(--accent)]' },
        { id: 'voice', label: 'Assistant Vocal', icon: Mic, color: 'text-[var(--accent)]', adminOnly: true },
    ].filter(item => !isGuestMode || !item.adminOnly);

    // Mobile Overlay
    const mobileOverlay = (
        <div
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
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
                    fixed inset-y-0 left-0 z-50 bg-[var(--surface)]/90 backdrop-blur-2xl border-r border-[var(--border)] shadow-2xl transition-all duration-300 ease-in-out
                    flex flex-col h-[100dvh]
                    lg:sticky lg:top-0 lg:h-screen lg:shadow-none lg:bg-[var(--surface)]/80
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${isCollapsed ? 'lg:w-[80px]' : 'lg:w-[280px]'}
                    w-[280px] sm:w-[320px] 
                `}
            >
                {/* COLLAPSE TOGGLE (Desktop Only) */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-[var(--surface)] border border-[var(--border)] rounded-full items-center justify-center text-[var(--text-dim)] hover:text-[var(--accent)] transition-all z-[60] shadow-sm hover:scale-110 active:scale-95"
                    aria-label={isCollapsed ? "Déplier le menu" : "Replier le menu"}
                >
                    {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                </button>

                {/* MOBILE CLOSE BUTTON */}
                <button
                    onClick={onMobileClose}
                    className="lg:hidden absolute right-4 top-4 p-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>


                {/* SCROLLABLE AREA: LOGO + ACTION + NAV */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar pt-8 pb-4 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-6'}`}>
                    <div
                        className={`flex items-center gap-4 mb-10 group cursor-pointer whitespace-nowrap ${isCollapsed ? 'justify-center' : ''}`}
                        onClick={() => {
                            !isGuestMode && onViewChange('lab');
                            onMobileClose();
                        }}
                    >
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-[var(--accent)] blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative w-12 h-12 bg-[var(--primary)] rounded-[var(--radius-lg)] flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:bg-[var(--accent)] group-hover:rotate-[15deg] group-hover:scale-110">
                                <ShieldCheck className="text-white" size={24} />
                            </div>
                        </div>
                        {!isCollapsed && (
                            <div className="animate-reveal">
                                <h1 className="font-black text-[var(--primary)] tracking-tighter text-2xl uppercase leading-none font-display">
                                    DOJ<span className="text-[var(--accent)]">Forensic</span>
                                </h1>
                                <span className="text-[8px] font-black tracking-[0.4em] text-[var(--text-dim)] uppercase">Security Protocol</span>
                            </div>
                        )}
                    </div>

                    {/* ACTION BUTTON - PREMIUM */}

                    {!isGuestMode && (
                        <button
                            onClick={() => { onNewAnalysis(); onMobileClose(); }}
                            className={`w-full mb-8 group relative flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} h-11 bg-[var(--accent)] text-white rounded-[var(--radius-lg)] transition-all duration-500 shadow-md hover:shadow-xl active:scale-[0.98] border border-white/10`}
                        >
                            <Plus size={18} className="shrink-0 group-hover:rotate-90 transition-transform duration-500" />
                            {!isCollapsed && (
                                <span className="ml-3 font-black text-[10px] uppercase tracking-[0.15em] whitespace-nowrap">
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
                                    className={`w-full relative flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start lg:px-4'} h-12 md:h-11 rounded-[var(--radius-md)] transition-all duration-300 group select-none touch-manipulation my-1.5 ${isActive
                                        ? 'bg-[var(--surface-muted)] text-[var(--primary)] shadow-sm'
                                        : 'text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-muted)]/50'}`}
                                    title={isCollapsed ? item.label : ''}
                                    aria-label={item.label}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 w-1 h-5 bg-[var(--accent)] rounded-r-full"></div>
                                    )}
                                    <item.icon
                                        size={20}
                                        className={`shrink-0 transition-all duration-500 ${isActive ? 'text-[var(--accent)] scale-110' : `${item.color} opacity-60 group-hover:opacity-100 group-hover:scale-110`}`}
                                        aria-hidden="true"
                                    />
                                    {!isCollapsed && (
                                        <span className={`text-[14px] font-semibold tracking-tight ml-5 transition-all duration-300 ${isActive ? 'translate-x-1 text-[var(--primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'}`}>
                                            {item.label}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* FOOTER */}
                <div className={`mt-auto p-4 transition-all duration-500 overflow-hidden ${isCollapsed ? 'px-2' : 'px-5'} pb-6 border-t border-[var(--border)] bg-[var(--background)]/50`}>
                    <div className="space-y-1">
                        {/* <button
                            onClick={onToggleLogs}
                            className={`w-full flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start lg:px-4'} h-9 rounded-[var(--radius-sm)] text-[var(--text-dim)] hover:bg-[var(--surface)] hover:text-[var(--primary)] transition-all group border border-transparent shadow-sm`}
                            title={isCollapsed ? 'Console Système' : ''}
                        >
                            <Activity
                                size={14}
                                className={`group-hover:animate-pulse transition-all shrink-0`}
                            />
                            {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-[0.2em] ml-3 transition-all">Monitor System</span>}
                        </button> */}

                        {/* <button
                            onClick={() => {
                                onOpenSettings();
                                onMobileClose();
                            }}
                            className={`w-full flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start lg:px-4'} h-9 rounded-[var(--radius-sm)] text-[var(--text-dim)] hover:bg-[var(--surface)] hover:text-[var(--accent)] transition-all group border border-transparent shadow-sm`}
                            title={isCollapsed ? 'Paramètres' : ''}
                        >
                            <Settings
                                size={14}
                                className="group-hover:rotate-90 transition-transform duration-700 shrink-0"
                            />
                            {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-[0.2em] ml-3 transition-all">Protocol Config</span>}
                        </button> */}

                        {/* NEW LOGIN/LOGOUT BUTTON */}
                        <button
                            onClick={onLogout}
                            className={`w-full mt-3 flex items-center justify-center ${isCollapsed ? '' : 'lg:justify-start lg:px-4'} h-11 rounded-[var(--radius-md)] transition-all group border ${isGuestMode
                                ? 'bg-[var(--accent)] text-white border-[var(--color-brand-700)] shadow-lg shadow-red-900/20 hover:opacity-90'
                                : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--accent)] hover:border-[var(--accent)] shadow-sm'}`}
                            title={isCollapsed ? (isGuestMode ? 'Connexion' : 'Déconnexion') : ''}
                        >
                            <Lock
                                size={16}
                                className={`${isGuestMode ? 'text-white' : 'group-hover:text-[var(--accent)]'} transition-colors shrink-0`}
                            />
                            {!isCollapsed && (
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ml-3 transition-all ${isGuestMode ? 'text-white' : ''}`}>
                                    {isGuestMode ? 'Connexion' : 'Deconnexion'}
                                </span>
                            )}
                        </button>
                    </div>


                </div>

                {/* Side Accent */}
                <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-gradient-to-b from-[var(--accent)] via-[var(--accent)]/20 to-transparent opacity-0 lg:opacity-100"></div>
            </aside>
        </>
    );
};
