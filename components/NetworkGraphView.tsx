/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { ProcessedResult } from '../types';
import { storageService } from '../services/storageService';
import { Share2, Info, Crosshair, ZoomIn, ZoomOut, Activity, Users, FileText, Search, Filter, Shield, Target, Link2, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen, ArrowUpRight, Zap, ShieldCheck } from 'lucide-react';
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
}

export const NetworkGraphView: React.FC<NetworkGraphViewProps> = ({ onDeepDive, onNavigateToInvestigation }) => {
    const fgRef = useRef<ForceGraphMethods>();
    const containerRef = useRef<HTMLDivElement>(null);
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set<GraphNode>());
    const [highlightLinks, setHighlightLinks] = useState(new Set<GraphLink>());
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'PERSON' | 'INVESTIGATION'>('ALL');
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
                color: '#B91C1C',
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

                const riskColor = risk > 7 ? '#B91C1C' : risk > 4 ? '#0F4C81' : '#64748B';

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

        return {
            nodes: Array.from(nodesMap.values()),
            links: links
        };
    }, [history]);

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
                        <div className="absolute inset-0 border-[2px] border-slate-50 rounded-full"></div>
                        <div className="absolute inset-0 border-t-[2px] border-[#B91C1C] rounded-full animate-spin"></div>
                        <Share2 size={24} className="absolute inset-0 m-auto text-[#B91C1C] animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">Neural Mapping Sequence...</span>
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
        <div ref={containerRef} className={`h-full flex bg-[#F8FAFC] relative overflow-hidden font-sans text-[#0F172A] ${isFullscreen ? 'fixed inset-0 z-[100]' : ''}`}>

            {/* Background Texture */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] report-paper"></div>

            {/* SIDEBAR TOGGLE */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute top-6 left-6 z-40 p-3 bg-white/90 backdrop-blur-3xl border border-slate-100 rounded-xl text-slate-400 hover:text-[#B91C1C] transition-all shadow-lg animate-in fade-in"
                >
                    <PanelLeftOpen size={18} />
                </button>
            )}

            {/* PROFESSIONAL SIDEBAR - Forensic Asset Panel */}
            <aside className={`${isSidebarOpen ? 'w-[360px] lg:w-[400px]' : 'w-0'} border-r border-slate-100 bg-white/95 backdrop-blur-3xl z-20 flex flex-col transition-all duration-500 relative overflow-hidden shadow-2xl`}>
                <div className={`${isSidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 h-full flex flex-col p-8 lg:p-10`}>
                    <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-[#F8FAFC] to-transparent pointer-events-none opacity-50"></div>

                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute top-8 right-8 text-slate-300 hover:text-[#0F172A] transition-colors p-2 hover:bg-slate-50 rounded-xl z-10"
                    >
                        <PanelLeftClose size={18} />
                    </button>

                    <div className="mb-10 relative z-10">
                        <div className="flex items-center gap-5 mb-4">
                            <div className="w-12 h-12 bg-[#B91C1C] rounded-[1rem] flex items-center justify-center shadow-xl shadow-red-900/10 transition-transform hover:rotate-6">
                                <Share2 size={22} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-[#0F172A] uppercase italic font-serif-legal leading-tight">Cartographie <span className="text-[#B91C1C]">Relationnelle</span></h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Neural Link v4.2 Trace</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
                        <div className="bg-[#F8FAFC] p-6 rounded-[2rem] border border-slate-100 relative overflow-hidden group shadow-sm transition-all hover:bg-white hover:shadow-xl">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                                <Target size={40} className="text-[#B91C1C]" />
                            </div>
                            <div className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Entités Identifiées</div>
                            <div className="text-2xl font-mono-data font-black text-[#B91C1C] leading-none">{graphData.nodes.length}</div>
                        </div>
                        <div className="bg-[#F8FAFC] p-6 rounded-[2rem] border border-slate-100 relative overflow-hidden group shadow-sm transition-all hover:bg-white hover:shadow-xl">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                                <Link2 size={40} className="text-[#0F4C81]" />
                            </div>
                            <div className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Liens Détectés</div>
                            <div className="text-2xl font-mono-data font-black text-[#0F4C81] leading-none">{graphData.links.length}</div>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="space-y-4 mb-10 relative z-10">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#B91C1C] transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Rechercher une cible..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-[#F8FAFC] border border-slate-100 rounded-xl py-3 pl-12 pr-6 text-[13px] focus:border-[#B91C1C] focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium"
                            />
                        </div>
                        <div className="flex gap-2 p-1.5 bg-[#F8FAFC] border border-slate-50 rounded-xl">
                            {(['ALL', 'PERSON', 'INVESTIGATION'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setFilterType(t)}
                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterType === t ? 'bg-white text-[#B91C1C] shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {t === 'ALL' ? 'Tous' : t === 'PERSON' ? 'Cibles' : 'Affaires'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Influencers */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                        <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                            <Zap size={14} className="text-[#B91C1C]" /> Forensic Integrity Feed
                        </h3>
                        <div className="space-y-3 pb-8">
                            {topInfluencers.map((inf, i) => (
                                <div
                                    key={inf.id}
                                    className="group relative flex items-center gap-4 p-4 bg-white hover:bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-[#B91C1C]/10 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                    onClick={() => setSelectedEntity(inf.name)}
                                    onDoubleClick={() => {
                                        fgRef.current?.centerAt(inf.x, inf.y, 800);
                                        fgRef.current?.zoom(3, 800);
                                        handleNodeHover(inf);
                                    }}
                                    title="Cliquer pour voir le profil • Double-cliquer pour zoomer"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[10px] font-black text-[#B91C1C] border border-slate-100 group-hover:bg-white group-hover:border-[#B91C1C] transition-all shrink-0 font-serif-legal italic">
                                        {String(i + 1).padStart(2, '0')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-[13px] font-black text-[#0F172A] truncate group-hover:text-[#B91C1C] transition-colors font-serif-legal italic">{inf.name}</div>
                                            <ArrowUpRight size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#B91C1C] opacity-80" style={{ width: `${Math.min(100, (inf.val / 50) * 100)}%` }}></div>
                                            </div>
                                            <span className="text-[9px] font-mono-data font-black text-slate-300 uppercase shrink-0">RI: {inf.val}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50 mt-4 relative z-10">
                        <div className="p-5 bg-[#F8FAFC] border border-slate-50 rounded-2xl flex items-start gap-4">
                            <ShieldCheck size={18} className="text-[#B5965D] shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold italic">
                                Le RI-Score calcule l'indice de résonance transversale au sein des archives judiciaires compilées.
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* GRAPH AREA */}
            <div className="flex-1 relative bg-white transition-all overflow-hidden flex flex-col">
                <div className="absolute inset-0 pointer-events-none opacity-[0.2]"
                    style={{ backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                </div>

                {/* HUD Overlay - Top Right Controls */}
                <div className="absolute top-6 right-6 z-30 flex flex-col items-end gap-3 scale-90 origin-top-right">
                    <div className="bg-white/80 backdrop-blur-3xl p-1.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-1.5">
                        <button onClick={toggleFullscreen} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-[#B91C1C] transition-all" title="Fullscreen">
                            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                        <div className="w-[1px] h-6 bg-slate-100"></div>
                        <button onClick={() => fgRef.current?.zoomToFit(800)} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-[#B91C1C] transition-all" title="Zoom to Fit">
                            <Crosshair size={18} />
                        </button>
                        <div className="w-[1px] h-6 bg-slate-100"></div>
                        <div className="flex items-center">
                            <button onClick={() => fgRef.current?.zoom(fgRef.current?.zoom() * 1.5, 300)} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-[#B91C1C] transition-all">
                                <ZoomIn size={18} />
                            </button>
                            <button onClick={() => fgRef.current?.zoom(fgRef.current?.zoom() * 0.7, 300)} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-[#B91C1C] transition-all">
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
                    <div className="absolute top-24 right-6 z-30 bg-white/95 backdrop-blur-3xl p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_30px_100px_rgba(0,0,0,0.1)] w-[320px] lg:w-[380px] animate-in slide-in-from-top-4 fade-in pointer-events-none scale-95 lg:scale-100 origin-top-right">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                            <Target size={120} className="text-[#B91C1C]" />
                        </div>

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className={`w-2.5 h-2.5 rounded-full shadow-sm animate-pulse ${hoverNode.type === 'INVESTIGATION' ? 'bg-[#B91C1C] shadow-red-500/50' : 'bg-[#0F4C81] shadow-blue-500/50'}`}></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">{hoverNode.type} ANALYTICS</span>
                        </div>

                        <h4 className="text-xl lg:text-2xl font-black text-[#0F172A] leading-snug mb-8 tracking-tighter italic font-serif-legal">"{hoverNode.name}"</h4>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-100 flex flex-col justify-center">
                                <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Direct Connections</div>
                                <div className="flex items-baseline gap-2 text-[#B91C1C]">
                                    <div className="text-3xl font-mono-data font-black">{hoverNode.neighbors?.length}</div>
                                    <div className="text-[10px] font-black uppercase tracking-tighter opacity-50">Links</div>
                                </div>
                            </div>
                            <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-slate-100 flex flex-col justify-center">
                                <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Resonance Score</div>
                                <div className="flex items-baseline gap-2 text-[#0F4C81]">
                                    <div className="text-3xl font-mono-data font-black">{hoverNode.val}</div>
                                    <div className="text-[10px] font-black uppercase tracking-tighter opacity-50">Pts</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-3 bg-white border border-slate-50 px-4 py-2 rounded-xl">
                            <Shield className="text-emerald-500" size={14} />
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Verified Integrity Source</span>
                        </div>
                    </div>
                )}

                <div className="flex-1 min-h-0 relative z-10">
                    <ForceGraph2D
                        ref={fgRef}
                        graphData={graphData}
                        nodeLabel={() => ""}
                        nodeRelSize={1}
                        nodeVal={(node: any) => node.val}
                        linkColor={(link: any) => {
                            if (highlightLinks.has(link)) return '#B91C1C';
                            return link.type === 'TRANSACTION' ? 'rgba(239, 68, 68, 0.4)' : '#F1F5F9';
                        }}
                        linkWidth={(link: any) => {
                            if (highlightLinks.has(link)) return 3;
                            return link.type === 'TRANSACTION' ? 2 : 1;
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

                            // Label Styling - More Professional
                            if (globalScale > 0.9 || active) {
                                const labelFontSize = (active ? 12 : 9) / globalScale;
                                ctx.font = `${active ? '900' : '600'} ${labelFontSize}px Inter`;
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';

                                if (active) {
                                    const text = node.name.toUpperCase();
                                    const textWidth = ctx.measureText(text).width;

                                    // Tag-style label background
                                    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
                                    const padding = 6 / globalScale;
                                    const rectX = node.x - textWidth / 2 - padding;
                                    const rectY = node.y + size + (12 / globalScale);
                                    const rectW = textWidth + padding * 2;
                                    const rectH = labelFontSize + padding * 1.5;

                                    // Rounded Rect label
                                    ctx.beginPath();
                                    ctx.roundRect(rectX, rectY, rectW, rectH, 4 / globalScale);
                                    ctx.fill();

                                    ctx.fillStyle = '#FFFFFF';
                                    ctx.fillText(text, node.x, rectY + rectH / 2);
                                } else {
                                    ctx.fillStyle = '#64748B';
                                    ctx.fillText(node.name, node.x, node.y + size + (12 / globalScale));
                                }
                            }
                        }}
                    />
                </div>

                {/* HUD Footer Information */}
                <div className="absolute bottom-6 left-6 right-6 z-30 flex justify-between items-center pointer-events-none scale-90 lg:scale-100 origin-bottom">
                    <div className="flex items-center gap-6 px-6 py-3 bg-white/50 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#B91C1C]"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Criminal Record</span>
                        </div>
                        <div className="h-3 w-px bg-slate-200"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#0F4C81]"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Case</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">Spatial Processor</span>
                            <span className="text-[10px] font-mono-data font-black text-slate-500 uppercase tracking-wider">v4.2.0-ALGORITHMIC</span>
                        </div>
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
                            <Zap size={16} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
