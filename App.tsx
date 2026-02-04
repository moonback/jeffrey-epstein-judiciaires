/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { generateInputData } from './constants';
import { InputData, ProcessedResult } from './types';
import { mergeDataWithFlash } from './services/openRouterService';
import { storageService } from './services/storageService';
import { DataCard } from './components/DataCard';
import { LogTerminal } from './components/LogTerminal';
import { LiveAssistant } from './components/LiveAssistant';
import { SettingsModal } from './components/SettingsModal';
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
  Clock
} from 'lucide-react';
import { Sidebar, ViewType } from './components/Sidebar';
import { NetworkGraphView } from './components/NetworkGraphView';
import { TimelineView } from './components/TimelineView';
import { ContradictionsView, POIView } from './components/AdvancedModules';

const App: React.FC = () => {
  // ... existing state ...
  const [queue, setQueue] = useState<InputData[]>([]);
  const [resolutionHistory, setResolutionHistory] = useState<ProcessedResult[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewType>('lab');
  const [showPlanner, setShowPlanner] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const queueRef = useRef<InputData[]>([]);

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
    queueRef.current = [];
  }, []);

  const handleStartInvestigation = (query: string, sourceName: string) => {
    const newId = `ANALYSE-${Date.now().toString().slice(-6)}`;
    const newQuery: InputData = {
      id: newId,
      query: query,
      targetUrl: `Source : ${sourceName}`,
      timestamp: Date.now()
    };

    setQueue(prev => [newQuery, ...prev]);
    queueRef.current = [newQuery, ...queueRef.current];
    setShowPlanner(false);
    setViewMode('lab');
    setActiveTabId(newId);

    if (!isProcessing) {
      processQueue();
    }
  };

  const processQueue = async () => {
    if (isProcessing || queueRef.current.length === 0) return;
    setIsProcessing(true);

    const processItem = async () => {
      if (queueRef.current.length === 0) {
        setIsProcessing(false);
        return;
      }

      const item = queueRef.current.shift();
      setQueue([...queueRef.current]);

      if (!item) return;

      const tempResult: ProcessedResult = {
        id: item.id,
        input: item,
        output: null,
        logs: ["Initialisation de l'agent de recherche approfondie..."],
        sources: [],
        durationMs: 0,
        status: 'processing',
      };

      setResolutionHistory(prev => {
        const index = prev.findIndex(r => r.id === item.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = tempResult;
          return updated;
        }
        return [...prev, tempResult];
      });

      await storageService.saveResult(tempResult);
      setActiveTabId(tempResult.id);

      const start = performance.now();
      const result = await mergeDataWithFlash(item);
      const duration = performance.now() - start;

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

      if (queueRef.current.length > 0) {
        setTimeout(processItem, 2500);
      } else {
        setIsProcessing(false);
      }
    };

    processItem();
  };

  const handleEntityClick = (entityName: string) => {
    const newId = `ENTITY-${Date.now().toString().slice(-4)}`;
    const entityQuery: InputData = {
      id: newId,
      query: `PROFILAGE ENTITÉ : Qui est "${entityName}" dans le contexte de l'affaire Epstein ? Quel est son rôle exact, quelles sont les accusations ou implications mentionnées dans les documents DOJ ?`,
      targetUrl: "https://www.justice.gov/epstein/doj-disclosures",
      timestamp: Date.now()
    };

    setQueue(prev => [entityQuery, ...prev]);
    queueRef.current = [entityQuery, ...queueRef.current];
    setViewMode('lab');

    if (!isProcessing) {
      processQueue();
    }
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

    setQueue(prev => [deepQuery, ...prev]);
    queueRef.current = [deepQuery, ...queueRef.current];
    setViewMode('lab');

    if (!isProcessing) {
      processQueue();
    }
  };

  const handleOpenInvestigation = (id: string) => {
    setActiveTabId(id);
    setViewMode('lab');
  };

  const activeResult = resolutionHistory.find(r => r.id === activeTabId);
  const activeLogs = activeResult ? activeResult.logs : [];

  return (
    <div className="flex flex-col lg:flex-row bg-[#050505] text-[#EEE] min-h-screen overflow-hidden font-sans">

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

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#050505]">

        {/* PREMIUM MODULE HEADER - Adjusted for mobile */}
        <header className="px-5 lg:px-8 h-14 lg:h-16 shrink-0 flex justify-between items-center bg-[#080808]/90 backdrop-blur-xl border-b border-[#1A1A1A] z-40">
          <div className="flex gap-4 lg:gap-6 items-center">
            {/* Mobile Logo Logo */}
            <div className="lg:hidden flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#F2B8B5]" />
              <span className="text-[10px] font-bold tracking-widest uppercase">DOJ Forensic</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[#2A2A2A] rounded-lg relative overflow-hidden group hover:border-[#F2B8B5]/30 transition-colors cursor-help">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6DD58C] opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6DD58C]"></span>
              </span>
              <span className="text-[10px] text-[#BBB] font-bold uppercase tracking-widest relative">Système Live</span>
            </div>

            <div className="hidden lg:block h-4 w-[1px] bg-[#2A2A2A]"></div>

            <div className="flex items-center gap-2.5">
              <div className="text-[9px] font-bold text-[#555] uppercase tracking-[0.2em] hidden sm:block">Intel Core</div>
              <div className="flex items-center gap-1.5">
                <div className="text-sm font-mono font-bold text-[#F2B8B5] leading-none">{processedCount}</div>
                <div className="text-[9px] font-bold text-[#444] uppercase tracking-tighter">Hits</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            {isProcessing && (
              <div className="flex gap-2.5 items-center bg-[#180808] px-3 lg:px-4 py-1.5 rounded-lg text-[9px] lg:text-[10px] text-[#F2B8B5] border border-[#301010] animate-pulse">
                <Loader2 size={12} className="animate-spin" />
                <span className="font-bold uppercase tracking-widest hidden xs:block">Analyse...</span>
              </div>
            )}

            <div className="hidden lg:flex items-center gap-5 text-[9px] font-bold text-[#333] uppercase border-l border-[#1A1A1A] pl-5 tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#F2B8B5]/40"></div>
                <span>AES-256</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#6DD58C]/40"></div>
                <span>NODE-01</span>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="lg:hidden p-2 text-[#555] hover:text-white transition-colors"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 overflow-hidden relative pb-16 lg:pb-0">
          <div className="bg-noise"></div>

          <div className="h-full w-full relative z-10 overflow-hidden">
            {viewMode === 'lab' && (
              <div className="h-full flex flex-col lg:grid lg:grid-cols-12 overflow-hidden animate-in fade-in duration-700">
                {/* Lab Sidebar: Queue - Hidden on mobile, visible on LG */}
                <section className="hidden lg:flex lg:col-span-3 xl:col-span-2 border-r border-[#1A1A1A] bg-[#080808]/50 flex-col overflow-hidden min-h-0">
                  <div className="p-5 flex justify-between items-center border-b border-[#1A1A1A]">
                    <h2 className="text-[10px] font-bold text-[#555] uppercase tracking-[0.2em] flex items-center gap-2">
                      Pipeline
                    </h2>
                    <span className="text-[10px] font-mono text-[#F2B8B5] bg-[#F2B8B5]/10 px-1.5 rounded border border-[#F2B8B5]/20">{queue.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {queue.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-40 opacity-10">
                        <Activity size={24} className="mb-2" />
                        <span className="text-[9px] uppercase font-bold tracking-widest">Standby</span>
                      </div>
                    )}
                    {queue.map((item) => (
                      <div key={item.id} className="bg-[#121212] p-3 rounded-lg border border-[#1A1A1A] border-l-2 border-l-[#F2B8B5]/40 animate-in slide-in-from-left-2 group hover:border-[#F2B8B5]/20 transition-colors">
                        <div className="text-[9px] font-mono text-[#444] mb-1 group-hover:text-[#F2B8B5]/60 transition-colors">{item.id}</div>
                        <div className="text-[11px] text-[#888] font-medium line-clamp-2 leading-relaxed">"{item.query}"</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Main Lab Area */}
                <section className="lg:col-span-9 xl:col-span-10 flex flex-col overflow-hidden min-h-0">
                  {/* Tabs Wrapper */}
                  <div className="flex items-center overflow-x-auto no-scrollbar bg-[#080808] border-b border-[#1A1A1A] h-11 lg:h-12 px-4 gap-1">
                    {resolutionHistory.length > 0 && (
                      <button
                        onClick={() => {
                          setViewMode('lab');
                          setShowPlanner(true);
                          setActiveTabId(null);
                        }}
                        className="flex items-center gap-2 px-3 h-full border-r border-[#1A1A1A] text-[#F2B8B5] hover:text-white transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                    {resolutionHistory.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => {
                          setActiveTabId(res.id);
                          setShowPlanner(false);
                        }}
                        className={`group flex items-center gap-3 px-4 h-full cursor-pointer min-w-[120px] lg:min-w-[140px] max-w-[200px] lg:max-w-[240px] transition-all relative border-x border-transparent hover:bg-[#121212] ${activeTabId === res.id && !showPlanner ? 'bg-[#121212] border-[#1A1A1A] z-10 !border-x-[#1A1A1A]' : 'text-[#555] hover:text-[#888]'
                          }`}
                      >
                        {activeTabId === res.id && !showPlanner && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F2B8B5] shadow-[0_-2px_8px_#F2B8B5]"></div>
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className={`text-[8px] font-mono ${activeTabId === res.id && !showPlanner ? 'text-[#F2B8B5]' : ''}`}>{res.id}</span>
                          <span className={`text-[10px] lg:text-[11px] font-bold truncate ${activeTabId === res.id && !showPlanner ? 'text-[#EEE]' : ''}`}>{res.input.query}</span>
                        </div>
                        {res.status === 'processing' ? (
                          <div className="ml-auto w-1 h-1 rounded-full bg-[#F2B8B5] animate-ping"></div>
                        ) : (
                          <XCircle
                            size={12}
                            className="ml-auto lg:opacity-0 lg:group-hover:opacity-100 hover:text-[#F2B8B5] transition-all"
                            onClick={(e) => handleCloseTab(e, res.id)}
                          />
                        )}
                      </div>
                    ))}
                    {resolutionHistory.length === 0 && <span className="text-[10px] text-[#333] uppercase font-bold tracking-widest ml-2">En attente de dossier</span>}
                  </div>

                  {/* Content Container */}
                  <div className="flex-1 bg-[#0A0A0A] overflow-hidden relative flex flex-col min-h-0">
                    {activeResult && !showPlanner ? (
                      <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500 min-h-0">
                        <div className="px-5 lg:px-8 py-4 lg:py-6 border-b border-[#1A1A1A] flex justify-between items-start bg-gradient-to-b from-[#0D0D0D] to-transparent shrink-0">
                          <div className="max-w-4xl">
                            <div className="flex items-center gap-3 mb-2 lg:mb-4">
                              <span className={`px-2 py-0.5 rounded text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.15em] ${activeResult.status === 'completed' ? 'bg-[#0F3010] text-[#6DD58C] border border-[#6DD58C]/20' : 'bg-[#301010] text-[#F2B8B5] border border-[#F2B8B5]/20 animate-pulse'}`}>
                                {activeResult.status === 'completed' ? 'Extraction OK' : 'Traitement...'}
                              </span>
                              <div className="h-3 w-[1px] bg-[#2A2A2A]"></div>
                              <span className="text-[9px] lg:text-[10px] text-[#555] font-mono uppercase truncate max-w-[150px] lg:max-w-none">{activeResult.input.targetUrl.split(' : ')[1] || activeResult.input.targetUrl}</span>
                            </div>
                            <h2 className="text-lg lg:text-2xl font-medium text-[#EEE] tracking-tight leading-tight line-clamp-2">"{activeResult.input.query}"</h2>
                          </div>
                          <div className="text-right hidden sm:block">
                            <div className="text-[9px] text-[#444] uppercase font-bold tracking-[0.2em] mb-1">Proc. Latency</div>
                            <div className="text-sm font-mono text-[#F2B8B5]">{activeResult.durationMs ? `${Math.round(activeResult.durationMs)}ms` : '--'}</div>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                          <div className="max-w-6xl mx-auto">
                            <DataCard
                              data={activeResult.output}
                              sources={activeResult.sources}
                              loading={activeResult.status === 'processing'}
                              onDeepDive={handleDeepDive}
                              onDownload={() => handleDownload(activeResult)}
                              onEntityClick={handleEntityClick}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 p-4 lg:p-8 animate-in fade-in zoom-in-[0.98] duration-500 overflow-y-auto custom-scrollbar min-h-0">
                        <div className="max-w-5xl mx-auto">
                          <InvestigationPlanner onStartInvestigation={handleStartInvestigation} />
                        </div>
                        {showPlanner && activeResult && (
                          <button onClick={() => setShowPlanner(false)} className="absolute top-6 lg:top-8 right-6 lg:right-8 p-2 bg-[#121212] rounded-lg border border-[#2A2A2A] hover:border-[#F2B8B5] transition-all text-[#666] hover:text-[#EEE] shadow-xl z-20"><X size={16} /></button>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {viewMode === 'database' && (
              <div className="h-full overflow-y-auto custom-scrollbar p-4 lg:p-0">
                <ResultsDashboard
                  history={resolutionHistory}
                  onDeepDive={handleDeepDive}
                  onOpenInvestigation={handleOpenInvestigation}
                />
              </div>
            )}

            {viewMode === 'network' && (
              <div className="h-full p-4 lg:p-0">
                <NetworkGraphView onDeepDive={handleDeepDive} />
              </div>
            )}

            {viewMode === 'timeline' && <TimelineView onDeepDive={handleDeepDive} />}
            {viewMode === 'contradictions' && <ContradictionsView onDeepDive={handleDeepDive} />}
            {viewMode === 'poi' && <POIView onDeepDive={handleDeepDive} />}
          </div>
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#080808] border-t border-[#1A1A1A] flex items-center justify-around px-2 z-50 backdrop-blur-lg bg-opacity-90">
          <MobileNavItem
            icon={Terminal}
            label="Lab"
            isActive={viewMode === 'lab'}
            onClick={() => setViewMode('lab')}
          />
          <MobileNavItem
            icon={Database}
            label="Base"
            isActive={viewMode === 'database'}
            onClick={() => setViewMode('database')}
          />
          <MobileNavItem
            icon={Share2}
            label="Réseau"
            isActive={viewMode === 'network'}
            onClick={() => setViewMode('network')}
          />
          <MobileNavItem
            icon={Clock}
            label="Temps"
            isActive={viewMode === 'timeline'}
            onClick={() => setViewMode('timeline')}
          />
          <MobileNavItem
            icon={Activity}
            label="Logs"
            isActive={showLogs}
            onClick={() => setShowLogs(!showLogs)}
          />
        </nav>
      </div>

      <LiveAssistant />

      {showLogs && (
        <div className="fixed bottom-20 lg:bottom-10 right-4 lg:right-10 left-4 lg:left-auto lg:w-[500px] h-[400px] lg:h-[450px] z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="absolute inset-0 bg-[#080808]/95 backdrop-blur-3xl rounded-2xl lg:rounded-[40px] border border-white/10 shadow-[0_32px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
            <div className="px-6 lg:px-8 py-4 lg:py-5 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full bg-[#6DD58C] animate-pulse"></div>
                <span className="text-[10px] lg:text-[12px] font-bold uppercase tracking-[0.2em] text-[#EEE]">Trace Forensique</span>
              </div>
              <button
                onClick={() => setShowLogs(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={18} className="text-[#555] hover:text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-3 lg:p-4">
              <LogTerminal logs={activeLogs} type="flash" />
            </div>
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearData={handleClearHistory}
        onExportData={handleExportAll}
        dbSize={resolutionHistory.length}
      />

    </div>
  );
};

// Helper components for mobile navigation
const MobileNavItem: React.FC<{ icon: any, label: string, isActive: boolean, onClick: () => void }> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1.5 transition-all w-14 ${isActive ? 'text-[#F2B8B5]' : 'text-[#444]'}`}
  >
    <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-[#F2B8B5]/5' : ''}`}>
      <Icon size={18} />
    </div>
    <span className="text-[8px] font-bold uppercase tracking-widest">{label}</span>
    {isActive && <div className="w-4 h-0.5 bg-[#F2B8B5] rounded-full shadow-[0_0_8px_#F2B8B5]"></div>}
  </button>
);

export default App;
