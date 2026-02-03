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
  Loader2
} from 'lucide-react';
import { Sidebar, ViewType } from './components/Sidebar';
import { NetworkGraphView } from './components/NetworkGraphView';
import { TimelineView } from './components/TimelineView';
import { ContradictionsView, POIView } from './components/AdvancedModules';

const App: React.FC = () => {
  const [queue, setQueue] = useState<InputData[]>([]);
  const [resolutionHistory, setResolutionHistory] = useState<ProcessedResult[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewType>('lab');
  const [showPlanner, setShowPlanner] = useState(false);

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
    <div className="flex bg-[#0F0F0F] text-[#E3E3E3] min-h-screen overflow-hidden font-sans">

      {/* 1. Global Navigation Sidebar */}
      <Sidebar
        currentView={viewMode}
        onViewChange={setViewMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewAnalysis={() => {
          setViewMode('lab');
          setShowPlanner(true);
          setActiveTabId(null);
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#0A0A0A]">

        {/* 2. PREMIUM MODULE HEADER */}
        <header className="px-10 h-20 shrink-0 flex justify-between items-center bg-[#0F0F0F]/80 backdrop-blur-3xl border-b border-[#1F1F1F] z-40">
          <div className="flex gap-8 items-center">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-[#0F5223]/20 to-transparent border border-[#6DD58C]/20 rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6DD58C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6DD58C]"></span>
              </span>
              <span className="text-[10px] text-[#6DD58C] font-black uppercase tracking-[0.2em] relative">Node Live</span>
            </div>

            <div className="h-6 w-[1px] bg-[#1F1F1F]"></div>

            <div className="flex items-center gap-3">
              <div className="text-[10px] font-black text-[#757775] uppercase tracking-widest">Database Capacity</div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-mono font-black text-[#F2B8B5] leading-none">{processedCount}</div>
                <div className="text-[9px] font-bold text-[#757775] uppercase tracking-tighter self-end mb-0.5">Dossiers Indexés</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {isProcessing && (
              <div className="flex gap-3 items-center bg-[#370003] px-5 py-2 rounded-2xl text-[10px] text-[#F2B8B5] border border-[#601410] shadow-[0_0_20px_rgba(96,20,16,0.3)] animate-in fade-in zoom-in slide-in-from-right-4">
                <Loader2 size={14} className="animate-spin" />
                <span className="font-black uppercase tracking-[0.2em]">Neural Processing...</span>
              </div>
            )}

            <div className="hidden xl:flex items-center gap-4 text-[10px] font-bold text-[#444746] uppercase border-l border-[#1F1F1F] pl-6 tracking-widest">
              <span>LATENCY: 12ms</span>
              <span className="text-[#F2B8B5]">ENCRYPTION: AES-256</span>
            </div>
          </div>
        </header>

        {/* 3. Main Viewport */}
        <main className="flex-1 overflow-hidden relative">

          {/* Forensic Technical Grid Background */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F1F1F_1px,transparent_1px),linear-gradient(to_bottom,#1F1F1F_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.2]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/50 to-[#0A0A0A]"></div>
          </div>

          <div className="h-full w-full relative z-10 overflow-hidden">
            {viewMode === 'lab' && (
              <div className="h-full flex flex-col lg:grid lg:grid-cols-12 gap-8 p-10 overflow-hidden animate-in fade-in duration-700">
                {/* Lab Sidebar: Queue & Logs */}
                <section className="lg:col-span-3 flex flex-col gap-6 overflow-hidden min-h-0">
                  <div className="flex flex-col gap-4 flex-1 overflow-hidden min-h-0">
                    <div className="flex justify-between items-center px-1">
                      <h2 className="text-xs font-bold text-[#8E918F] uppercase tracking-widest flex items-center gap-2">
                        Inbound Pipeline
                      </h2>
                      <span className="text-[10px] bg-[#1E1E1E] text-[#C4C7C5] px-2 py-0.5 rounded-full border border-[#444746]">{queue.length}</span>
                    </div>
                    <div className="bg-[#1A1A1A] rounded-3xl p-3 flex-1 border border-[#2D2D2D] overflow-hidden flex flex-col shadow-inner min-h-0">
                      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                        {queue.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full opacity-20">
                            <Activity size={32} className="mb-2" />
                            <span className="text-[10px] uppercase font-bold tracking-tighter">Idle</span>
                          </div>
                        )}
                        {queue.map((item) => (
                          <div key={item.id} className="bg-[#252525] p-3 rounded-2xl border border-transparent border-l-2 border-l-[#F2B8B5]/30 animate-in slide-in-from-left-2">
                            <div className="text-[9px] font-mono text-[#757775] mb-1">{item.id}</div>
                            <div className="text-xs text-[#E3E3E3] font-medium truncate">"{item.query}"</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="h-1/3 flex flex-col gap-3 min-h-[150px]">
                    <h2 className="text-xs font-bold text-[#8E918F] uppercase tracking-widest">System Logs</h2>
                    <div className="flex-1 bg-black rounded-3xl border border-[#2D2D2D] overflow-hidden shadow-2xl min-h-0">
                      <LogTerminal logs={activeLogs} type="flash" />
                    </div>
                  </div>
                </section>

                {/* Main Lab Area */}
                <section className="lg:col-span-9 flex flex-col overflow-hidden min-h-0 flex-1">
                  {/* Tabs Wrapper */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-[#2D2D2D] shrink-0">
                    {resolutionHistory.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => setActiveTabId(res.id)}
                        className={`group flex items-center gap-3 px-6 py-3 rounded-t-2xl border-t border-x border-b-0 cursor-pointer min-w-[180px] transition-all relative ${activeTabId === res.id ? 'bg-[#1A1A1A] border-[#2D2D2D] text-[#E3E3E3] z-10 -mb-[1px]' : 'bg-transparent border-transparent text-[#757775] hover:text-[#E3E3E3]'
                          }`}
                      >
                        <div className="flex flex-col overflow-hidden">
                          <span className={`text-[9px] font-mono ${activeTabId === res.id ? 'text-[#F2B8B5]' : ''}`}>{res.id}</span>
                          <span className="text-[11px] font-bold truncate max-w-[120px]">{res.input.query}</span>
                        </div>
                        {res.status === 'processing' ? (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F2B8B5] animate-ping"></div>
                        ) : (
                          <XCircle
                            size={14}
                            className="ml-auto opacity-0 group-hover:opacity-100 hover:text-[#F2B8B5] transition-all"
                            onClick={(e) => handleCloseTab(e, res.id)}
                          />
                        )}
                      </div>
                    ))}
                    {resolutionHistory.length === 0 && <span className="px-6 py-3 text-[10px] text-[#757775] uppercase font-bold pt-6">Dossier Vide</span>}
                  </div>

                  {/* Content Container */}
                  <div className="flex-1 bg-[#1A1A1A] rounded-b-[40px] rounded-tr-[40px] border border-[#2D2D2D] overflow-hidden relative shadow-2xl flex flex-col min-h-0">
                    {activeResult && !showPlanner ? (
                      <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500 min-h-0">
                        <div className="p-8 border-b border-[#2D2D2D] flex justify-between items-center bg-gradient-to-r from-transparent to-[#252525]/30 shrink-0">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${activeResult.status === 'completed' ? 'bg-[#0F5223] text-[#6DD58C] border border-[#6DD58C]/20' : 'bg-[#601410] text-[#F2B8B5] animate-pulse'}`}>
                                {activeResult.status === 'completed' ? 'Evidence Ready' : 'Processing Content'}
                              </span>
                              <span className="text-[10px] text-[#757775] font-mono uppercase">{activeResult.input.targetUrl}</span>
                            </div>
                            <h2 className="text-2xl font-light text-[#E3E3E3] tracking-tight italic">"{activeResult.input.query}"</h2>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-[#757775] uppercase font-bold tracking-widest mb-1">Latency</div>
                            <div className="text-xl font-mono text-[#F2B8B5]">{activeResult.durationMs ? `${Math.round(activeResult.durationMs)}ms` : '--'}</div>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
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
                    ) : (
                      <div className="flex-1 p-8 animate-in fade-in zoom-in-95 duration-500 overflow-y-auto custom-scrollbar min-h-0">
                        <InvestigationPlanner onStartInvestigation={handleStartInvestigation} />
                        {showPlanner && activeResult && (
                          <button onClick={() => setShowPlanner(false)} className="absolute top-8 right-8 p-3 bg-black rounded-full border border-[#2D2D2D] hover:border-[#F2B8B5] transition-all"><XCircle /></button>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {viewMode === 'database' && (
              <ResultsDashboard
                history={resolutionHistory}
                onDeepDive={handleDeepDive}
                onOpenInvestigation={handleOpenInvestigation}
              />
            )}

            {viewMode === 'network' && <NetworkGraphView onDeepDive={handleDeepDive} />}
            {viewMode === 'timeline' && <TimelineView onDeepDive={handleDeepDive} />}
            {viewMode === 'contradictions' && <ContradictionsView onDeepDive={handleDeepDive} />}
            {viewMode === 'poi' && <POIView onDeepDive={handleDeepDive} />}
          </div>
        </main>
      </div>

      <LiveAssistant />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearData={handleClearHistory}
        onExportData={handleExportAll}
        dbSize={resolutionHistory.length}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #373737; border-radius: 20px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
