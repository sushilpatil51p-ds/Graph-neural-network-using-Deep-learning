export type NodeType = 'licit' | 'illicit' | 'mule' | 'mixer' | 'unknown' | 'sink';

export interface GraphNode {
  id: string;
  label: string;
  address: string;
  type: NodeType;
  balance: number;
  anomalyScore: number; // 0.0 to 1.0 (ST-GNN output)
  predictedClass: 'licit' | 'illicit' | 'suspicious';
  groundTruth?: 'licit' | 'illicit' | 'unknown';
  timeStep: number; // 1 to 49
  // 166-dim representative features
  features: {
    inDegree: number;
    outDegree: number;
    transactedVolumeBtc: number;
    feeRateSats: number;
    avgNeighborRisk: number;
    temporalVelocity: number; // tx count per unit time
    burstScore: number;
    circularityIndex: number;
  };
  // Dynamic embedding representation (e.g. 64-dim, projected to 2D for visualization)
  embedding: [number, number];
  prevEmbedding?: [number, number];
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  amount: number; // in BTC or USD
  timestamp: number;
  timeStep: number;
  attentionWeight: number; // ST-GNN spatial attention α_uv
  latencyMs: number; // edge inference time
  isFlagged: boolean;
  txHash: string;
  anomalyContribution: number;
}

export interface AnomalousRing {
  id: string;
  title: string;
  patternType: 'Synthetic Identity Ring' | 'Smurfing & Layering' | 'Peel Chain Exfiltration' | 'Circular Mixing Loop';
  riskScore: number;
  totalVolume: number;
  nodeIds: string[];
  edgeIds: string[];
  detectionTime: string;
  status: 'Investigating' | 'Flagged' | 'SAR Filed' | 'Frozen';
  timeStep: number;
  explanation: string;
}

export interface InferenceTelemetry {
  currentTps: number;
  targetTps: number;
  avgLatencyMs: number;
  p99LatencyMs: number;
  armCpuLoadPercent: number;
  armNeonVectorOpsPerSec: number;
  memgraphRamUsageMb: number;
  totalVpsRamMb: number; // 24576 MB (24GB)
  costPerHourUsd: number; // 0.00
  totalProcessedTx: number;
  detectedAnomaliesCount: number;
  quantizationMode: 'INT8 Neon SIMD' | 'FP16 Vectorized' | 'FP32 Fallback';
  onnxOptimization: 'Level 3 - Graph Fusion & Constant Folding';
  activeEngine: 'Memgraph C++ In-Memory Engine';
}

export interface CypherQueryResult {
  query: string;
  executionTimeMs: number;
  columns: string[];
  rows: Array<Record<string, string | number | boolean>>;
  nodesAffected?: number;
}
