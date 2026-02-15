/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileProcessingService } from './services/fileProcessingService';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ChevronDown,
  Monitor,
  Cpu,
  Layers,
  ArrowUpRight,
  Lock,
  Briefcase,
  DollarSign,
  Archive,
  Link2,
  ShieldAlert,
  Users,
  Mic,
  Plane,
  Fingerprint,
  Network,
  History,
  Search
} from 'lucide-react';
import { Sidebar, ViewType } from './components/Sidebar';
import { CaseListView } from './components/CaseListView';
import { NetworkGraphView } from './components/NetworkGraphView';
import { NetworkGraphView3D } from './components/NetworkGraphView3D';
import { TimelineView } from './components/TimelineView';
import { ContradictionsView, POIView } from './components/AdvancedModules';
import { FinancialFlowView } from './components/FinancialFlowView';
import { AssetsView } from './components/AssetsView';
import { CrossSessionView } from './components/CrossSessionView';
import { FlightLogsView } from './components/FlightLogsView';
import { CrossDocumentDiscoveryView } from './components/CrossDocumentDiscoveryView';
import { MainActorsView } from './components/MainActorsView';
import { VoiceAssistant } from './components/VoiceAssistant';
import { Auth } from './components/Auth';
import { BackgroundAIView, FileTask } from './components/BackgroundAIView';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

