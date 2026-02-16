/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { PageHeader } from './PageHeader';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { ProcessedResult } from '../types';
import { storageService } from '../services/storageService';
import { Share2, Info, Crosshair, ZoomIn, ZoomOut, Activity, Users, FileText, Search, Filter, Shield, Target, Link2, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen, ArrowUpRight, Zap, ShieldCheck, Box, Network } from 'lucide-react';
import { EntityProfile } from './EntityProfile';

interface GraphNode {
    id: string;
    name: string;
    val: number;
    type: 'PERSON' | 'INVESTIGATION';
    color: string;
    neighbors?: GraphNode[];
    links?: GraphLink[];
    x?: number;
    y?: number;
}

interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    value: number;
}

interface NetworkGraphViewProps {
    onDeepDive?: (docTitle: string, style: 'standard' | 'simple' | 'technical') => void;
    onNavigateToInvestigation?: (investigationId: string) => void;
    isGuestMode?: boolean;
    onToggle2D3D?: () => void;
}

export const NetworkGraphView: React.FC<NetworkGraphViewProps> = ({ onDeepDive, onNavigateToInvestigation, isGuestMode, onToggle2D3D }) => {
    const fgRef = useRef<ForceGraphMethods>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set<GraphNode>());
    const [highlightLinks, setHighlightLinks] = useState(new Set<GraphLink>());
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'PERSON' | 'INVESTIGATION'>('ALL');
    const [minConnections, setMinConnections] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        storageService.getAllResults().then(data => {
            setHistory(data);
            setLoading(false);
        });
    }, []);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => console.error(err));
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const graphData = useMemo(() => {
        const nodesMap: Map<string, GraphNode> = new Map();
        const links: (GraphLink & { type?: 'CONNECTION' | 'TRANSACTION', amount?: number, currency?: string })[] = [];

        history.forEach(res => {
            if (!res.output) return;

            const invId = res.id;
            const invNode: GraphNode = {
                id: invId,
                name: res.input.query,
                val: 28,
                type: 'INVESTIGATION',
                color: '#dc2626', // var(--accent)
                neighbors: [],
                links: []
            };
            nodesMap.set(invId, invNode);

            const entities = res.output.entites_cles || [];
            const entDetails = res.output.entites_details || [];
            const transactions = res.output.transactions_financieres || [];

            // Add Entity-to-Investigation Links
            entities.forEach(ent => {
                let entNode = nodesMap.get(ent);
                const detail = entDetails.find(d => d.nom === ent);
                const risk = detail?.risk_level || 5;
                const influence = detail?.influence || 5;

                const riskColor = risk > 7 ? '#dc2626' : risk > 4 ? '#0f172a' : '#94a3b8'; // danger | primary | text-dim

                if (!entNode) {
                    entNode = {
                        id: ent,
                        name: ent,
                        val: influence * 3,
                        type: 'PERSON',
                        color: riskColor,
                        neighbors: [],
                        links: []
                    };
                    nodesMap.set(ent, entNode);
                } else {
                    entNode.val += 2;
                }

                const link: any = { source: invId, target: ent, value: 1, type: 'CONNECTION' };
                links.push(link);

                invNode.neighbors!.push(entNode);
                entNode.neighbors!.push(invNode);
                invNode.links!.push(link);
                entNode.links!.push(link);
            });

            // Add Entity-to-Entity Transactional Links
            transactions.forEach(t => {
                if (!nodesMap.has(t.source) || !nodesMap.has(t.destination)) return;

                const sourceNode = nodesMap.get(t.source)!;
                const destNode = nodesMap.get(t.destination)!;

                const transLink: any = {
                    source: t.source,
                    target: t.destination,
                    value: Math.log10(t.montant + 1) * 2,
                    type: 'TRANSACTION',
                    amount: t.montant,
                    currency: t.devise
                };
                links.push(transLink);

                sourceNode.neighbors!.push(destNode);
                destNode.neighbors!.push(sourceNode);
                sourceNode.links!.push(transLink);
                destNode.links!.push(transLink);
            });
        });

        let finalNodes = Array.from(nodesMap.values());

        // Apply Density Filter
        if (minConnections > 0) {
            finalNodes = finalNodes.filter(n => (n.neighbors?.length || 0) >= minConnections || n.type === 'INVESTIGATION');
        }

        const nodeIds = new Set(finalNodes.map(n => n.id));
        const finalLinks = links.filter(l =>
            nodeIds.has(typeof l.source === 'string' ? l.source : (l.source as any).id) &&
            nodeIds.has(typeof l.target === 'string' ? l.target : (l.target as any).id)
        );

        return {
            nodes: finalNodes,
            links: finalLinks
        };
    }, [history, minConnections]);

    useEffect(() => {
        if (fgRef.current) {
            // Increase repulsion significantly to spread out nodes
            fgRef.current.d3Force('charge')?.strength(-1000);
            // Link distance should be enough to space things out
            fgRef.current.d3Force('link')?.distance(120);
            // Center the graph gently
            fgRef.current.d3Force('center')?.strength(0.05);
        }
    }, [graphData]);

    const handleNodeHover = (node: any) => {
        highlightNodes.clear();
        highlightLinks.clear();
        if (node) {
            highlightNodes.add(node);
            node.neighbors?.forEach((neighbor: any) => highlightNodes.add(neighbor));
            node.links?.forEach((link: any) => highlightLinks.add(link));
        }
        setHoverNode(node || null);
        setHighlightNodes(new Set(highlightNodes));
        setHighlightLinks(new Set(highlightLinks));
    };

    const topInfluencers = useMemo(() => {
        return graphData.nodes
            .filter(n => n.type === 'PERSON')
            .sort((a, b) => b.val - a.val)
            .slice(0, 10);
    }, [graphData]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-white animate-pro-reveal">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-[2px] border-[var(--surface-muted)] rounded-full"></div>
                        <div className="absolute inset-0 border-t-[2px] border-[var(--accent)] rounded-full animate-spin"></div>
                        <Share2 size={24} className="absolute inset-0 m-auto text-[var(--accent)] animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.4em] animate-pulse">Neural Mapping Sequence...</span>
                </div>
            </div>
        );
    }

    // Show Entity Profile if an entity is selected
    if (selectedEntity) {
        return (
            <EntityProfile
                entityName={selectedEntity}
                onBack={() => setSelectedEntity(null)}
                onNavigateToInvestigation={onNavigateToInvestigation}
            />
        );
    }

    return (
        <div className="h-full flex flex-col bg-[var(--background)] overflow-hidden relative font-sans text-[var(--text)]">
            <PageHeader
                title="Cartographie"
                titleHighlight="Relationnelle"
                icon={Share2}
                badgeText="Nexus_Graph_ v3.0"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Rechercher une cible..."
                totalLabel="Nœuds Actifs"
                totalCount={graphData.nodes.length}
                stats={[
                    {
                        label: "Liens",
                        value: graphData.links.length,
                        icon: <Activity size={10} className="text-slate-400" />
                    },
                    {
                        label: "Densité",
                        value: minConnections,
                        icon: <Network size={10} className="text-slate-400" />
                    }
                ]}
            >
                <div className="flex items-center bg-slate-50 border border-slate-100 p-1 rounded-xl shadow-inner shrink-0 leading-none">
                    {(['ALL', 'PERSON', 'INVESTIGATION'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${filterType === t ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm border border-[var(--border)]' : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'}`}
                        >
                            {t === 'ALL' ? 'Tous' : t === 'PERSON' ? 'Cibles' : 'Affaires'}
                        </button>
                    ))}
                </div>

                <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block shrink-0"></div>

                {/* Density Control - Mini */}
                <div className="flex items-center gap-3 bg-[var(--surface-muted)] border border-[var(--border)] px-3 py-1 rounded-xl shadow-inner shrink-0">
                    <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest hidden lg:inline">Densité</span>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={minConnections}
                        onChange={(e) => setMinConnections(parseInt(e.target.value))}
                        className="w-24 h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                        title={`Minimum connections: ${minConnections}`}
                    />
                    <span className="text-[9px] font-mono-data font-black text-[var(--accent)] w-4 text-center">{minConnections}</span>
                </div>
            </PageHeader>

            <div ref={containerRef} className={`flex-1 flex overflow-hidden relative ${isFullscreen ? 'fixed inset-0 z-[100] bg-[#F8FAFC]' : ''}`}>
                {/* Background Texture */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

                {/* SIDEBAR TOGGLE */}
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="absolute top-6 left-6 z-40 p-3 bg-[var(--surface)]/90 backdrop-blur-3xl border border-[var(--border)] rounded-xl text-[var(--text-dim)] hover:text-[var(--accent)] transition-all shadow-lg animate-in fade-in"
                    >
                        <PanelLeftOpen size={18} />
                    </button>
                )}

                {/* PROFESSIONAL SIDEBAR - Forensic Asset Panel */}
                <aside className={`${isSidebarOpen ? 'w-[360px] lg:w-[400px]' : 'w-0'} border-r border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-3xl z-20 flex flex-col transition-all duration-500 relative overflow-hidden shadow-2xl shrink-0`}>
                    <div className={`${isSidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 h-full flex flex-col`}>
                        <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none opacity-50"></div>

                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-4 right-4 text-[var(--text-dim)] hover:text-[var(--text)] transition-colors p-2 hover:bg-[var(--surface-muted)] rounded-xl z-30"
                        >
                            <PanelLeftClose size={18} />
                        </button>

                        <div className="p-6 border-b border-[var(--border)]/50 flex items-center justify-between z-20 bg-[var(--surface)]/50 backdrop-blur-sm">
                            <h3 className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.4em] flex items-center gap-2">
                                <Zap size={14} className="text-[var(--accent)]" /> Forensic Feed
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10">
                            <div className="space-y-3 pb-8">
                                {topInfluencers.map((inf, i) => (
                                    <div
                                        key={inf.id}
                                        className="group relative flex items-center gap-4 p-4 bg-[var(--surface)] hover:bg-[var(--surface-muted)] rounded-[var(--radius-xl)] border border-[var(--border)] hover:border-[var(--accent)]/10 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                        onClick={() => setSelectedEntity(inf.name)}
                                        onDoubleClick={() => {
                                            fgRef.current?.centerAt(inf.x, inf.y, 800);
                                            fgRef.current?.zoom(3, 800);
                                            handleNodeHover(inf);
                                        }}
                                        title="Cliquer pour voir le profil • Double-cliquer pour zoomer"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-[var(--surface-muted)] flex items-center justify-center text-[10px] font-black text-[var(--accent)] border border-[var(--border)] group-hover:bg-[var(--surface)] group-hover:border-[var(--accent)] transition-all shrink-0 font-legal italic">
                                            {String(i + 1).padStart(2, '0')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-[13px] font-black text-[var(--text)] truncate group-hover:text-[var(--accent)] transition-colors font-legal italic">{inf.name}</div>
                                                <ArrowUpRight size={12} className="text-[var(--text-dim)] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <div className="flex-1 h-1 bg-[var(--surface-muted)] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[var(--accent)] opacity-80" style={{ width: `${Math.min(100, (inf.val / 50) * 100)}%` }}></div>
                                                </div>
                                                <span className="text-[9px] font-mono-data font-black text-[var(--text-dim)] uppercase shrink-0">RI: {inf.val}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* GRAPH AREA */}
                <div className="flex-1 relative bg-white transition-all overflow-hidden flex flex-col min-w-0">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.2]"
                        style={{ backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                    </div>

                    {/* HUD Overlay - Top Right Controls */}
                    <div className="absolute top-6 right-6 z-30 flex flex-col items-end gap-3 scale-90 origin-top-right">
                        <div className="bg-white/80 backdrop-blur-3xl p-1.5 rounded-2xl shadow-xl border border-[var(--border)] flex items-center gap-1.5">
                            {/* Toggle to 3D Iron Man View */}
                            <button
                                onClick={onToggle2D3D}
                                className="flex items-center gap-2 px-4 py-2.5 hover:bg-[var(--surface-muted)] rounded-xl text-[var(--text-muted)] hover:text-[var(--accent)] transition-all group"
                                title="Basculer en Iron Man View 3D"
                            >
                                <Box size={16} className="group-hover:rotate-12 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Iron Man View</span>
                            </button>
                            <div className="w-[1px] h-6 bg-[var(--border)]"></div>
                            <button onClick={toggleFullscreen} className="p-3 hover:bg-[var(--surface-muted)] rounded-xl text-[var(--text-dim)] hover:text-[var(--accent)] transition-all" title="Fullscreen">
                                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                            <div className="w-[1px] h-6 bg-[var(--border)]"></div>
                            <button onClick={() => fgRef.current?.zoomToFit(800)} className="p-3 hover:bg-[var(--surface-muted)] rounded-xl text-[var(--text-dim)] hover:text-[var(--accent)] transition-all" title="Zoom to Fit">
                                <Crosshair size={18} />
                            </button>
                            <div className="w-[1px] h-6 bg-[var(--border)]"></div>
                            <div className="flex items-center">
                                <button onClick={() => fgRef.current?.zoom((fgRef.current?.zoom() || 1) * 1.5, 300)} className="p-3 hover:bg-[var(--surface-muted)] rounded-xl text-[var(--text-dim)] hover:text-[var(--accent)] transition-all">
                                    <ZoomIn size={18} />
                                </button>
                                <button onClick={() => fgRef.current?.zoom((fgRef.current?.zoom() || 1) * 0.7, 300)} className="p-3 hover:bg-[var(--surface-muted)] rounded-xl text-[var(--text-dim)] hover:text-[var(--accent)] transition-all">
                                    <ZoomOut size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="px-4 py-2 bg-black/90 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.4em] font-mono-data">Renderer: Canvas_v4</span>
                        </div>
                    </div>

                    {/* Hover Evidence Details - Pro Style */}
                    {hoverNode && (
                        <div className="absolute top-24 right-6 z-30 bg-[var(--surface)]/95 backdrop-blur-3xl p-6 lg:p-8 rounded-[var(--radius-2xl)] border border-[var(--border)] shadow-[var(--shadow-premium)] w-[320px] lg:w-[380px] animate-in slide-in-from-top-4 fade-in pointer-events-none scale-95 lg:scale-100 origin-top-right">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                                <Target size={120} className="text-[var(--accent)]" />
                            </div>

                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className={`w-2.5 h-2.5 rounded-full shadow-sm animate-pulse ${hoverNode.type === 'INVESTIGATION' ? 'bg-[var(--accent)]' : 'bg-[var(--primary)]'}`}></div>
                                <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-[0.4em]">{hoverNode.type} ANALYTICS</span>
                            </div>

                            <h4 className="text-xl lg:text-2xl font-black text-[var(--text)] leading-snug mb-8 tracking-tighter italic font-legal">"{hoverNode.name}"</h4>

                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div className="bg-[var(--surface-muted)]/50 p-5 rounded-2xl border border-[var(--border)] flex flex-col justify-center">
                                    <div className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-1.5">Direct Connections</div>
                                    <div className="flex items-baseline gap-2 text-[var(--accent)]">
                                        <div className="text-3xl font-mono-data font-black">{hoverNode.neighbors?.length}</div>
                                        <div className="text-[10px] font-black uppercase tracking-tighter opacity-50">Links</div>
                                    </div>
                                </div>
                                <div className="bg-[var(--surface-muted)]/50 p-5 rounded-2xl border border-[var(--border)] flex flex-col justify-center">
                                    <div className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-widest mb-1.5">Resonance Score</div>
                                    <div className="flex items-baseline gap-2 text-[var(--primary)]">
                                        <div className="text-3xl font-mono-data font-black">{hoverNode.val}</div>
                                        <div className="text-[10px] font-black uppercase tracking-tighter opacity-50">Pts</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)]/50 px-4 py-2 rounded-xl">
                                <Shield className="text-[var(--success)]" size={14} />
                                <span className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em]">Verified Integrity Source</span>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 min-h-0 relative z-10">
                        <ForceGraph2D
                            ref={fgRef}
                            graphData={graphData}
                            nodeLabel={(node: any) => node.name}
                            nodeRelSize={1.5}
                            nodeVal={(node: any) => Math.sqrt(node.val) * 2}
                            cooldownTicks={100}
                            d3AlphaDecay={0.02}
                            d3VelocityDecay={0.3}
                            linkColor={(link: any) => {
                                if (highlightLinks.has(link)) return '#dc2626';
                                return link.type === 'TRANSACTION' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.15)';
                            }}
                            linkWidth={(link: any) => {
                                if (highlightLinks.has(link)) return 2;
                                return link.type === 'TRANSACTION' ? 1.5 : 0.8;
                            }}
                            linkDirectionalArrowLength={(link: any) => link.type === 'TRANSACTION' ? 6 : 0}
                            linkDirectionalArrowRelPos={1}
                            linkDirectionalParticles={(link: any) => link.type === 'TRANSACTION' && highlightLinks.has(link) ? 4 : 0}
                            linkDirectionalParticleWidth={2}
                            linkDirectionalParticleSpeed={0.01}
                            backgroundColor="transparent"
                            onNodeHover={handleNodeHover}
                            onNodeClick={(node: any) => {
                                const graphNode = node as GraphNode;
                                if (graphNode.type === 'PERSON') {
                                    setSelectedEntity(graphNode.name);
                                }
                            }}
                            nodeCanvasObject={(nodeItem: any, ctx, globalScale) => {
                                const node = nodeItem as GraphNode;
                                if (!node.x || !node.y) return;

                                const isHighlighted = highlightNodes.has(node);
                                const isSearching = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());
                                const active = isHighlighted || isSearching;

                                const baseSize = Math.sqrt(node.val) * 1.8;
                                const size = active ? baseSize * 1.4 : baseSize;

                                // Selection Glow
                                if (active) {
                                    ctx.beginPath();
                                    ctx.arc(node.x, node.y, size * 2.5, 0, 2 * Math.PI);
                                    ctx.fillStyle = `${node.color}10`;
                                    ctx.fill();

                                    ctx.beginPath();
                                    ctx.arc(node.x, node.y, size * 1.6, 0, 2 * Math.PI);
                                    ctx.fillStyle = `${node.color}20`;
                                    ctx.fill();
                                }

                                // Node Circle
                                ctx.beginPath();
                                ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
                                ctx.fillStyle = active ? node.color : '#FFFFFF';
                                ctx.fill();
                                ctx.strokeStyle = active ? '#FFFFFF' : `${node.color}80`;
                                ctx.lineWidth = active ? 2 : 1.2;
                                ctx.stroke();

                                // Inner Core Detail
                                if (active) {
                                    ctx.beginPath();
                                    ctx.arc(node.x, node.y, size * 0.35, 0, 2 * Math.PI);
                                    ctx.fillStyle = '#FFFFFF';
                                    ctx.fill();
                                }

                                const label = node.name;
                                const fontSize = active ? 14 / globalScale : 12 / globalScale;
                                ctx.font = `${active ? '900' : '500'} ${fontSize}px Inter`;
                                const textWidth = ctx.measureText(label).width;
                                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.5) as [number, number];

                                if (active) {
                                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                                    ctx.roundRect
                                        ? ctx.roundRect(node.x - bckgDimensions[0] / 2, node.y + size + 2, bckgDimensions[0], bckgDimensions[1], 4)
                                        : ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + size + 2, bckgDimensions[0], bckgDimensions[1]);
                                    ctx.fill();

                                    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
                                    ctx.shadowBlur = 10;
                                }

                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillStyle = active ? (isSearching ? '#dc2626' : '#0f172a') : node.color;
                                if (active || globalScale > 1.5) {
                                    ctx.fillText(label, node.x, node.y + size + 2 + bckgDimensions[1] / 2);
                                }

                                ctx.shadowColor = 'transparent';
                            }}
                            nodePointerAreaPaint={(node: any, color, ctx) => {
                                ctx.fillStyle = color;
                                const size = Math.sqrt(node.val) * 1.8;
                                ctx.beginPath();
                                ctx.arc(node.x, node.y, size + 5, 0, 2 * Math.PI);
                                ctx.fill();
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
