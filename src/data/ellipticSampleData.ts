import { GraphNode, GraphEdge, AnomalousRing } from '../types';

export const INITIAL_TIME_STEP = 12;
export const MAX_TIME_STEPS = 49;

// Generates realistic node clusters for Elliptic & Kaggle AML topologies
export function generateBaseGraphData(): {
  nodes: GraphNode[];
  edges: GraphEdge[];
  rings: AnomalousRing[];
} {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Helper to generate a truncated hash
  const genAddr = (prefix: string, idx: number) =>
    `0x${prefix}${idx.toString(16).padStart(4, '0')}${Math.random().toString(16).slice(2, 6)}`;
  const genTx = (step: number, i: number) =>
    `tx_${step}_${i.toString(16).padStart(4, '0')}`;

  // Ring 1: Synthetic Identity Ring (Circular Layering, 6 nodes cycling funds to build fake credit history)
  const ring1Nodes = ['Mule-Alpha', 'Mule-Beta', 'Mule-Gamma', 'Mule-Delta', 'Mule-Epsilon', 'Mule-Zeta'];
  const ring1NodeIds: string[] = [];
  ring1Nodes.forEach((name, i) => {
    const id = `node_syn_${i + 1}`;
    ring1NodeIds.push(id);
    const angle = (i / ring1Nodes.length) * Math.PI * 2;
    nodes.push({
      id,
      label: name,
      address: genAddr('7f', i + 10),
      type: 'mule',
      balance: 14.5 + (i * 2.3),
      anomalyScore: 0.94 - (i * 0.02),
      predictedClass: 'illicit',
      groundTruth: 'illicit',
      timeStep: 12,
      features: {
        inDegree: 4,
        outDegree: 4,
        transactedVolumeBtc: 88.4,
        feeRateSats: 42,
        avgNeighborRisk: 0.91,
        temporalVelocity: 18.2,
        burstScore: 0.88,
        circularityIndex: 0.96,
      },
      embedding: [
        Math.cos(angle) * 0.7 - 0.5 + (Math.random() - 0.5) * 0.1,
        Math.sin(angle) * 0.7 + 0.6 + (Math.random() - 0.5) * 0.1,
      ],
      x: 320 + Math.cos(angle) * 110,
      y: 220 + Math.sin(angle) * 110,
    });
  });

  // Edges for Ring 1: Circular cycle
  for (let i = 0; i < ring1NodeIds.length; i++) {
    const nextIdx = (i + 1) % ring1NodeIds.length;
    edges.push({
      id: `edge_syn_${i}`,
      source: ring1NodeIds[i],
      target: ring1NodeIds[nextIdx],
      amount: 12.8 + (i * 1.5),
      timestamp: Date.now() - (ring1NodeIds.length - i) * 60000,
      timeStep: 12,
      attentionWeight: 0.89 + Math.random() * 0.08,
      latencyMs: 1.2,
      isFlagged: true,
      txHash: genTx(12, 100 + i),
      anomalyContribution: 0.92,
    });
  }

  // Cross links inside the ring to mimic dense credit mesh
  edges.push({
    id: `edge_syn_cross_1`,
    source: ring1NodeIds[0],
    target: ring1NodeIds[3],
    amount: 5.4,
    timestamp: Date.now() - 30000,
    timeStep: 12,
    attentionWeight: 0.94,
    latencyMs: 1.1,
    isFlagged: true,
    txHash: genTx(12, 110),
    anomalyContribution: 0.95,
  });

  // Ring 2: Smurfing & Fan-In to Ransomware Sink (Elliptic Dataset Pattern)
  const sinkId = 'node_sink_ransomware';
  nodes.push({
    id: sinkId,
    label: 'Darknet Ransomware Sink',
    address: 'bc1qa9e334f89d34e2c019a84',
    type: 'illicit',
    balance: 142.8,
    anomalyScore: 0.985,
    predictedClass: 'illicit',
    groundTruth: 'illicit',
    timeStep: 12,
    features: {
      inDegree: 8,
      outDegree: 1,
      transactedVolumeBtc: 420.5,
      feeRateSats: 65,
      avgNeighborRisk: 0.85,
      temporalVelocity: 34.0,
      burstScore: 0.95,
      circularityIndex: 0.12,
    },
    embedding: [-0.85 + Math.random() * 0.1, 0.45 + Math.random() * 0.1],
    x: 180,
    y: 480,
  });

  const smurfMules = ['Smurf-A1', 'Smurf-A2', 'Smurf-A3', 'Smurf-A4', 'Smurf-A5'];
  const smurfNodeIds: string[] = [];
  smurfMules.forEach((name, i) => {
    const id = `node_smurf_${i + 1}`;
    smurfNodeIds.push(id);
    const angle = ((i - 2) / smurfMules.length) * (Math.PI * 0.7);
    nodes.push({
      id,
      label: name,
      address: genAddr('3c', 200 + i),
      type: 'mule',
      balance: 1.8 + Math.random() * 2,
      anomalyScore: 0.87 + Math.random() * 0.08,
      predictedClass: 'illicit',
      groundTruth: 'illicit',
      timeStep: 12,
      features: {
        inDegree: 1,
        outDegree: 2,
        transactedVolumeBtc: 9.8,
        feeRateSats: 38,
        avgNeighborRisk: 0.82,
        temporalVelocity: 14.5,
        burstScore: 0.91,
        circularityIndex: 0.05,
      },
      embedding: [-0.6 + Math.random() * 0.15, 0.25 + Math.random() * 0.15],
      x: 80 + Math.cos(angle) * 90,
      y: 360 + Math.sin(angle) * 80 + (i * 30),
    });

    // Smurf fan-in edge to sink
    edges.push({
      id: `edge_smurf_sink_${i}`,
      source: id,
      target: sinkId,
      amount: 9.9, // just below 10.0 AML reporting threshold (Structuring)
      timestamp: Date.now() - (i * 45000),
      timeStep: 12,
      attentionWeight: 0.92,
      latencyMs: 1.0,
      isFlagged: true,
      txHash: genTx(12, 200 + i),
      anomalyContribution: 0.89,
    });
  });

  // Ring 3: Peel Chain Exfiltration via Mixer / Tornado Cash clone
  const mixerId = 'node_mixer_wasabi';
  nodes.push({
    id: mixerId,
    label: 'Mixer / CoinJoin Pool',
    address: '0x881d40237659c251811cec9c364ef91dc08d300c',
    type: 'mixer',
    balance: 530.0,
    anomalyScore: 0.96,
    predictedClass: 'illicit',
    groundTruth: 'illicit',
    timeStep: 12,
    features: {
      inDegree: 14,
      outDegree: 16,
      transactedVolumeBtc: 1850.0,
      feeRateSats: 80,
      avgNeighborRisk: 0.79,
      temporalVelocity: 48.0,
      burstScore: 0.92,
      circularityIndex: 0.44,
    },
    embedding: [-0.35 + Math.random() * 0.1, -0.75 + Math.random() * 0.1],
    x: 480,
    y: 500,
  });

  const peelChain = ['Peel-Hop-1', 'Peel-Hop-2', 'Peel-Hop-3', 'Peel-Hop-4'];
  const peelNodeIds: string[] = [];
  peelChain.forEach((name, i) => {
    const id = `node_peel_${i + 1}`;
    peelNodeIds.push(id);
    nodes.push({
      id,
      label: name,
      address: genAddr('bc', 400 + i),
      type: 'mule',
      balance: 24.0 - i * 5.0,
      anomalyScore: 0.89 - i * 0.04,
      predictedClass: 'illicit',
      groundTruth: 'illicit',
      timeStep: 12,
      features: {
        inDegree: 1,
        outDegree: 2,
        transactedVolumeBtc: 50 - i * 10,
        feeRateSats: 32,
        avgNeighborRisk: 0.75,
        temporalVelocity: 12.0,
        burstScore: 0.83,
        circularityIndex: 0.15,
      },
      embedding: [-0.1 - i * 0.1, -0.5 - i * 0.08],
      x: 320 + i * 50,
      y: 420 + (i % 2 === 0 ? 30 : -30),
    });
  });

  // Link peel chain hops sequentially, peeling off funds to mixer
  for (let i = 0; i < peelNodeIds.length - 1; i++) {
    edges.push({
      id: `edge_peel_${i}`,
      source: peelNodeIds[i],
      target: peelNodeIds[i + 1],
      amount: 18.5 - i * 3,
      timestamp: Date.now() - (5 - i) * 80000,
      timeStep: 12,
      attentionWeight: 0.86,
      latencyMs: 0.9,
      isFlagged: true,
      txHash: genTx(12, 300 + i),
      anomalyContribution: 0.88,
    });
    // Peel cut into mixer
    edges.push({
      id: `edge_peel_mixer_${i}`,
      source: peelNodeIds[i],
      target: mixerId,
      amount: 3.5,
      timestamp: Date.now() - (5 - i) * 75000,
      timeStep: 12,
      attentionWeight: 0.91,
      latencyMs: 1.1,
      isFlagged: true,
      txHash: genTx(12, 350 + i),
      anomalyContribution: 0.93,
    });
  }
  // Connect last peel node to mixer
  edges.push({
    id: `edge_peel_mixer_last`,
    source: peelNodeIds[peelNodeIds.length - 1],
    target: mixerId,
    amount: 8.2,
    timestamp: Date.now() - 20000,
    timeStep: 12,
    attentionWeight: 0.93,
    latencyMs: 1.0,
    isFlagged: true,
    txHash: genTx(12, 399),
    anomalyContribution: 0.96,
  });

  // Licit Institutional & Merchant Clusters (Elliptic Licit baseline)
  const licitClusters = [
    { name: 'Coinbase Custody HotWallet', addr: '0x71C...49b2', x: 680, y: 160, bal: 1450.0, deg: 12 },
    { name: 'Kraken Settlement Tier-1', addr: '0x32e...88a1', x: 820, y: 220, bal: 980.0, deg: 10 },
    { name: 'Binance US Liquidity Pool', addr: '0x44d...11c0', x: 740, y: 340, bal: 2100.0, deg: 16 },
    { name: 'Bitstamp Treasury', addr: '0x19a...55f4', x: 880, y: 360, bal: 640.0, deg: 8 },
    { name: 'Institutional Prime Broker', addr: '0x88c...ef22', x: 660, y: 460, bal: 320.0, deg: 6 },
    { name: 'Verified Merchant Gateway', addr: '0x55b...aa19', x: 820, y: 490, bal: 180.0, deg: 5 },
    { name: 'Compliant Payroll SmartContract', addr: '0x02a...9911', x: 920, y: 180, bal: 95.0, deg: 4 },
  ];

  const licitIds: string[] = [];
  licitClusters.forEach((cl, i) => {
    const id = `node_licit_${i + 1}`;
    licitIds.push(id);
    nodes.push({
      id,
      label: cl.name,
      address: cl.addr,
      type: 'licit',
      balance: cl.bal,
      anomalyScore: 0.03 + Math.random() * 0.07, // very low risk
      predictedClass: 'licit',
      groundTruth: 'licit',
      timeStep: 12,
      features: {
        inDegree: cl.deg,
        outDegree: cl.deg - 1,
        transactedVolumeBtc: cl.bal * 3,
        feeRateSats: 20 + Math.random() * 5,
        avgNeighborRisk: 0.05,
        temporalVelocity: 55.0,
        burstScore: 0.12,
        circularityIndex: 0.02,
      },
      embedding: [0.65 + Math.random() * 0.2, 0.1 + Math.random() * 0.4],
      x: cl.x,
      y: cl.y,
    });
  });

  // Interconnect licit nodes with high-volume normal transfers
  for (let i = 0; i < licitIds.length - 1; i++) {
    edges.push({
      id: `edge_licit_${i}`,
      source: licitIds[i],
      target: licitIds[i + 1],
      amount: 45.0 + i * 15,
      timestamp: Date.now() - (i + 1) * 30000,
      timeStep: 12,
      attentionWeight: 0.15 + Math.random() * 0.1,
      latencyMs: 0.8,
      isFlagged: false,
      txHash: genTx(12, 500 + i),
      anomalyContribution: 0.04,
    });
  }
  edges.push({
    id: `edge_licit_cross`,
    source: licitIds[0],
    target: licitIds[2],
    amount: 110.0,
    timestamp: Date.now() - 15000,
    timeStep: 12,
    attentionWeight: 0.18,
    latencyMs: 0.85,
    isFlagged: false,
    txHash: genTx(12, 599),
    anomalyContribution: 0.03,
  });

  // Normal retail user nodes connected to licit exchanges
  for (let i = 1; i <= 8; i++) {
    const id = `node_retail_${i}`;
    nodes.push({
      id,
      label: `Retail Investor #${i}`,
      address: genAddr('1a', 600 + i),
      type: 'licit',
      balance: 1.2 + Math.random() * 4,
      anomalyScore: 0.05 + Math.random() * 0.08,
      predictedClass: 'licit',
      groundTruth: 'licit',
      timeStep: 12,
      features: {
        inDegree: 1,
        outDegree: 1,
        transactedVolumeBtc: 3.5,
        feeRateSats: 22,
        avgNeighborRisk: 0.06,
        temporalVelocity: 2.1,
        burstScore: 0.08,
        circularityIndex: 0.01,
      },
      embedding: [0.75 + Math.random() * 0.15, -0.2 - Math.random() * 0.3],
      x: 700 + (i % 4) * 60,
      y: 80 + Math.floor(i / 4) * 500,
    });

    edges.push({
      id: `edge_retail_${i}`,
      source: id,
      target: licitIds[i % licitIds.length],
      amount: 0.8 + Math.random() * 1.5,
      timestamp: Date.now() - i * 12000,
      timeStep: 12,
      attentionWeight: 0.12,
      latencyMs: 0.7,
      isFlagged: false,
      txHash: genTx(12, 650 + i),
      anomalyContribution: 0.02,
    });
  }

  // Anomalous Rings metadata
  const rings: AnomalousRing[] = [
    {
      id: 'ring_aml_01',
      title: 'Synthetic Identity Ring (Credit Churn Syndicate)',
      patternType: 'Synthetic Identity Ring',
      riskScore: 0.94,
      totalVolume: 88.4,
      nodeIds: ring1NodeIds,
      edgeIds: edges.filter(e => e.id.startsWith('edge_syn')).map(e => e.id),
      detectionTime: '18 seconds ago',
      status: 'Flagged',
      timeStep: 12,
      explanation:
        'Circular fund transfer mesh identified across 6 synthetic identity mule nodes. Spatio-temporal message passing reveals circularity index of 0.96 and rapid transaction velocity with near-zero inter-arrival delta.',
    },
    {
      id: 'ring_aml_02',
      title: 'Fan-In Smurfing (Under-$10k Structuring Syndicate)',
      patternType: 'Smurfing & Layering',
      riskScore: 0.98,
      totalVolume: 49.5,
      nodeIds: [...smurfNodeIds, sinkId],
      edgeIds: edges.filter(e => e.id.startsWith('edge_smurf')).map(e => e.id),
      detectionTime: '45 seconds ago',
      status: 'SAR Filed',
      timeStep: 12,
      explanation:
        '5 synchronized mule nodes depositing $9,900 / ~0.24 BTC equivalent into a single ransomware sink to evade FinCEN Currency Transaction Report (CTR) filing thresholds. High temporal burstiness detected.',
    },
    {
      id: 'ring_aml_03',
      title: 'Multi-Hop Peel Chain Exfiltration via CoinJoin Mixer',
      patternType: 'Peel Chain Exfiltration',
      riskScore: 0.93,
      totalVolume: 74.2,
      nodeIds: [...peelNodeIds, mixerId],
      edgeIds: edges.filter(e => e.id.startsWith('edge_peel')).map(e => e.id),
      detectionTime: '2 minutes ago',
      status: 'Investigating',
      timeStep: 12,
      explanation:
        'Classic laundering peel chain where successive intermediate hops peel off ~3.5 BTC increments into a Wasabi/Tornado style unhosted mixer pool while forwarding remaining balance to the next hop.',
    },
  ];

  return { nodes, edges, rings };
}

