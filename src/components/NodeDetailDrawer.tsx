import React, { useState } from 'react';
import { GraphNode, GraphEdge } from '../types';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Cpu,
  Copy,
  Check,
  FileCheck,
  Terminal,
  Activity,
} from 'lucide-react';

interface NodeDetailDrawerProps {
  node: GraphNode | null;
  edges: GraphEdge[];
  nodes: GraphNode[];
  onClose: () => void;
  onGenerateSar: (node: GraphNode) => void;
  onExecuteCypherForNode: (nodeId: string) => void;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  node,
  edges,
  nodes,
  onClose,
  onGenerateSar,
  onExecuteCypherForNode,
}) => {
  const [copied, setCopied] = useState(false);

  if (!node) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find incoming and outgoing edges for this node
  const incomingEdges = edges.filter(e => e.target === node.id);
  const outgoingEdges = edges.filter(e => e.source === node.id);

  const isIllicit = node.anomalyScore > 0.7;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-slate-900/95 border-l border-slate-800 backdrop-blur-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border ${
              isIllicit
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {isIllicit ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">{node.label}</h3>
            <span
              className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-semibold ${
                node.type === 'mule'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : node.type === 'mixer'
                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                  : isIllicit
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {node.type} entity
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Wallet Address bar */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 block mb-1 font-mono uppercase">
            Blockchain Address / Node ID
          </span>
          <div className="flex items-center justify-between font-mono text-slate-300">
            <span className="truncate mr-2 text-[11px]">{node.address}</span>
            <button
              onClick={() => handleCopy(node.address)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Copy Address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* ST-GNN Risk Gauge Card */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">ST-GNN Anomaly Probability</span>
            <span
              className={`font-mono text-sm font-bold ${
                isIllicit ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {(node.anomalyScore * 100).toFixed(1)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isIllicit
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
              }`}
              style={{ width: `${node.anomalyScore * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>0.0 (Licit Baseline)</span>
            <span>Threshold: 0.70</span>
            <span>1.0 (Critical AML)</span>
          </div>
        </div>

        {/* Dynamic Topology Features (Elliptic 166-dim subset) */}
        <div>
          <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Elliptic Topology Feature Vectors</span>
          </h4>
          <div className="grid grid-cols-2 gap-2 font-mono">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">In / Out Degree</span>
              <span className="text-slate-200 font-semibold">
                {node.features.inDegree} in · {node.features.outDegree} out
              </span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">Circularity Index</span>
              <span className={`font-semibold ${node.features.circularityIndex > 0.5 ? 'text-amber-400' : 'text-slate-200'}`}>
                {node.features.circularityIndex.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">Temporal Velocity</span>
              <span className="text-slate-200 font-semibold">
                {node.features.temporalVelocity.toFixed(1)} tx/min
              </span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 block text-[10px]">Burst Score</span>
              <span className={`font-semibold ${node.features.burstScore > 0.7 ? 'text-rose-400' : 'text-slate-200'}`}>
                {node.features.burstScore.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 col-span-2">
              <span className="text-slate-500 block text-[10px]">Current Balance</span>
              <span className="text-cyan-300 font-semibold">{node.balance.toFixed(2)} BTC</span>
            </div>
          </div>
        </div>

        {/* Spatial Attention & Inflow Decomposition */}
        <div>
          <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Spatial Message Passing (Attention α_uv)</span>
          </h4>
          {incomingEdges.length === 0 ? (
            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg text-slate-500 text-center">
              No incoming transfer edges in current time slice.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {incomingEdges.map(edge => {
                const source = nodes.find(n => n.id === edge.source);
                return (
                  <div
                    key={edge.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 font-mono text-[11px]"
                  >
                    <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                      <span className="text-slate-400">{source?.label || edge.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">{edge.amount.toFixed(1)} BTC</span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px]">
                        α={edge.attentionWeight.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
        <button
          onClick={() => onGenerateSar(node)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs transition-all shadow-md"
        >
          <FileCheck className="w-4 h-4" />
          <span>File FinCEN SAR Suspicious Report</span>
        </button>

        <button
          onClick={() => onExecuteCypherForNode(node.id)}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors border border-slate-700"
        >
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          <span>Inspect in Memgraph Cypher</span>
        </button>
      </div>
    </div>
  );
};
