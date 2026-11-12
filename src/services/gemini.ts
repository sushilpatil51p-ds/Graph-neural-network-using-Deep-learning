import { GoogleGenAI } from '@google/genai';
import { AnomalousRing, GraphNode } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!ai) {
    if (!API_KEY) throw new Error('VITE_GEMINI_API_KEY is not set');
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
}

export interface SarNarrativeInput {
  ring?: AnomalousRing | null;
  node?: GraphNode | null;
  filingDate: string;
  sarId: string;
}

export interface SarNarrativeResult {
  narrative: string;
  subjectDescription: string;
  activityDescription: string;
  riskJustification: string;
}

export async function generateSarNarrative(
  input: SarNarrativeInput
): Promise<SarNarrativeResult> {
  const client = getAI();

  const { ring, node, filingDate, sarId } = input;

  // Build context for Gemini
  const contextLines: string[] = [];

  if (ring) {
    contextLines.push(`Pattern Type: ${ring.patternType}`);
    contextLines.push(`Risk Score: ${(ring.riskScore * 100).toFixed(1)}%`);
    contextLines.push(`Total Volume: ${ring.totalVolume} BTC`);
    contextLines.push(`Nodes Involved: ${ring.nodeIds.length}`);
    contextLines.push(`Detection Time: ${ring.detectionTime}`);
    contextLines.push(`Status: ${ring.status}`);
    contextLines.push(`Algorithm Explanation: ${ring.explanation}`);
  }

  if (node) {
    contextLines.push(`Entity: ${node.label}`);
    contextLines.push(`Address: ${node.address}`);
    contextLines.push(`Type: ${node.type}`);
    contextLines.push(`Anomaly Score: ${(node.anomalyScore * 100).toFixed(1)}%`);
    contextLines.push(`Balance: ${node.balance.toFixed(2)} BTC`);
    contextLines.push(`In-Degree: ${node.features.inDegree}`);
    contextLines.push(`Out-Degree: ${node.features.outDegree}`);
    contextLines.push(`Burst Score: ${node.features.burstScore.toFixed(3)}`);
    contextLines.push(`Circularity Index: ${node.features.circularityIndex.toFixed(3)}`);
    contextLines.push(`Temporal Velocity: ${node.features.temporalVelocity.toFixed(1)} tx/min`);
  }

  const prompt = `You are a FinCEN-certified AML compliance officer generating a Suspicious Activity Report (SAR) narrative.

SAR Reference: ${sarId}
Filing Date: ${filingDate}

Detection Data from GraphGuard AI ST-GNN System:
${contextLines.join('\n')}

Generate a professional, legally-precise SAR narrative in 4 clearly separated sections. Use plain text only (no markdown, no bullet points). Be specific, factual, and reference the algorithmic evidence.

Section 1 - SUBJECT DESCRIPTION (2-3 sentences):
Describe the subject entity or entities involved, their wallet addresses/identifiers, and their role in the network.

Section 2 - SUSPICIOUS ACTIVITY DESCRIPTION (3-4 sentences):
Describe the suspicious transaction pattern detected, including specific amounts, timing, and the topology of the financial flow (e.g., circular transfers, fan-in structuring below CTR threshold, peel chain exfiltration).

Section 3 - RISK JUSTIFICATION (2-3 sentences):
Explain why the ST-GNN model flagged this activity, referencing specific feature values (burst score, circularity index, neighbor risk) and the GNN anomaly confidence score.

Section 4 - RECOMMENDED ACTION (1-2 sentences):
State the recommended compliance action (e.g., freeze accounts, escalate to law enforcement, file CTR).

Format your response as JSON with keys: narrative, subjectDescription, activityDescription, riskJustification. Each value should be a plain text string.`;

  const response = await client.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  const text = response.text ?? '{}';

  // Parse JSON response
  try {
    const parsed = JSON.parse(text) as Partial<SarNarrativeResult>;
    return {
      narrative:
        parsed.narrative ??
        `${parsed.subjectDescription ?? ''} ${parsed.activityDescription ?? ''} ${parsed.riskJustification ?? ''}`.trim(),
      subjectDescription: parsed.subjectDescription ?? 'Entity information unavailable.',
      activityDescription: parsed.activityDescription ?? 'Activity details unavailable.',
      riskJustification: parsed.riskJustification ?? 'Risk score exceeds threshold.',
    };
  } catch {
    // Fallback: return raw text as narrative
    return {
      narrative: text,
      subjectDescription: 'See full narrative.',
      activityDescription: 'See full narrative.',
      riskJustification: 'See full narrative.',
    };
  }
}
