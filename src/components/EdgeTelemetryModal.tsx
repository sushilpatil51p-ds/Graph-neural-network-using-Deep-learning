import React from 'react';
import { X, Cpu, Server, Zap, CheckCircle, Database, Gauge, ArrowDownRight, DollarSign } from 'lucide-react';
import { InferenceTelemetry } from '../types';

interface EdgeTelemetryModalProps {
  telemetry: InferenceTelemetry;
  onClose: () => void;
}

export const EdgeTelemetryModal: React.FC<EdgeTelemetryModalProps> = ({
  telemetry,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Zero-Cost VPS & Edge Inference Telemetry
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Oracle Free Tier
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Optimized ARM CPU SIMD Execution & Memgraph In-Memory Profiling
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block mb-1">Target Throughput</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                {telemetry.currentTps.toFixed(1)} TPS
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Sustaining 50-100 TPS</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block mb-1">Inference Latency</span>
              <span className="font-mono text-base font-bold text-cyan-400">
                {telemetry.avgLatencyMs.toFixed(1)} ms
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">p99: {telemetry.p99LatencyMs.toFixed(1)} ms</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block mb-1">ARM CPU Load</span>
              <span className="font-mono text-base font-bold text-amber-400">
                {telemetry.armCpuLoadPercent.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">4 OCPU Ampere A1</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block mb-1">Hosting Monthly Cost</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                ₹0 / $0.00
              </span>
              <span className="text-[10px] text-emerald-500/80 block mt-0.5">Always Free Lifetime</span>
            </div>
          </div>

          {/* Architecture Comparison: GPU vs ARM CPU */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Cost & Hardware Optimization Strategy</span>
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              By converting PyTorch Geometric models into an <strong>INT8-quantized ONNX runtime graph</strong> using <strong>ARM Neon SIMD</strong> instructions, we eliminate the need for expensive GPU instances (e.g. AWS EC2 g4dn.xlarge @ $380/mo). The entire system runs inside Oracle Cloud&apos;s Always Free tier with 24GB RAM and 4 ARM OCPUs.
            </p>

            {/* Comparison Table */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg">
                <div className="text-rose-400 font-bold mb-1">Standard GPU Deployment</div>
                <div className="text-slate-400 text-[11px]">Hardware: AWS EC2 g4dn.xlarge (16GB GPU)</div>
                <div className="text-rose-300 font-bold mt-1 text-sm">$380 / month (~₹31,000/mo)</div>
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-800/60 rounded-lg">
                <div className="text-emerald-400 font-bold mb-1">Our ST-GNN ONNX ARM Solution</div>
                <div className="text-slate-300 text-[11px]">Hardware: Oracle Cloud Ampere A1 (24GB RAM)</div>
                <div className="text-emerald-400 font-bold mt-1 text-sm">$0.00 / month (₹0 / Lifetime Free)</div>
              </div>
            </div>
          </div>

          {/* Memory & Memgraph Engine Breakdown */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-slate-200">Memgraph C++ In-Memory Footprint</span>
              </div>
              <span className="font-mono text-cyan-400 font-bold">
                {telemetry.memgraphRamUsageMb} MB / 24,576 MB
              </span>
            </div>

            {/* Memory bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                style={{ width: `${(telemetry.memgraphRamUsageMb / telemetry.totalVpsRamMb) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 pt-1">
              <div>
                <span className="text-slate-500 block">Graph Engine:</span>
                <span className="text-slate-300">Memgraph v2.14 (C++)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Quantization:</span>
                <span className="text-emerald-400">{telemetry.quantizationMode}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ONNX Optimizer:</span>
                <span className="text-slate-300">{telemetry.onnxOptimization}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
