import React from 'react';
import {
    Terminal,
    Database,
    Share2,
    Clock,
    AlertTriangle,
    Users,
    Settings,
    Plus
} from 'lucide-react';

export type ViewType = 'lab' | 'database' | 'network' | 'timeline' | 'contradictions' | 'poi';

interface SidebarProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    onOpenSettings: () => void;
    onNewAnalysis: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    currentView,
    onViewChange,
    onOpenSettings,
    onNewAnalysis
}) => {
    const menuItems = [
        { id: 'lab', label: 'Laboratoire', icon: Terminal, color: 'text-[#F2B8B5]' },
        { id: 'database', label: 'Base de Données', icon: Database, color: 'text-[#8AB4F8]' },
        { id: 'network', label: 'Réseau d\'Influence', icon: Share2, color: 'text-[#C6A7FB]' },
        { id: 'timeline', label: 'Chronologie', icon: Clock, color: 'text-[#FFD54F]' },
        { id: 'contradictions', label: 'Détecteur Dev', icon: AlertTriangle, color: 'text-[#F44336]' },
        { id: 'poi', label: 'Cibles (POI)', icon: Users, color: 'text-[#4DB6AC]' },
    ];

    return (
        <aside className="w-20 lg:w-64 bg-[#121212] border-r border-[#2D2D2D] flex flex-col h-screen sticky top-0 z-50">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F2B8B5] to-[#601410] rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-xl">D</span>
                    </div>
                    <span className="hidden lg:block font-bold text-[#E3E3E3] tracking-tighter text-xl">
                        DOJ<span className="text-[#F2B8B5]">Forensic</span>
                    </span>
                </div>

                <button
                    onClick={onNewAnalysis}
                    className="w-full mb-8 flex items-center justify-center lg:justify-start gap-3 bg-[#F2B8B5] hover:bg-[#F9DEDC] text-[#370003] p-3 rounded-2xl transition-all shadow-lg hover:shadow-[#F2B8B5]/20 group"
                >
                    <Plus size={24} strokeWidth={3} />
                    <span className="hidden lg:block font-bold text-sm uppercase tracking-wider">Nouvelle Analyse</span>
                </button>

                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id as ViewType)}
                            className={`w-full flex items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl transition-all group ${currentView === item.id
                                    ? 'bg-[#1E1E1E] border border-[#444746] shadow-sm'
                                    : 'text-[#757775] hover:bg-[#1E1E1E]/50'
                                }`}
                        >
                            <item.icon
                                size={22}
                                className={currentView === item.id ? item.color : 'group-hover:text-[#E3E3E3]'}
                            />
                            <span className={`hidden lg:block text-sm font-medium ${currentView === item.id ? 'text-[#E3E3E3]' : 'group-hover:text-[#E3E3E3]'
                                }`}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-[#2D2D2D]">
                <button
                    onClick={onOpenSettings}
                    className="w-full flex items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl text-[#757775] hover:bg-[#1E1E1E] hover:text-[#E3E3E3] transition-all group"
                >
                    <Settings size={22} />
                    <span className="hidden lg:block text-sm font-medium">Paramètres</span>
                </button>
            </div>
        </aside>
    );
};
