import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GraphNode,
  GraphEdge,
  AnomalousRing,
  InferenceTelemetry,
} from './types';
import {
  generateBaseGraphData,
  generateStreamingTransaction,
  MAX_TIME_STEPS,
  INITIAL_TIME_STEP,
} from './data/ellipticSampleData';
import { stGnnEngine } from './engine/stgnnModel';
import { Header } from './components/Header';
import { GraphCanvas } from './components/GraphCanvas';
import { TemporalControls } from './components/TemporalControls';
import { AnomalyAlertsPanel } from './components/AnomalyAlertsPanel';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';
import { EmbeddingScatterPlot } from './components/EmbeddingScatterPlot';
import { CypherConsole } from './components/CypherConsole';
import { EdgeTelemetryModal } from './components/EdgeTelemetryModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { SarExportModal } from './components/SarExportModal';

export default function App() {
  // Graph state
  const [data, setData] = useState(() => generateBaseGraphData());
  const [currentTimeStep, setCurrentTimeStep] = useState<number>(INITIAL_TIME_STEP);
  const [activeDataset, setActiveDataset] = useState<'elliptic' | 'paysim'>('elliptic');

  // UI state
  const [activeTab, setActiveTab] = useState<'topology' | 'embeddings' | 'cypher'>('topology');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedRing, setSelectedRing] = useState<AnomalousRing | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'anomalies_only' | 'rings_only'>('all');

  // Streaming & TPS Control
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [tpsSpeed, setTpsSpeed] = useState<number>(75); // default 75 TPS (sustaining 50-100 TPS)

  // Modals
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);
  const [showTelemetryModal, setShowTelemetryModal] = useState<boolean>(false);
  const [sarModalState, setSarModalState] = useState<{
    isOpen: boolean;
    ring?: AnomalousRing | null;
    node?: GraphNode | null;
  }>({ isOpen: false });

  // Cypher prefill query
  const [cypherQuery, setCypherQuery] = useState<string | undefined>(undefined);

  // Live Telemetry
  const [telemetry, setTelemetry] = useState<InferenceTelemetry>({
    currentTps: 74.8,
    targetTps: 75,
    avgLatencyMs: 7.8,
    p99LatencyMs: 12.4,
    armCpuLoadPercent: 34.2,
    armNeonVectorOpsPerSec: 1840000,
    memgraphRamUsageMb: 1842,
    totalVpsRamMb: 24576, // 24 GB Oracle Cloud Free Tier
    costPerHourUsd: 0.0,
    totalProcessedTx: 14280,
    detectedAnomaliesCount: 38,
    quantizationMode: 'INT8 Neon SIMD',
    onnxOptimization: 'Level 3 - Graph Fusion & Constant Folding',
    activeEngine: 'Memgraph C++ In-Memory Engine',
  });

  // Reference to avoid stale closures in streaming interval
  const nodesRef = useRef(data.nodes);
  nodesRef.current = data.nodes;
  const edgesRef = useRef(data.edges);
  edgesRef.current = data.edges;

  // Handle live transaction generation based on TPS speed
  useEffect(() => {
    if (!isStreaming) return;

    // Interval fires every 100ms and batches transactions to match target TPS
    const batchIntervalMs = 100;
    const interval = setInterval(() => {
      const txPerBatch = Math.max(1, Math.round((tpsSpeed * batchIntervalMs) / 1000));
      let newEdges: GraphEdge[] = [];
      let anomalyCount = 0;

      for (let i = 0; i < txPerBatch; i++) {
        const streamResult = generateStreamingTransaction(currentTimeStep, nodesRef.current);
        newEdges.push(streamResult.edge);
        if (streamResult.isAnomaly) anomalyCount++;
      }

      // Keep recent edge buffer constrained for smooth UI performance
      setData(prev => ({
        ...prev,
        edges: [...prev.edges.slice(-60), ...newEdges],
      }));

      // Update telemetry with realistic jitter
      const jitter = (Math.random() - 0.5) * 4;
      const effectiveTps = Math.max(50, Math.min(100, tpsSpeed + jitter));

      setTelemetry(prev => ({
        ...prev,
        currentTps: Number(effectiveTps.toFixed(1)),
        totalProcessedTx: prev.totalProcessedTx + txPerBatch,
        detectedAnomaliesCount: prev.detectedAnomaliesCount + anomalyCount,
        avgLatencyMs: Number((7.2 + (tpsSpeed / 100) * 2.5 + Math.random() * 0.6).toFixed(1)),
        armCpuLoadPercent: Number((25 + (tpsSpeed / 100) * 18 + Math.random() * 2).toFixed(1)),
      }));
    }, batchIntervalMs);

    return () => clearInterval(interval);
  }, [isStreaming, tpsSpeed, currentTimeStep]);

  // Handle Time Step scrubber changes (ST-GNN Temporal recurrence step)
  const handleTimeStepChange = (newStep: number) => {
    setCurrentTimeStep(newStep);

    // Compute ST-GNN temporal updates across all nodes
    const updatedNodes = data.nodes.map(node => {
      const { aggregatedScore } = stGnnEngine.computeSpatialMessage(node.id, data.nodes, data.edges);
      const { newScore, newEmbedding } = stGnnEngine.stepTemporalRecurrence(node, aggregatedScore);
      return {
        ...node,
        timeStep: newStep,
        anomalyScore: newScore,
        embedding: newEmbedding,
      };
    });

    setData(prev => ({
      ...prev,
      nodes: updatedNodes,
    }));
  };

  // Switch between Elliptic AML dataset and Kaggle PaySim dataset
  const handleDatasetChange = (dataset: 'elliptic' | 'paysim') => {
    setActiveDataset(dataset);
    const fresh = generateBaseGraphData();
    if (dataset === 'paysim') {
      // Modify labels to show bank accounts / corporate synthetic IDs
      fresh.nodes = fresh.nodes.map(n => ({
        ...n,
        label: n.label.replace('BTC', 'USD').replace('Darknet', 'Wire Sink Corp'),
        address: n.address.replace('0x', 'IBAN-US'),
      }));
    }
    setData(fresh);
    setSelectedNode(null);
    setSelectedRing(null);
  };

  // Inject a synthetic burst attack (e.g. smurfing or fast circular churn)
  const handleInjectSyntheticAttack = () => {
    const now = Date.now();
    const newRingNodes: GraphNode[] = [];
    const newRingNodeIds: string[] = [];

    for (let i = 1; i <= 4; i++) {
      const id = `burst_node_${now}_${i}`;
      newRingNodeIds.push(id);
      const angle = (i / 4) * Math.PI * 2;
      newRingNodes.push({
        id,
        label: `Burst-Syndicate #${i}`,
        address: `0xburst${Math.random().toString(16).slice(2, 8)}`,
        type: 'mule',
        balance: 15.0 + i * 3.5,
        anomalyScore: 0.96,
        predictedClass: 'illicit',
        groundTruth: 'illicit',
        timeStep: currentTimeStep,
        features: {
          inDegree: 3,
          outDegree: 3,
          transactedVolumeBtc: 62.0,
          feeRateSats: 50,
          avgNeighborRisk: 0.95,
          temporalVelocity: 42.0,
          burstScore: 0.98,
          circularityIndex: 0.92,
        },
        embedding: [-0.65 + (Math.random() - 0.5) * 0.1, 0.4 + (Math.random() - 0.5) * 0.1],
        x: 450 + Math.cos(angle) * 80,
        y: 350 + Math.sin(angle) * 80,
      });
    }

    const newRingEdges: GraphEdge[] = [];
    for (let i = 0; i < newRingNodeIds.length; i++) {
      const next = (i + 1) % newRingNodeIds.length;
      newRingEdges.push({
        id: `burst_edge_${now}_${i}`,
        source: newRingNodeIds[i],
        target: newRingNodeIds[next],
        amount: 8.8,
        timestamp: now,
        timeStep: currentTimeStep,
        attentionWeight: 0.95,
        latencyMs: 1.1,
        isFlagged: true,
        txHash: `0x${Math.random().toString(16).slice(2, 10)}`,
        anomalyContribution: 0.96,
      });
    }

    const newRing: AnomalousRing = {
      id: `ring_burst_${now}`,
      title: 'Real-Time Rapid Layering Burst Attack',
      patternType: 'Circular Mixing Loop',
      riskScore: 0.97,
      totalVolume: 35.2,
      nodeIds: newRingNodeIds,
      edgeIds: newRingEdges.map(e => e.id),
      detectionTime: 'Just now',
      status: 'Flagged',
      timeStep: currentTimeStep,
      explanation:
        'Live injected burst attack: 4 high-velocity nodes cycling 8.8 BTC each with near-simultaneous timestamp execution detected by ST-GNN spatial attention.',
    };

    setData(prev => ({
      nodes: [...prev.nodes, ...newRingNodes],
      edges: [...prev.edges, ...newRingEdges],
      rings: [newRing, ...prev.rings],
    }));

    setSelectedRing(newRing);
  };

  // Freeze ring nodes
  const handleFreezeRing = (ringId: string) => {
    setData(prev => ({
      ...prev,
      rings: prev.rings.map(r => (r.id === ringId ? { ...r, status: 'Frozen' } : r)),
    }));
  };

  // Execute Cypher for selected node
  const handleExecuteCypherForNode = (nodeId: string) => {
    setCypherQuery(
      `MATCH (n {id: '${nodeId}'})-[r:TRANSFER]-(neighbor)\nRETURN n.label, type(r), r.amount, neighbor.label, neighbor.anomalyScore;`
    );
    setActiveTab('cypher');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        telemetry={telemetry}
        activeDataset={activeDataset}
        onDatasetChange={handleDatasetChange}
        onOpenArchitecture={() => setShowArchitectureModal(true)}
        onOpenTelemetry={() => setShowTelemetryModal(true)}
        onOpenCypher={() => setActiveTab('cypher')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Center / Primary Viewport */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          {activeTab === 'topology' && (
            <div className="flex-1 relative h-full">
              <GraphCanvas
                nodes={data.nodes}
                edges={data.edges}
                selectedNode={selectedNode}
                selectedRing={selectedRing}
                onSelectNode={setSelectedNode}
                filterMode={filterMode}
              />
            </div>
          )}

          {activeTab === 'embeddings' && (
            <div className="flex-1 p-4 overflow-hidden h-full">
              <EmbeddingScatterPlot
                nodes={data.nodes}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
              />
            </div>
          )}

          {activeTab === 'cypher' && (
            <div className="flex-1 p-4 overflow-hidden h-full">
              <CypherConsole
                nodes={data.nodes}
                edges={data.edges}
                initialQuery={cypherQuery}
              />
            </div>
          )}

          {/* Bottom Temporal Timeline & Streaming Controls */}
          <TemporalControls
            currentTimeStep={currentTimeStep}
            maxTimeSteps={MAX_TIME_STEPS}
            onTimeStepChange={handleTimeStepChange}
            isStreaming={isStreaming}
            onToggleStreaming={() => setIsStreaming(!isStreaming)}
            tpsSpeed={tpsSpeed}
            onTpsSpeedChange={setTpsSpeed}
            filterMode={filterMode}
            onFilterModeChange={setFilterMode}
            onInjectSyntheticAttack={handleInjectSyntheticAttack}
          />
        </div>

        {/* Right Sidebar: Anomalous Subgraphs & Rings List */}
        <div className="w-full lg:w-96 border-l border-slate-800 bg-slate-950/90 flex flex-col h-64 lg:h-full shrink-0">
          <AnomalyAlertsPanel
            rings={data.rings}
            selectedRing={selectedRing}
            onSelectRing={setSelectedRing}
            onGenerateSar={ring => setSarModalState({ isOpen: true, ring })}
            onFreezeRing={handleFreezeRing}
          />
        </div>
      </div>

      {/* Selected Node Inspector Drawer */}
      <NodeDetailDrawer
        node={selectedNode}
        edges={data.edges}
        nodes={data.nodes}
        onClose={() => setSelectedNode(null)}
        onGenerateSar={node => setSarModalState({ isOpen: true, node })}
        onExecuteCypherForNode={handleExecuteCypherForNode}
      />

      {/* Modals */}
      {showArchitectureModal && (
        <ArchitectureModal onClose={() => setShowArchitectureModal(false)} />
      )}

      {showTelemetryModal && (
        <EdgeTelemetryModal
          telemetry={telemetry}
          onClose={() => setShowTelemetryModal(false)}
        />
      )}

      {sarModalState.isOpen && (
        <SarExportModal
          ring={sarModalState.ring}
          node={sarModalState.node}
          onClose={() => setSarModalState({ isOpen: false })}
        />
      )}
    </div>
  );
}
