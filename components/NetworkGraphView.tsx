import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { ProcessedResult } from '../types';
import { storageService } from '../services/storageService';
import { Share2, Info, Crosshair, ZoomIn, ZoomOut, Activity, Users, FileText } from 'lucide-react';

interface GraphNode {
    id: string;
    name: string;
    val: number;
    type: 'PERSON' | 'INVESTIGATION';
    color: string;
    neighbors?: GraphNode[];
    links?: GraphLink[];
}

interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    value: number;
}

export const NetworkGraphView: React.FC = () => {
    const fgRef = useRef<ForceGraphMethods>();
    const [history, setHistory] = useState<ProcessedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set<GraphNode>());
    const [highlightLinks, setHighlightLinks] = useState(new Set<GraphLink>());

    useEffect(() => {
        storageService.getAllResults().then(data => {
            setHistory(data);
            setLoading(false);
        });
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
                val: 20,
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
                        val: 10,
                        type: 'PERSON',
                        color: '#8AB4F8',
                        neighbors: [],
                        links: []
                    };
                    nodesMap.set(ent, entNode);
                } else {
                    entNode.val += 3; // Influence grows with recurrence
                }

                const link: GraphLink = { source: invId, target: ent, value: 1 };
                links.push(link);

                // Setup relationships for highlighting
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

    const updateHighlight = () => {
        setHighlightNodes(new Set(highlightNodes));
        setHighlightLinks(new Set(highlightLinks));
    };

    const handleNodeHover = (node: any) => {
        highlightNodes.clear();
        highlightLinks.clear();
        if (node) {
            highlightNodes.add(node);
            node.neighbors?.forEach((neighbor: any) => highlightNodes.add(neighbor));
            node.links?.forEach((link: any) => highlightLinks.add(link));
        }
        setHoverNode(node || null);
        updateHighlight();
    };

    const topInfluencers = useMemo(() => {
        return graphData.nodes
            .filter(n => n.type === 'PERSON')
            .sort((a, b) => b.val - a.val)
            .slice(0, 5);
    }, [graphData]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-[#0F0F0F]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#F2B8B5] blur-2xl opacity-20 animate-pulse"></div>
                        <Activity size={48} className="text-[#F2B8B5] animate-spin" />
                    </div>
                    <span className="text-xs font-black text-[#E3E3E3] uppercase tracking-[0.3em] animate-pulse">Init Mapping Sequence...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex bg-[#0F0F0F] relative overflow-hidden font-sans">

            {/* 1. Forensic Sidebar Statistics */}
            <aside className="w-80 border-r border-[#2D2D2D] bg-[#121212]/80 backdrop-blur-xl z-20 flex flex-col p-8 animate-in slide-in-from-left duration-700">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-[#F2B8B5]/10 rounded-2xl border border-[#F2B8B5]/20">
                        <Share2 size={24} className="text-[#F2B8B5]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-[#E3E3E3] tracking-tighter">Influence Map</h2>
                        <span className="text-[10px] font-bold text-[#757775] uppercase tracking-widest">Network Analytics</span>
                    </div>
                </div>

                <div className="space-y-8 flex-1 overflow-y-auto no-scrollbar">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#1A1A1A] p-4 rounded-3xl border border-[#2D2D2D]">
                            <div className="text-[10px] font-black text-[#757775] uppercase mb-1">Entités</div>
                            <div className="text-2xl font-mono text-[#F2B8B5]">{graphData.nodes.length}</div>
                        </div>
                        <div className="bg-[#1A1A1A] p-4 rounded-3xl border border-[#2D2D2D]">
                            <div className="text-[10px] font-black text-[#757775] uppercase mb-1">Liens</div>
                            <div className="text-2xl font-mono text-[#8AB4F8]">{graphData.links.length}</div>
                        </div>
                    </div>

                    {/* Top Influencers */}
                    <div>
                        <h3 className="text-xs font-black text-[#8E918F] uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Users size={14} /> Top Influencers
                        </h3>
                        <div className="space-y-3">
                            {topInfluencers.map((inf, i) => (
                                <div key={inf.id} className="group flex items-center gap-4 p-4 bg-[#1A1A1A] hover:bg-[#F2B8B5]/5 rounded-2xl border border-[#2D2D2D] transition-all cursor-pointer">
                                    <div className="w-8 h-8 rounded-full bg-[#121212] flex items-center justify-center text-[10px] font-black text-[#F2B8B5] border border-[#2D2D2D]">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="text-xs font-bold text-[#E3E3E3] truncate">{inf.name}</div>
                                        <div className="text-[9px] text-[#757775] uppercase font-black tracking-widest">Score: {inf.val}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-8 border-t border-[#2D2D2D] space-y-4">
                    <div className="flex items-center gap-3 text-[#757775] text-[10px] font-bold uppercase tracking-widest">
                        <Info size={14} /> Interactive Graph Ready
                    </div>
                </div>
            </aside>

            {/* 2. Main Graph Area */}
            <div className="flex-1 relative bg-black">
                {/* Floating Controls */}
                <div className="absolute top-8 right-8 z-30 flex flex-col gap-2 pointer-events-auto">
                    <button onClick={() => fgRef.current?.zoomToFit(400)} className="p-3 bg-[#1A1A1A] hover:bg-[#252525] rounded-2xl border border-[#2D2D2D] text-[#E3E3E3] transition-all" title="Recenter">
                        <Crosshair size={20} />
                    </button>
                    <button onClick={() => fgRef.current?.zoom(fgRef.current?.zoom() * 1.2)} className="p-3 bg-[#1A1A1A] hover:bg-[#252525] rounded-2xl border border-[#2D2D2D] text-[#E3E3E3] transition-all">
                        <ZoomIn size={20} />
                    </button>
                    <button onClick={() => fgRef.current?.zoom(fgRef.current?.zoom() * 0.8)} className="p-3 bg-[#1A1A1A] hover:bg-[#252525] rounded-2xl border border-[#2D2D2D] text-[#E3E3E3] transition-all">
                        <ZoomOut size={20} />
                    </button>
                </div>

                {/* Hover Info Card */}
                {hoverNode && (
                    <div className="absolute bottom-8 left-8 z-30 bg-[#121212]/95 backdrop-blur-md p-6 rounded-[32px] border border-[#F2B8B5]/30 shadow-2xl w-72 animate-in fade-in slide-in-from-bottom-2 pointer-events-none">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-3 h-3 rounded-full ${hoverNode.type === 'INVESTIGATION' ? 'bg-[#F2B8B5]' : 'bg-[#8AB4F8]'}`}></div>
                            <span className="text-[10px] font-black text-[#757775] uppercase tracking-widest">{hoverNode.type}</span>
                        </div>
                        <h4 className="text-[#E3E3E3] font-bold text-sm mb-2">{hoverNode.name}</h4>
                        <div className="text-[10px] font-mono text-[#F2B8B5]">Connections: {hoverNode.neighbors?.length}</div>
                    </div>
                )}

                <ForceGraph2D
                    ref={fgRef}
                    graphData={graphData}
                    nodeLabel={(node: any) => ""} // Custom hover instead
                    nodeRelSize={1}
                    nodeVal={(node: any) => node.val}
                    linkColor={(link: any) => highlightLinks.has(link) ? '#F2B8B5' : '#1A1A1A'}
                    linkWidth={(link: any) => highlightLinks.has(link) ? 3 : 1}
                    linkDirectionalParticles={2}
                    linkDirectionalParticleWidth={(link: any) => highlightLinks.has(link) ? 3 : 0}
                    linkDirectionalParticleSpeed={0.005}
                    backgroundColor="#0F0F0F"
                    onNodeHover={handleNodeHover}
                    onNodeClick={(node: any) => {
                        fgRef.current?.centerAt(node.x, node.y, 400);
                        fgRef.current?.zoom(2.5, 400);
                    }}
                    nodeCanvasObject={(node: any, ctx, globalScale) => {
                        const isHighlighted = highlightNodes.has(node);
                        const size = node.val / Math.sqrt(globalScale);

                        // Draw Glow
                        if (isHighlighted || node.val > 25) {
                            ctx.beginPath();
                            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 2.5);
                            gradient.addColorStop(0, `${node.color}33`);
                            gradient.addColorStop(1, 'transparent');
                            ctx.fillStyle = gradient;
                            ctx.arc(node.x, node.y, size * 2.5, 0, 2 * Math.PI);
                            ctx.fill();
                        }

                        // Draw Base Circle
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                        ctx.fillStyle = isHighlighted ? '#FFF' : node.color;
                        ctx.shadowColor = node.color;
                        ctx.shadowBlur = isHighlighted ? 15 : 5;
                        ctx.fill();

                        // Draw Icon or Label
                        if (globalScale > 1.2) {
                            const label = node.name;
                            const fontSize = 10 / globalScale;
                            ctx.font = `${isHighlighted ? 'bold' : 'normal'} ${fontSize}px Inter`;
                            const textWidth = ctx.measureText(label).width;

                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = isHighlighted ? '#FFF' : '#757775';

                            if (globalScale > 2 || isHighlighted) {
                                ctx.fillText(label, node.x, node.y + size + fontSize + 2);
                            }
                        }
                    }}
                    cooldownTicks={100}
                    onEngineStop={() => fgRef.current?.zoomToFit(400)}
                />
            </div>
        </div>
    );
};
