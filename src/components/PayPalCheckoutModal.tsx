import React, { useState } from 'react';
import {
  CreditCard,
  X,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw,
  Building,
  User,
  DollarSign,
  FileCheck
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { PayPalTransactionPayload, PayPalFraudAuditReport } from '../types';
import { processPayPalTransaction } from '../services/api';
import { generatePayPalComplianceSummary } from '../services/geminiPayPal';

interface PayPalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionAnalyzed: (result: {
    report: PayPalFraudAuditReport;
    newNode: any;
    newEdge: any;
  }) => void;
}

type SimulationScenario =
  | 'legitimate_ecommerce'
  | 'smurfing_structuring'
  | 'synthetic_mule'
  | 'mixer_exfiltration';

export const PayPalCheckoutModal: React.FC<PayPalCheckoutModalProps> = ({
  isOpen,
  onClose,
  onTransactionAnalyzed,
}) => {
  const [scenario, setScenario] = useState<SimulationScenario>('legitimate_ecommerce');
  const [senderName, setSenderName] = useState('Alice Johnson');
  const [senderEmail, setSenderEmail] = useState('alice.johnson@example.com');
  const [receiverEntity, setReceiverEntity] = useState('Coinbase Verified HotWallet');
  const [amount, setAmount] = useState(149.99);
  const [currency] = useState('USD');

  const [isProcessing, setIsProcessing] = useState(false);
  const [analyzedReport, setAnalyzedReport] = useState<PayPalFraudAuditReport | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const paypalClientId =
    (import.meta.env.VITE_PAYPAL_CLIENT_ID as string) ||
    'test'; // 'test' enables sandbox rendering in PayPal JS SDK

  if (!isOpen) return null;

  // Preset scenarios to easily demo in the 3-minute hackathon video
  const handleSelectScenario = (sc: SimulationScenario) => {
    setScenario(sc);
    setAnalyzedReport(null);
    if (sc === 'legitimate_ecommerce') {
      setSenderName('Alice Johnson');
      setSenderEmail('alice.retail@verified-buyer.org');
      setReceiverEntity('Verified Merchant Gateway');
      setAmount(149.99);
    } else if (sc === 'smurfing_structuring') {
      setSenderName('Smurf Mule Operative #7');
      setSenderEmail('mule.operative07@protonmail.com');
      setReceiverEntity('darknet_ransomware');
      setAmount(9850.0); // Structuring just below $10,000 CTR limit
    } else if (sc === 'synthetic_mule') {
      setSenderName('Ghost Identity Syndicate #3');
      setSenderEmail('ghost.identity3@temp-mail.org');
      setReceiverEntity('synthetic_mule_ring');
      setAmount(4200.0);
    } else if (sc === 'mixer_exfiltration') {
      setSenderName('Unregistered OTC Broker');
      setSenderEmail('otc.broker.anon@relay.onion');
      setReceiverEntity('mixer_pool');
      setAmount(18500.0);
    }
  };

  const executeFraudAnalysisPipeline = async (orderId: string, captureId?: string) => {
    setIsProcessing(true);
    setStatusMessage('Capturing PayPal payment in Sandbox...');

    try {
      const payload: PayPalTransactionPayload = {
        orderId,
        captureId,
        senderName,
        senderEmail,
        receiverEmail: `${receiverEntity.toLowerCase().replace(/[^a-z0-9]/g, '')}@gateway.com`,
        receiverEntity,
        amount,
        currency,
        timestamp: Date.now(),
        scenario,
      };

      setStatusMessage('Ingesting transaction into ST-GNN & updating node embeddings...');
      const serverResult = await processPayPalTransaction(payload);

      setStatusMessage('Calling Gemini 2.0 Flash for Compliance & Risk Audit Report...');
      const geminiSummary = await generatePayPalComplianceSummary(
        payload,
        serverResult.riskScore,
        serverResult.topologyPattern,
        serverResult.gnnExplanation
      );

      const completeReport: PayPalFraudAuditReport = {
        transactionId: serverResult.transactionId,
        orderId: serverResult.orderId,
        status: serverResult.status,
        riskScore: serverResult.riskScore,
        isSuspicious: serverResult.isSuspicious,
        verdict: serverResult.verdict,
        topologyPattern: serverResult.topologyPattern,
        gnnExplanation: serverResult.gnnExplanation,
        aiAuditSummary: geminiSummary.summary,
        complianceRecommendations: geminiSummary.recommendations,
        features: serverResult.features,
        timestamp: serverResult.timestamp,
        newNodeId: serverResult.newNode?.id,
        newEdgeId: serverResult.newEdge?.id,
      };

      setAnalyzedReport(completeReport);
      onTransactionAnalyzed({
        report: completeReport,
        newNode: serverResult.newNode,
        newEdge: serverResult.newEdge,
      });
      setStatusMessage('');
    } catch (err: any) {
      console.error('Error in PayPal ST-GNN bridge:', err);
      setStatusMessage(`Error: ${err.message || 'Failed to process transaction'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // One-click quick simulation button for seamless offline / instant demo recording
  const handleSimulateInstantPayment = () => {
    const syntheticOrderId = `PAYPAL-SBX-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const syntheticCaptureId = `CAP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    executeFraudAnalysisPipeline(syntheticOrderId, syntheticCaptureId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#003087]/40 via-[#0079C1]/30 to-cyan-500/20 border border-[#0079C1]/40 shadow-lg shadow-[#0079C1]/10">
              <CreditCard className="w-6 h-6 text-[#0079C1]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  PayPal Developer Sandbox & Live GNN Bridge
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  PAYMENT.CAPTURE.COMPLETED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Execute live PayPal checkouts and monitor real-time ST-GNN topological risk & Gemini AI compliance audits.
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

        {/* Content body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs">
          {/* Scenario Selector Banner */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Demo Testing Scenarios (PayPal Hackathon Showcase):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleSelectScenario('legitimate_ecommerce')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scenario === 'legitimate_ecommerce'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-xs mb-1">
                  <span>1. Licit Commerce</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                    Low Risk
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Verified retail buyer purchasing $149.99 from an institutional gateway.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectScenario('smurfing_structuring')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scenario === 'smurfing_structuring'
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-xs mb-1">
                  <span>2. Smurfing / CTR</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 border border-rose-800 text-rose-400">
                    High Risk
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  $9,850.00 structuring transfer aimed just under the $10k reporting rule.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectScenario('synthetic_mule')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scenario === 'synthetic_mule'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-xs mb-1">
                  <span>3. Synthetic Ring</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800 text-amber-400">
                    Syndicate
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Circular layering cycling $4,200 into the Mule-Alpha credit churn ring.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectScenario('mixer_exfiltration')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  scenario === 'mixer_exfiltration'
                    ? 'bg-purple-500/10 border-purple-500/40 text-purple-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-xs mb-1">
                  <span>4. Mixer Exfil</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 border border-purple-800 text-purple-400">
                    Exfiltration
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Peel chain routing $18,500 through OTC into CoinJoin privacy pool.
                </p>
              </button>
            </div>
          </div>

          {/* Form details & Checkout side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Transaction Parameters */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                PayPal Payment Metadata
              </h3>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Sender Name & Identity</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Sender Email / Wallet Identifier</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={e => setSenderEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    step="0.01"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Receiver Counterparty</label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={receiverEntity}
                      onChange={e => setReceiverEntity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500 truncate"
                    />
                  </div>
                </div>
              </div>

              {/* Instant Simulation Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSimulateInstantPayment}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-md shadow-cyan-900/20 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Zap className="w-4 h-4 text-amber-300" />
                  )}
                  <span>
                    {isProcessing ? 'Analyzing in Graph Neural Net...' : 'Simulate PayPal Payment Capture & Audit'}
                  </span>
                </button>
              </div>
            </div>

            {/* Right: PayPal JavaScript SDK Sandbox Checkout Buttons */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white flex items-center gap-1.5 text-xs">
                    <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                    Live PayPal Sandbox Smart Buttons
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Sandbox Mode</span>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 mb-3 space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Merchant:</span>
                    <span className="text-slate-200">GraphGuard AML Store</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Amount:</span>
                    <span className="text-emerald-400 font-bold">${amount.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Scenario:</span>
                    <span className="text-cyan-400 capitalize">{scenario.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* PayPal Buttons Render */}
                <div className="min-h-[120px] flex items-center justify-center">
                  <PayPalScriptProvider
                    options={{
                      clientId: paypalClientId,
                      currency: 'USD',
                      intent: 'capture',
                    }}
                  >
                    <div className="w-full max-w-[280px]">
                      <PayPalButtons
                        style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal', height: 35 }}
                        createOrder={(_data, actions) => {
                          return actions.order.create({
                            intent: 'CAPTURE',
                            purchase_units: [
                              {
                                description: `GraphGuard AML Sandbox Payment - ${scenario}`,
                                amount: {
                                  currency_code: 'USD',
                                  value: amount.toFixed(2),
                                },
                              },
                            ],
                          });
                        }}
                        onApprove={async (_data, actions) => {
                          if (actions.order) {
                            const details = await actions.order.capture();
                            const captureId = details.purchase_units?.[0]?.payments?.captures?.[0]?.id;
                            await executeFraudAnalysisPipeline(details.id, captureId);
                          }
                        }}
                        onError={(err) => {
                          console.warn('PayPal button error (fallback to instant simulate):', err);
                          handleSimulateInstantPayment();
                        }}
                      />
                    </div>
                  </PayPalScriptProvider>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 text-center mt-2">
                Clicking PayPal buttons runs actual sandbox authorization with PayPal Developer credentials.
              </p>
            </div>
          </div>

          {/* Status Progress indicator */}
          {statusMessage && (
            <div className="flex items-center gap-2 p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-cyan-300 text-xs font-mono animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Result Card: Gemini AI Compliance & Risk Summary */}
          {analyzedReport && (
            <div
              className={`p-4 rounded-xl border text-xs font-mono transition-all animate-in fade-in duration-200 ${
                analyzedReport.isSuspicious
                  ? analyzedReport.riskScore >= 0.88
                    ? 'bg-rose-950/30 border-rose-700/60 text-slate-200'
                    : 'bg-amber-950/30 border-amber-700/60 text-slate-200'
                  : 'bg-emerald-950/30 border-emerald-700/60 text-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  {analyzedReport.isSuspicious ? (
                    <ShieldAlert
                      className={`w-5 h-5 ${
                        analyzedReport.riskScore >= 0.88 ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      PayPal Live GNN Audit Verdict: {analyzedReport.verdict}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Order ID: <span className="text-cyan-400">{analyzedReport.orderId}</span> | Tx: {analyzedReport.transactionId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-slate-400">ST-GNN Anomaly Score</div>
                    <div
                      className={`text-base font-bold ${
                        analyzedReport.riskScore >= 0.7 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {(analyzedReport.riskScore * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Gemini AI Compliance Audit Report Box */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-1.5 text-violet-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini 2.0 Flash — AI Fraud & Compliance Audit Summary</span>
                </div>
                <p className="bg-slate-950/90 p-3 rounded-lg border border-slate-800 leading-relaxed text-slate-200">
                  {analyzedReport.aiAuditSummary}
                </p>
              </div>

              {/* Compliance Actions */}
              {analyzedReport.complianceRecommendations.length > 0 && (
                <div className="mt-3">
                  <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Compliance Operations Playbook Recommendations:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    {analyzedReport.complianceRecommendations.map((rec, idx) => (
                      <li key={idx} className="leading-snug">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Graph Telemetry Footprint */}
              <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                <div>
                  Topology Pattern: <span className="text-slate-200 font-semibold">{analyzedReport.topologyPattern}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Velocity: {analyzedReport.features.velocity} tx/m</span>
                  <span>Burst: {analyzedReport.features.burstScore}</span>
                  <span>Neighbor Risk: {(analyzedReport.features.neighborRisk * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-500 font-mono text-[11px]">
            PayPal Sandbox Node Pipeline · Memgraph C++ Ingestion & GAT Attention
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
