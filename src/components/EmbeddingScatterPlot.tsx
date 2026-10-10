import React, { useState } from 'react';
import { GraphNode } from '../types';
import { Activity, Info, Sparkles, Layers } from 'lucide-react';

interface EmbeddingScatterPlotProps {
  nodes: GraphNode[];
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode | null) => void;
}

export const EmbeddingScatterPlot: React.FC<EmbeddingScatterPlotProps> = ({
  nodes,
  selectedNode,
  onSelectNode,
}) => {
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Map coordinates from [-1, 1] to plot pixel coordinates [40, 560]
  const width = 600;
  const height = 460;
  const padding = 50;

  const toScreenX = (val: number) => padding + ((val + 1.2) / 2.4) * (width - 2 * padding);
  const toScreenY = (val: number) => height - padding - ((val + 1.2) / 2.4) * (height - 2 * padding);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Latent Representation Manifold (t-SNE / PCA 2D)
            </h3>
            <span className="text-[11px] text-slate-400">
              Dynamic Spatio-Temporal Node Embeddings h_v^(t)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Licit Manifold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-400">Illicit / Mule Cluster</span>
          </div>
        </div>
      </div>

      {/* Scatter plot area */}
      <div className="relative flex-1 flex items-center justify-center bg-slate-950/70 rounded-xl border border-slate-800/80 overflow-hidden p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-h-[500px]">
          {/* Coordinate axes */}
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />
          <line
            x1={width / 2}
            y1={padding}
            x2={width / 2}
            y2={height - padding}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />

          {/* Cluster Region Labels */}
          <text x={width - padding - 10} y={padding + 20} fill="#059669" fontSize="10" textAnchor="end" fontFamily="monospace">
            ✦ Licit Banking / Exchange Basin
          </text>
          <text x={padding + 10} y={height - padding - 15} fill="#dc2626" fontSize="10" fontFamily="monospace">
            ⚠ Laundering / Mule Synthetics Basin
          </text>

          {/* Nodes representation */}
          {nodes.map(node => {
            const cx = toScreenX(node.embedding[0]);
            const cy = toScreenY(node.embedding[1]);
            const isSelected = selectedNode?.id === node.id;
            const isHovered = hoveredNode?.id === node.id;

            let fill = '#10b981';
            if (node.type === 'illicit' || node.type === 'sink') fill = '#ef4444';
            else if (node.type === 'mule') fill = '#f59e0b';
            else if (node.type === 'mixer') fill = '#a855f7';

            return (
              <g
                key={node.id}
                onClick={() => onSelectNode(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-all"
              >
                {/* Outer halo */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 14 : 10}
                    fill={fill}
                    opacity={0.3}
                    className="animate-pulse"
                  />
                )}

                {/* Main point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 7 : isHovered ? 6 : 4.5}
                  fill={fill}
                  stroke="#0f172a"
                  strokeWidth={1.5}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating tooltip */}
        {hoveredNode && (
          <div className="absolute top-4 right-4 bg-slate-900/95 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs w-56 pointer-events-none backdrop-blur-md font-mono">
            <div className="text-slate-100 font-semibold text-[11px] mb-1">{hoveredNode.label}</div>
            <div className="text-[10px] text-slate-400">Embedding Vector:</div>
            <div className="text-cyan-400 text-[10px]">
              [{hoveredNode.embedding[0].toFixed(2)}, {hoveredNode.embedding[1].toFixed(2)}]
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Anomaly Probability:</div>
            <div className={`font-bold ${hoveredNode.anomalyScore > 0.7 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {(hoveredNode.anomalyScore * 100).toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 text-[11px]">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          Spatio-Temporal message passing dynamically drives anomalous entities into the lower-left manifold.
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          Dimensionality: 64D → 2D Projection
        </span>
      </div>
    </div>
  );
};
