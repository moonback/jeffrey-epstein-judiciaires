/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileProcessingService } from './services/fileProcessingService';

import React, { useState, useEffect, useRef } from 'react';
import { generateInputData } from './constants';
import { InputData, ProcessedResult } from './types';
import { mergeDataWithFlash } from './services/openRouterService';
import { storageService } from './services/storageService';
import { DataCard } from './components/DataCard';
import { LogTerminal } from './components/LogTerminal';
import { LiveAssistant } from './components/LiveAssistant';
import { SettingsModal } from './components/SettingsModal';
import { AI_MODELS } from './constants';
import { ResultsDashboard } from './components/ResultsDashboard';
import { InvestigationPlanner } from './components/InvestigationPlanner';
import {
  Terminal,
  Database,
  Plus,
  XCircle,
  Activity,
  Loader2,
  X,
  ShieldCheck,
  Settings,
  Share2,
  Clock,
  Menu,
  ChevronDown,
  Monitor,
  Cpu,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Sidebar, ViewType } from './components/Sidebar';
import { CaseListView } from './components/CaseListView';
import { NetworkGraphView } from './components/NetworkGraphView';
import { TimelineView } from './components/TimelineView';
import { ContradictionsView, POIView } from './components/AdvancedModules';
import { FinancialFlowView } from './components/FinancialFlowView';
import { CrossSessionView } from './components/CrossSessionView';
import { VoiceAssistant } from './components/VoiceAssistant';
import { Auth } from './components/Auth';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

