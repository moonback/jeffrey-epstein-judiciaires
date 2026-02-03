/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { X, Database, Download, ShieldCheck, Activity, Trash2, Cpu } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearData: () => void;
  onExportData: () => void;
  dbSize: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onClearData, onExportData, dbSize }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#1E1E1E] rounded-3xl border border-[#444746] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#444746] flex justify-between items-center bg-[#252525]">
          <h2 className="text-[#E3E3E3] font-medium text-lg">Paramètres Système</h2>
          <button onClick={onClose} className="text-[#C4C7C5] hover:text-white transition-colors rounded-full p-1 hover:bg-[#373737]">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Section API (Read Only) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#8E918F] uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} /> Configuration
            </h3>
            <div className="bg-[#121212] rounded-xl p-4 border border-[#444746] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#C4C7C5] text-sm flex items-center gap-2"><Cpu size={14} /> Moteur IA</span>
                <span className="text-[#E3E3E3] text-xs font-mono bg-[#2B2B2B] px-2 py-1 rounded border border-[#444746]">x-ai/grok-2-1212</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#C4C7C5] text-sm flex items-center gap-2"><Activity size={14} /> Statut API</span>
                <span className="text-[#6DD58C] text-[10px] font-bold bg-[#0F5223] px-2 py-1 rounded flex items-center gap-1 border border-[#6DD58C]/20">
                  ENVIRONNEMENT SÉCURISÉ
                </span>
              </div>
              <p className="text-[10px] text-[#757775] leading-relaxed border-t border-[#444746] pt-2 mt-1">
                La clé API est injectée via les variables d'environnement (`process.env`) pour garantir la sécurité. La modification manuelle est désactivée.
              </p>
            </div>
          </div>

          {/* Section Données */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#8E918F] uppercase tracking-widest flex items-center gap-2">
              <Database size={14} /> Base de Données Vectorielle
            </h3>
            <div className="bg-[#121212] rounded-xl p-1 border border-[#444746]">
              <button
                onClick={onExportData}
                className="w-full flex items-center justify-between p-3 hover:bg-[#2B2B2B] rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#004A77] rounded-lg text-[#D3E3FD] border border-[#004A77]">
                    <Download size={18} />
                  </div>
                  <div className="text-left">
                    <div className="text-[#E3E3E3] text-sm font-medium group-hover:text-[#D3E3FD] transition-colors">Exporter l'historique</div>
                    <div className="text-[#C4C7C5] text-[10px]">{dbSize} dossiers d'investigation</div>
                  </div>
                </div>
              </button>
              <div className="h-[1px] bg-[#444746] mx-3 my-1 opacity-50"></div>
              <button
                onClick={onClearData}
                className="w-full flex items-center justify-between p-3 hover:bg-[#370003] rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#601410] rounded-lg text-[#F2B8B5] border border-[#601410]">
                    <Trash2 size={18} />
                  </div>
                  <div className="text-left">
                    <div className="text-[#F2B8B5] text-sm font-medium">Vider la base locale</div>
                    <div className="text-[#C4C7C5] text-[10px]">Action irréversible</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#252525] border-t border-[#444746] text-center flex justify-between items-center">
          <span className="text-[#757775] text-[10px] font-mono">IDB Storage v2.0</span>
          <span className="text-[#757775] text-[10px]">DOJ Forensic Analyzer</span>
        </div>
      </div>
    </div>
  );
};