import { useOptimistic, useTransition } from 'react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(localStorage.getItem('GUEST_MODE') === 'true');
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
      return [newResult, ...state];
    }
  );

  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewType>(
    localStorage.getItem('GUEST_MODE') === 'true' ? 'database' : 'lab'
  );
  const [showPlanner, setShowPlanner] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [showTabsDropdown, setShowTabsDropdown] = useState(false);
  const [is3DView, setIs3DView] = useState<boolean>(
    localStorage.getItem('NETWORK_3D_VIEW') === 'true'
  );
  const [selectedAiModel, setSelectedAiModel] = useState<string>(
    localStorage.getItem('SELECTED_AI_MODEL') || 'google/gemini-2.0-flash-lite-preview-02-05'
  );
  const [openRouterKey, setOpenRouterKey] = useState<string>(
    localStorage.getItem('OPENROUTER_API_KEY') || ''
  );
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  // Background AI Tasks State
  const [bgTasks, setBgTasks] = useState<FileTask[]>([]);
  const [isBgProcessing, setIsBgProcessing] = useState(false);
  const [bgStats, setBgStats] = useState({ total: 0, completed: 0, failed: 0 });

  // Background Processing Loop
  const isProcessingRef = useRef(false);
  useEffect(() => {
    if (!isBgProcessing || isProcessingRef.current) return;

    const processNext = async () => {
      const nextIndex = bgTasks.findIndex(t => t.status === 'idle' || t.status === 'error');
      if (nextIndex === -1) {
        setIsBgProcessing(false);
        isProcessingRef.current = false;
        return;
      }

      isProcessingRef.current = true;
      const task = bgTasks[nextIndex];

      // Update task status to extracting
      setBgTasks(prev => {
        const next = [...prev];
        next[nextIndex] = { ...next[nextIndex], status: 'extracting', progress: 10 };
        return next;
      });

      try {
        let content = "";
        let fileName = task.file.name;

        if (task.publicPath) {
          content = await FileProcessingService.extractTextFromPDFUrl(task.publicPath, fileName, (msg) => {
            setBgTasks(prev => {
              const next = [...prev];
              if (next[nextIndex]) next[nextIndex] = { ...next[nextIndex], progress: 30 };
              return next;
            });
          });
        } else {
          const processed = await FileProcessingService.processFile(task.file, (msg) => {
            setBgTasks(prev => {
              const next = [...prev];
              if (next[nextIndex]) next[nextIndex] = { ...next[nextIndex], progress: 30 };
              return next;
            });
          });
          content = processed.content;
        }

        setBgTasks(prev => {
          const next = [...prev];
          if (next[nextIndex]) next[nextIndex] = { ...next[nextIndex], status: 'analyzing', progress: 50 };
          return next;
        });

        const newId = `BG-${Date.now().toString().slice(-4)}-${nextIndex}`;
        const inputData: InputData = {
          id: newId,
          query: `ANALYSE AUTOMATIQUE : Effectuez une extraction structurée des faits, entités et dates clés de ce document judiciaire.`,
          targetUrl: task.publicPath || `LOCAL_FILE: ${fileName}`,
          timestamp: Date.now(),
          fileContent: content
        } as any;

        const result = await mergeDataWithFlash(inputData);

        const completedResult: ProcessedResult = {
          id: newId,
          input: inputData,
          output: result.json,
          logs: result.logs,
          sources: [{ title: fileName, uri: task.publicPath || 'local' }],
          durationMs: 0,
          status: 'completed'
        };

        await storageService.saveResult(completedResult);

        // Sync with main history
        setResolutionHistory(prev => [completedResult, ...prev.filter(r => r.id !== completedResult.id)]);
        setProcessedCount(prev => prev + 1);

        setBgTasks(prev => {
          const next = [...prev];
          if (next[nextIndex]) next[nextIndex] = { ...next[nextIndex], status: 'completed', progress: 100, resultId: newId };
          return next;
        });
        setBgStats(prev => ({ ...prev, completed: prev.completed + 1 }));

      } catch (error: any) {
        console.error("Background task error", error);
        setBgTasks(prev => {
          const next = [...prev];
          if (next[nextIndex]) next[nextIndex] = { ...next[nextIndex], status: 'error', error: error.message };
          return next;
        });
        setBgStats(prev => ({ ...prev, failed: prev.failed + 1 }));
      } finally {
        isProcessingRef.current = false;
      }
    };

    processNext();
  }, [isBgProcessing, bgTasks.length, bgStats.completed, bgStats.failed]);

  const handleModelChange = (modelId: string) => {
    setSelectedAiModel(modelId);
    localStorage.setItem('SELECTED_AI_MODEL', modelId);
  };

  const handleKeyChange = (key: string) => {
    setOpenRouterKey(key);
    localStorage.setItem('OPENROUTER_API_KEY', key);
  };

  const handleLogout = async () => {
    setIsGuestMode(false);
    localStorage.removeItem('GUEST_MODE');
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

      setResolutionHistory(prev => [tempResult, ...prev.filter(r => r.id !== item.id)]);
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

  const analyzedFilePaths = useMemo(() => {
    return new Set(
      resolutionHistory
        .filter(r => r.input.targetUrl.startsWith('/epstein/') && r.status === 'completed')
        .map(r => r.input.targetUrl)
    );
  }, [resolutionHistory]);

  const handleOpenAnalysis = (path: string) => {
    const existing = resolutionHistory.find(r => r.input.targetUrl === path && r.status === 'completed');
    if (existing) {
      setActiveTabId(existing.id);
      setViewMode('lab');
    }
  };

  const handleAnalyzeFile = async (file: { name: string, path: string }) => {
    const existing = resolutionHistory.find(r => r.input.targetUrl === file.path);
    if (existing) {
      handleOpenAnalysis(file.path);
      return;
    }
    const newId = `FILE-${Date.now().toString().slice(-4)}`;

    // Create optimistic pending result
    const placeholder: ProcessedResult = {
      id: newId,
      input: {
        id: newId,
        query: `ANALYSE DOC : ${file.name}`,
        targetUrl: file.path,
        timestamp: Date.now()
      } as any,
      output: null,
      logs: ["Préparation de l'extraction forensique...", `Cible : ${file.name}`],
      sources: [],
      durationMs: 0,
      status: 'processing',
    };

    startTransition(() => {
      addOptimisticHistory(placeholder);
      setViewMode('lab');
      setActiveTabId(newId);
    });

    try {
      // Extract text from the PDF file in the archive
      const fileContent = await FileProcessingService.extractTextFromPDFUrl(file.path, file.name, (msg) => {
        setLogs(prev => [...prev, msg]);
        setResolutionHistory(prev => prev.map(r => r.id === newId ? { ...r, logs: [...(r.logs || []), msg] } : r));
      });

      const inputData: InputData = {
        id: newId,
        query: `ANALYSE DE DOCUMENT : Effectue une analyse exhaustive du document judiciaire "${file.name}". Identifie les parties prenantes, les accusations, les dates clés et les éventuelles contradictions ou éléments suspects.`,
        targetUrl: file.path,
        timestamp: Date.now(),
        fileContent: fileContent
      } as any;

      // Add to queue for LLM processing
      setQueue(prev => [inputData, ...prev]);
    } catch (error) {
      console.error("Archive analysis failed", error);
      alert("Erreur lors de l'analyse du document archive.");
    }
  };

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

  const handleRetryInvestigation = (id: string) => {
    const existing = resolutionHistory.find(r => r.id === id);
    if (!existing) return;

    const retryingResult: ProcessedResult = {
      ...existing,
      status: 'processing',
      output: null,
      logs: ["Relance de l'extraction forensique...", "Restauration du contexte..."],
    };

    setResolutionHistory(prev => prev.map(r => r.id === id ? retryingResult : r));
    setQueue(prev => [existing.input, ...prev]);
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

  if (isSupabaseConfigured && !session && !isGuestMode) {
    return <Auth onGuestAccess={() => {
      setIsGuestMode(true);
      localStorage.setItem('GUEST_MODE', 'true');
      setViewMode('database');
    }} />;
  }

  return (
    <div className="flex flex-col lg:flex-row bg-[#F8FAFC] text-[#0F172A] min-h-screen overflow-hidden font-sans">

      {/* 1. Global Navigation Sidebar - Premium Responsive Navigation */}
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
        onLogout={handleLogout}
        isGuestMode={isGuestMode}
      />

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



            <div className="hidden lg:block h-8 w-[1px] bg-slate-100"></div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-start hidden sm:flex">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] mb-0.5">Index Central</span>
                <div className="flex items-center gap-1.5">
                  <div className="text-xl font-mono-data font-black text-[#B91C1C] leading-none">{processedCount}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter self-end mb-0.5 whitespace-nowrap">Dossiers analysés</div>
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
                {/* Lab Sidebar: Queue - Modern Sidebar */}
                {queue.length > 0 && (
                  <section className="hidden lg:flex lg:col-span-3 xl:col-span-2 border-r border-slate-100 bg-white flex-col overflow-hidden min-h-0 relative z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] animate-in slide-in-from-left duration-700">
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.1] report-paper"></div>

                    <div className="p-6 pb-4 flex flex-col gap-1 border-b border-slate-50 bg-white/50 backdrop-blur-md relative z-10">
                      <div className="text-[9px] font-black text-[#B91C1C] uppercase tracking-[0.4em] mb-1 flex items-center gap-2">
                        <Activity size={10} className="animate-pulse" /> Live Pipeline
                      </div>
                      <div className="flex justify-between items-center">
                        <h2 className="text-[14px] font-black text-[#0F172A] italic font-serif-legal">Neural Queue</h2>
                        <div className="flex items-center justify-center px-2 py-0.5 bg-slate-900 text-white rounded-md font-mono-data font-black text-[10px] shadow-lg">
                          {queue.length}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 relative z-10">
                      {queue.map((item, idx) => (
                        <div key={item.id}
                          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-left-4 group hover:shadow-xl hover:border-[#B91C1C]/10 transition-all duration-500 cursor-wait relative overflow-hidden"
                          style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-[#B91C1C]/20 group-hover:bg-[#B91C1C] transition-all"></div>
                          <div className="flex justify-between items-start mb-2 pl-2">
                            <div className="text-[9px] font-mono-data font-black text-slate-300 group-hover:text-[#B91C1C] transition-colors">{item.id}</div>
                            <Loader2 size={10} className="text-[#B91C1C] animate-spin" />
                          </div>
                          <div className="text-[12px] text-slate-500 font-bold line-clamp-2 leading-snug italic group-hover:text-[#0F172A] transition-colors pl-2">"{item.query}"</div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-slate-50 bg-[#F8FAFC]/50 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Agent Monitoring Active</span>
                    </div>
                  </section>
                )}

                {/* Main Lab Area */}
                <section className={`${queue.length > 0 ? 'lg:col-span-9 xl:col-span-10' : 'lg:col-span-12'} flex flex-col overflow-hidden min-h-0 bg-[#F8FAFC]`}>
                  {/* Modern Pro Tab Bar */}
                  <div className="flex flex-col bg-[#F8FAFC] shrink-0 z-20">
                    {/* Neural Link Status Line */}
                    <div className="h-0.5 w-full bg-slate-100 relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-[#B91C1C] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                    </div>

                    <div className="flex items-center h-12 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4">


                      <div className="flex-1 flex items-center overflow-x-auto no-scrollbar gap-1 relative h-full">
                        {optimisticHistory.length > 0 && (
                          <button
                            onClick={() => {
                              setViewMode('lab');
                              setShowPlanner(true);
                              setActiveTabId(null);
                            }}
                            className={`flex items-center justify-center w-10 h-8 rounded-lg transition-all shadow-sm border shrink-0 group ${showPlanner ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-xl rotate-0' : 'bg-white border-slate-100 text-slate-400 hover:text-[#B91C1C] hover:border-[#B91C1C] -rotate-3 hover:rotate-0'}`}
                            title="Nouvelle Analyse"
                          >
                            <Plus size={18} className={`${showPlanner ? 'rotate-90' : 'group-hover:rotate-90'} transition-transform`} />
                          </button>
                        )}

                        <div className="h-4 w-px bg-slate-100 mx-2"></div>

                        {optimisticHistory.map((res) => (
                          <div
                            key={res.id}
                            onClick={() => {
                              setActiveTabId(res.id);
                              setShowPlanner(false);
                            }}
                            className={`group flex items-center gap-3 px-5 h-8.5 cursor-pointer min-w-[140px] max-w-[200px] transition-all duration-300 relative rounded-xl border select-none ${activeTabId === res.id && !showPlanner
                              ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-xl -translate-y-0.5 z-10'
                              : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200'
                              }`}
                          >
                            <div className="flex flex-col overflow-hidden flex-1">
                              <span className={`text-[7px] font-mono-data font-black tracking-widest leading-none mb-0.5 ${activeTabId === res.id && !showPlanner ? 'text-[#B91C1C]' : 'text-slate-300'}`}>{res.id}</span>
                              <span className={`text-[11px] font-black truncate italic font-serif-legal ${activeTabId === res.id && !showPlanner ? 'text-white' : 'text-slate-600'}`}>{res.input?.query || 'Analyse'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {res.status === 'processing' ? (
                                <Loader2 size={10} className="text-[#B91C1C] animate-spin" />
                              ) : (
                                <div
                                  role="button"
                                  onClick={(e) => handleCloseTab(e, res.id)}
                                  className={`w-5 h-5 flex items-center justify-center rounded-lg transition-all ${activeTabId === res.id && !showPlanner ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'text-slate-300 hover:bg-slate-100 hover:text-[#B91C1C]'}`}
                                >
                                  <X size={10} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {optimisticHistory.length === 0 && (
                          <div className="flex items-center gap-4 ml-2 animate-pulse">
                            <span className="text-[10px] text-slate-300 uppercase font-black tracking-[0.4em] italic font-serif-legal">Prêt pour Analyse...</span>
                            <div className="h-0.5 w-12 bg-slate-100 relative">
                              <div className="absolute inset-y-0 left-0 w-1/3 bg-[#B91C1C]"></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Dropdown Menu - Modern */}
                      {optimisticHistory.length > 5 && (
                        <div className="flex items-center pl-4 ml-4 border-l border-slate-100 relative h-full">
                          <button
                            onClick={() => setShowFullHistory(true)}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${showFullHistory ? 'bg-[#B91C1C] text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-[#0F172A]'}`}
                            title="Historique des Analyses"
                          >
                            <History size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="flex-1 bg-white overflow-hidden relative flex flex-col min-h-0">
                    {activeResult && !showPlanner ? (
                      <div className="flex-1 flex flex-col overflow-hidden animate-pro-reveal min-h-0">
                        {/* Investigation Header Info */}

                        <div className="px-6 lg:px-8 py-5 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white shrink-0 gap-6 relative overflow-hidden">
                          <div className="max-w-6xl relative z-10">
                            <div className="flex flex-wrap items-center gap-4 mb-3">
                              <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 group">
                                <div className={`w-2 h-2 rounded-full ${activeResult.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-[#DC2626] animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.4)]'}`}></div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${activeResult.status === 'completed' ? 'text-emerald-700' : 'text-[#DC2626]'}`}>
                                  {activeResult.status === 'completed' ? 'Extraction Validée' : 'Analyse de Flux...'}
                                </span>
                              </div>
                              <div className="h-4 w-px bg-slate-200"></div>
                              <div className="flex items-center gap-2">
                                <Monitor size={14} className="text-slate-400" />
                                <span className="text-[11px] text-slate-500 font-mono-data font-bold uppercase tracking-tight">{activeResult.input.targetUrl.split(' : ')[1] || activeResult.input.targetUrl}</span>
                              </div>
                            </div>
                            <h2 className="text-lg lg:text-xl font-black text-[#020617] font-display tracking-tight leading-tight group">
                              <span className="text-[#DC2626] opacity-30 mr-1.5 group-hover:opacity-100 transition-opacity">/</span>
                              {activeResult.input.query}
                            </h2>
                          </div>

                          <div className="lg:text-right shrink-0 relative z-10">
                            <div className="flex items-center gap-2 lg:justify-end mb-1">
                              <span className="text-[9px] text-slate-400 uppercase font-black tracking-[0.3em]">Latence</span>
                            </div>
                            <div className="flex items-baseline gap-1.5 lg:justify-end">
                              <div className="text-xl font-mono-data font-black text-[#DC2626] tracking-tighter">{activeResult.durationMs ? Math.round(activeResult.durationMs) : '000'}</div>
                              <div className="text-[12px] font-black text-slate-300 uppercase">ms</div>
                            </div>
                          </div>
                        </div>


                        {/* Analysis Body */}
                        <div className="flex-1 overflow-y-auto p-2 lg:p-2 custom-scrollbar report-paper relative">
                          <div className="max-w-12xl mx-auto pb-40">
                            <DataCard
                              result={activeResult}
                              loading={activeResult.status === 'processing' || activeResult.status === 'pending'}
                              onDeepDive={handleDeepDive}
                              onDownload={() => handleDownload(activeResult)}
                              onEntityClick={handleEntityClick}
                              isGuestMode={isGuestMode}
                              onRetry={() => handleRetryInvestigation(activeResult.id)}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 p-8 lg:p-2 animate-pro-reveal duration-1000 overflow-y-auto custom-scrollbar min-h-0 bg-[#F8FAFC]">
                        <div className="max-w-12xl mx-auto py-2 relative">
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

            {viewMode === 'background_ai' && (
              <div className="h-full overflow-hidden animate-pro-reveal">
                <BackgroundAIView
                  onOpenAnalysis={handleOpenInvestigation}
                  tasks={bgTasks}
                  setTasks={setBgTasks}
                  isProcessing={isBgProcessing}
                  setIsProcessing={setIsBgProcessing}
                  stats={bgStats}
                  setStats={setBgStats}
                  analyzedTargets={new Set(resolutionHistory.map(r => r.input.targetUrl))}
                />
              </div>
            )}

            {viewMode === 'database' && (
              <div className="h-full overflow-hidden bg-white">
                <ResultsDashboard
                  history={optimisticHistory}
                  onDeepDive={handleDeepDive}
                  onOpenInvestigation={handleOpenInvestigation}
                  isGuestMode={isGuestMode}
                />
              </div>
            )}

            {viewMode === 'network' && (
              <div className="h-full bg-slate-50 relative">
                {/* Conditional Rendering */}
                {is3DView ? (
                  <NetworkGraphView3D
                    onDeepDive={handleDeepDive}
                    onNavigateToInvestigation={handleOpenInvestigation}
                    isGuestMode={isGuestMode}
                    onToggle2D3D={() => {
                      const newValue = !is3DView;
                      setIs3DView(newValue);
                      localStorage.setItem('NETWORK_3D_VIEW', String(newValue));
                    }}
                  />
                ) : (
                  <NetworkGraphView
                    onDeepDive={handleDeepDive}
                    onNavigateToInvestigation={handleOpenInvestigation}
                    isGuestMode={isGuestMode}
                    onToggle2D3D={() => {
                      const newValue = !is3DView;
                      setIs3DView(newValue);
                      localStorage.setItem('NETWORK_3D_VIEW', String(newValue));
                    }}
                  />
                )}
              </div>
            )}

            {viewMode === 'timeline' && <TimelineView onDeepDive={handleDeepDive} isGuestMode={isGuestMode} />}
            {viewMode === 'actors' && <MainActorsView onEntityClick={handleEntityClick} isGuestMode={isGuestMode} />}
            {viewMode === 'contradictions' && <ContradictionsView onDeepDive={handleDeepDive} isGuestMode={isGuestMode} />}
            {viewMode === 'poi' && <POIView onDeepDive={handleDeepDive} isGuestMode={isGuestMode} />}
            {viewMode === 'finance' && <FinancialFlowView />}
            {viewMode === 'assets' && <AssetsView />}
            {viewMode === 'cross' && <CrossSessionView onNavigateToInvestigation={handleOpenInvestigation} />}
            {viewMode === 'voice' && <VoiceAssistant />}
            {viewMode === 'flights' && <FlightLogsView />}
            {viewMode === 'discovery' && <CrossDocumentDiscoveryView onNavigateToInvestigation={handleOpenInvestigation} />}
          </div>
        </main >


      </div >

      {!isGuestMode && <LiveAssistant />}

      {
        showFullHistory && (
          <div className="fixed inset-0 z-[110] bg-white animate-in zoom-in-95 fade-in duration-500 flex flex-col pt-0">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.2] report-paper"></div>

            <header className="px-6 lg:px-20 py-8 border-b border-slate-100 bg-white/50 backdrop-blur-xl shrink-0 z-10 relative">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between max-w-[1600px] mx-auto gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-xl">
                    <History className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#0F172A] uppercase italic font-serif-legal tracking-tight">Dossiers <span className="text-[#B91C1C]">Historiques</span></h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C] animate-pulse"></div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Neural Database Index</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 max-w-2xl px-4 lg:px-10">
                  <div className="relative group w-full">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#B91C1C] transition-colors">
                      <Search size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher dans les archives neurales (ID, Query, URL)..."
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-sm focus:bg-white focus:border-[#B91C1C] focus:ring-4 focus:ring-red-900/5 transition-all outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden lg:flex flex-col items-end pr-6 border-r border-slate-100">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Total Archive</span>
                    <span className="text-lg font-mono-data font-black text-[#0F172A] leading-none mt-1">{optimisticHistory.length}</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowFullHistory(false);
                      setHistorySearchTerm('');
                    }}
                    className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#B91C1C] hover:border-[#B91C1C] transition-all shadow-lg active:scale-95 group"
                  >
                    <X size={20} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 lg:p-20 custom-scrollbar z-10">
              <div className="max-w-[1600px] mx-auto space-y-12">
                {(() => {
                  const filtered = optimisticHistory.filter(res =>
                    res.input?.query?.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                    res.input?.targetUrl?.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                    res.id.toLowerCase().includes(historySearchTerm.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-40 animate-pro-reveal">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100">
                          <Search size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-lg font-black text-slate-300 uppercase tracking-[0.4em] italic font-serif-legal">Aucun dossier correspondant</h3>
                        <button
                          onClick={() => setHistorySearchTerm('')}
                          className="mt-6 text-[10px] font-black text-[#B91C1C] uppercase tracking-widest hover:underline"
                        >
                          Réinitialiser la recherche
                        </button>
                      </div>
                    );
                  }

                  const grouped = filtered.reduce((acc, res) => {
                    const cat = res.input?.targetUrl || 'Analyses Diverses';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(res);
                    return acc;
                  }, {} as Record<string, typeof optimisticHistory>);

                  return Object.entries(grouped).map(([category, items]) => (
                    <section key={category} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-slate-100"></div>
                        <div className="flex items-center gap-3 px-6 py-2 bg-slate-50 border border-slate-100 rounded-full shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-md">{category}</h3>
                          <span className="text-[9px] font-mono-data font-black text-slate-300 ml-2">({items.length})</span>
                        </div>
                        <div className="h-px flex-1 bg-slate-100"></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {items.map((res) => (
                          <button
                            key={res.id}
                            onClick={() => {
                              setActiveTabId(res.id);
                              setShowPlanner(false);
                              setShowFullHistory(false);
                              setHistorySearchTerm('');
                            }}
                            className={`flex flex-col p-6 rounded-3xl border text-left transition-all relative group overflow-hidden ${activeTabId === res.id && !showPlanner
                              ? 'bg-[#0F172A] border-[#0F172A] shadow-2xl scale-[1.02] z-20'
                              : 'bg-white border-slate-100 hover:border-[#B91C1C]/30 shadow-sm hover:shadow-xl hover:-translate-y-1'
                              }`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex flex-col">
                                <span className={`text-[8px] font-mono-data font-black tracking-widest ${activeTabId === res.id && !showPlanner ? 'text-[#B91C1C]' : 'text-slate-300'}`}>
                                  #{res.id.slice(0, 10)}
                                </span>
                                <span className={`text-[8px] font-black uppercase mt-0.5 ${activeTabId === res.id && !showPlanner ? 'text-slate-400' : 'text-slate-300'}`}>
                                  {new Date(res.timestamp || (res.input as any).timestamp || Date.now()).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              {res.status === 'processing' ? (
                                <Loader2 size={12} className="text-[#B91C1C] animate-spin" />
                              ) : res.status === 'completed' ? (
                                <ShieldCheck size={12} className="text-emerald-500" />
                              ) : (
                                <Activity size={12} className="text-[#B91C1C]" />
                              )}
                            </div>

                            <h4 className={`text-[13px] font-bold italic font-serif-legal leading-relaxed mb-4 line-clamp-2 h-10 ${activeTabId === res.id && !showPlanner ? 'text-white' : 'text-[#0F172A]'}`}>
                              "{res.input?.query || 'Analyse Neutre'}"
                            </h4>

                            <div className={`mt-auto pt-4 border-t flex items-center justify-between ${activeTabId === res.id && !showPlanner ? 'border-white/10' : 'border-slate-50'}`}>
                              <span className={`text-[7px] font-black uppercase tracking-widest flex items-center gap-1.5 ${activeTabId === res.id && !showPlanner ? 'text-slate-400' : 'text-slate-300'}`}>
                                <Cpu size={10} /> Forensic Node {res.id.slice(-2)}
                              </span>
                              <ArrowUpRight size={12} className={`${activeTabId === res.id && !showPlanner ? 'text-[#B91C1C]' : 'text-slate-200 group-hover:text-[#B91C1C]'} transition-colors`} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  ));
                })()}
              </div>
            </div>

            <footer className="px-10 py-4 border-t border-slate-50 bg-[#F8FAFC]/50 flex justify-between items-center shrink-0">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Neural Database Status: SECURED_IDLE
              </span>
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic font-serif-legal">SECURE_LEGAL_PROTOCOL_V4</span>
            </footer>
          </div>
        )
      }

      {/* LOGS OVERLAY - PRO STYLE */}
      {
        !isGuestMode && showLogs && (
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
        isGuestMode={isGuestMode}
      />

    </div >
  );
};



export default App;
