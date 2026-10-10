import React, { useState } from 'react';
import { X, FileCheck, Printer, Download, Check, ShieldAlert, Lock, AlertOctagon } from 'lucide-react';
import { AnomalousRing, GraphNode } from '../types';

interface SarExportModalProps {
  ring?: AnomalousRing | null;
  node?: GraphNode | null;
  onClose: () => void;
}

export const SarExportModal: React.FC<SarExportModalProps> = ({
  ring,
  node,
  onClose,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const now = new Date().toISOString();
  const sarTrackingId = `SAR-GNN-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = document.getElementById('sar-dossier-content')?.innerText || '';
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <FileCheck className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Suspicious Activity Report (FinCEN SAR)
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  Form 111 / AML
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated ST-GNN Subgraph Evidence Dossier
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

        {/* SAR Content Box */}
        <div
          id="sar-dossier-content"
          className="flex-1 overflow-y-auto py-4 space-y-4 text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 my-2 text-slate-300 leading-relaxed select-text"
        >
          <div className="border-b border-slate-800 pb-3">
            <div className="text-emerald-400 font-bold text-sm">
              FINANCIAL CRIMES ENFORCEMENT NETWORK (FinCEN)
            </div>
            <div className="text-slate-400 text-[11px]">
              CONFIDENTIAL SUSPICIOUS ACTIVITY REPORT ELECTRONIC FILING
            </div>
            <div className="text-slate-500 text-[10px] mt-1">
              Filing Reference: <span className="text-cyan-400">{sarTrackingId}</span> | Timestamp: {now}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-slate-400 font-bold text-[11px] uppercase">
              1. SUBJECT IDENTIFICATION & TOPOLOGY PATTERN
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-[11px]">
              <div>Target Type: {ring ? ring.patternType : node?.type.toUpperCase()}</div>
              <div>Subject Name/Label: {ring ? ring.title : node?.label}</div>
              <div>Primary Blockchain Address: {node ? node.address : 'Multiple Subgraph Addresses'}</div>
              <div>ST-GNN Anomaly Confidence: {((ring ? ring.riskScore : (node?.anomalyScore || 0.95)) * 100).toFixed(1)}%</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-slate-400 font-bold text-[11px] uppercase">
              2. SUSPICIOUS ACTIVITY NARRATIVE & GNN TOPOLOGY PROOF
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-[11px] leading-relaxed text-slate-300">
              {ring ? ring.explanation : `Node ${node?.label} (${node?.address}) triggered anomalous spatio-temporal message-passing weights (score: ${(node?.anomalyScore || 0.95) * 100}%). High temporal velocity (${node?.features.temporalVelocity} tx/min) and structuring volume patterns detected.`}
              <br /><br />
              Topological analysis confirms multi-hop layering intended to obscure fund origins before exfiltration through unhosted mixer contracts or cashout sinks.
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-slate-400 font-bold text-[11px] uppercase">
              3. INFERENCE ENGINE & COMPLIANCE VERIFICATION
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-[11px]">
              <div>Runtime: PyTorch Geometric → ONNX Runtime (ARM Neon SIMD)</div>
              <div>Graph Database: Memgraph C++ In-Memory Engine</div>
              <div>Temporal Step: t = {ring ? ring.timeStep : node?.timeStep || 12} / 49</div>
              <div>Status: AUTOMATIC FREEZE & LAW ENFORCEMENT ESCALATION RECOMMENDED</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied to Clipboard' : 'Copy SAR Text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors"
            >
              Confirm SAR Filing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
