import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { ProcessedResult } from '../types';
import { storageService } from '../services/storageService';
import { Share2, Info, Crosshair, ZoomIn, ZoomOut, Activity, Users, FileText, Search, Filter, Shield, Target, Link2, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

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

export const NetworkGraphView: React.FC = () => {
    const fgRef = useRef<ForceGraphMethods>();
    const containerRef = useRef<HTMLDivElement>(null);
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
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
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const graphData = useMemo(() => {
        const nodesMap: Map<string, GraphNode> = new Map();
        const links: GraphLink[] = [];

        history.forEach(res => {
            if (!res.output) return;

            const invId = res.id;
            const invNode: GraphNode = {
                id: invId,
                name: res.input.query,
                val: 28,
                type: 'INVESTIGATION',
                color: '#F2B8B5',
                neighbors: [],
                links: []
            };
            nodesMap.set(invId, invNode);

            const entities = res.output.entites_cles || [];
            entities.forEach(ent => {
                let entNode = nodesMap.get(ent);
                if (!entNode) {
                    entNode = {
                        id: ent,
                        name: ent,
                        val: 12,
                        type: 'PERSON',
                        color: '#8AB4F8',
                        neighbors: [],
                        links: []
                    };
                    nodesMap.set(ent, entNode);
                } else {
                    entNode.val += 4;
                }

                const link: GraphLink = { source: invId, target: ent, value: 1 };
                links.push(link);

                invNode.neighbors!.push(entNode);
                entNode.neighbors!.push(invNode);
                invNode.links!.push(link);
                entNode.links!.push(link);
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
            .slice(0, 5);
    }, [graphData]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-[#090909]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-2 border-[#F2B8B5]/10 rounded-full"></div>
                        <div className="absolute inset-0 border-t-2 border-[#F2B8B5] rounded-full animate-spin"></div>
                        <Activity size={32} className="absolute inset-0 m-auto text-[#F2B8B5]" />
                    </div>
                    <span className="text-[10px] font-black text-[#757775] uppercase tracking-[0.4em] animate-pulse">Neural Mapping Sequence...</span>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={`h-full flex bg-[#090909] relative overflow-hidden font-sans text-[#E3E3E3] ${isFullscreen ? 'fixed inset-0 z-[100]' : ''}`}>

            {/* TOGGLE SIDEBAR BUTTON (Floating when sidebar closed) */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute top-8 left-8 z-40 p-4 bg-[#161616]/80 backdrop-blur-xl border border-[#1F1F1F] rounded-2xl text-[#757775] hover:text-[#F2B8B5] transition-all shadow-2xl animate-in fade-in zoom-in"
                >
                    <PanelLeftOpen size={20} />
                </button>
            )}

            {/* 1. PROFESSIONAL SIDEBAR */}
            <aside className={`${isSidebarOpen ? 'w-[380px]' : 'w-0 opacity-0 pointer-events-none'} border-r border-[#1F1F1F] bg-[#0F0F0F]/90 backdrop-blur-3xl z-20 flex flex-col p-8 transition-all duration-500 relative overflow-hidden shrink-0`}>

                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute top-8 right-8 text-[#444746] hover:text-white transition-colors"
                >
                    <PanelLeftClose size={20} />
                </button>

                {/* Header Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#F2B8B5] to-[#601410] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#F2B8B5]/10 border border-white/10">
                            <Share2 size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tighter leading-none">Influence Map</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#6DD58C] animate-pulse"></span>
                                <span className="text-[9px] font-bold text-[#757775] uppercase tracking-widest">Neural Link v4.2</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-[#161616] p-5 rounded-[28px] border border-[#2D2D2D] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
                            <Target size={40} className="text-[#F2B8B5]" />
                        </div>
                        <div className="text-[10px] font-black text-[#757775] uppercase mb-1 tracking-widest">Entités</div>
                        <div className="text-3xl font-mono font-black text-[#F2B8B5]">{graphData.nodes.length}</div>
                    </div>
                    <div className="bg-[#161616] p-5 rounded-[28px] border border-[#2D2D2D] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
                            <Link2 size={40} className="text-[#8AB4F8]" />
                        </div>
                        <div className="text-[10px] font-black text-[#757775] uppercase mb-1 tracking-widest">Liens</div>
                        <div className="text-3xl font-mono font-black text-[#8AB4F8]">{graphData.links.length}</div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="space-y-4 mb-8">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#757775] group-focus-within:text-[#F2B8B5] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher une cible..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-[#161616] border border-[#2D2D2D] rounded-2xl py-3.5 pl-12 pr-4 text-xs focus:border-[#F2B8B5] focus:outline-none transition-all placeholder:text-[#444746]"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(['ALL', 'PERSON', 'INVESTIGATION'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setFilterType(t)}
                                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${filterType === t ? 'bg-[#F2B8B5] border-[#F2B8B5] text-[#370003]' : 'bg-transparent border-[#2D2D2D] text-[#757775] hover:border-[#444746]'}`}
                            >
                                {t === 'ALL' ? 'Tous' : t === 'PERSON' ? 'Cibles' : 'Affaires'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Top Influencers Section */}
                <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
                    <h3 className="text-xs font-black text-[#757775] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Shield size={14} className="text-[#F2B8B5]" /> Top Neural Priorities
                    </h3>
                    <div className="space-y-2.5">
                        {topInfluencers.map((inf, i) => (
                            <div
                                key={inf.id}
                                className="group relative flex items-center gap-4 p-4 bg-[#161616] hover:bg-[#1C1C1C] rounded-[24px] border border-[#2D2D2D] hover:border-[#F2B8B5]/30 transition-all cursor-pointer overflow-hidden"
                                onClick={() => {
                                    fgRef.current?.centerAt(inf.x, inf.y, 800);
                                    fgRef.current?.zoom(3, 800);
                                    handleNodeHover(inf);
                                }}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[#F2B8B5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-10 h-10 rounded-full bg-[#0F0F0F] flex items-center justify-center text-[10px] font-black text-[#F2B8B5] border border-[#2D2D2D] group-hover:border-[#F2B8B5] transition-colors shrink-0">
                                    {String(i + 1).padStart(2, '0')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold truncate group-hover:text-[#F2B8B5] transition-colors">{inf.name}</div>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex-1 h-1 bg-[#2D2D2D] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#F2B8B5]" style={{ width: `${Math.min(100, (inf.val / 50) * 100)}%` }}></div>
                                        </div>
                                        <span className="text-[9px] font-mono text-[#757775] uppercase">RI-Score: {inf.val}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-[#1F1F1F] mt-6">
                    <div className="p-4 bg-[#601410]/10 border border-[#601410]/30 rounded-2xl flex items-center gap-3">
                        <Info size={16} className="text-[#F2B8B5] shrink-0" />
                        <p className="text-[10px] text-[#C4C7C5] leading-relaxed italic">
                            Le RI-Score représente l'interconnectivité de l'entité à travers tous les dossiers indexés.
                        </p>
                    </div>
                </div>
            </aside>

            {/* 2. ENHANCED VIRTUAL GRAPH AREA */}
            <div className="flex-1 relative bg-black transition-all">

                {/* Advanced Multi-Control Overlay */}
                <div className="absolute top-8 right-8 z-30 flex gap-2">
                    <div className="bg-[#0F0F0F]/80 backdrop-blur-xl p-1.5 rounded-[24px] border border-[#1F1F1F] flex gap-1 shadow-2xl">
                        <button onClick={toggleFullscreen} className="p-3 hover:bg-[#1C1C1C] rounded-2xl text-[#757775] hover:text-[#F2B8B5] transition-all" title={isFullscreen ? "Quitter Plein Écran" : "Plein Écran"}>
                            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <div className="w-[1px] bg-[#1F1F1F]"></div>
                        <button onClick={() => fgRef.current?.zoomToFit(800)} className="p-3 hover:bg-[#1C1C1C] rounded-2xl text-[#757775] hover:text-[#F2B8B5] transition-all" title="Recenter View">
                            <Crosshair size={20} />
                        </button>
                        <div className="w-[1px] bg-[#1F1F1F]"></div>
                        <button onClick={() => fgRef.current?.zoom(fgRef.current?.zoom() * 1.5, 300)} className="p-3 hover:bg-[#1C1C1C] rounded-2xl text-[#757775] hover:text-[#F2B8B5] transition-all">
                            <ZoomIn size={20} />
                        </button>
                        <button onClick={() => fgRef.current?.zoom(fgRef.current?.zoom() * 0.7, 300)} className="p-3 hover:bg-[#1C1C1C] rounded-2xl text-[#757775] hover:text-[#F2B8B5] transition-all">
                            <ZoomOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Precision Hover Info Panel */}
                {hoverNode && (
                    <div className="absolute top-24 right-8 z-30 bg-[#0F0F0F]/95 backdrop-blur-2xl p-7 rounded-[40px] border border-[#F2B8B5]/30 shadow-2xl w-[320px] animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500 pointer-events-none">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-3 h-3 rounded-full shadow-[0_0_12px] ${hoverNode.type === 'INVESTIGATION' ? 'bg-[#F2B8B5] shadow-[#F2B8B5]' : 'bg-[#8AB4F8] shadow-[#8AB4F8]'}`}></div>
                            <span className="text-[10px] font-black text-[#757775] uppercase tracking-[0.3em]">{hoverNode.type} PROFILE</span>
                        </div>
                        <h4 className="text-xl font-black text-[#E3E3E3] leading-tight mb-4 tracking-tighter italic">"{hoverNode.name}"</h4>

                        <div className="space-y-4">
                            <div className="bg-[#161616] p-4 rounded-2xl border border-[#2D2D2D]">
                                <div className="text-[9px] font-black text-[#757775] uppercase tracking-widest mb-2">Network Resonance</div>
                                <div className="flex items-end gap-2">
                                    <div className="text-2xl font-mono text-[#F2B8B5] leading-none">{hoverNode.neighbors?.length}</div>
                                    <div className="text-[10px] text-[#757775] mb-0.5">Direct Intersections</div>
                                </div>
                            </div>
                            <div className="text-[10px] text-[#757775] uppercase font-bold tracking-[0.1em] px-2 italic">
                                Neural integrity verified by system lab
                            </div>
                        </div>
                    </div>
                )}

                <ForceGraph2D
                    ref={fgRef}
                    graphData={graphData}
                    nodeLabel={() => ""}
                    nodeRelSize={1}
                    nodeVal={(node: any) => node.val}
                    linkColor={(link: any) => highlightLinks.has(link) ? '#F2B8B5' : '#1F1F1F'}
                    linkWidth={(link: any) => highlightLinks.has(link) ? 3 : 1}
                    linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 4 : 0}
                    linkDirectionalParticleWidth={1.5}
                    linkDirectionalParticleSpeed={0.008}
                    backgroundColor="#090909"
                    onNodeHover={handleNodeHover}
                    onNodeClick={(node: any) => {
                        fgRef.current?.centerAt(node.x, node.y, 600);
                        fgRef.current?.zoom(3.5, 600);
                    }}
                    nodeCanvasObject={(node: any, ctx, globalScale) => {
                        if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;

                        const isHighlighted = highlightNodes.has(node);
                        const isSearching = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());
                        const active = isHighlighted || isSearching;

                        const baseSize = node.val / Math.sqrt(globalScale);
                        const size = active ? baseSize * 1.5 : baseSize;

                        if (active || node.val > 35) {
                            const glowLevels = active ? 3 : 1;
                            for (let i = 1; i <= glowLevels; i++) {
                                ctx.beginPath();
                                const gradient = ctx.createRadialGradient(node.x!, node.y!, 0, node.x!, node.y!, size * (1.5 + i));
                                gradient.addColorStop(0, `${node.color}${Math.floor(60 / i).toString(16).padStart(2, '0')}`);
                                gradient.addColorStop(1, 'transparent');
                                ctx.fillStyle = gradient;
                                ctx.arc(node.x!, node.y!, size * (1.5 + i), 0, 2 * Math.PI);
                                ctx.fill();
                            }
                        }

                        ctx.beginPath();
                        ctx.arc(node.x!, node.y!, size, 0, 2 * Math.PI, false);

                        if (node.type === 'INVESTIGATION') {
                            ctx.fillStyle = active ? '#FFF' : node.color;
                            ctx.fill();
                            ctx.strokeStyle = active ? '#FFF' : '#601410';
                            ctx.lineWidth = 2 / globalScale;
                            ctx.stroke();
                        } else {
                            ctx.fillStyle = active ? '#FFF' : node.color;
                            ctx.fill();
                            ctx.strokeStyle = active ? '#FFF' : '#1A237E';
                            ctx.lineWidth = 1.5 / globalScale;
                            ctx.stroke();
                        }

                        const showLabel = globalScale > 1.5 || active;
                        if (showLabel) {
                            const fontSize = (active ? 14 : 10) / globalScale;
                            ctx.font = `${active ? '900' : '500'} ${fontSize}px Inter`;
                            const label = node.name;

                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'top';
                            ctx.fillStyle = active ? '#FFF' : '#8E918F';

                            ctx.shadowColor = 'black';
                            ctx.shadowBlur = 4 / globalScale;
                            ctx.fillText(label, node.x!, node.y! + size + 4 / globalScale);
                            ctx.shadowBlur = 0;
                        }
                    }}
                    cooldownTicks={150}
                    onEngineStop={() => {
                        if (!hoverNode) fgRef.current?.zoomToFit(800);
                    }}
                />
            </div>
        </div>
    );
};
