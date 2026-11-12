import React, { useState, useEffect } from 'react';
import { X, FileCheck, Printer, Download, Check, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { AnomalousRing, GraphNode } from '../types';
import { generateSarNarrative, SarNarrativeResult } from '../services/gemini';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [geminiNarrative, setGeminiNarrative] = useState<SarNarrativeResult | null>(null);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [useGemini, setUseGemini] = useState(false);

  const now = new Date().toISOString();
  const sarTrackingId = `SAR-GNN-${Math.floor(100000 + Math.random() * 900000)}`;
  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

  const handleGenerateWithGemini = async () => {
    setIsGenerating(true);
    setGeminiError(null);
    try {
      const result = await generateSarNarrative({ ring, node, filingDate: now, sarId: sarTrackingId });
      setGeminiNarrative(result);
      setUseGemini(true);
    } catch (err) {
      setGeminiError(err instanceof Error ? err.message : 'Gemini generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => window.print();

  const handleCopyText = () => {
    const text = document.getElementById('sar-dossier-content')?.innerText || '';
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Static fallback narrative (original behaviour)
  const staticNarrative = ring
    ? ring.explanation
    : `Node ${node?.label} (${node?.address}) triggered anomalous spatio-temporal message-passing weights (score: ${((node?.anomalyScore || 0.95) * 100).toFixed(1)}%). High temporal velocity (${node?.features.temporalVelocity} tx/min) and structuring volume patterns detected.`;

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
                {useGemini && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Gemini AI
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {useGemini ? 'AI-Generated Evidence Dossier · Gemini 2.0 Flash' : 'Automated ST-GNN Subgraph Evidence Dossier'}
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

        {/* Gemini Generate Button */}
        {!useGemini && (
          <div className="mt-3 mb-1 flex items-center gap-3">
            {hasApiKey ? (
              <button
                onClick={handleGenerateWithGemini}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-xs font-semibold transition-colors"
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {isGenerating ? 'Generating AI Narrative…' : 'Generate with Gemini AI'}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Set <code className="bg-slate-800 px-1 rounded">VITE_GEMINI_API_KEY</code> in .env to enable AI narratives</span>
              </div>
            )}
            {geminiError && (
              <span className="text-xs text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {geminiError}
              </span>
            )}
          </div>
        )}

        {useGemini && (
          <div className="mt-2 mb-1">
            <button
              onClick={() => { setUseGemini(false); setGeminiNarrative(null); }}
              className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2"
            >
              ← Switch back to static template
            </button>
          </div>
        )}

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
              {useGemini && geminiNarrative ? (
                <p className="text-slate-200 leading-relaxed">{geminiNarrative.subjectDescription}</p>
              ) : (
                <>
                  <div>Target Type: {ring ? ring.patternType : node?.type.toUpperCase()}</div>
                  <div>Subject Name/Label: {ring ? ring.title : node?.label}</div>
                  <div>Primary Blockchain Address: {node ? node.address : 'Multiple Subgraph Addresses'}</div>
                  <div>ST-GNN Anomaly Confidence: {((ring ? ring.riskScore : (node?.anomalyScore || 0.95)) * 100).toFixed(1)}%</div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-slate-400 font-bold text-[11px] uppercase">
              2. SUSPICIOUS ACTIVITY NARRATIVE & GNN TOPOLOGY PROOF
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-[11px] leading-relaxed text-slate-300">
              {useGemini && geminiNarrative ? (
                <p className="text-slate-200 leading-relaxed">{geminiNarrative.activityDescription}</p>
              ) : (
                <>
                  {staticNarrative}
                  <br /><br />
                  Topological analysis confirms multi-hop layering intended to obscure fund origins before exfiltration through unhosted mixer contracts or cashout sinks.
                </>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-slate-400 font-bold text-[11px] uppercase">
              3. RISK JUSTIFICATION & GNN EVIDENCE
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-[11px] leading-relaxed text-slate-300">
              {useGemini && geminiNarrative ? (
                <p className="text-slate-200 leading-relaxed">{geminiNarrative.riskJustification}</p>
              ) : (
                <>
                  ST-GNN spatial attention GAT aggregation identified anomalous message-passing weights exceeding threshold
                  (α &gt; 0.85) across {ring?.nodeIds.length ?? 1} entity cluster with temporal decay factor applied
                  (τ = 600s half-life).
                </>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-slate-400 font-bold text-[11px] uppercase">
              4. INFERENCE ENGINE & COMPLIANCE VERIFICATION
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-[11px]">
              <div>Runtime: GraphGuard ST-GNN + ONNX Classifier (GradientBoosting/INT8)</div>
              <div>Narrative Engine: {useGemini ? 'Gemini 2.0 Flash (Google AI)' : 'Template-based (static)'}</div>
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
