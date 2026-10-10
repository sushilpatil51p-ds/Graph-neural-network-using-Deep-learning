import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GraphNode, GraphEdge, AnomalousRing } from '../types';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Eye, Flame, ShieldCheck, ShieldAlert } from 'lucide-react';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  selectedRing: AnomalousRing | null;
  onSelectNode: (node: GraphNode | null) => void;
  filterMode: 'all' | 'anomalies_only' | 'rings_only';
}

interface Particle {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  color: string;
  amount: number;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  selectedNode,
  selectedRing,
  onSelectNode,
  filterMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Transform state for pan and zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Simulation coordinates map
  const posRef = useRef<Map<string, { x: number; y: number; vx: number; vy: number }>>(new Map());

  // Initialize node positions if not present
  useEffect(() => {
    nodes.forEach((n, idx) => {
      if (!posRef.current.has(n.id)) {
        posRef.current.set(n.id, {
          x: n.x ?? 400 + Math.cos(idx) * 250,
          y: n.y ?? 300 + Math.sin(idx) * 200,
          vx: 0,
          vy: 0,
        });
      }
    });
  }, [nodes]);

  // Spawn dynamic message passing pulses periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (edges.length === 0) return;

      // Pick 2-4 random edges to spawn particles
      const count = Math.floor(Math.random() * 3) + 1;
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const edge = edges[Math.floor(Math.random() * edges.length)];
        const sourcePos = posRef.current.get(edge.source);
        const targetPos = posRef.current.get(edge.target);

