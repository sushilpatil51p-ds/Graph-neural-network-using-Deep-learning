import React from 'react';
import { X, BookOpen, Layers, Cpu, Database, Network, ShieldCheck, Zap } from 'lucide-react';

interface ArchitectureModalProps {
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Architecture & Research Abstract
              </h2>
              <p className="text-xs text-slate-400">
                Dynamic Spatio-Temporal Graph Neural Network for Real-Time Fraud Topology & AML
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Official Abstract Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Network className="w-4 h-4" />
                <span>Project Abstract (150-200 Words)</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Peer Review Ready
              </span>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed italic">
              &quot;Traditional fraud detection relies on static rule engines or isolated relational data, failing to catch sophisticated, multi-hop money laundering syndicates. This project implements a Dynamic Spatio-Temporal Graph Neural Network (ST-GNN) to construct a continuous, real-time graph of entity relationships. By utilizing advanced message-passing architectures, the network updates node embeddings dynamically, identifying anomalous subgraphs and synthetic identity rings before funds can be exfiltrated.
              <br /><br />
              A core innovation of this project is its highly constrained, zero-cost deployment architecture (under ₹200/month). To circumvent expensive GPU requirements, the system is deployed on an Oracle Cloud &apos;Always Free&apos; VPS featuring 24GB of RAM. The architecture integrates Memgraph as the in-memory graph database and utilizes PyTorch Geometric compiled via ONNX to run highly optimized inference purely on ARM CPUs. This full-stack approach guarantees a sustainable throughput of 50 to 100 Transactions Per Second (TPS), providing an industry-grade, highly efficient MVP deployment for modern FinTech security.&quot;
            </p>
          </div>

          {/* Mathematical Formulation */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Spatio-Temporal Mathematical Formulation</span>
            </h3>

            <div className="space-y-2 font-mono text-[11px] bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400">
                <span className="text-indigo-400 font-semibold block mb-0.5">1. Spatial Message Aggregation (Graph Attention GAT):</span>
                <span className="text-slate-200 block pl-3 bg-slate-950/60 p-1.5 rounded">
                  m_v^(t) = ∑_(u ∈ N(v)) α_uv^(t) · W_s · h_u^(t)
                </span>
              </div>

              <div className="text-slate-400 pt-1">
                <span className="text-indigo-400 font-semibold block mb-0.5">2. Attention Weight with Temporal Decay & Edge Features:</span>
                <span className="text-slate-200 block pl-3 bg-slate-950/60 p-1.5 rounded">
                  α_uv^(t) = Softmax_u ( LeakyReLU ( a^T [W·h_u || W·h_v || W_e·e_uv] · exp(-Δt / τ) ) )
                </span>
              </div>

              <div className="text-slate-400 pt-1">
                <span className="text-cyan-400 font-semibold block mb-0.5">3. Temporal Recurrence (Gated Recurrent Unit):</span>
                <span className="text-slate-200 block pl-3 bg-slate-950/60 p-1.5 rounded">
                  h_v^(t) = GRUCell( m_v^(t), h_v^(t-1) )
                </span>
              </div>

              <div className="text-slate-400 pt-1">
                <span className="text-rose-400 font-semibold block mb-0.5">4. Anomaly Readout & AML Risk Scoring:</span>
                <span className="text-slate-200 block pl-3 bg-slate-950/60 p-1.5 rounded">
                  y_v^(t) = σ( W_o · [ h_v^(t) || x_v^(t) ] )  ∈ [0.0, 1.0]
                </span>
              </div>
            </div>
          </div>

          {/* System Pipeline Architecture */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Full-Stack Zero-Cost Edge Pipeline</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <div className="font-bold text-purple-400 mb-1 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" />
                  <span>1. In-Memory Graph</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  <strong>Memgraph (C++ engine)</strong> maintains dynamic streaming edges, subgraphs, and indexed Cypher patterns directly in RAM for microsecond traversal.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>2. ONNX ARM Runtime</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  PyTorch Geometric model is exported to ONNX with <strong>INT8 quantization</strong> and <strong>ARM Neon SIMD</strong> execution, bypassing costly GPUs.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>3. High-Throughput Edge</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Deploys on <strong>Oracle Cloud Always Free</strong> (4 OCPU Ampere A1, 24GB RAM) sustaining <strong>50 to 100 TPS</strong> with zero monthly infrastructure bills.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
