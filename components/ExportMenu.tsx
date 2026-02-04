/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Table, File } from 'lucide-react';
import { ProcessedResult } from '../types';
import { ExportService } from '../services/exportService';

interface ExportMenuProps {
    result: ProcessedResult;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ result }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleExport = (format: 'pdf' | 'markdown' | 'csv') => {
        switch (format) {
            case 'pdf':
                ExportService.downloadPDF(result);
                break;
            case 'markdown':
                ExportService.downloadMarkdown(result);
                break;
            case 'csv':
                ExportService.downloadCSV(result);
                break;
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center gap-3 bg-white hover:bg-[#0F172A] hover:text-white px-5 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all border border-slate-100 shadow-sm active:scale-95"
            >
                <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                EXPORT
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 space-y-1">
                        <button
                            onClick={() => handleExport('pdf')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F8FAFC] transition-all text-left group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-[#B91C1C]/10 flex items-center justify-center group-hover:bg-[#B91C1C] transition-all">
                                <File size={16} className="text-[#B91C1C] group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-black text-[#0F172A]">PDF Report</div>
                                <div className="text-[9px] text-slate-400 font-bold">Rapport professionnel</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleExport('markdown')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F8FAFC] transition-all text-left group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center group-hover:bg-[#0F4C81] transition-all">
                                <FileText size={16} className="text-[#0F4C81] group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-black text-[#0F172A]">Markdown</div>
                                <div className="text-[9px] text-slate-400 font-bold">Documentation texte</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleExport('csv')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F8FAFC] transition-all text-left group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 transition-all">
                                <Table size={16} className="text-emerald-600 group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-black text-[#0F172A]">CSV Data</div>
                                <div className="text-[9px] text-slate-400 font-bold">Données tabulaires</div>
                            </div>
                        </button>
                    </div>

                    <div className="px-4 py-2 bg-[#F8FAFC] border-t border-slate-50">
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider text-center">Export Suite v1.0</p>
                    </div>
                </div>
            )}
        </div>
    );
};