        if (sourcePos && targetPos) {
          const isFlagged = edge.isFlagged;
          newParticles.push({
            id: `p_${Date.now()}_${Math.random()}`,
            sourceX: sourcePos.x,
            sourceY: sourcePos.y,
            targetX: targetPos.x,
            targetY: targetPos.y,
            progress: 0,
            speed: 0.015 + Math.random() * 0.02,
            color: isFlagged ? '#ef4444' : '#10b981',
            amount: edge.amount,
          });
        }
      }

      setParticles(prev => [...prev.slice(-30), ...newParticles]);
    }, 450);

    return () => clearInterval(interval);
  }, [edges]);

  // Center camera helper
  const handleResetCamera = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    setZoom(0.85);
    setPan({ x: clientWidth * 0.1, y: clientHeight * 0.1 });
  }, []);

  useEffect(() => {
    handleResetCamera();
  }, [handleResetCamera]);

  // Main render loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Background graph grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 40 * zoom;
      const startX = (pan.x % gridSize) - gridSize;
      const startY = (pan.y % gridSize) - gridSize;

      ctx.beginPath();
      for (let x = startX; x < width + gridSize; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = startY; y < height + gridSize; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Apply Pan & Zoom
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Filter nodes based on filterMode and selectedRing
      const visibleNodes = nodes.filter(n => {
        if (filterMode === 'anomalies_only') return n.anomalyScore > 0.6;
        if (filterMode === 'rings_only') {
          if (selectedRing) return selectedRing.nodeIds.includes(n.id);
          return n.type === 'mule' || n.type === 'mixer' || n.type === 'sink';
        }
        return true;
      });

      const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
      const visibleEdges = edges.filter(
        e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
      );

      // Render Edges
      visibleEdges.forEach(edge => {
        const sourcePos = posRef.current.get(edge.source);
        const targetPos = posRef.current.get(edge.target);
        if (!sourcePos || !targetPos) return;

        const isHighlight =
          (selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id)) ||
          (selectedRing && selectedRing.edgeIds.includes(edge.id));

        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);

        if (edge.isFlagged) {
          ctx.strokeStyle = isHighlight
            ? 'rgba(239, 68, 68, 0.95)'
            : 'rgba(239, 68, 68, 0.45)';
          ctx.lineWidth = isHighlight ? 3.5 : 2;
          if (isHighlight) {
            ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
            ctx.shadowBlur = 8;
          }
        } else {
          ctx.strokeStyle = isHighlight
            ? 'rgba(16, 185, 129, 0.9)'
            : 'rgba(51, 65, 85, 0.5)';
          ctx.lineWidth = isHighlight ? 2.5 : 1.2;
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw directional arrow on edge
        const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x);
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;
        const arrowSize = isHighlight ? 7 : 5;

        ctx.fillStyle = edge.isFlagged ? '#ef4444' : '#64748b';
        ctx.beginPath();
        ctx.moveTo(midX + Math.cos(angle) * arrowSize, midY + Math.sin(angle) * arrowSize);
        ctx.lineTo(
          midX + Math.cos(angle - (Math.PI * 0.75)) * arrowSize,
          midY + Math.sin(angle - (Math.PI * 0.75)) * arrowSize
        );
        ctx.lineTo(
          midX + Math.cos(angle + (Math.PI * 0.75)) * arrowSize,
          midY + Math.sin(angle + (Math.PI * 0.75)) * arrowSize
        );
        ctx.closePath();
        ctx.fill();

        // Edge label (amount in BTC/USD) if highlighted
        if (isHighlight || edge.amount > 20) {
          ctx.font = '10px "Fira Code", monospace';
          ctx.fillStyle = edge.isFlagged ? '#fca5a5' : '#94a3b8';
          ctx.fillText(`${edge.amount.toFixed(1)} BTC`, midX + 8, midY - 6);
        }
      });

      // Render Dynamic Message-Passing / Transfer Particles
      setParticles(prev =>
        prev
          .map(p => {
            p.progress += p.speed;
            const curX = p.sourceX + (p.targetX - p.sourceX) * p.progress;
            const curY = p.sourceY + (p.targetY - p.sourceY) * p.progress;

            ctx.beginPath();
            ctx.arc(curX, curY, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;

            return p;
          })
          .filter(p => p.progress < 1)
      );

      // Render Nodes
      visibleNodes.forEach(node => {
        const pos = posRef.current.get(node.id);
        if (!pos) return;

        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const isRingMember = selectedRing?.nodeIds.includes(node.id);

        let nodeRadius = 14;
        let baseColor = '#10b981'; // Licit
        let glowColor = 'rgba(16, 185, 129, 0.4)';

        if (node.type === 'illicit' || node.type === 'sink') {
          baseColor = '#ef4444';
          glowColor = 'rgba(239, 68, 68, 0.6)';
          nodeRadius = 18;
        } else if (node.type === 'mule') {
          baseColor = '#f59e0b';
          glowColor = 'rgba(245, 158, 11, 0.5)';
          nodeRadius = 15;
        } else if (node.type === 'mixer') {
          baseColor = '#a855f7';
          glowColor = 'rgba(168, 85, 247, 0.6)';
          nodeRadius = 19;
        }

        // Draw pulsing halo for high-risk anomalies or selected
        if (node.anomalyScore > 0.8 || isSelected || isRingMember) {
          const pulseScale = 1 + Math.sin(Date.now() / 250) * 0.18;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, (nodeRadius + 6) * pulseScale, 0, Math.PI * 2);
          ctx.fillStyle = glowColor;
          ctx.fill();
        }

        // Node circle background
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#090d16';
        ctx.fill();
        ctx.lineWidth = isSelected ? 3.5 : isHovered ? 2.5 : 2;
        ctx.strokeStyle = baseColor;
        ctx.stroke();

        // Inner core
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius - 5, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();

        // Node Label
        ctx.font = isSelected || isRingMember ? 'bold 11px "Plus Jakarta Sans"' : '10px "Plus Jakarta Sans"';
        ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, pos.x, pos.y + nodeRadius + 14);

        // Anomaly Score Badge under label
        if (node.anomalyScore > 0.4) {
          ctx.font = '9px "Fira Code", monospace';
          ctx.fillStyle = node.anomalyScore > 0.8 ? '#f87171' : '#fbbf24';
          ctx.fillText(`risk ${(node.anomalyScore * 100).toFixed(0)}%`, pos.x, pos.y + nodeRadius + 26);
        }
      });

      ctx.restore();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [nodes, edges, selectedNode, selectedRing, hoveredNode, zoom, pan, filterMode]);

  // Mouse & interaction handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Convert to world coordinates
    const worldX = (clientX - pan.x) / zoom;
    const worldY = (clientY - pan.y) / zoom;

    // Check if a node was clicked
    let hitNode: GraphNode | null = null;
    for (const node of nodes) {
      const pos = posRef.current.get(node.id);
      if (!pos) continue;
      const dist = Math.hypot(pos.x - worldX, pos.y - worldY);
      if (dist <= 22) {
        hitNode = node;
        break;
      }
    }

    if (hitNode) {
      setDraggedNode(hitNode);
      onSelectNode(hitNode);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (draggedNode) {
      const worldX = (clientX - pan.x) / zoom;
      const worldY = (clientY - pan.y) / zoom;
      const currentPos = posRef.current.get(draggedNode.id);
      if (currentPos) {
        currentPos.x = worldX;
        currentPos.y = worldY;
      }
      return;
    }

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    // Hover check
    const worldX = (clientX - pan.x) / zoom;
    const worldY = (clientY - pan.y) / zoom;
    let foundHover: GraphNode | null = null;

    for (const node of nodes) {
      const pos = posRef.current.get(node.id);
      if (!pos) continue;
      const dist = Math.hypot(pos.x - worldX, pos.y - worldY);
      if (dist <= 20) {
        foundHover = node;
        break;
      }
    }
    setHoveredNode(foundHover);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.35), 3.0);
    setZoom(newZoom);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Floating Canvas Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl z-20">
        <button
          onClick={() => setZoom(z => Math.min(z * 1.2, 3.0))}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z * 0.8, 0.35))}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetCamera}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Top Left Canvas HUD */}
      <div className="absolute top-4 left-4 flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 shadow-lg text-xs z-20">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span className="text-slate-300 font-medium">Licit ({nodes.filter(n => n.type === 'licit').length})</span>
        </div>
        <div className="w-px h-3 bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
          <span className="text-slate-300 font-medium">Mule Ring ({nodes.filter(n => n.type === 'mule').length})</span>
        </div>
        <div className="w-px h-3 bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
          <span className="text-slate-300 font-medium">Mixer / CoinJoin ({nodes.filter(n => n.type === 'mixer').length})</span>
        </div>
        <div className="w-px h-3 bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-sm shadow-rose-500/50" />
          <span className="text-slate-300 font-medium">Illicit Sink ({nodes.filter(n => n.type === 'illicit' || n.type === 'sink').length})</span>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredNode && !isDragging && (
        <div
          className="absolute pointer-events-none bg-slate-900/95 border border-slate-700 px-3 py-2 rounded-lg shadow-2xl z-30 text-xs w-64 backdrop-blur-md"
          style={{
            left: `${Math.min(window.innerWidth - 300, (posRef.current.get(hoveredNode.id)?.x || 0) * zoom + pan.x + 20)}px`,
            top: `${(posRef.current.get(hoveredNode.id)?.y || 0) * zoom + pan.y - 40}px`,
          }}
        >
          <div className="flex items-center justify-between font-semibold text-slate-100 mb-1">
            <span>{hoveredNode.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
                hoveredNode.anomalyScore > 0.75
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {hoveredNode.type}
            </span>
          </div>
          <div className="text-slate-400 font-mono text-[10px] truncate mb-2">{hoveredNode.address}</div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-500 block">ST-GNN Risk</span>
              <span className={`font-mono font-bold ${hoveredNode.anomalyScore > 0.75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {(hoveredNode.anomalyScore * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Balance</span>
              <span className="font-mono text-slate-200">{hoveredNode.balance.toFixed(2)} BTC</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
