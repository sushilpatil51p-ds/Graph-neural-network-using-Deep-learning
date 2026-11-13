import { GoogleGenAI } from '@google/genai';
import { PayPalTransactionPayload, PayPalFraudAuditReport } from '../types';

const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!ai) {
    if (!API_KEY) throw new Error('VITE_GEMINI_API_KEY is not configured');
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
}

export async function generatePayPalComplianceSummary(
  tx: PayPalTransactionPayload,
  riskScore: number,
  pattern: string,
  gnnEvidence: string
): Promise<{ summary: string; recommendations: string[] }> {
  try {
    if (!API_KEY) {
      return getFallbackReport(tx, riskScore, pattern, gnnEvidence);
    }

    const client = getAI();
    const prompt = `You are a Principal FinTech Compliance & AI Fraud Architect evaluating a live PayPal Developer Sandbox payment processed through GraphGuard's Spatio-Temporal Graph Neural Network (ST-GNN).

PayPal Transaction Details:
- Order ID: ${tx.orderId}
- Capture ID: ${tx.captureId || 'CAP-' + tx.orderId.slice(-6)}
- Sender: ${tx.senderName} (${tx.senderEmail})
- Receiver: ${tx.receiverEntity} (${tx.receiverEmail})
- Amount: $${tx.amount.toFixed(2)} ${tx.currency}
- Timestamp: ${new Date(tx.timestamp).toISOString()}

Graph Analytics & GNN Telemetry:
- GNN Anomaly Score: ${(riskScore * 100).toFixed(1)}%
- Graph Topology Pattern: ${pattern}
- GNN Mathematical Evidence: ${gnnEvidence}

Task:
Produce a concise, professional FinTech Fraud & AML Compliance Audit Report for executive stakeholders and PayPal risk operations.

Respond in valid JSON with exactly two fields:
{
  "summary": "2-3 crisp sentences detailing the behavioral risk finding, topological graph context, and GNN verdict.",
  "recommendations": [
    "Specific compliance action 1 (e.g. Account freeze, 3DS step-up, SAR filing, or Clear for instant settlement)",
    "Specific compliance action 2 (e.g. Merchant reserve hold, counterparty graph audit, or monitoring)"
  ]
}`;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      summary: parsed.summary || getFallbackReport(tx, riskScore, pattern, gnnEvidence).summary,
      recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
        ? parsed.recommendations
        : getFallbackReport(tx, riskScore, pattern, gnnEvidence).recommendations,
    };
  } catch (err) {
    console.warn('Gemini API call returned fallback report:', err);
    return getFallbackReport(tx, riskScore, pattern, gnnEvidence);
  }
}

function getFallbackReport(
  tx: PayPalTransactionPayload,
  riskScore: number,
  pattern: string,
  gnnEvidence: string
): { summary: string; recommendations: string[] } {
  const isSuspicious = riskScore >= 0.7;
  const isCritical = riskScore >= 0.88;

  if (isCritical) {
    return {
      summary: `CRITICAL ALERT: PayPal Order ${tx.orderId} ($${tx.amount.toFixed(2)}) flagged with an ST-GNN anomaly score of ${(riskScore * 100).toFixed(1)}%. Topological message-passing identified immediate linkage to an active ${pattern}. ${gnnEvidence}`,
      recommendations: [
        'Immediate automated freeze of payout and escrow hold under FinCEN Rule 31 CFR § 1010.410.',
        'File Electronic Suspicious Activity Report (FinCEN SAR Form 111) within 24 hours citing synthetic ring churn.',
        'Trigger counterparty risk propagation traversal on connected PayPal receiver accounts.',
      ],
    };
  } else if (isSuspicious) {
    return {
      summary: `ELEVATED RISK: PayPal Order ${tx.orderId} ($${tx.amount.toFixed(2)}) exhibits structuring indicators typical of ${pattern} with ${(riskScore * 100).toFixed(1)}% anomaly probability. Transaction velocity and neighbor risk diverge significantly from baseline institutional merchant profiles.`,
      recommendations: [
        'Route transaction to Tier-2 Fraud Analysts for manual document verification.',
        'Impose 48-hour velocity cap on sender identity and cross-reference device fingerprint.',
        'Monitor linked PayPal wallets for coordinated fan-in structuring under $10,000 threshold.',
      ],
    };
  } else {
    return {
      summary: `VERIFIED & CLEARED: PayPal Order ${tx.orderId} ($${tx.amount.toFixed(2)}) exhibits an anomaly score of ${(riskScore * 100).toFixed(1)}%, well within normal licit commerce parameters. Graph centrality confirms connection to established merchant clusters with low temporal velocity.`,
      recommendations: [
        'Release funds for immediate merchant settlement via PayPal Instant Transfer.',
        'Log baseline embedding vector into Memgraph graph store for progressive model refinement.',
      ],
    };
  }
}