import { useOptimistic, useTransition } from 'react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [queue, setQueue] = useState<InputData[]>([]);
  const [resolutionHistory, setResolutionHistory] = useState<ProcessedResult[]>([]);
  const [optimisticHistory, addOptimisticHistory] = useOptimistic<ProcessedResult[], ProcessedResult>(
    resolutionHistory,
    (state, newResult) => {
      const index = state.findIndex(r => r.id === newResult.id);
      if (index >= 0) {
        const updated = [...state];
        updated[index] = newResult;
        return updated;
      }
      return [...state, newResult];
    }
  );

  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewType>('lab');
  const [showPlanner, setShowPlanner] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showTabsDropdown, setShowTabsDropdown] = useState(false);
  const [selectedAiModel, setSelectedAiModel] = useState<string>(
    localStorage.getItem('SELECTED_AI_MODEL') || 'google/gemini-2.0-flash-lite-preview-02-05'
  );
  const [openRouterKey, setOpenRouterKey] = useState<string>(
    localStorage.getItem('OPENROUTER_API_KEY') || ''
  );
  const [isPending, startTransition] = useTransition();

  const handleModelChange = (modelId: string) => {
    setSelectedAiModel(modelId);
    localStorage.setItem('SELECTED_AI_MODEL', modelId);
  };

  const handleKeyChange = (key: string) => {
    setOpenRouterKey(key);
    localStorage.setItem('OPENROUTER_API_KEY', key);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase!.auth.signOut();
    }
  };

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Supabase Auth Listener
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsAuthLoading(false);
      return;
    }

    supabase!.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load History from IndexedDB on Mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const history = await storageService.getAllResults();
        setResolutionHistory(history);
        setProcessedCount(history.length);
        if (history.length > 0) {
          setActiveTabId(history[history.length - 1].id);
        }
      } catch (e) {
        console.error("Failed to load history from DB", e);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    setQueue([]);
  }, []);

  const handleStartInvestigation = async (query: string, sourceLabel: string, file?: File) => {
    const newId = `CASE-${Date.now().toString().slice(-4)}`;
    let fileContent = '';

    if (file) {
      try {
        const processed = await FileProcessingService.processFile(file, (msg) => {
          setLogs(prev => [...prev, msg]);
        });
        fileContent = processed.content;
      } catch (error) {
        console.error("File processing error", error);
        alert("Erreur lors de la lecture du fichier");
        return;
      }
    }

    const inputData: InputData = {
      id: newId,
      query: query,
      targetUrl: file ? `DOC: ${file.name}` : `DOJ ARCHIVE : ${sourceLabel}`,
      timestamp: Date.now(),
      ...(fileContent ? { fileContent } : {})
    } as any;

    const placeholderResult: ProcessedResult = {
      id: newId,
      input: inputData,
      output: null,
      logs: ["Préparation de la requête..."],
      sources: [],
      durationMs: 0,
      status: 'processing',
    };

    startTransition(() => {
      addOptimisticHistory(placeholderResult);
      setQueue(prev => [inputData, ...prev]);
      setActiveTabId(newId);
    });

    setIsSettingsOpen(false);
  };

  // Dedicated Effect for Queue Processing (Avoids Memory Leaks and closure stales)
  useEffect(() => {
    if (isProcessing || queue.length === 0) return;

    let timeoutId: any;
    const processItem = async () => {
      if (!isMounted.current) return;

      setIsProcessing(true);
      const currentQueue = [...queue];
      const item = currentQueue.shift();

      if (!item) {
        setIsProcessing(false);
        return;
      }

      setQueue(currentQueue);

      const tempResult: ProcessedResult = {
        id: item.id,
        input: item,
        output: null,
        logs: ["Initialisation de l'agent forensique..."],
        sources: [],
        durationMs: 0,
        status: 'processing',
      };

      setResolutionHistory(prev => [...prev.filter(r => r.id !== item.id), tempResult]);
      await storageService.saveResult(tempResult);

      try {
        const start = performance.now();
        const result = await mergeDataWithFlash(item);
        const duration = performance.now() - start;

        if (!isMounted.current) return;

        const completedResult: ProcessedResult = {
          ...tempResult,
          output: result.json,
          logs: result.logs,
          sources: result.sources,
          durationMs: duration,
          status: 'completed'
        };

        await storageService.saveResult(completedResult);
        setResolutionHistory(prev => prev.map(r => r.id === item.id ? completedResult : r));
        setProcessedCount(prev => prev + 1);
      } catch (error) {
        console.error("Processing failed", error);
      } finally {
        if (isMounted.current) {
          setIsProcessing(false);
        }
      }
    };

    processItem();

  }, [queue, isProcessing, addOptimisticHistory, isMounted, startTransition]);

  const handleEntityClick = (entityName: string) => {
    const newId = `ENTITY-${Date.now().toString().slice(-4)}`;
    const entityQuery: InputData = {
      id: newId,
      query: `PROFILAGE ENTITÉ : Qui est "${entityName}" dans le contexte de l'affaire Epstein ? Quel est son rôle exact, quelles sont les accusations ou implications mentionnées dans les documents DOJ ?`,
      targetUrl: "https://www.justice.gov/epstein/doj-disclosures",
      timestamp: Date.now()
    };

    const placeholder: ProcessedResult = {
      id: newId,
      input: entityQuery,
      output: null,
      logs: ["Ciblage de l'entité en cours..."],
      sources: [],
      durationMs: 0,
      status: 'processing',
    };

    startTransition(() => {
      addOptimisticHistory(placeholder);
      setQueue(prev => [entityQuery, ...prev]);
      setViewMode('lab');
      setActiveTabId(newId);
    });
  };

  const handleDownload = (result: ProcessedResult) => {
    if (!result.output) return;

    const exportData = {
      meta: {
        id: result.id,
        timestamp: new Date().toISOString(),
        query: result.input.query,
        source: result.input.targetUrl,
        latency_ms: result.durationMs
      },
      analysis: result.output,
      sources: result.sources
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `DOJ_Analysis_${result.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportAll = async () => {
    try {
      const allData = await storageService.getAllResults();
      const exportBlob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(exportBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DOJ_Forensic_FULL_Export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("CONFIRMATION REQUISE : Vider uniquement le cache local ? Les données Supabase seront préservées.")) {
      await storageService.clearAll();
      setResolutionHistory([]);
      setProcessedCount(0);
      setActiveTabId(null);
      setIsSettingsOpen(false);
    }
  };

  const handleCloseTab = async (e: React.MouseEvent, idToRemove: string) => {
    e.stopPropagation();
    await storageService.deleteResult(idToRemove);
    setResolutionHistory(prev => {
      const newHistory = prev.filter(item => item.id !== idToRemove);
      if (activeTabId === idToRemove) {
        setActiveTabId(newHistory.length > 0 ? newHistory[newHistory.length - 1].id : null);
      }
      return newHistory;
    });
  };

  const handleDeepDive = (docTitle: string, style: 'standard' | 'simple' | 'technical') => {
    const newId = `DEEP-${Date.now().toString().slice(-4)}`;
    const queryMap = {
      standard: `Analyse approfondie du document : "${docTitle}". Détaillez les faits, les noms cités et les implications.`,
      simple: `Expliquez simplement le contenu du document : "${docTitle}". À quoi sert-il ?`,
      technical: `Analyse technique/forensique du document : "${docTitle}". Quelles sont les preuves matérielles ou les aspects juridiques complexes ?`
    };

    const deepQuery: InputData = {
      id: newId,
      query: queryMap[style],
      targetUrl: "https://www.justice.gov/epstein/doj-disclosures",
      timestamp: Date.now()
    };

    const placeholder: ProcessedResult = {
      id: newId,
      input: deepQuery,
      output: null,
      logs: ["Immersion profonde dans le document..."],
      sources: [],
      durationMs: 0,
      status: 'processing',
    };

    startTransition(() => {
      addOptimisticHistory(placeholder);
      setQueue(prev => [deepQuery, ...prev]);
      setViewMode('lab');
      setActiveTabId(newId);
    });
  };

  const handleOpenInvestigation = (id: string) => {
    setActiveTabId(id);
    setViewMode('lab');
  };

  const activeResult = optimisticHistory.find(r => r.id === activeTabId);
  const activeLogs = activeResult ? activeResult.logs : [];

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-t-4 border-[#B91C1C] rounded-full animate-spin"></div>
          </div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Chargement des Protocoles...</span>
        </div>
      </div>
    );
  }

  if (isSupabaseConfigured && !session) {
    return <Auth />;
  }

  return (
    <div className="flex flex-col lg:flex-row bg-[#F8FAFC] text-[#0F172A] min-h-screen overflow-hidden font-sans">

      {/* 1. Global Navigation Sidebar - Hidden on mobile, visible on LG */}
      <div className="hidden lg:flex">
        <Sidebar
          currentView={viewMode}
          onViewChange={setViewMode}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onNewAnalysis={() => {
            setViewMode('lab');
            setShowPlanner(true);
            setActiveTabId(null);
          }}
          onToggleLogs={() => setShowLogs(!showLogs)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#F8FAFC]">

        {/* PREMIUM MODULE HEADER - Pro Light Theme */}
        <header className="px-4 lg:px-6 h-12 lg:h-14 shrink-0 flex justify-between items-center bg-white border-b border-slate-100 z-40 shadow-sm relative">
          <div className="flex gap-3 lg:gap-8 items-center">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2.5">
              <div className="p-1.5 bg-[#B91C1C] rounded-lg shadow-lg shadow-red-900/10">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <h1 className="text-base font-black tracking-tight text-[#0F172A] uppercase italic">
                DOJ <span className="text-[#B91C1C] font-serif-legal font-black tracking-normal">Forensic</span>
              </h1>
            </div>

            <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-[#F8FAFC] border border-slate-100 rounded-xl relative overflow-hidden group hover:shadow-md hover:bg-white transition-all cursor-crosshair">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-20"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span>
              </div>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] relative">Système Live Actif</span>
            </div>

            <div className="hidden lg:block h-8 w-[1px] bg-slate-100"></div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-start hidden sm:flex">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] mb-0.5">Index Central</span>
                <div className="flex items-center gap-1.5">
                  <div className="text-xl font-mono-data font-black text-[#B91C1C] leading-none">{processedCount}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter self-end mb-0.5 whitespace-nowrap">Dossiers Qualifiés</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            {isProcessing && (
              <div className="flex gap-3 items-center bg-[#B91C1C]/5 px-4 py-2 rounded-xl text-[10px] text-[#B91C1C] border border-[#B91C1C]/10 shadow-sm animate-pulse">
                <Loader2 size={14} className="animate-spin" />
                <span className="font-black uppercase tracking-[0.2em] hidden xs:block">Traitement Neural...</span>
              </div>
            )}

            <div className="hidden lg:flex items-center gap-6 text-[9px] font-black text-slate-400 uppercase border-l border-slate-100 pl-6 tracking-[0.15em]">
              {session?.user?.email && (
                <div className="flex flex-col items-start pr-6 border-r border-slate-100">
                  <span className="text-slate-300 text-[7px] mb-0.5 uppercase">Agent Identifié</span>
                  <div className="flex items-center gap-1.5 text-[#0F172A] font-bold">
                    <div className="w-4 h-4 rounded-md bg-slate-900 flex items-center justify-center">
                      <ShieldCheck size={10} className="text-white" />
                    </div>
                    <span>{session.user.email}</span>
                  </div>
                </div>
              )}
              <div className="flex flex-col items-start">
                <span className="text-slate-300 text-[7px] mb-0.5 uppercase">Cryptage</span>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <div className="w-1 h-1 rounded-full bg-[#0F4C81]"></div>
                  <span>AES-256</span>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-slate-300 text-[7px] mb-0.5 uppercase">Réponse</span>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>12.4ms Sync</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-[#B91C1C] transition-colors bg-white rounded-lg border border-slate-100"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 overflow-hidden relative pb-16 lg:pb-0">
          <div className="bg-noise"></div>

          <div className="h-full w-full relative z-10 overflow-hidden">
            {viewMode === 'lab' && (
              <div className="h-full flex flex-col lg:grid lg:grid-cols-12 overflow-hidden animate-pro-reveal">
                {/* Lab Sidebar: Queue - Hidden on mobile, visible on LG, hidden if empty */}
                {queue.length > 0 && (
                  <section className="hidden lg:flex lg:col-span-3 xl:col-span-2 border-r border-slate-100 bg-white flex-col overflow-hidden min-h-0 relative">
                    <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none opacity-50"></div>

                    <div className="p-5 flex justify-between items-center border-b border-slate-100 bg-white/50 backdrop-blur-md relative z-10">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Queue d'Analyse</span>
                        <h2 className="text-[12px] font-black text-[#0F172A] uppercase tracking-[0.2em] flex items-center gap-2">
                          Pipeline Actif
                        </h2>
                      </div>
                      <div className="flex flex-col items-center justify-center w-10 h-10 bg-black text-white rounded-xl font-mono-data font-black text-sm shadow-xl">
                        {queue.length}
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 relative z-10">
                      {queue.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 border-l-[6px] border-l-[#B91C1C] shadow-sm animate-in slide-in-from-left-4 group hover:shadow-xl hover:border-[#B91C1C]/20 transition-all duration-500 cursor-help">
                          <div className="flex justify-between items-start mb-3">
                            <div className="text-[10px] font-mono-data font-black text-slate-300 group-hover:text-[#B91C1C] transition-colors">{item.id}</div>
                            <Cpu size={12} className="text-slate-100 group-hover:text-[#B91C1C] transition-colors" />
                          </div>
                          <div className="text-[13px] text-[#475569] font-bold line-clamp-3 leading-relaxed italic group-hover:text-[#0F172A] transition-colors">"{item.query}"</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Main Lab Area */}
                <section className={`${queue.length > 0 ? 'lg:col-span-9 xl:col-span-10' : 'lg:col-span-12'} flex flex-col overflow-hidden min-h-0 bg-[#F8FAFC]`}>
                  {/* Tabs Wrapper - Pro Tabs */}
                  <div className="flex bg-[#F1F5F9] border-b border-slate-200 h-10 shrink-0 pt-1.5 relative z-20">
                    <div className="flex-1 flex items-center overflow-x-auto no-scrollbar px-2 gap-1">
                      {optimisticHistory.length > 0 && (
                        <button
                          onClick={() => {
                            setViewMode('lab');
                            setShowPlanner(true);
                            setActiveTabId(null);
                          }}
                          className="flex items-center justify-center w-10 h-10 bg-white hover:bg-[#B91C1C] text-slate-400 hover:text-white rounded-t-lg transition-all shadow-sm border border-b-0 border-slate-200 hover:border-[#B91C1C] shrink-0 group ml-2"
                        >
                          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        </button>
                      )}

                      {optimisticHistory.map((res) => (
                        <div
                          key={res.id}
                          onClick={() => {
                            setActiveTabId(res.id);
                            setShowPlanner(false);
                          }}
                          className={`group flex items-center gap-3 px-4 h-8.5 cursor-pointer min-w-[150px] max-w-[240px] transition-all duration-200 relative rounded-t-lg border-t-2 border-x border-b-0 select-none ${activeTabId === res.id && !showPlanner
                            ? 'bg-white border-t-[#B91C1C] border-x-slate-200 text-[#0F172A] z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]'
                            : 'bg-slate-100/50 border-t-transparent border-x-transparent text-slate-400 hover:bg-white/50 hover:text-slate-600'
                            }`}
                        >
                          <div className="flex flex-col overflow-hidden flex-1">
                            <span className={`text-[8px] font-mono-data font-bold tracking-wider leading-none mb-0.5 ${activeTabId === res.id && !showPlanner ? 'text-[#B91C1C]' : 'opacity-70'}`}>{res.id}</span>
                            <span className={`text-[11px] font-bold truncate font-serif-legal ${activeTabId === res.id && !showPlanner ? 'text-[#0F172A]' : 'opacity-80'}`}>{res.input?.query || 'Nouvelle Analyse'}</span>
                          </div>
                          <div className="flex items-center gap-2 pl-2">
                            {res.status === 'processing' ? (
                              <Loader2 size={12} className="text-[#B91C1C] animate-spin" />
                            ) : (
                              <div
                                role="button"
                                onClick={(e) => handleCloseTab(e, res.id)}
                                className={`p-1 rounded-md transition-colors ${activeTabId === res.id && !showPlanner ? 'hover:bg-slate-100 text-slate-400 hover:text-[#B91C1C]' : 'hover:bg-slate-200 text-slate-400 hover:text-[#B91C1C] opacity-0 group-hover:opacity-100'}`}
                              >
                                <X size={12} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {optimisticHistory.length === 0 && (
                        <div className="flex items-center gap-4 ml-4">
                          <span className="text-[11px] text-slate-300 uppercase font-black tracking-[0.5em]">Archives Standby</span>
                          <div className="h-1 w-20 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-1/3 animate-pulse"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tabs Menu Button - Only show if we have tabs */}
                    {optimisticHistory.length > 0 && (
                      <div className="flex items-center px-2 relative h-full mb-2 bg-[#F1F5F9] z-20 pl-4 border-l border-slate-200 shadow-[-10px_0_20px_#F1F5F9]">
                        <button
                          onClick={() => setShowTabsDropdown(!showTabsDropdown)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all border border-transparent shadow-sm ${showTabsDropdown ? 'bg-[#0F172A] text-white' : 'hover:bg-white text-slate-400 hover:text-[#0F172A] hover:border-slate-200'}`}
                        >
                          <ChevronDown size={14} className={`transition-transform duration-300 ${showTabsDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showTabsDropdown && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setShowTabsDropdown(false)}></div>
                            <div className="absolute right-2 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-40 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden ring-1 ring-slate-900/5">
                              <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] px-4 py-3 border-b border-slate-50 mb-2 flex items-center justify-between">
                                <span>Index des Dossiers</span>
                                <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[8px]">{optimisticHistory.length}</span>
                              </div>
                              <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1">
                                {optimisticHistory.map((res) => (
                                  <button
                                    key={res.id}
                                    onClick={() => {
                                      setActiveTabId(res.id);
                                      setShowPlanner(false);
                                      setShowTabsDropdown(false);
                                    }}
                                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group ${activeTabId === res.id && !showPlanner ? 'bg-slate-50 border border-slate-100 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}
                                  >
                                    <div className={`w-1.5 h-1.5 rounded-full ${activeTabId === res.id && !showPlanner ? 'bg-[#B91C1C]' : 'bg-slate-200 group-hover:bg-slate-300'}`}></div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                      <span className={`text-[9px] font-mono-data font-black ${activeTabId === res.id && !showPlanner ? 'text-[#B91C1C]' : 'text-slate-400'}`}>{res.id}</span>
                                      <span className={`text-[12px] font-bold truncate font-serif-legal ${activeTabId === res.id && !showPlanner ? 'text-[#0F172A]' : 'text-slate-500'}`}>{res.input?.query || 'Nouvelle Analyse'}</span>
                                    </div>
                                    {res.status === 'processing' && <Loader2 size={12} className="text-[#B91C1C] animate-spin" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div className="flex-1 bg-white overflow-hidden relative flex flex-col min-h-0">
                    {activeResult && !showPlanner ? (
                      <div className="flex-1 flex flex-col overflow-hidden animate-pro-reveal min-h-0">
                        {/* Investigation Header Info */}
                        <div className="px-8 lg:px-8 py-10 lg:py-3 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-end bg-gradient-to-b from-[#F8FAFC] to-white shrink-0 gap-8">
                          <div className="max-w-5xl">
                            <div className="flex flex-wrap items-center gap-4 mb-8">
                              <div className="flex items-center gap-2.5 px-5 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <div className={`w-2.5 h-2.5 rounded-full ${activeResult.status === 'completed' ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-[#B91C1C] animate-ping shadow-[0_0_10px_rgba(185,28,28,0.3)]'}`}></div>
                                <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${activeResult.status === 'completed' ? 'text-emerald-700' : 'text-[#B91C1C]'}`}>
                                  {activeResult.status === 'completed' ? 'Dossier Qualifié' : 'Investigation en Cours...'}
                                </span>
                              </div>
                              <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
                              <div className="flex items-center gap-3">
                                <Monitor size={14} className="text-slate-300" />
                                <span className="text-[12px] text-slate-400 font-mono-data font-bold uppercase tracking-tight">{activeResult.input.targetUrl.split(' : ')[1] || activeResult.input.targetUrl}</span>
                              </div>
                            </div>
                            <h2 className="text-3xl lg:text-3xl font-black text-[#0F172A] font-serif-legal tracking-tight leading-tight line-clamp-3 italic selection:bg-[#B91C1C]/5 group">
                              <span className="text-[#B91C1C]/20 font-sans mr-4 group-hover:text-[#B91C1C] transition-colors">"</span>
                              {activeResult.input.query}
                              <span className="text-[#B91C1C]/20 font-sans ml-4 group-hover:text-[#B91C1C] transition-colors">"</span>
                            </h2>
                          </div>

                          <div className="lg:text-right shrink-0">
                            <div className="flex items-center gap-3 lg:justify-end mb-3">
                              <span className="text-[10px] text-slate-300 uppercase font-black tracking-[0.4em]">Latency Profile</span>
                              <div className="h-0.5 w-12 bg-[#B91C1C]/10 rounded-full"></div>
                            </div>
                            <div className="flex items-baseline gap-1 lg:justify-end">
                              <div className="text-4xl font-mono-data font-black text-[#B91C1C] tracking-tighter shadow-sm">{activeResult.durationMs ? Math.round(activeResult.durationMs) : '000'}</div>
                              <div className="text-[12px] font-black text-slate-400 uppercase">ms</div>
                            </div>
                          </div>
                        </div>

                        {/* Analysis Body */}
                        <div className="flex-1 overflow-y-auto p-2 lg:p-2 custom-scrollbar report-paper relative">
                          <div className="max-w-12xl mx-auto pb-40">
                            <DataCard
                              result={activeResult}
                              loading={activeResult.status === 'processing'}
                              onDeepDive={handleDeepDive}
                              onDownload={() => handleDownload(activeResult)}
                              onEntityClick={handleEntityClick}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 p-8 lg:p-2 animate-pro-reveal duration-1000 overflow-y-auto custom-scrollbar min-h-0 bg-[#F8FAFC]">
                        <div className="max-w-7xl mx-auto py-2 relative">
                          {/* Background Decorative */}
                          <div className="absolute top-0 right-0 w-80 h-80 bg-[#B91C1C] rounded-full blur-[140px] opacity-[0.03]"></div>
                          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0F4C81] rounded-full blur-[140px] opacity-[0.03]"></div>

                          <InvestigationPlanner onStartInvestigation={handleStartInvestigation} />
                        </div>
                        {showPlanner && activeResult && (
                          <button
                            onClick={() => setShowPlanner(false)}
                            className="fixed top-24 lg:top-32 right-12 lg:right-40 p-5 bg-white rounded-full border border-slate-100 hover:border-[#B91C1C] text-slate-400 hover:text-[#B91C1C] shadow-2xl transition-all z-20 hover:scale-110 active:scale-90"
                          >
                            <X size={28} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {viewMode === 'database' && (
              <div className="h-full overflow-hidden bg-white">
                <CaseListView
                  history={optimisticHistory}
                  onOpenInvestigation={(id) => {
                    setActiveTabId(id);
                    setViewMode('lab');
                    setShowPlanner(false);
                  }}
                />
              </div>
            )}

            {viewMode === 'network' && (
              <div className="h-full bg-slate-50">
                <NetworkGraphView
                  onDeepDive={handleDeepDive}
                  onNavigateToInvestigation={handleOpenInvestigation}
                />
              </div>
            )}

            {viewMode === 'timeline' && <TimelineView onDeepDive={handleDeepDive} />}
            {viewMode === 'contradictions' && <ContradictionsView onDeepDive={handleDeepDive} />}
            {viewMode === 'poi' && <POIView onDeepDive={handleDeepDive} />}
            {viewMode === 'finance' && <FinancialFlowView />}
            {viewMode === 'cross' && <CrossSessionView onNavigateToInvestigation={handleOpenInvestigation} />}
            {viewMode === 'voice' && <VoiceAssistant />}
          </div>
        </main >

        {/* MOBILE BOTTOM NAVIGATION - PREMIUM PRO LIGHT */}
        < nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 border-t border-slate-100 flex items-center justify-around px-4 z-50 backdrop-blur-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.05)]" >
          <MobileNavItem
            icon={Terminal}
            label="Lab"
            isActive={viewMode === 'lab'}
            onClick={() => setViewMode('lab')}
          />
          <MobileNavItem
            icon={Database}
            label="Archives"
            isActive={viewMode === 'database'}
            onClick={() => setViewMode('database')}
          />
          <MobileNavItem
            icon={Share2}
            label="Neural"
            isActive={viewMode === 'network'}
            onClick={() => setViewMode('network')}
          />
          <MobileNavItem
            icon={Clock}
            label="Temps"
            isActive={viewMode === 'timeline'}
            onClick={() => setViewMode('timeline')}
          />
          <div className="h-10 w-px bg-slate-100 mx-2"></div>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className={`flex flex-col items-center justify-center gap-2 transition-all w-16 ${showLogs ? 'text-[#B91C1C]' : 'text-slate-400'}`}
          >
            <div className={`p-3 rounded-2xl transition-all ${showLogs ? 'bg-red-50 shadow-inner' : 'hover:bg-slate-50'}`}>
              <Activity size={20} className={showLogs ? 'animate-pulse' : ''} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Logs</span>
          </button>
        </nav >
      </div >

      <LiveAssistant />

      {/* LOGS OVERLAY - PRO STYLE */}
      {
        showLogs && (
          <div className="fixed bottom-24 lg:bottom-12 right-6 lg:right-12 left-6 lg:left-auto lg:w-[600px] h-[500px] lg:h-[600px] z-[100] animate-in slide-in-from-bottom-12 fade-in duration-700">
            <div className="absolute inset-0 bg-white border border-slate-100 shadow-[0_40px_100px_rgba(0,0,0,0.15)] rounded-[3rem] overflow-hidden flex flex-col scale-100">
              <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-[#F8FAFC]">
                <div className="flex items-center gap-5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.4em] text-[#0F172A]">Real-time Trace Console</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Neural Link Synchronized</span>
                      <div className="h-0.5 w-4 bg-emerald-500/20"></div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogs(false)}
                  className="w-12 h-12 flex items-center justify-center hover:bg-red-50 rounded-2xl transition-all group"
                >
                  <X size={24} className="text-slate-300 group-hover:text-[#B91C1C] transition-colors" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden p-6 bg-slate-50 relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                  <Activity size={300} className="absolute -bottom-20 -right-20" />
                </div>
                <LogTerminal logs={activeLogs} type="flash" />
              </div>
              <div className="px-8 py-3 bg-white border-t border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-[#B91C1C]/10 rounded-full"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Agent Monitoring Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono-data text-slate-400">STATUS: IDLE_WAIT_FLUSH</span>
                </div>
              </div>
            </div>
          </div>
        )
      }

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearData={handleClearHistory}
        onExportData={handleExportAll}
        dbSize={processedCount}
        selectedModel={selectedAiModel}
        onModelChange={handleModelChange}
        openRouterKey={openRouterKey}
        onKeyChange={handleKeyChange}
        onLogout={handleLogout}
      />

    </div >
  );
};

interface MobileNavItemProps {
  icon: any;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 transition-all w-20 ${isActive ? 'text-[#B91C1C]' : 'text-slate-400'}`}
  >
    <div className={`p-3 rounded-2xl transition-all duration-500 ${isActive ? 'bg-[#0F172A] text-white shadow-xl scale-110 -translate-y-1' : 'hover:bg-slate-50'}`}>
      <Icon size={20} />
    </div>
    <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${isActive ? 'opacity-100 scale-100' : 'opacity-40 scale-90'}`}>{label}</span>
  </button>
);

export default App;
