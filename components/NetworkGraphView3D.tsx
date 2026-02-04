/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Iron Man 3D View - Immersive Network Visualization
 */

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph3D, { ForceGraphMethods } from 'react-force-graph-3d';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ProcessedResult } from '../types';
import { storageService } from '../services/storageService';
import { Share2, Info, Crosshair, ZoomIn, ZoomOut, Activity, Users, FileText, Search, Filter, Shield, Target, Link2, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen, ArrowUpRight, Zap, ShieldCheck, Layers, Box } from 'lucide-react';
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
    z?: number;
}

interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    value: number;
}

interface NetworkGraphView3DProps {
    onDeepDive?: (docTitle: string, style: 'standard' | 'simple' | 'technical') => void;
    onNavigateToInvestigation?: (investigationId: string) => void;
    isGuestMode?: boolean;
    onToggle2D3D?: () => void;
}

export const NetworkGraphView3D: React.FC<NetworkGraphView3DProps> = ({ onDeepDive, onNavigateToInvestigation, isGuestMode, onToggle2D3D }) => {
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
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    // Advanced filters
    const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
    const [minInfluence, setMinInfluence] = useState(0);
    const [colorMode, setColorMode] = useState<'RISK' | 'TYPE' | 'INFLUENCE'>('RISK');
    const [showLabels, setShowLabels] = useState(true);
    const [focusNode, setFocusNode] = useState<GraphNode | null>(null);
    const [isolationMode, setIsolationMode] = useState(false);

    useEffect(() => {
        storageService.getAllResults().then(data => {
            setHistory(data);
            setLoading(false);
        });
    }, []);

    // Handle window resize to adapt to screen
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({ width: rect.width, height: rect.height });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [isSidebarOpen]);

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

        let finalNodes = Array.from(nodesMap.values());

        // Apply Risk Filter
        if (riskFilter !== 'ALL') {
            finalNodes = finalNodes.filter(n => {
                if (n.type !== 'PERSON') return true; // Keep investigations
                const detail = history.flatMap(h => h.output?.entites_details || []).find(d => d.nom === n.name);
                const risk = detail?.risk_level || 5;

                if (riskFilter === 'HIGH') return risk > 7;
                if (riskFilter === 'MEDIUM') return risk >= 4 && risk <= 7;
                if (riskFilter === 'LOW') return risk < 4;
                return true;
            });
        }

        // Apply Influence Filter
        if (minInfluence > 0) {
            finalNodes = finalNodes.filter(n => {
                if (n.type !== 'PERSON') return true; // Keep investigations
                const detail = history.flatMap(h => h.output?.entites_details || []).find(d => d.nom === n.name);
                const influence = detail?.influence || 0;
                return influence >= minInfluence;
            });
        }

        // Apply Density Filter
        if (minConnections > 0) {
            finalNodes = finalNodes.filter(n => (n.neighbors?.length || 0) >= minConnections || n.type === 'INVESTIGATION');
        }

        // Apply Isolation Mode
        if (isolationMode && focusNode) {
            const focusNodeObj = nodesMap.get(focusNode.id);
            if (focusNodeObj) {
                const neighborIds = new Set([focusNode.id, ...(focusNodeObj.neighbors?.map(n => n.id) || [])]);
                finalNodes = finalNodes.filter(n => neighborIds.has(n.id));
            }
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
    }, [history, minConnections, riskFilter, minInfluence, isolationMode, focusNode]);

    useEffect(() => {
        if (fgRef.current) {
            // Optimize 3D forces
            fgRef.current.d3Force('charge')?.strength(-800);
            fgRef.current.d3Force('link')?.distance(150);
        }
    }, [graphData]);

    // Dynamic node color based on color mode
    const getNodeColor = (node: GraphNode): string => {
        if (colorMode === 'TYPE') {
            return node.type === 'INVESTIGATION' ? '#3B82F6' : '#06B6D4';
        }

        if (colorMode === 'INFLUENCE') {
            const detail = history.flatMap(h => h.output?.entites_details || []).find(d => d.nom === node.name);
            const influence = detail?.influence || 0;
            // Gradient from gray to cyan
            const intensity = Math.min(influence / 10, 1);
            return `hsl(${180 + intensity * 30}, ${50 + intensity * 50}%, ${40 + intensity * 30}%)`;
        }

        // Default: RISK mode
        return node.color;
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
        setHighlightNodes(new Set(highlightNodes));
        setHighlightLinks(new Set(highlightLinks));
    };

    // Custom node object with glow effect
    const nodeThreeObject = useCallback((node: any) => {
        const group = new THREE.Group();
        const nodeData = node as GraphNode;

        const isHighlighted = highlightNodes.has(nodeData);
        const baseSize = Math.sqrt(nodeData.val) * 2;

        // Main sphere
        const geometry = new THREE.SphereGeometry(baseSize, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(nodeData.color),
            emissive: new THREE.Color(nodeData.color),
            emissiveIntensity: isHighlighted ? 0.8 : 0.3,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);

        // Glow ring for highlighted nodes
        if (isHighlighted) {
            const ringGeometry = new THREE.RingGeometry(baseSize * 1.5, baseSize * 1.8, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(nodeData.color),
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.lookAt(0, 0, 1);
            group.add(ring);
        }

        // Add sprite label for important nodes
        if (isHighlighted || nodeData.val > 30) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            canvas.width = 512;
            canvas.height = 128;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 48px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(nodeData.name.substring(0, 20), canvas.width / 2, canvas.height / 2);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: isHighlighted ? 1 : 0.7
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(baseSize * 8, baseSize * 2, 1);
            sprite.position.y = baseSize * 2;
            group.add(sprite);
        }

        return group;
    }, [highlightNodes]);

    // Custom link object with particles
    const linkThreeObject = useCallback((link: any) => {
        const isHighlighted = highlightLinks.has(link);
        const isTransaction = link.type === 'TRANSACTION';

        if (!isTransaction && !isHighlighted) return undefined;

        const material = new THREE.LineBasicMaterial({
            color: new THREE.Color(isHighlighted ? '#B91C1C' : '#EF4444'),
            transparent: true,
            opacity: isHighlighted ? 0.8 : 0.3,
            linewidth: isHighlighted ? 3 : 1
        });

        return new THREE.Line(new THREE.BufferGeometry(), material);
    }, [highlightLinks]);

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
                        <Box size={24} className="absolute inset-0 m-auto text-[#B91C1C] animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">Initializing 3D Neural Matrix...</span>
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
        <div ref={containerRef} className={`h-full flex bg-[#0A0A0F] relative overflow-hidden font-sans text-white ${isFullscreen ? 'fixed inset-0 z-[100]' : ''}`}>

            {/* Sci-fi grid background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]"
                style={{ backgroundImage: 'linear-gradient(#1E293B 1px, transparent 1px), linear-gradient(90deg, #1E293B 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
            </div>

            {/* SIDEBAR TOGGLE */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute top-6 left-6 z-40 p-3 bg-black/80 backdrop-blur-3xl border border-cyan-500/30 rounded-xl text-cyan-400 hover:text-cyan-300 transition-all shadow-lg shadow-cyan-500/20 animate-in fade-in"
                >
                    <PanelLeftOpen size={18} />
                </button>
            )}

            {/* PROFESSIONAL SIDEBAR - Iron Man Style */}
            <aside className={`${isSidebarOpen ? 'w-[360px] lg:w-[400px]' : 'w-0'} border-r border-cyan-500/20 bg-black/90 backdrop-blur-3xl z-20 flex flex-col transition-all duration-500 relative overflow-hidden shadow-2xl shadow-cyan-500/10`}>
                <div className={`${isSidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 h-full flex flex-col`}>
                    <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none"></div>

                    {/* Fixed Header */}
                    <div className="p-8 lg:p-10 pb-6 relative z-10 flex-shrink-0">
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-8 right-8 text-cyan-400/50 hover:text-cyan-300 transition-colors p-2 hover:bg-cyan-500/10 rounded-xl z-10"
                        >
                            <PanelLeftClose size={18} />
                        </button>

                        <div className="mb-6 relative z-10">
                            <div className="flex items-center gap-5 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[1rem] flex items-center justify-center shadow-xl shadow-cyan-500/30 transition-transform hover:rotate-6">
                                    <Box size={22} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-white uppercase italic font-serif-legal leading-tight">Iron Man <span className="text-cyan-400">View</span></h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-lg shadow-cyan-500/50"></span>
                                        <span className="text-[9px] font-black text-cyan-400/70 uppercase tracking-[0.3em]">3D Neural WebGL v5.0</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="bg-cyan-950/30 p-6 rounded-[2rem] border border-cyan-500/20 relative overflow-hidden group shadow-sm transition-all hover:bg-cyan-950/50 hover:shadow-xl hover:shadow-cyan-500/10">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.08] group-hover:scale-110 transition-transform">
                                    <Target size={40} className="text-cyan-400" />
                                </div>
                                <div className="text-[9px] font-black text-cyan-400/60 uppercase mb-1 tracking-widest">Entités Mappées</div>
                                <div className="text-2xl font-mono-data font-black text-cyan-400 leading-none">{graphData.nodes.length}</div>
                            </div>
                            <div className="bg-blue-950/30 p-6 rounded-[2rem] border border-blue-500/20 relative overflow-hidden group shadow-sm transition-all hover:bg-blue-950/50 hover:shadow-xl hover:shadow-blue-500/10">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.08] group-hover:scale-110 transition-transform">
                                    <Link2 size={40} className="text-blue-400" />
                                </div>
                                <div className="text-[9px] font-black text-blue-400/60 uppercase mb-1 tracking-widest">Connexions 3D</div>
                                <div className="text-2xl font-mono-data font-black text-blue-400 leading-none">{graphData.links.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-8 lg:px-10 pb-8 relative z-10">
                        {/* Search & Filters */}
                        <div className="space-y-4 mb-6 relative z-10">
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-400/50 group-focus-within:text-cyan-400 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Scanner le réseau..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-cyan-950/20 border border-cyan-500/20 rounded-xl py-3 pl-12 pr-6 text-[13px] text-cyan-200 focus:border-cyan-400 focus:bg-cyan-950/30 outline-none transition-all placeholder:text-cyan-400/30 font-medium"
                                />
                            </div>
                            <div className="flex gap-2 p-1.5 bg-cyan-950/20 border border-cyan-500/20 rounded-xl">
                                {(['ALL', 'PERSON', 'INVESTIGATION'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFilterType(t)}
                                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterType === t ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30' : 'text-cyan-400/50 hover:text-cyan-300'}`}
                                    >
                                        {t === 'ALL' ? 'Tous' : t === 'PERSON' ? 'Cibles' : 'Affaires'}
                                    </button>
                                ))}
                            </div>

                            {/* Density Control */}
                            <div className="pt-4 px-2">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black text-cyan-400/60 uppercase tracking-widest">Densité 3D</span>
                                    <span className="text-[10px] font-mono-data font-black text-cyan-400">{minConnections}+ liens</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="1"
                                    value={minConnections}
                                    onChange={(e) => setMinConnections(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-cyan-950/30 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                                <div className="flex justify-between mt-2 text-[8px] font-black text-cyan-400/40 uppercase tracking-tighter">
                                    <span>Complexe</span>
                                    <span>Épuré</span>
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            <div className="mt-6 pt-6 border-t border-cyan-500/20">
                                <h3 className="text-[9px] font-black text-cyan-400/60 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                                    <Filter size={12} className="text-cyan-400" /> Filtres Avancés
                                </h3>

                                {/* Risk Level Filter */}
                                <div className="mb-4">
                                    <label className="text-[9px] font-black text-cyan-400/50 uppercase tracking-wider mb-2 block">Niveau de Risque</label>
                                    <select
                                        value={riskFilter}
                                        onChange={(e) => setRiskFilter(e.target.value as any)}
                                        className="w-full bg-cyan-950/20 border border-cyan-500/20 rounded-lg py-2 px-3 text-[11px] text-cyan-200 focus:border-cyan-400 focus:bg-cyan-950/30 outline-none transition-all font-bold"
                                    >
                                        <option value="ALL" className="bg-slate-900 text-cyan-200">Tous les risques</option>
                                        <option value="HIGH" className="bg-slate-900 text-cyan-200">Risque Élevé (7+)</option>
                                        <option value="MEDIUM" className="bg-slate-900 text-cyan-200">Risque Moyen (4-7)</option>
                                        <option value="LOW" className="bg-slate-900 text-cyan-200">Risque Faible (&lt;4)</option>
                                    </select>
                                </div>

                                {/* Influence Filter */}
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[9px] font-black text-cyan-400/50 uppercase tracking-wider">Influence Min</label>
                                        <span className="text-[10px] font-mono-data font-black text-cyan-400">{minInfluence}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        step="1"
                                        value={minInfluence}
                                        onChange={(e) => setMinInfluence(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-cyan-950/30 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                </div>

                                {/* Color Mode */}
                                <div className="mb-4">
                                    <label className="text-[9px] font-black text-cyan-400/50 uppercase tracking-wider mb-2 block">Mode Couleur</label>
                                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-cyan-950/20 border border-cyan-500/20 rounded-lg">
                                        {(['RISK', 'TYPE', 'INFLUENCE'] as const).map(mode => (
                                            <button
                                                key={mode}
                                                onClick={() => setColorMode(mode)}
                                                className={`py-1.5 rounded text-[8px] font-black uppercase tracking-wider transition-all ${colorMode === mode
                                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                                    : 'text-cyan-400/50 hover:text-cyan-300'
                                                    }`}
                                            >
                                                {mode === 'RISK' ? 'Risque' : mode === 'TYPE' ? 'Type' : 'Influence'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Label Toggle */}
                                <div className="mb-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={showLabels}
                                            onChange={(e) => setShowLabels(e.target.checked)}
                                            className="w-4 h-4 accent-cyan-500"
                                        />
                                        <span className="text-[10px] font-black text-cyan-400/70 uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
                                            Afficher Étiquettes
                                        </span>
                                    </label>
                                </div>

                                {/* Isolation Mode */}
                                <div className="mb-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={isolationMode}
                                            onChange={(e) => {
                                                setIsolationMode(e.target.checked);
                                                if (!e.target.checked) setFocusNode(null);
                                            }}
                                            className="w-4 h-4 accent-cyan-500"
                                        />
                                        <span className="text-[10px] font-black text-cyan-400/70 uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
                                            Mode Isolation
                                        </span>
                                    </label>
                                    {isolationMode && focusNode && (
                                        <div className="mt-2 p-2 bg-cyan-950/30 rounded-lg border border-cyan-500/20">
                                            <div className="text-[9px] text-cyan-300 font-bold mb-1">Focus: {focusNode.name}</div>
                                            <button
                                                onClick={() => {
                                                    setFocusNode(null);
                                                    setIsolationMode(false);
                                                }}
                                                className="text-[8px] text-cyan-400/60 hover:text-cyan-300 uppercase tracking-wider font-black"
                                            >
                                                ✕ Réinitialiser
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Statistics Panel */}
                            <div className="mt-6 pt-6 border-t border-cyan-500/20">
                                <h3 className="text-[9px] font-black text-cyan-400/60 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                                    <Activity size={12} className="text-cyan-400" /> Statistiques
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center p-2 bg-cyan-950/20 rounded-lg">
                                        <span className="text-[9px] text-cyan-400/60 font-black uppercase">Nœuds visibles</span>
                                        <span className="text-[11px] text-cyan-300 font-mono-data font-black">{graphData.nodes.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-cyan-950/20 rounded-lg">
                                        <span className="text-[9px] text-cyan-400/60 font-black uppercase">Liens visibles</span>
                                        <span className="text-[11px] text-cyan-300 font-mono-data font-black">{graphData.links.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-cyan-950/20 rounded-lg">
                                        <span className="text-[9px] text-cyan-400/60 font-black uppercase">Densité</span>
                                        <span className="text-[11px] text-cyan-300 font-mono-data font-black">
                                            {graphData.nodes.length > 0 ? (graphData.links.length / graphData.nodes.length).toFixed(2) : '0.00'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Influencers */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10 mt-6">
                            <h3 className="text-[9px] font-black text-cyan-400/60 uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                                <Zap size={14} className="text-cyan-400" /> Neural Feed
                            </h3>
                            <div className="space-y-3 pb-8">
                                {topInfluencers.map((inf, i) => (
                                    <div
                                        key={inf.id}
                                        className="group relative flex items-center gap-4 p-4 bg-cyan-950/20 hover:bg-cyan-950/40 rounded-[1.5rem] border border-cyan-500/20 hover:border-cyan-400/40 transition-all cursor-pointer shadow-sm hover:shadow-md hover:shadow-cyan-500/20"
                                        onClick={() => {
                                            setSelectedEntity(inf.name);
                                            if (isolationMode) {
                                                setFocusNode(inf);
                                            }
                                        }}
                                        onDoubleClick={() => {
                                            if (fgRef.current && inf.x && inf.y && inf.z) {
                                                fgRef.current.cameraPosition(
                                                    { x: inf.x, y: inf.y, z: inf.z + 200 },
                                                    { x: inf.x, y: inf.y, z: inf.z },
                                                    1000
                                                );
                                            }
                                            handleNodeHover(inf);
                                        }}
                                        title="Cliquer pour voir le profil • Double-cliquer pour zoomer"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-cyan-950/50 flex items-center justify-center text-[10px] font-black text-cyan-400 border border-cyan-500/30 group-hover:bg-cyan-500/20 group-hover:border-cyan-400 transition-all shrink-0 font-serif-legal italic">
                                            {String(i + 1).padStart(2, '0')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-[13px] font-black text-white truncate group-hover:text-cyan-300 transition-colors font-serif-legal italic">{inf.name}</div>
                                                <ArrowUpRight size={12} className="text-cyan-400/30 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <div className="flex-1 h-1 bg-cyan-950/50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-80" style={{ width: `${Math.min(100, (inf.val / 50) * 100)}%` }}></div>
                                                </div>
                                                <span className="text-[9px] font-mono-data font-black text-cyan-400/60 uppercase shrink-0">RI: {inf.val}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="pt-6 border-t border-cyan-500/20 mb-8">
                            <div className="p-5 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl flex items-start gap-4">
                                <ShieldCheck size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-cyan-300/70 leading-relaxed font-bold italic">
                                    Visualisation 3D optimisée WebGL avec effets de bloom et particules lumineuses en temps réel.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* 3D GRAPH AREA */}
            <div className="flex-1 relative transition-all overflow-hidden flex flex-col">
                {/* HUD Overlay - Top Right Controls */}
                <div className="absolute top-6 right-6 z-30 flex flex-col items-end gap-3 scale-90 origin-top-right">
                    <div className="bg-black/80 backdrop-blur-3xl p-1.5 rounded-2xl shadow-xl shadow-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5">
                        {/* Toggle 2D/3D Button */}
                        <button
                            onClick={onToggle2D3D}
                            className="flex items-center gap-2 px-4 py-2.5 hover:bg-cyan-500/10 rounded-xl text-cyan-400 hover:text-cyan-300 transition-all group"
                            title="Basculer en vue 2D Classic"
                        >
                            <Layers size={16} className="group-hover:-rotate-12 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Cartographie</span>
                        </button>
                        <div className="w-[1px] h-6 bg-cyan-500/30"></div>
                        <button onClick={toggleFullscreen} className="p-3 hover:bg-cyan-500/10 rounded-xl text-cyan-400 hover:text-cyan-300 transition-all" title="Fullscreen">
                            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                        <div className="w-[1px] h-6 bg-cyan-500/30"></div>
                        <button
                            onClick={() => {
                                if (fgRef.current) {
                                    fgRef.current.cameraPosition({ x: 0, y: 0, z: 1000 }, { x: 0, y: 0, z: 0 }, 800);
                                }
                            }}
                            className="p-3 hover:bg-cyan-500/10 rounded-xl text-cyan-400 hover:text-cyan-300 transition-all"
                            title="Reset View"
                        >
                            <Crosshair size={18} />
                        </button>
                    </div>

                    <div className="px-4 py-2 bg-black/90 backdrop-blur-md rounded-xl shadow-2xl shadow-cyan-500/20 border border-cyan-500/30 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-lg shadow-cyan-500/50"></div>
                        <span className="text-[9px] font-black text-cyan-400/70 uppercase tracking-[0.4em] font-mono-data">WebGL Renderer Active</span>
                    </div>
                </div>

                {/* Hover Evidence Details */}
                {hoverNode && (
                    <div className="absolute top-24 right-6 z-30 bg-black/95 backdrop-blur-3xl p-6 lg:p-8 rounded-[2.5rem] border border-cyan-500/30 shadow-[0_30px_100px_rgba(6,182,212,0.3)] w-[320px] lg:w-[380px] animate-in slide-in-from-top-4 fade-in pointer-events-none scale-95 lg:scale-100 origin-top-right">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
                            <Target size={120} className="text-cyan-400" />
                        </div>

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className={`w-2.5 h-2.5 rounded-full shadow-lg animate-pulse ${hoverNode.type === 'INVESTIGATION' ? 'bg-cyan-500 shadow-cyan-500/50' : 'bg-blue-500 shadow-blue-500/50'}`}></div>
                            <span className="text-[9px] font-black text-cyan-400/70 uppercase tracking-[0.4em]">{hoverNode.type} NODE</span>
                        </div>

                        <h4 className="text-xl lg:text-2xl font-black text-white leading-snug mb-8 tracking-tighter italic font-serif-legal">"{hoverNode.name}"</h4>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="bg-cyan-950/30 p-5 rounded-2xl border border-cyan-500/20 flex flex-col justify-center">
                                <div className="text-[8px] font-black text-cyan-400/50 uppercase tracking-widest mb-1.5">Connections</div>
                                <div className="flex items-baseline gap-2 text-cyan-400">
                                    <div className="text-3xl font-mono-data font-black">{hoverNode.neighbors?.length}</div>
                                    <div className="text-[10px] font-black uppercase tracking-tighter opacity-50">Links</div>
                                </div>
                            </div>
                            <div className="bg-blue-950/30 p-5 rounded-2xl border border-blue-500/20 flex flex-col justify-center">
                                <div className="text-[8px] font-black text-blue-400/50 uppercase tracking-widest mb-1.5">Score 3D</div>
                                <div className="flex items-baseline gap-2 text-blue-400">
                                    <div className="text-3xl font-mono-data font-black">{hoverNode.val}</div>
                                    <div className="text-[10px] font-black uppercase tracking-tighter opacity-50">Pts</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-3 bg-cyan-950/30 border border-cyan-500/20 px-4 py-2 rounded-xl">
                            <Shield className="text-cyan-400" size={14} />
                            <span className="text-[8px] font-black text-cyan-400/70 uppercase tracking-[0.3em]">3D Neural Source</span>
                        </div>
                    </div>
                )}

                <div className="flex-1 min-h-0 relative z-10">
                    <ForceGraph3D
                        ref={fgRef}
                        graphData={graphData}
                        width={dimensions.width}
                        height={dimensions.height}
                        backgroundColor="rgba(10, 10, 15, 1)"
                        nodeLabel={(node: any) => showLabels ? node.name : ''}
                        nodeRelSize={4}
                        nodeVal={(node: any) => Math.sqrt(node.val) * 2}
                        nodeColor={(node: any) => {
                            const n = node as GraphNode;
                            if (highlightNodes.has(n)) return getNodeColor(n);
                            return '#64748B';
                        }}
                        nodeOpacity={0.9}
                        nodeResolution={16}
                        linkColor={(link: any) => {
                            if (highlightLinks.has(link)) return '#06B6D4';
                            return link.type === 'TRANSACTION' ? '#3B82F6' : '#334155';
                        }}
                        linkWidth={(link: any) => {
                            if (highlightLinks.has(link)) return 2;
                            return link.type === 'TRANSACTION' ? 1.5 : 0.5;
                        }}
                        linkOpacity={0.5}
                        linkDirectionalArrowLength={(link: any) => link.type === 'TRANSACTION' ? 8 : 0}
                        linkDirectionalArrowRelPos={1}
                        linkDirectionalParticles={(link: any) => {
                            // Animated particles on transaction links
                            if (link.type === 'TRANSACTION' && highlightLinks.has(link)) return 6;
                            if (link.type === 'TRANSACTION') return 2;
                            return 0;
                        }}
                        linkDirectionalParticleWidth={3}
                        linkDirectionalParticleSpeed={0.005}
                        linkDirectionalParticleColor={(link: any) => highlightLinks.has(link) ? '#06B6D4' : '#3B82F6'}
                        onNodeHover={handleNodeHover}
                        onNodeClick={(node: any) => {
                            const graphNode = node as GraphNode;
                            if (graphNode.type === 'PERSON') {
                                setSelectedEntity(graphNode.name);
                            }
                        }}
                        enableNodeDrag={true}
                        enableNavigationControls={true}
                        showNavInfo={false}
                        d3AlphaDecay={0.01}
                        d3VelocityDecay={0.2}
                        cooldownTicks={100}
                    />
                </div>

                {/* HUD Footer Information */}
                <div className="absolute bottom-6 left-6 right-6 z-30 flex justify-between items-center pointer-events-none scale-90 lg:scale-100 origin-bottom">
                    <div className="flex items-center gap-6 px-6 py-3 bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-sm shadow-cyan-500/20">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50"></div>
                            <span className="text-[9px] font-black text-cyan-400/70 uppercase tracking-widest">High Risk</span>
                        </div>
                        <div className="h-3 w-px bg-cyan-500/30"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                            <span className="text-[9px] font-black text-blue-400/70 uppercase tracking-widest">Active Investigation</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-cyan-400/50 uppercase tracking-[0.4em]">3D Processor</span>
                            <span className="text-[10px] font-mono-data font-black text-cyan-400/70 uppercase tracking-wider">IRON-MAN-v5.0</span>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                            <Layers size={16} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
