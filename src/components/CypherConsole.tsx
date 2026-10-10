import React, { useState } from 'react';
import { GraphNode, GraphEdge, CypherQueryResult } from '../types';
import { stGnnEngine } from '../engine/stgnnModel';
import { Terminal, Play, CheckCircle2, Clock, Database, Sparkles, BookOpen } from 'lucide-react';

interface CypherConsoleProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  initialQuery?: string;
}

const PRESET_QUERIES = [
  {
    name: '1. Detect Circular Synthetic Rings',
    query: 'MATCH p=(a:Mule)-[:TRANSFER*3..6]->(a)\nRETURN p, length(p) AS path_len\nLIMIT 5;',
    desc: 'Identifies closed circular fund flows indicating fake identity credit churn syndicates.',
  },
  {
    name: '2. Detect Smurfing & Fan-In Structuring',
    query: 'MATCH (m:Mule)-[r:TRANSFER]->(s:Sink)\nWHERE r.amount < 10.0\nRETURN s.label, count(m) AS fan_in_mules, sum(r.amount) AS total_btc;',
    desc: 'Aggregates micro-transactions just below reporting thresholds to uncover smurfing.',
  },
  {
    name: '3. Filter Critical Anomaly Score (> 0.70)',
    query: 'MATCH (n)\nWHERE n.anomalyScore > 0.70\nRETURN n.id, n.label, n.type, n.anomalyScore, n.balance\nORDER BY n.anomalyScore DESC;',
    desc: 'Extracts all high-risk nodes scored by the ST-GNN ONNX model.',
  },
];

export const CypherConsole: React.FC<CypherConsoleProps> = ({
  nodes,
  edges,
  initialQuery,
}) => {
  const [query, setQuery] = useState(
    initialQuery || PRESET_QUERIES[0].query
  );
  const [result, setResult] = useState<CypherQueryResult>(() =>
    stGnnEngine.executeCypher(initialQuery || PRESET_QUERIES[0].query, nodes, edges)
  );
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRunQuery = (qToRun?: string) => {
    const targetQuery = qToRun || query;
    setIsExecuting(true);
    setTimeout(() => {
      const res = stGnnEngine.executeCypher(targetQuery, nodes, edges);
      setResult(res);
      setIsExecuting(false);
    }, 120);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <Terminal className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              Memgraph In-Memory Cypher Console
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                C++ In-Memory DB
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Low-latency graph queries on subgraphs & multi-hop paths
            </span>
          </div>
        </div>

        {/* Engine status */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Memgraph v2.14 · Port 7687</span>
        </div>
      </div>

      {/* Preset Query Chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {PRESET_QUERIES.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(preset.query);
              handleRunQuery(preset.query);
            }}
            className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/60 text-slate-300 hover:text-purple-300 transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-3 h-3 text-purple-400" />
            <span>{preset.name}</span>
          </button>
        ))}
      </div>

      {/* Query Editor Box */}
      <div className="relative mb-3">
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          rows={3}
          className="w-full bg-slate-950 font-mono text-xs text-purple-200 p-3 rounded-lg border border-slate-800 focus:border-purple-500 focus:outline-none resize-none selection:bg-purple-900"
          placeholder="Enter Cypher query (e.g., MATCH (n) RETURN n LIMIT 10;)"
        />
        <button
          onClick={() => handleRunQuery()}
          disabled={isExecuting}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg transition-all disabled:opacity-50"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isExecuting ? 'Running...' : 'Execute Cypher'}</span>
        </button>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between py-1.5 px-2 bg-slate-950/60 border-t border-b border-slate-800 text-xs font-mono text-slate-400 mb-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Result: {result.rows.length} rows returned</span>
        </div>
        <div className="flex items-center gap-1 text-cyan-400">
          <Clock className="w-3 h-3" />
          <span>Execution time: {result.executionTimeMs} ms</span>
        </div>
      </div>

      {/* Tabular Output */}
      <div className="flex-1 overflow-auto rounded-lg border border-slate-800 bg-slate-950/80 font-mono text-[11px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 sticky top-0">
              {result.columns.map(col => (
                <th key={col} className="p-2 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="border-b border-slate-800/40 hover:bg-slate-900/40 transition-colors"
              >
                {result.columns.map(col => (
                  <td key={col} className="p-2 text-slate-300 whitespace-nowrap">
                    {String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
