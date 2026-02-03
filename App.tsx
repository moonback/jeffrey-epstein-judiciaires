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
import { Zap, Play, RotateCw, Database, Search, Activity, Globe, Terminal, Trash2, Layout, Plus, XCircle, Settings, LayoutGrid } from 'lucide-react';

const App: React.FC = () => {
  const [queue, setQueue] = useState<InputData[]>([]);
  const [resolutionHistory, setResolutionHistory] = useState<ProcessedResult[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'investigation' | 'database'>('investigation');

  const queueRef = useRef<InputData[]>([]);

  // Load History from IndexedDB on Mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const history = await storageService.getAllResults();
        setResolutionHistory(history);
        setProcessedCount(history.length);
        if (history.length > 0) {
          // Select the last one by default
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

  // Initialize Queue
  useEffect(() => {
    const initialData = generateInputData(5);
    setQueue(initialData);
    queueRef.current = initialData;
  }, []);

  const addToQueue = () => {
    const newData = generateInputData(5);
    setQueue(prev => [...prev, ...newData]);
    queueRef.current = [...queueRef.current, ...newData];
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

    if (!isProcessing) {
      processQueue();
    }
  }

  const handleDeepDive = (docTitle: string, style: 'standard' | 'simple' | 'technical' = 'standard') => {
    const newId = `REFORM-${Date.now().toString().slice(-4)}`;
    let promptPrefix = "";
    let promptSuffix = "";

    switch (style) {
      case 'simple':
        promptPrefix = "VULGARISATION (ELI5) : ";
        promptSuffix = "Explique le contenu de ce document en langage très simple, accessible au grand public. Utilise des analogies si nécessaire et évite le jargon juridique complexe.";
        break;
      case 'technical':
        promptPrefix = "EXPERTISE JURIDIQUE : ";
        promptSuffix = "Analyse ce document avec une rigueur académique. Identifie les précédents juridiques, la terminologie procédurale exacte et les implications légales techniques.";
        break;
      case 'standard':
      default:
        promptPrefix = "ANALYSE PROFONDE : ";
        promptSuffix = "Détaille chaque section, liste tous les noms cités dans ce document spécifique, et analyse les contradictions ou révélations majeures.";
        break;
    }

    const deepDiveQuery: InputData = {
      id: newId,
      query: `${promptPrefix}Concentre-toi exclusivement sur le document intitulé "${docTitle}". ${promptSuffix}`,
      targetUrl: "https://www.justice.gov/epstein/doj-disclosures",
      timestamp: Date.now()
    };

    setQueue(prev => [deepDiveQuery, ...prev]);
    queueRef.current = [deepDiveQuery, ...queueRef.current];

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
    if (window.confirm("CONFIRMATION REQUISE : Cette action va effacer définitivement toute la base de données locale. Continuer ?")) {
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
      // If we closed the active tab, switch to the last one available
      if (activeTabId === idToRemove) {
        setActiveTabId(newHistory.length > 0 ? newHistory[newHistory.length - 1].id : null);
      }
      return newHistory;
    });
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

      // Add/Update temp result to UI
      setResolutionHistory(prev => {
        const index = prev.findIndex(r => r.id === item.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = tempResult;
          return updated;
        }
        return [...prev, tempResult];
      });
      // Switch to the new tab immediately so user sees progress
      setActiveTabId(tempResult.id);

      const start = performance.now();

      // Call Gemini API
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

      // Update State and DB
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

  const handleOpenInvestigation = (id: string) => {
    setActiveTabId(id);
    setViewMode('investigation');
  };

  // Determine active result based on tab
  const activeResult = resolutionHistory.find(r => r.id === activeTabId);
  // For logs, use active result logs OR if nothing active, maybe empty
  const activeLogs = activeResult ? activeResult.logs : [];

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E3E3E3] p-6 font-sans flex flex-col">

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearData={handleClearHistory}
        onExportData={handleExportAll}
        dbSize={resolutionHistory.length}
      />

      {/* Top App Bar */}
      <header className="max-w-[1600px] mx-auto w-full mb-6 flex flex-col md:flex-row justify-between items-center pb-6 border-b border-[#2D2D2D]">
        <div className="flex items-center gap-4">
          <div className="bg-[#1E1E1E] p-3 rounded-2xl shadow-lg border border-[#444746]">
            <Globe className="text-[#F2B8B5]" size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-normal text-[#E3E3E3] tracking-tight">
              Analyseur de <span className="font-bold text-[#F2B8B5]">Documents Judiciaires</span>
            </h1>
            <p className="text-[#C4C7C5] text-sm mt-1 max-w-3xl">
              Base Vectorielle Locale • Analyse Gemini 3 Flash • <span className="text-[#F2B8B5]">{processedCount}</span> dossiers indexés
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-6 md:mt-0 items-center">

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 p-3 rounded-full text-[#757775] hover:text-[#E3E3E3] hover:bg-[#373737] transition-all border border-transparent hover:border-[#444746]"
            title="Paramètres & Gestion des Données"
          >
            <Settings size={20} />
          </button>

          <div className="h-8 w-[1px] bg-[#444746] mx-2"></div>

          <button
            onClick={() => setViewMode(viewMode === 'investigation' ? 'database' : 'investigation')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all text-sm font-medium tracking-wide uppercase ${viewMode === 'database'
              ? 'bg-[#8AB4F8] text-[#002B55] border-[#8AB4F8]'
              : 'border-[#444746] text-[#E3E3E3] hover:bg-[#373737]'
              }`}
          >
            {viewMode === 'investigation' ? (
              <>
                <Database size={18} />
                Voir la Base
              </>
            ) : (
              <>
                <LayoutGrid size={18} />
                Retour Labo
              </>
            )}
          </button>

          <button
            onClick={addToQueue}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-[#F2B8B5] text-[#F2B8B5] hover:bg-[#F2B8B5]/10 transition-colors text-sm font-medium tracking-wide uppercase"
          >
            <RotateCw size={18} />
            Ajouter Requêtes
          </button>
          <button
            onClick={processQueue}
            disabled={isProcessing || (queue.length === 0 && queueRef.current.length === 0)}
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium tracking-wide uppercase transition-all shadow-md ${isProcessing || (queue.length === 0 && queueRef.current.length === 0)
              ? 'bg-[#1E1E1E] text-[#757775] cursor-not-allowed shadow-none'
              : 'bg-[#F2B8B5] text-[#370003] hover:bg-[#F9DEDC] shadow-lg shadow-[#F2B8B5]/20'
              }`}
          >
            <Play size={18} fill="currentColor" />
            {isProcessing ? 'Indexation en cours...' : 'Lancer Investigation'}
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0">

        {viewMode === 'investigation' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 min-h-0">
            {/* Left Col: Queue & Logs */}
            <section className="lg:col-span-3 flex flex-col gap-6 lg:h-[calc(100vh-12rem)] sticky top-6">

              <div className="flex flex-col gap-4 flex-1 min-h-0">
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-lg font-medium text-[#E3E3E3] flex items-center gap-2">
                    <Database size={18} className="text-[#C4C7C5]" />
                    File d'Indexation
                  </h2>
                  <span className="bg-[#1E1E1E] border border-[#444746] text-[#E3E3E3] text-xs font-bold px-3 py-1 rounded-full">{queue.length}</span>
                </div>

                <div className="bg-[#1E1E1E] rounded-[24px] p-2 flex-1 shadow-sm border border-[#444746] overflow-hidden flex flex-col min-h-[200px]">
                  <div className="flex-1 overflow-y-auto space-y-2 p-2 custom-scrollbar">
                    {queue.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-[#757775]">
                        <Activity size={32} className="opacity-20 mb-3" />
                        <span className="italic text-sm">File vide</span>
                      </div>
                    )}
                    {queue.map((item, idx) => (
                      <div key={item.id} className="bg-[#2B2B2B] p-4 rounded-xl border border-transparent hover:border-[#F2B8B5]/30 transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[#F2B8B5] text-[10px] font-mono tracking-wider">{item.id}</span>
                        </div>
                        <div className="text-xs text-[#E3E3E3] font-medium leading-relaxed line-clamp-2">"{item.query}"</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-[250px] shrink-0 flex flex-col gap-2">
                <h2 className="text-sm font-medium text-[#C4C7C5] px-2 flex items-center gap-2">
                  <Terminal size={14} /> Terminal Système
                </h2>
                <div className="flex-1 bg-[#1E1E1E] rounded-2xl border border-[#444746] overflow-hidden shadow-lg">
                  <LogTerminal
                    logs={activeLogs}
                    type="flash"
                  />
                </div>
              </div>

            </section>

            {/* Right Col: Tabbed Interface */}
            <section className="lg:col-span-9 flex flex-col h-full min-h-[600px]">

              {/* Tabs Navigation */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0 mb-0 no-scrollbar border-b border-[#444746]">
                {resolutionHistory.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => setActiveTabId(res.id)}
                    className={`group flex items-center gap-2 px-4 py-2.5 rounded-t-lg border-t border-r border-l border-b-0 cursor-pointer min-w-[160px] max-w-[240px] transition-all relative ${activeTabId === res.id
                      ? 'bg-[#121212] border-[#444746] text-[#E3E3E3] z-10 -mb-[1px] pb-3'
                      : 'bg-[#1E1E1E] border-[#333] text-[#757775] hover:bg-[#252525]'
                      }`}
                  >
                    <div className="flex flex-col overflow-hidden">
                      <span className={`text-[10px] font-mono font-bold uppercase ${activeTabId === res.id ? 'text-[#F2B8B5]' : ''}`}>
                        {res.id}
                      </span>
                      <span className="text-xs truncate opacity-80">{res.input.query}</span>
                    </div>
                    {res.status === 'processing' ? (
                      <div className="ml-auto w-2 h-2 rounded-full bg-[#F2B8B5] animate-ping"></div>
                    ) : (
                      <button
                        onClick={(e) => handleCloseTab(e, res.id)}
                        className={`ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-[#370003] hover:text-[#FFB4AB] rounded-full transition-all ${activeTabId === res.id ? 'opacity-100' : ''}`}
                      >
                        <XCircle size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {resolutionHistory.length === 0 && !isLoadingHistory && (
                  <div className="px-4 py-3 text-[#757775] text-sm italic">Aucun dossier ouvert</div>
                )}
              </div>

              {/* Active Tab Content Area */}
              <div className="bg-[#121212] flex-1 rounded-b-[32px] rounded-tr-[32px] border border-[#444746] p-1 shadow-2xl relative min-h-[600px] overflow-hidden">

                <div className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(#444746 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>

                {activeResult ? (
                  <div className="h-full flex flex-col relative z-10 animate-in fade-in duration-300">
                    {/* Header of Active Tab */}
                    <div className="bg-[#1E1E1E]/90 backdrop-blur-md p-6 border-b border-[#444746] flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${activeResult.status === 'completed' ? 'bg-[#0F5223] text-[#6DD58C]' : 'bg-[#601410] text-[#F2B8B5] animate-pulse'}`}>
                            {activeResult.status === 'completed' ? 'Extraction Terminée' : 'Analyse en cours'}
                          </span>
                          <span className="text-[#C4C7C5] text-xs font-mono">{new Date(activeResult.input.timestamp).toLocaleString()}</span>
                        </div>
                        <h2 className="text-xl font-medium text-[#E3E3E3] mb-1">"{activeResult.input.query}"</h2>
                        <p className="text-xs text-[#8AB4F8] font-mono">{activeResult.input.targetUrl}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-[#C4C7C5] mb-1">Performance</div>
                        <div className="font-mono text-lg text-[#E3E3E3]">
                          {activeResult.durationMs > 0 ? `${activeResult.durationMs.toFixed(0)}ms` : '--'}
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
                        <DataCard
                          key={activeResult.id}
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
                  <div className="flex flex-col items-center justify-center h-full opacity-30">
                    <Layout size={80} className="mb-4 text-[#F2B8B5]" />
                    <p className="text-xl">Espace de Travail Vide</p>
                    <p className="text-sm mt-2">Lancez une investigation pour ouvrir un nouvel onglet.</p>
                  </div>
                )}

              </div>
            </section>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#121212] rounded-[32px] border border-[#444746] overflow-hidden shadow-2xl">
            <ResultsDashboard
              history={resolutionHistory}
              onDeepDive={handleDeepDive}
              onOpenInvestigation={handleOpenInvestigation}
            />
          </div>
        )}

      </main>

      <LiveAssistant />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #444746;
          border-radius: 20px;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
