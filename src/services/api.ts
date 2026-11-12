import { GraphNode, GraphEdge, AnomalousRing } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function authFetch<T>(endpoint: string, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Session expired — please log in again');
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export const fetchNodes = (token: string): Promise<GraphNode[]> =>
  authFetch<GraphNode[]>('/api/nodes', token);

export const fetchEdges = (token: string): Promise<GraphEdge[]> =>
  authFetch<GraphEdge[]>('/api/edges', token);

export const fetchRings = (token: string): Promise<AnomalousRing[]> =>
  authFetch<AnomalousRing[]>('/api/rings', token);

export async function fetchGraphData(token: string) {
  const [nodes, edges, rings] = await Promise.all([
    fetchNodes(token),
    fetchEdges(token),
    fetchRings(token),
  ]);
  return { nodes, edges, rings };
}
