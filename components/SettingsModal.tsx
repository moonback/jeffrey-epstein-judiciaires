/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Database, Download, ShieldCheck, Trash2, ArrowUpRight, Cpu, Cloud, CloudOff, Lock, Server, Shield, Sparkles, ChevronDown, Key } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { AI_MODELS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearData: () => void;
  onExportData: () => void;
  dbSize: number;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  openRouterKey: string;
  onKeyChange: (key: string) => void;
  onLogout: () => void;
  isGuestMode?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onClearData, onExportData, dbSize, selectedModel, onModelChange, openRouterKey, onKeyChange, onLogout, isGuestMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[20px] p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-xl max-h-[90vh] bg-white rounded-[3rem] border border-slate-100 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-500 relative flex flex-col">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B91C1C] rounded-full blur-[120px] opacity-[0.03] pointer-events-none"></div>

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white relative z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-[1.2rem] flex items-center justify-center shadow-xl">
              <ShieldCheck className="text-white" size={22} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[#0F172A] font-black text-xl tracking-tighter uppercase italic font-serif-legal leading-none">Terminal <span className="text-[#B91C1C]">Config</span></h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">Protocol Control Module</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-[#B91C1C] transition-all group"
          >
            <X size={22} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>

        {/* Global Security Badge */}
        <div className="mx-8 mt-6 mb-3 px-5 py-2.5 bg-[#F8FAFC] border border-slate-100 rounded-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Lock size={12} className="text-emerald-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Session Encrypted (TLS 1.3)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[8px] font-black text-emerald-600 uppercase">Live</span>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-8">

            {/* Section API & Infrastructure */}
            {!isGuestMode && (
              <div className="space-y-5">
                <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-3">
                  <Server size={12} className="text-[#B91C1C]" /> Infrastructure Core
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#F8FAFC] rounded-[1.5rem] p-6 border border-slate-100 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-[0.05] group-hover:scale-110 transition-transform">
                      <Cpu size={32} className="text-black" />
                    </div>
                    <span className="text-[#0F172A] text-[13px] font-black uppercase tracking-tight block mb-3">Neural Engine</span>
                    <div className="flex items-center justify-between">
                      <div className="relative w-full">
                        <select
                          value={selectedModel}
                          onChange={(e) => onModelChange(e.target.value)}
                          className="w-full bg-white text-[#B91C1C] text-[10px] font-black px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm tracking-tight uppercase italic appearance-none cursor-pointer focus:ring-1 focus:ring-[#B91C1C] outline-none"
                        >
                          {AI_MODELS.map(model => (
                            <option key={model.id} value={model.id}>
                              {model.name} ({model.speed})
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#B91C1C]">
                          <ChevronDown size={10} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-[1.5rem] p-6 border border-slate-100 relative group overflow-hidden md:col-span-2">
                    <div className="absolute top-0 right-0 p-3 opacity-[0.05] group-hover:scale-110 transition-transform">
                      <Lock size={32} className="text-black" />
                    </div>
                    <span className="text-[#0F172A] text-[13px] font-black uppercase tracking-tight block mb-3">OpenRouter API Access</span>
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <input
                          type="password"
                          value={openRouterKey}
                          onChange={(e) => onKeyChange(e.target.value)}
                          placeholder="sk-or-v1-..."
                          className="w-full bg-white text-[#0F172A] text-[11px] font-mono-data px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm outline-none focus:ring-1 focus:ring-[#B91C1C] transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                          <Key size={12} />
                        </div>
                      </div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        {openRouterKey ? "Clé personnalisée active (Primeur sur .env)" : "Utilisation de la clé d'infrastructure par défaut."}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed text-center font-bold px-4 italic">
                  {isSupabaseConfigured
                    ? "Investigations synchronisées en temps réel avec le cluster distant sécurisé."
                    : "Mode Offline : Données isolées localement. Export manuel recommandé."}
                </p>
              </div>
            )}

            {/* Section Hardware & Data */}
            <div className="space-y-5">
              {!isGuestMode && (
                <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-3">
                  <Database size={12} className="text-[#0F4C81]" /> Hardware Maintenance
                </h3>
              )}

              <div className="bg-white rounded-[2rem] p-2 border border-slate-100 shadow-sm overflow-hidden">
                {!isGuestMode && (
                  <>
                    <button
                      onClick={onExportData}
                      className="w-full flex items-center justify-between p-5 hover:bg-[#F8FAFC] rounded-[1.5rem] transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-[#0F4C81] rounded-xl text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                          <Download size={20} />
                        </div>
                        <div className="text-left">
                          <div className="text-[#0F172A] text-base font-black uppercase tracking-tight italic font-serif-legal leading-none">Snapshot Archive</div>
                          <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                            {dbSize} Files <div className="w-0.5 h-0.5 bg-slate-200 rounded-full"></div> Qualified
                          </div>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#0F4C81] group-hover:text-white transition-all">
                        <ArrowUpRight size={16} className="group-hover:scale-110 transition-transform" />
                      </div>
                    </button>

                    <div className="h-px bg-slate-50 mx-6 my-1"></div>

                    <button
                      onClick={onClearData}
                      className="w-full flex items-center justify-between p-5 hover:bg-red-50 rounded-[1.5rem] transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-white border border-red-100 rounded-xl text-[#B91C1C] flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                          <Trash2 size={20} />
                        </div>
                        <div className="text-left">
                          <div className="text-[#B91C1C] text-base font-black uppercase tracking-tight italic font-serif-legal leading-none">Emergency Purge</div>
                          <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                            Irreversible <div className="w-0.5 h-0.5 bg-red-200 rounded-full"></div> High Risk
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-red-100/50 rounded-lg text-[#B91C1C] text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        Execute
                      </div>
                    </button>
                    <div className="h-px bg-slate-50 mx-6 my-1"></div>
                  </>
                )}

                <div className="h-px bg-slate-50 mx-6 my-1"></div>

                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50 rounded-[1.5rem] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-black rounded-xl text-white flex items-center justify-center shadow-lg group-hover:bg-[#B91C1C] transition-all">
                      <Lock size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-[#0F172A] text-base font-black uppercase tracking-tight italic font-serif-legal leading-none">Terminer la Session</div>
                      <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Déconnexion Sécurisée</div>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-300 group-hover:text-[#B91C1C] transition-colors" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Technical Meta */}
        <div className="px-8 py-5 bg-[#F8FAFC] border-t border-slate-50 flex justify-between items-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <div className="line-glow h-full w-full"></div>
          </div>
          <div className="relative z-10">
            <span className="text-slate-300 text-[8px] font-black uppercase tracking-[0.4em]">Core Version</span>
            <div className="text-[#0F172A] text-[10px] font-mono-data font-black">2.4.0-RTX_FORENSIC</div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <Shield size={14} className="text-[#B5965D]" />
            <div className="h-3 w-px bg-slate-200"></div>
            <span className="text-[#B91C1C] text-[9px] font-black uppercase tracking-[0.3em] font-serif-legal italic">OSINT Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
