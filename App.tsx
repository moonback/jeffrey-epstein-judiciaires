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
  Search,
  Menu
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#F8FAFC]">

        {/* PREMIUM MODULE HEADER - Pro Design System */}
        <header className="px-6 h-16 lg:h-20 shrink-0 flex justify-between items-center bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)] z-40 shadow-sm relative">
          <div className="flex gap-4 lg:gap-10 items-center">
            {/* Mobile Logo & Menu Trigger */}
            <div className="lg:hidden flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2.5 -ml-2 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-muted)] rounded-[var(--radius-md)] transition-all"
                aria-label="Ouvrir le menu"
              >
                <Menu size={24} />
              </button>
              <div className="p-2 bg-[var(--accent)] rounded-[var(--radius-sm)] shadow-lg shadow-red-900/20">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <h1 className="text-lg font-black tracking-tighter text-[var(--primary)] uppercase italic font-display">
                DOJ <span className="text-[var(--accent)] font-legal font-black tracking-normal">Forensic</span>
              </h1>
            </div>

            <div className="hidden lg:block h-10 w-px bg-[var(--border)]"></div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-start hidden sm:flex">
                <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em] mb-1">Index Central Analytique</span>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-mono-data font-black text-[var(--accent)] leading-none">{processedCount}</div>
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight self-end mb-0.5 whitespace-nowrap">Dossiers de Preuves</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            {isProcessing && (
              <div className="flex gap-3 items-center bg-[var(--accent)]/5 px-5 py-2.5 rounded-[var(--radius-md)] text-[10px] text-[var(--accent)] border border-[var(--accent)]/10 shadow-sm animate-pulse">
                <Loader2 size={16} className="animate-spin" />
                <span className="font-black uppercase tracking-[0.2em] hidden xs:block">Traitement Neural en cours...</span>
              </div>
            )}

            <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold text-[var(--text-muted)] uppercase border-l border-[var(--border)] pl-8 tracking-[0.15em]">
              {session?.user?.email && (
                <div className="flex flex-col items-start pr-8 border-r border-[var(--border)]">
                  <span className="text-[var(--text-dim)] text-[8px] mb-1 uppercase tracking-[0.2em]">Agent de Liaison Certifié</span>
                  <div className="flex items-center gap-2 text-[var(--primary)] font-black">
                    <div className="w-5 h-5 rounded-[var(--radius-sm)] bg-[var(--primary)] flex items-center justify-center shadow-md">
                      <ShieldCheck size={12} className="text-white" />
                    </div>
                    <span className="truncate max-w-[150px]">{session.user.email}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] hover:border-[var(--accent)]/30 hover:shadow-md"
              title="Paramètres Globaux"
            >
              <Settings size={22} />
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
                  <section className="hidden lg:flex lg:col-span-3 xl:col-span-2 border-r border-[var(--border)] bg-[var(--surface)] flex-col overflow-hidden min-h-0 relative z-30 shadow-2xl shadow-slate-900/5 animate-reveal">
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05] report-paper"></div>

                    <div className="p-8 pb-6 flex flex-col gap-2 border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-md relative z-10">
                      <div className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.4em] mb-1 flex items-center gap-2">
                        <Activity size={12} className="animate-pulse" /> Live Pipeline
                      </div>
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-black text-[var(--primary)] italic font-legal">Neural Queue</h2>
                        <div className="flex items-center justify-center px-2.5 py-1 bg-[var(--primary)] text-white rounded-[var(--radius-sm)] font-mono-data font-black text-[10px] shadow-lg">
                          {queue.length}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 relative z-10">
                      {queue.map((item, idx) => (
                        <div key={item.id}
                          className="bg-[var(--surface)] p-5 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-sm group hover:shadow-xl hover:border-[var(--accent)]/20 transition-all duration-500 cursor-wait relative overflow-hidden"
                          style={{ animation: `reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.1}s forwards`, opacity: 0 }}
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)]/20 group-hover:bg-[var(--accent)] transition-all"></div>
                          <div className="flex justify-between items-start mb-2.5">
                            <div className="text-[10px] font-mono-data font-bold text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors">{item.id}</div>
                            <Loader2 size={12} className="text-[var(--accent)] animate-spin" />
                          </div>
                          <div className="text-[13px] text-[var(--text-muted)] font-medium line-clamp-2 leading-relaxed italic group-hover:text-[var(--primary)] transition-colors">"{item.query}"</div>
                        </div>
                      ))}
                    </div>

                    <div className="p-5 border-t border-[var(--border)] bg-[var(--background)]/50 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Agent Monitoring Active</span>
                    </div>
                  </section>
                )}

                {/* Main Lab Area */}
                <section className={`${queue.length > 0 ? 'lg:col-span-9 xl:col-span-10' : 'lg:col-span-12'} flex flex-col overflow-hidden min-h-0 bg-[var(--background)]`}>
                  {/* Modern Pro Tab Bar */}
                  <div className="flex flex-col bg-[var(--background)] shrink-0 z-20">
                    {/* Status Line */}
                    <div className="h-0.5 w-full bg-[var(--border)] relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent animate-shimmer"></div>
                    </div>

                    <div className="flex items-center h-14 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border)] px-6 overflow-x-auto no-scrollbar">
                      <div className="flex items-center gap-2 relative h-full">
                        {optimisticHistory.length > 0 && (
                          <button
                            onClick={() => {
                              setViewMode('lab');
                              setShowPlanner(true);
                              setActiveTabId(null);
                            }}
                            className={`flex items-center justify-center w-10 h-9 rounded-[var(--radius-md)] transition-all shadow-sm border shrink-0 group ${showPlanner ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-xl rotate-0' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 -rotate-2 hover:rotate-0'}`}
                            title="Nouvelle Analyse"
                          >
                            <Plus size={20} className={`${showPlanner ? 'rotate-90' : 'group-hover:rotate-90'} transition-transform duration-500`} />
                          </button>
                        )}

                        <div className="h-5 w-px bg-[var(--border)] mx-3"></div>

                        {optimisticHistory.map((res) => (
                          <div
                            key={res.id}
                            onClick={() => {
                              setViewMode('lab');
                              setShowPlanner(false);
                              setActiveTabId(res.id);
                            }}
                            className={`group relative h-9 px-6 flex items-center gap-3 cursor-pointer transition-all duration-300 rounded-[var(--radius-md)] border-x border-t border-transparent select-none whitespace-nowrap min-w-[140px] max-w-[240px]
                              ${activeTabId === res.id && !showPlanner
                                ? 'bg-[var(--surface)] text-[var(--primary)] border-[var(--border)] shadow-sm translate-y-[-1px]'
                                : 'text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-muted)]/50'
                              }`}
                          >
                            <Terminal size={14} className={`${activeTabId === res.id && !showPlanner ? 'text-[var(--accent)]' : 'text-[var(--text-dim)] group-hover:text-[var(--accent)]'} transition-colors duration-500`} />
                            <span className={`text-xs font-bold truncate transition-all ${activeTabId === res.id && !showPlanner ? 'tracking-normal' : 'tracking-tight'}`}>
                              {res.input.query.slice(0, 30)}...
                            </span>

                            <button
                              onClick={(e) => handleCloseTab(e, res.id)}
                              className={`ml-2 p-1 rounded-full transition-all group-hover:bg-[var(--accent)]/10 group-hover:text-[var(--accent)] ${activeTabId === res.id && !showPlanner ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            >
                              <X size={12} strokeWidth={3} />
                            </button>

                            {activeTabId === res.id && !showPlanner && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-t-full shadow-[0_-2px_8px_var(--accent)]"></div>
                            )}
                          </div>
                        ))}
                      </div>

                      {optimisticHistory.length > 5 && (
                        <div className="relative ml-auto px-4 border-l border-[var(--border)] flex items-center gap-3">
                          <button
                            onClick={() => setShowFullHistory(true)}
                            className="bg-[var(--surface)] p-2 rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] shadow-sm transition-all"
                            title="Historique Complet"
                          >
                            <History size={18} />
                          </button>

                          <button
                            onClick={() => setShowTabsDropdown(!showTabsDropdown)}
                            className="bg-[var(--surface)] p-2 rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] shadow-sm transition-all"
                          >
                            <ChevronDown size={18} className={`${showTabsDropdown ? 'rotate-180' : ''} transition-transform duration-500`} />
                          </button>

                          {showTabsDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-2xl z-50 p-3 overflow-hidden animate-reveal">
                              <div className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em] mb-3 px-3">Sessions d'Analyse Active</div>
                              <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-1">
                                {optimisticHistory.map(res => (
                                  <button
                                    key={res.id}
                                    onClick={() => {
                                      setActiveTabId(res.id);
                                      setShowPlanner(false);
                                      setShowTabsDropdown(false);
                                    }}
                                    className={`w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] text-xs font-bold truncate transition-all ${activeTabId === res.id ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--primary)]'}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Terminal size={12} className={activeTabId === res.id ? 'text-white' : 'text-[var(--text-dim)]'} />
                                      <span className="truncate">{res.input.query}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="flex-1 bg-[var(--background)] overflow-hidden relative flex flex-col min-h-0">
                    {activeResult && !showPlanner ? (
                      <div className="flex-1 flex flex-col overflow-hidden animate-reveal min-h-0">
                        {/* Investigation Header Info - Modernized */}
                        <div className="px-8 py-6 border-b border-[var(--border)] flex flex-col lg:flex-row justify-between items-start lg:items-center bg-[var(--surface)]/50 backdrop-blur-xl shrink-0 gap-6 relative overflow-hidden">
                          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-noise"></div>

                          <div className="max-w-6xl relative z-10 flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--surface-muted)] border border-[var(--border)] group">
                                <div className={`w-2 h-2 rounded-full ${activeResult.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-[var(--accent)] animate-pulse shadow-[0_0_8px_var(--accent)]'}`}></div>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${activeResult.status === 'completed' ? 'text-emerald-700' : 'text-[var(--accent)]'}`}>
                                  {activeResult.status === 'completed' ? 'Extraction Validée' : 'Analyse de Flux...'}
                                </span>
                              </div>
                              <div className="h-4 w-px bg-[var(--border)]"></div>
                              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                <Monitor size={14} />
                                <span className="text-[11px] font-mono-data font-black uppercase tracking-tight">{activeResult.input.targetUrl.split(' : ')[1] || activeResult.input.targetUrl}</span>
                              </div>
                            </div>
                            <h2 className="text-xl lg:text-2xl font-black text-[var(--primary)] font-display tracking-tight leading-tight group flex items-center gap-3">
                              <span className="text-[var(--accent)] opacity-40 font-legal">/</span>
                              {activeResult.input.query}
                            </h2>
                          </div>

                          <div className="lg:text-right shrink-0 relative z-10 flex flex-col items-end gap-1">
                            <span className="text-[9px] text-[var(--text-dim)] uppercase font-black tracking-[0.3em]">Latence Forensique</span>
                            <div className="flex items-baseline gap-1.5">
                              <div className="text-3xl font-mono-data font-black text-[var(--accent)] tracking-tighter">{activeResult.durationMs ? Math.round(activeResult.durationMs) : '000'}</div>
                              <div className="text-sm font-black text-[var(--text-dim)] uppercase">ms</div>
                            </div>
                          </div>
                        </div>

                        {/* Analysis Body - Modernized */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar report-paper relative">
                          <div className="max-w-7xl mx-auto p-8 lg:p-12 pb-40">
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
                      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-[var(--background)] relative">
                        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] bg-[var(--accent)]/10"></div>

                        {/* Investigation Planner Interface */}
                        <div className="flex-1 p-8 lg:p-16 animate-reveal">
                          <div className="max-w-5xl mx-auto py-10 relative">
                            {/* Visual Glows */}
                            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--accent)] rounded-full blur-[140px] opacity-[0.05]"></div>
                            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--primary)] rounded-full blur-[140px] opacity-[0.05]"></div>

                            <InvestigationPlanner onStartInvestigation={handleStartInvestigation} />
                          </div>
                        </div>

                        {showPlanner && activeResult && (
                          <button
                            onClick={() => setShowPlanner(false)}
                            className="fixed bottom-12 right-12 p-5 bg-[var(--surface)] text-[var(--primary)] rounded-full border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] shadow-2xl transition-all z-20 hover:scale-110 active:scale-95 group"
                          >
                            <X size={28} className="group-hover:rotate-90 transition-transform" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* Other Views Integration */}
            {viewMode === 'background_ai' && (
              <div className="h-full overflow-hidden animate-reveal bg-[var(--background)]">
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
              <div className="h-full overflow-hidden bg-[var(--surface)]">
                <ResultsDashboard
                  history={optimisticHistory}
                  onDeepDive={handleDeepDive}
                  onOpenInvestigation={handleOpenInvestigation}
                  isGuestMode={isGuestMode}
                />
              </div>
            )}

            {viewMode === 'network' && (
              <div className="h-full bg-[var(--background)] relative">
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
        </main>
      </div>

      {!isGuestMode && <LiveAssistant />}

      {/* FULL HISTORY OVERLAY - Modernized */}
      {showFullHistory && (
        <div className="fixed inset-0 z-[110] bg-[var(--background)] animate-reveal flex flex-col">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05] report-paper"></div>

          <header className="px-8 lg:px-20 py-10 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-2xl shrink-0 z-10 relative shadow-xl shadow-slate-900/5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between max-w-[1600px] mx-auto gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-[var(--primary)] rounded-[var(--radius-xl)] flex items-center justify-center shadow-2xl">
                  <History className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[var(--primary)] uppercase italic font-legal tracking-tight">Dossiers <span className="text-[var(--accent)]">Historiques</span></h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></div>
                    <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em]">Neural Database Index</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 max-w-2xl px-4 lg:px-12 w-full">
                <div className="relative group w-full">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] group-focus-within:text-[var(--accent)] transition-colors">
                    <Search size={22} />
                  </div>
                  <input
                    type="text"
                    placeholder="Recherche cryptographique (ID, Dossier, Source)..."
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    className="w-full bg-[var(--surface-muted)]/50 border border-[var(--border)] rounded-[var(--radius-xl)] py-4 pl-14 pr-8 text-base focus:bg-[var(--surface)] focus:border-[var(--accent)] focus:ring-8 focus:ring-[var(--accent)]/5 transition-all outline-none font-bold text-[var(--primary)] shadow-inner"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden lg:flex flex-col items-end pr-8 border-r border-[var(--border)]">
                  <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">Archives Totales</span>
                  <span className="text-2xl font-mono-data font-black text-[var(--primary)] leading-none mt-1">{optimisticHistory.length}</span>
                </div>
                <button
                  onClick={() => {
                    setShowFullHistory(false);
                    setHistorySearchTerm('');
                  }}
                  className="w-14 h-14 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 hover:shadow-2xl transition-all shadow-lg active:scale-90 group"
                >
                  <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 lg:p-20 custom-scrollbar z-10 relative">
            <div className="max-w-[1600px] mx-auto space-y-16">
              {(() => {
                const filtered = optimisticHistory.filter(res =>
                  res.input?.query?.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                  res.input?.targetUrl?.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                  res.id.toLowerCase().includes(historySearchTerm.toLowerCase())
                );

                if (filtered.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-40 animate-reveal">
                      <div className="w-24 h-24 bg-[var(--surface-muted)] rounded-full flex items-center justify-center mb-10 border border-[var(--border)] shadow-inner">
                        <Search size={40} className="text-[var(--text-dim)] opacity-40" />
                      </div>
                      <h3 className="text-xl font-black text-[var(--text-dim)] uppercase tracking-[0.5em] italic font-legal">Aucune archive neural détectée</h3>
                      <button
                        onClick={() => setHistorySearchTerm('')}
                        className="mt-8 text-xs font-black text-[var(--accent)] uppercase tracking-widest hover:underline hover:opacity-80 transition-opacity"
                      >
                        Réinitialiser les filtres de recherche
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

                return Object.entries(grouped).map(([category, items], gIdx) => (
                  <section key={category} className="space-y-8 animate-reveal" style={{ animationDelay: `${gIdx * 0.1}s` }}>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4 px-8 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-full shadow-premium relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
                        <h3 className="text-[11px] font-black text-[var(--primary)] uppercase tracking-widest truncate max-w-2xl">{category}</h3>
                        <span className="text-[10px] font-mono-data font-black text-[var(--text-dim)] ml-4 bg-[var(--surface-muted)] px-2 py-0.5 rounded-md">/ {items.length}</span>
                      </div>
                      <div className="h-px flex-1 bg-[var(--border)] opacity-40"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                      {items.map((res, iIdx) => (
                        <button
                          key={res.id}
                          onClick={() => {
                            setActiveTabId(res.id);
                            setShowPlanner(false);
                            setShowFullHistory(false);
                            setHistorySearchTerm('');
                          }}
                          className={`flex flex-col p-8 rounded-[var(--radius-xl)] border text-left transition-all relative group overflow-hidden h-[220px] shadow-sm
                            ${activeTabId === res.id && !showPlanner
                              ? 'bg-[var(--primary)] border-[var(--primary)] shadow-2xl scale-[1.03] z-20'
                              : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--accent)]/40 hover:shadow-premium hover:-translate-y-2'
                            }`}
                          style={{ animationDelay: `${iIdx * 0.05}s` }}
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex flex-col gap-1">
                              <span className={`text-[9px] font-mono-data font-black tracking-widest ${activeTabId === res.id && !showPlanner ? 'text-[var(--accent)]' : 'text-[var(--text-dim)]'}`}>
                                #{res.id.slice(0, 10)}
                              </span>
                              <span className={`text-[8px] font-black uppercase ${activeTabId === res.id && !showPlanner ? 'text-white/40' : 'text-[var(--text-dim)]/60'}`}>
                                {new Date(res.timestamp || (res.input as any).timestamp || Date.now()).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div className={`p-1.5 rounded-[var(--radius-sm)] ${activeTabId === res.id && !showPlanner ? 'bg-white/10' : 'bg-[var(--surface-muted)]'}`}>
                              {res.status === 'processing' ? (
                                <Loader2 size={14} className="text-[var(--accent)] animate-spin" />
                              ) : res.status === 'completed' ? (
                                <ShieldCheck size={14} className="text-emerald-500" />
                              ) : (
                                <Activity size={14} className="text-[var(--accent)]" />
                              )}
                            </div>
                          </div>

                          <h4 className={`text-sm font-bold italic font-legal leading-relaxed mb-6 line-clamp-2 h-10 ${activeTabId === res.id && !showPlanner ? 'text-white' : 'text-[var(--primary)]'}`}>
                            "{res.input?.query || 'Investigation Sans Nom'}"
                          </h4>

                          <div className={`mt-auto pt-6 border-t flex items-center justify-between ${activeTabId === res.id && !showPlanner ? 'border-white/10' : 'border-[var(--border)]'}`}>
                            <span className={`text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${activeTabId === res.id && !showPlanner ? 'text-white/40' : 'text-[var(--text-dim)]'}`}>
                              <Cpu size={12} /> Node {res.id.slice(-2)}
                            </span>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${activeTabId === res.id && !showPlanner ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-muted)] text-[var(--text-dim)] group-hover:bg-[var(--accent)]/10 group-hover:text-[var(--accent)]'}`}>
                              <ArrowUpRight size={14} />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                ));
              })()}
            </div>
          </div>

          <footer className="px-12 py-6 border-t border-[var(--border)] bg-[var(--surface)]/50 flex justify-between items-center shrink-0 z-10 backdrop-blur-md">
            <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest flex items-center gap-4">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              Neural Engine Status: <span className="text-[var(--primary)]">ACTIVE_SECURED_QUERY</span>
            </span>
            <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em] italic font-legal">DOJ_FORENSIC_SECURE_PROTOCOL_v04.2</span>
          </footer>
        </div>
      )}

      {/* LOGS OVERLAY - PRO STYLE */}
      {/* {!isGuestMode && showLogs && (
        <div className="fixed bottom-24 lg:bottom-12 right-6 lg:right-12 left-6 lg:left-auto lg:w-[650px] h-[550px] lg:h-[650px] z-[100] animate-reveal">
          <div className="absolute inset-0 bg-[var(--surface)] border border-[var(--border)] shadow-premium rounded-[var(--radius-2xl)] overflow-hidden flex flex-col">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-noise"></div>

            <div className="px-10 py-8 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-muted)]/50 backdrop-blur-xl relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-5 h-5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.6)]"></div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-[var(--primary)]">Machine Learning Trace</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest">Real-time Neural Stream</span>
                    <div className="h-0.5 w-6 bg-[var(--accent)]/30"></div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowLogs(false)}
                className="w-12 h-12 flex items-center justify-center hover:bg-[var(--accent)]/5 rounded-[var(--radius-lg)] transition-all group"
              >
                <X size={22} className="text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-transform duration-500 group-hover:rotate-90" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-8 bg-[var(--primary)] relative z-10 shadow-inner">
              <LogTerminal logs={activeLogs} type="flash" />
            </div>

            <div className="px-10 py-4 bg-[var(--surface)] border-t border-[var(--border)] flex justify-between items-center relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-[var(--accent)]/20 rounded-full"></div>
                <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em]">Agent Monitoring Protocol ACTIVE</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono-data text-[var(--text-dim)] opacity-60">MEM_ALLOC: 4.2GB / SWAP: OK</span>
              </div>
            </div>
          </div>
        </div>
      )} */}

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
    </div>
  );
};

export default App;
