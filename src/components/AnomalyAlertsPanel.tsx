import React from 'react';
import { AnomalousRing, GraphNode } from '../types';
import {
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  FileCheck,
  Crosshair,
  Lock,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface AnomalyAlertsPanelProps {
  rings: AnomalousRing[];
  selectedRing: AnomalousRing | null;
  onSelectRing: (ring: AnomalousRing | null) => void;
  onGenerateSar: (ring: AnomalousRing) => void;
  onFreezeRing: (ringId: string) => void;
}

export const AnomalyAlertsPanel: React.FC<AnomalyAlertsPanelProps> = ({
  rings,
  selectedRing,
  onSelectRing,
  onGenerateSar,
  onFreezeRing,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Identified Fraud Topologies
            </h3>
            <span className="text-[11px] text-slate-400">
              ST-GNN Subgraph & Ring Inference
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800/80">
          {rings.length} Active
        </span>
      </div>

      {/* Ring Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {rings.map(ring => {
          const isSelected = selectedRing?.id === ring.id;
          return (
            <div
              key={ring.id}
              onClick={() => onSelectRing(isSelected ? null : ring)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-rose-500/80 shadow-lg shadow-rose-950/30'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold ${
                        ring.patternType.includes('Identity')
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : ring.patternType.includes('Smurfing')
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}
                    >
                      {ring.patternType}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ring.detectionTime}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100">{ring.title}</h4>
                </div>

                {/* Risk score pill */}
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                    {(ring.riskScore * 100).toFixed(0)}% Risk
                  </span>
                </div>
              </div>

              {/* Explanation text */}
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3 line-clamp-2">
                {ring.explanation}
              </p>

              {/* Metrics grid */}
              <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono mb-3">
                <div>
                  <span className="text-slate-500 block text-[10px]">Volume</span>
                  <span className="text-slate-200 font-semibold">{ring.totalVolume.toFixed(1)} BTC</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Entities</span>
                  <span className="text-cyan-400 font-semibold">{ring.nodeIds.length} Nodes</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Status</span>
                  <span
                    className={`font-semibold ${
                      ring.status === 'Frozen'
                        ? 'text-cyan-400'
                        : ring.status === 'SAR Filed'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {ring.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onSelectRing(ring);
                    }}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium px-2 py-1 rounded bg-cyan-950/40 hover:bg-cyan-950/80 border border-cyan-800/50 transition-colors"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>Focus Subgraph</span>
                  </button>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onFreezeRing(ring.id);
                    }}
                    className={`flex items-center gap-1 font-medium px-2 py-1 rounded border transition-colors ${
                      ring.status === 'Frozen'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                        : 'bg-rose-950/40 text-rose-300 hover:bg-rose-950/80 border-rose-800/50'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>{ring.status === 'Frozen' ? 'Frozen' : 'Freeze Nodes'}</span>
                  </button>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    onGenerateSar(ring);
                  }}
                  className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                  title="Generate FinCEN-compliant Suspicious Activity Report (SAR)"
                >
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px]">SAR Dossier</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
