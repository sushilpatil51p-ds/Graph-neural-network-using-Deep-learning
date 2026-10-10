import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
  Sliders,
  Filter,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface TemporalControlsProps {
  currentTimeStep: number;
  maxTimeSteps: number;
  onTimeStepChange: (step: number) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  tpsSpeed: number;
  onTpsSpeedChange: (speed: number) => void;
  filterMode: 'all' | 'anomalies_only' | 'rings_only';
  onFilterModeChange: (mode: 'all' | 'anomalies_only' | 'rings_only') => void;
  onInjectSyntheticAttack: () => void;
}

export const TemporalControls: React.FC<TemporalControlsProps> = ({
  currentTimeStep,
  maxTimeSteps,
  onTimeStepChange,
  isStreaming,
  onToggleStreaming,
  tpsSpeed,
  onTpsSpeedChange,
  filterMode,
  onFilterModeChange,
  onInjectSyntheticAttack,
}) => {
  return (
    <div className="bg-slate-900/95 border-t border-slate-800 p-3 backdrop-blur-md">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Playback & Step scrubber */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Play/Pause Button */}
          <button
            onClick={onToggleStreaming}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-lg transition-all ${
              isStreaming
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:brightness-110 shadow-emerald-500/20'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Stream</span>
              </>
            )}
          </button>

          {/* Step Back / Forward */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => onTimeStepChange(Math.max(1, currentTimeStep - 1))}
              disabled={currentTimeStep <= 1 || isStreaming}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-40 rounded transition-colors"
              title="Step Backward (Time Slice t-1)"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-xs text-cyan-400 font-semibold">
              t = {currentTimeStep.toString().padStart(2, '0')} / {maxTimeSteps}
            </span>
            <button
              onClick={() => onTimeStepChange(Math.min(maxTimeSteps, currentTimeStep + 1))}
              disabled={currentTimeStep >= maxTimeSteps || isStreaming}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-40 rounded transition-colors"
              title="Step Forward (Time Slice t+1)"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Temporal Timeline Scrubber */}
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-xs">
            <span className="text-[11px] text-slate-400 font-mono">t₀</span>
            <input
              type="range"
              min={1}
              max={maxTimeSteps}
              value={currentTimeStep}
              onChange={e => onTimeStepChange(Number(e.target.value))}
              disabled={isStreaming}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-50"
            />
            <span className="text-[11px] text-slate-400 font-mono">t₄₉</span>
          </div>
        </div>

        {/* Center: Live TPS Frequency Control (50 to 100 TPS benchmark) */}
        <div className="flex items-center gap-3 w-full md:w-auto bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono">Throughput Target:</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={tpsSpeed}
            onChange={e => onTpsSpeedChange(Number(e.target.value))}
            className="w-28 accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-xs font-bold text-emerald-400 min-w-[55px]">
            {tpsSpeed} TPS
          </span>
          <span className="text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-400">
            ARM Neon SIMD
          </span>
        </div>

        {/* Right: Subgraph Filters & Attack Injection */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Filter options */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => onFilterModeChange('all')}
              className={`px-2 py-1 rounded transition-colors ${
                filterMode === 'all'
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Entities
            </button>
            <button
              onClick={() => onFilterModeChange('anomalies_only')}
              className={`px-2 py-1 rounded transition-colors ${
                filterMode === 'anomalies_only'
                  ? 'bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              High Risk (&gt;0.6)
            </button>
            <button
              onClick={() => onFilterModeChange('rings_only')}
              className={`px-2 py-1 rounded transition-colors ${
                filterMode === 'rings_only'
                  ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rings Only
            </button>
          </div>

          {/* Inject Synthetic Attack Button */}
          <button
            onClick={onInjectSyntheticAttack}
            className="flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm group"
            title="Inject Synthetic Smurfing Syndicate or Multi-Hop Peel Chain"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
            <span>Simulate Burst Attack</span>
          </button>
        </div>
      </div>
    </div>
  );
};
