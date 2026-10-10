import React from 'react';
import {
  ShieldAlert,
  Cpu,
  Server,
  Activity,
  FileText,
  BarChart3,
  Layers,
  Database,
  Terminal,
} from 'lucide-react';
import { InferenceTelemetry } from '../types';

interface HeaderProps {
  telemetry: InferenceTelemetry;
  activeDataset: 'elliptic' | 'paysim';
  onDatasetChange: (ds: 'elliptic' | 'paysim') => void;
  onOpenArchitecture: () => void;
  onOpenTelemetry: () => void;
  onOpenCypher: () => void;
  activeTab: 'topology' | 'embeddings' | 'cypher';
  setActiveTab: (tab: 'topology' | 'embeddings' | 'cypher') => void;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  activeDataset,
  onDatasetChange,
  onOpenArchitecture,
  onOpenTelemetry,
  onOpenCypher,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 max-w-[1700px] mx-auto">
        {/* Title & Branding */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-rose-500/20 border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg tracking-tight text-white flex items-center gap-2">
                ST-GNN Fraud Topology & AML
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  ONNX ARM · Memgraph
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Dynamic Spatio-Temporal Graph Neural Network · Real-Time Multi-Hop Syndicate & Ring Detection
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('topology')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'topology'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Graph Topology</span>
          </button>
          <button
            onClick={() => setActiveTab('embeddings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'embeddings'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Latent Manifold</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('cypher');
              onOpenCypher();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'cypher'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Memgraph Cypher</span>
          </button>
        </div>

        {/* Live Metrics & Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Dataset Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => onDatasetChange('elliptic')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeDataset === 'elliptic'
                  ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Elliptic Bitcoin AML Dataset (49 Time Steps)"
            >
              Elliptic AML (BTC)
            </button>
            <button
              onClick={() => onDatasetChange('paysim')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeDataset === 'paysim'
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kaggle Synthetic Financial (PaySim) Identity Rings"
            >
              Kaggle PaySim Rings
            </button>
          </div>

          {/* TPS Sustained Pill */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">Throughput:</span>
            <span className="text-emerald-400 font-mono font-semibold">
              {telemetry.currentTps.toFixed(1)} TPS
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              ({telemetry.avgLatencyMs.toFixed(1)}ms p50)
            </span>
          </div>

          {/* Zero-Cost VPS Pill */}
          <button
            onClick={onOpenTelemetry}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-lg transition-colors text-slate-300 group"
            title="Oracle Cloud Free Tier: 4 OCPU ARM Neoverse-N1, 24GB RAM"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="text-slate-200 font-mono font-medium">ARM A1 · 24GB</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1 rounded border border-emerald-500/30">
              ₹0/mo
            </span>
          </button>

          {/* Architecture / Research Dossier */}
          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 hover:from-cyan-600/40 hover:to-indigo-600/40 border border-cyan-500/50 px-2.5 py-1 rounded-lg text-cyan-200 transition-all font-medium shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-300" />
            <span>Architecture & Abstract</span>
          </button>
        </div>
      </div>
    </header>
  );
};
