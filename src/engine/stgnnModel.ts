import { GraphNode, GraphEdge, CypherQueryResult, InferenceTelemetry } from '../types';

/**
 * Spatio-Temporal Graph Neural Network (ST-GNN) Simulator
 * Compiles mathematical operations representing spatial message-passing (GAT)
 * and temporal recurrence (GRU) executed via ONNX Runtime on ARM Cortex-A72 / Neoverse-N1.
 */

export class StGnnInferenceEngine {
  private initialWeights: number[][] = [];

  constructor() {
    // Generate deterministic pseudo-weights for 64-dim embedding transformation
    for (let i = 0; i < 8; i++) {
      this.initialWeights.push([0.15, -0.22, 0.45, -0.11, 0.88, -0.34, 0.12, 0.05]);
    }
  }

  /**
   * Spatial Message Passing Step
   * m_v^(t) = Sum_{u in N(v)} alpha_uv * W_s * h_u^(t)
   */
  public computeSpatialMessage(
    targetNodeId: string,
    nodes: GraphNode[],
    edges: GraphEdge[]
  ): { aggregatedScore: number; incomingNeighbors: Array<{ id: string; weight: number; amount: number }> } {
    const incomingEdges = edges.filter(e => e.target === targetNodeId);
    if (incomingEdges.length === 0) {
      return { aggregatedScore: 0, incomingNeighbors: [] };
    }

    let weightedSum = 0;
    let totalWeight = 0;
    const incomingNeighbors: Array<{ id: string; weight: number; amount: number }> = [];

    incomingEdges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      if (source) {
        // Temporal decay factor based on edge recency
        const timeDelta = Math.max(1, (Date.now() - edge.timestamp) / 1000);
        const temporalDecay = Math.exp(-timeDelta / 600); // 10-minute half-life
        
        // Attention alpha_uv
        const alpha = edge.attentionWeight * temporalDecay;
        const neighborSignal = source.anomalyScore * (1 + edge.amount / 50);

        weightedSum += alpha * neighborSignal;
        totalWeight += alpha;

        incomingNeighbors.push({
          id: source.id,
          weight: Number(alpha.toFixed(3)),
          amount: edge.amount,
        });
      }
    });

    const aggregatedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    return { aggregatedScore, incomingNeighbors };
  }

  /**
   * Temporal GRU Update:
   * h_v^(t) = GRU(m_v^(t), h_v^(t-1))
   */
  public stepTemporalRecurrence(
    node: GraphNode,
    spatialMessage: number
  ): { newScore: number; newEmbedding: [number, number] } {
    // GRU Gate approximation
    const z_t = 1 / (1 + Math.exp(-(spatialMessage * 1.5 - 0.2))); // Update gate
    const r_t = 1 / (1 + Math.exp(-(spatialMessage * 1.2 + 0.1))); // Reset gate

    const candidate = Math.tanh(spatialMessage * 1.8 + (r_t * node.anomalyScore * 0.5));
    const updatedScore = (1 - z_t) * node.anomalyScore + z_t * candidate;
    const clampedScore = Math.max(0.01, Math.min(0.999, updatedScore));

    // Dynamic 2D manifold trajectory update
    const [prevX, prevY] = node.embedding;
    const driftAngle = (clampedScore - 0.5) * Math.PI;
    const driftDist = 0.04 * (1 + spatialMessage);

    const newEmbedding: [number, number] = [
      Number((prevX + Math.cos(driftAngle) * driftDist * (node.type === 'licit' ? 0.3 : 1)).toFixed(3)),
      Number((prevY + Math.sin(driftAngle) * driftDist * (node.type === 'licit' ? 0.3 : 1)).toFixed(3)),
    ];

    return {
      newScore: Number(clampedScore.toFixed(3)),
      newEmbedding,
    };
  }

  /**
   * Execute Cypher Queries in-memory simulating Memgraph C++ engine
   */
  public executeCypher(
    query: string,
    nodes: GraphNode[],
    edges: GraphEdge[]
  ): CypherQueryResult {
    const startTime = performance.now();
    const cleanQ = query.trim().toUpperCase();

    // 1. Cycle detection (Synthetic Identity Rings)
    if (cleanQ.includes('[:TRANSFER*') || (cleanQ.includes('MATCH P=') && cleanQ.includes('->(A)'))) {
      const muleNodes = nodes.filter(n => n.type === 'mule');
      const rows = [
        {
          cycle_id: 'RING_01_HEX',
          path_length: 6,
          nodes_in_cycle: muleNodes.map(m => m.label).join(' -> ') + ' -> Mule-Alpha',
          total_volume_cycled: '88.40 BTC',
          confidence_score: 0.965,
          verdict: 'CONFIRMED_SYNTHETIC_RING',
        },
        {
          cycle_id: 'RING_02_WASH',
          path_length: 4,
          nodes_in_cycle: 'Peel-Hop-1 -> Peel-Hop-2 -> Peel-Hop-3 -> Mixer / CoinJoin Pool',
          total_volume_cycled: '74.20 BTC',
          confidence_score: 0.942,
          verdict: 'PEEL_CHAIN_MIXER_EXFILTRATION',
        }
      ];

      return {
        query,
        executionTimeMs: Number((performance.now() - startTime + 1.2).toFixed(2)),
        columns: ['cycle_id', 'path_length', 'nodes_in_cycle', 'total_volume_cycled', 'confidence_score', 'verdict'],
        rows,
        nodesAffected: 10,
      };
    }

    // 2. High risk / Anomaly filter query
    if (cleanQ.includes('ANOMALYSCORE >') || cleanQ.includes('ILLICIT') || cleanQ.includes('WHERE N.ANOMALYSCORE')) {
      const threshold = 0.7;
      const filtered = nodes
        .filter(n => n.anomalyScore > threshold)
        .sort((a, b) => b.anomalyScore - a.anomalyScore);

      const rows = filtered.map(n => ({
        id: n.id,
        label: n.label,
        type: n.type,
        anomalyScore: n.anomalyScore,
        balance: `${n.balance.toFixed(2)} BTC`,
        inDegree: n.features.inDegree,
        outDegree: n.features.outDegree,
        timeVelocity: `${n.features.temporalVelocity} tx/m`,
      }));

      return {
        query,
        executionTimeMs: Number((performance.now() - startTime + 0.8).toFixed(2)),
        columns: ['id', 'label', 'type', 'anomalyScore', 'balance', 'inDegree', 'outDegree', 'timeVelocity'],
        rows,
        nodesAffected: rows.length,
      };
    }

    // 3. Smurfing / Fan-In Sink aggregation query
    if (cleanQ.includes('SINK') || cleanQ.includes('COUNT(M)') || cleanQ.includes('STRUCTURING')) {
      const sink = nodes.find(n => n.id === 'node_sink_ransomware') || nodes[0];
      const smurfEdges = edges.filter(e => e.target === sink.id);
      const totalAmt = smurfEdges.reduce((acc, e) => acc + e.amount, 0);

      const rows = [
        {
          sink_entity: sink.label,
          sink_address: sink.address,
          fan_in_mules: smurfEdges.length,
          avg_transfer_size: smurfEdges.length ? `${(totalAmt / smurfEdges.length).toFixed(2)} BTC` : '0 BTC',
          total_accumulated_btc: `${totalAmt.toFixed(2)} BTC`,
          structuring_flag: 'SUSPICIOUS_UNDER_THRESHOLD',
          st_gnn_risk: 0.985,
        }
      ];

      return {
        query,
        executionTimeMs: Number((performance.now() - startTime + 0.9).toFixed(2)),
        columns: ['sink_entity', 'sink_address', 'fan_in_mules', 'avg_transfer_size', 'total_accumulated_btc', 'structuring_flag', 'st_gnn_risk'],
        rows,
        nodesAffected: smurfEdges.length + 1,
      };
    }

    // Default general query: Match top 10 nodes
    const rows = nodes.slice(0, 10).map(n => ({
      id: n.id,
      label: n.label,
      type: n.type,
      anomalyScore: n.anomalyScore,
      balance_btc: n.balance.toFixed(2),
      status: n.predictedClass.toUpperCase(),
    }));

    return {
      query,
      executionTimeMs: Number((performance.now() - startTime + 0.6).toFixed(2)),
      columns: ['id', 'label', 'type', 'anomalyScore', 'balance_btc', 'status'],
      rows,
      nodesAffected: rows.length,
    };
  }
}

export const stGnnEngine = new StGnnInferenceEngine();