// Generate new streaming transactions at the specified TPS
export function generateStreamingTransaction(
  timeStep: number,
  existingNodes: GraphNode[]
): { node?: GraphNode; edge: GraphEdge; isAnomaly: boolean } {
  const isAnomaly = Math.random() < 0.18; // 18% anomaly rate in stream
  const now = Date.now();
  const txHash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;

  if (isAnomaly) {
    // Pick or create a mule node
    const sourceNode = existingNodes.find(n => n.type === 'mule' || n.type === 'illicit') || existingNodes[0];
    const targetNode = existingNodes.find(n => n.type === 'mixer' || n.type === 'sink') || existingNodes[1];

    const amount = Number((Math.random() * 8 + 1.2).toFixed(3));
    const edge: GraphEdge = {
      id: `stream_edge_${now}_${Math.floor(Math.random() * 1000)}`,
      source: sourceNode.id,
      target: targetNode.id,
      amount,
      timestamp: now,
      timeStep,
      attentionWeight: 0.91 + Math.random() * 0.08,
      latencyMs: Number((Math.random() * 4 + 7.5).toFixed(2)), // 7-11ms ONNX inference
      isFlagged: true,
      txHash,
      anomalyContribution: 0.94,
    };
    return { edge, isAnomaly: true };
  } else {
    // Normal licit transfer
    const licitNodes = existingNodes.filter(n => n.type === 'licit');
    const sourceNode = licitNodes[Math.floor(Math.random() * licitNodes.length)] || existingNodes[0];
    const targetNode = licitNodes[Math.floor(Math.random() * licitNodes.length)] || existingNodes[1];

    const amount = Number((Math.random() * 25 + 0.5).toFixed(2));
    const edge: GraphEdge = {
      id: `stream_edge_${now}_${Math.floor(Math.random() * 1000)}`,
      source: sourceNode.id,
      target: targetNode.id,
      amount,
      timestamp: now,
      timeStep,
      attentionWeight: 0.12 + Math.random() * 0.15,
      latencyMs: Number((Math.random() * 3 + 5.2).toFixed(2)), // 5-8ms ONNX inference
      isFlagged: false,
      txHash,
      anomalyContribution: 0.04,
    };
    return { edge, isAnomaly: false };
  }
}
