import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { DatabaseSync } from 'node:sqlite';

const app = express();
const PORT = process.env.API_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'graphguard-secret-key-2024';

app.use(cors());
app.use(express.json());

// ─── SQLite Setup ────────────────────────────────────────────────────────────
const db = new DatabaseSync(':memory:');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'analyst'
  );

  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    label TEXT,
    address TEXT,
    type TEXT,
    balance REAL,
    anomalyScore REAL,
    predictedClass TEXT,
    groundTruth TEXT,
    timeStep INTEGER,
    inDegree REAL, outDegree REAL, transactedVolumeBtc REAL,
    feeRateSats REAL, avgNeighborRisk REAL, temporalVelocity REAL,
    burstScore REAL, circularityIndex REAL,
    embeddingX REAL, embeddingY REAL,
    posX REAL, posY REAL
  );

  CREATE TABLE IF NOT EXISTS edges (
    id TEXT PRIMARY KEY,
    source TEXT, target TEXT,
    amount REAL, timestamp INTEGER, timeStep INTEGER,
    attentionWeight REAL, latencyMs REAL,
    isFlagged INTEGER, txHash TEXT, anomalyContribution REAL
  );

  CREATE TABLE IF NOT EXISTS rings (
    id TEXT PRIMARY KEY,
    title TEXT, patternType TEXT,
    riskScore REAL, totalVolume REAL,
    nodeIds TEXT, edgeIds TEXT,
    detectionTime TEXT, status TEXT,
    timeStep INTEGER, explanation TEXT
  );
`);

// ─── Seed Users ──────────────────────────────────────────────────────────────
const seedUsers = () => {
  const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)');
  insertUser.run('analyst', bcrypt.hashSync('graphguard2024', 10), 'analyst');
  insertUser.run('admin', bcrypt.hashSync('admin2024', 10), 'admin');
  console.log('✓ Users seeded (analyst / admin)');
};

// ─── Seed Graph Data ─────────────────────────────────────────────────────────
const seedGraphData = () => {
  const insertNode = db.prepare(`INSERT OR IGNORE INTO nodes
    (id,label,address,type,balance,anomalyScore,predictedClass,groundTruth,timeStep,
     inDegree,outDegree,transactedVolumeBtc,feeRateSats,avgNeighborRisk,temporalVelocity,burstScore,circularityIndex,
     embeddingX,embeddingY,posX,posY)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

  const insertEdge = db.prepare(`INSERT OR IGNORE INTO edges
    (id,source,target,amount,timestamp,timeStep,attentionWeight,latencyMs,isFlagged,txHash,anomalyContribution)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`);

  const insertRing = db.prepare(`INSERT OR IGNORE INTO rings
    (id,title,patternType,riskScore,totalVolume,nodeIds,edgeIds,detectionTime,status,timeStep,explanation)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`);

  // ── Synthetic Identity Ring ────────────────────────────────────────────────
  const synNodes = [
    { id:'node_syn_1', label:'SynCredit-Alpha', address:'0x9fa1e2...a3b1', type:'mule', balance:18.4, score:0.94, x:200, y:200 },
    { id:'node_syn_2', label:'SynCredit-Bravo', address:'0x7bc3d4...e5f2', type:'mule', balance:22.1, score:0.91, x:300, y:150 },
    { id:'node_syn_3', label:'SynCredit-Charlie', address:'0x4de5f6...7a83', type:'mule', balance:15.7, score:0.88, x:350, y:250 },
    { id:'node_syn_4', label:'SynCredit-Delta', address:'0x1ab2c3...d4e5', type:'mule', balance:19.9, score:0.92, x:300, y:350 },
    { id:'node_syn_5', label:'SynCredit-Echo', address:'0x8ef9a0...b1c2', type:'mule', balance:14.3, score:0.87, x:200, y:350 },
    { id:'node_syn_6', label:'SynCredit-Foxtrot', address:'0x5cd6e7...f8a9', type:'mule', balance:16.8, score:0.84, x:150, y:250 },
  ];
  for (const n of synNodes) {
    insertNode.run(n.id, n.label, n.address, n.type, n.balance, n.score, 'illicit', 'illicit', 12,
      5, 5, 88.4, 34, 0.91, 28.5, 0.88, 0.96, -0.6 + Math.random()*0.2, 0.3 + Math.random()*0.2, n.x, n.y);
  }

  // Syn ring edges (circular)
  for (let i = 0; i < synNodes.length; i++) {
    const next = (i + 1) % synNodes.length;
    insertEdge.run(`edge_syn_${i}`, synNodes[i].id, synNodes[next].id, 14.7, Date.now()-3600000, 12, 0.92, 2.1, 1, `0xsyn${i}hash`, 0.93);
  }

  // ── Smurfing / Fan-In Ransomware Sink ──────────────────────────────────────
  insertNode.run('node_sink_ransomware', 'Darknet Ransomware Sink', '0xdead...beef', 'sink', 125.5, 0.985, 'illicit', 'illicit', 12,
    5, 1, 49.5, 12, 0.97, 38.2, 0.94, 0.35, -0.8, -0.7, 600, 400);

  const smurfNames = ['Smurf-Mule-A','Smurf-Mule-B','Smurf-Mule-C','Smurf-Mule-D','Smurf-Mule-E'];
  for (let i = 0; i < 5; i++) {
    const id = `node_smurf_${i+1}`;
    insertNode.run(id, smurfNames[i], `0xsmurf${i+1}...addr`, 'mule', 9.9, 0.87+i*0.02, 'illicit', 'illicit', 12,
      1, 1, 9.9, 22, 0.89, 15.4, 0.78, 0.12, -0.4+i*0.08, -0.5+i*0.05, 450+i*40, 300+i*30);
    insertEdge.run(`edge_smurf_${i}`, id, 'node_sink_ransomware', 9.9, Date.now()-1800000, 12, 0.94, 1.8, 1, `0xsmurf${i}tx`, 0.95);
  }

  // ── Peel Chain → CoinJoin Mixer ────────────────────────────────────────────
  insertNode.run('node_mixer_wasabi', 'Wasabi CoinJoin Pool', '0xwasabi...mix', 'mixer', 340.0, 0.96, 'illicit', 'illicit', 12,
    4, 8, 280.0, 5, 0.94, 45.0, 0.82, 0.78, -0.9, -0.4, 750, 250);

  const peelNames = ['Peel-Hop-1','Peel-Hop-2','Peel-Hop-3','Peel-Hop-4'];
  for (let i = 0; i < 4; i++) {
    const id = `node_peel_${i+1}`;
    insertNode.run(id, peelNames[i], `0xpeel${i+1}...addr`, 'mule', 14.0-i*2, 0.82+i*0.03, 'illicit', 'illicit', 12,
      1, 2, 14.0-i*2, 18, 0.85, 20.0, 0.72, 0.45, -0.7+i*0.1, -0.2+i*0.1, 650+i*30, 180+i*40);
    insertEdge.run(`edge_peel_${i}`, id, 'node_mixer_wasabi', 3.5, Date.now()-900000, 12, 0.88, 2.3, 1, `0xpeel${i}tx`, 0.87);
  }

  // ── Licit Institutions ─────────────────────────────────────────────────────
  const licitNodes = [
    { id:'node_coinbase', label:'Coinbase Custody', balance:2100.0, score:0.03, x:800, y:100 },
    { id:'node_kraken', label:'Kraken Settlement', balance:1450.0, score:0.05, x:850, y:180 },
    { id:'node_binance', label:'Binance US', balance:980.0, score:0.04, x:900, y:120 },
    { id:'node_bitstamp', label:'Bitstamp Treasury', balance:720.0, score:0.06, x:820, y:250 },
    { id:'node_gemini', label:'Gemini Trust', balance:560.0, score:0.07, x:870, y:300 },
    { id:'node_retail_1', label:'Retail User A', balance:0.85, score:0.05, x:780, y:350 },
    { id:'node_retail_2', label:'Retail User B', balance:1.2, score:0.08, x:830, y:400 },
    { id:'node_retail_3', label:'Retail User C', balance:0.42, score:0.06, x:880, y:380 },
    { id:'node_retail_4', label:'Retail Trader D', balance:3.5, score:0.10, x:750, y:420 },
    { id:'node_retail_5', label:'Retail HODLer E', balance:12.0, score:0.04, x:920, y:350 },
  ];
  for (const n of licitNodes) {
    insertNode.run(n.id, n.label, `0x${n.id.slice(5)}...safe`, 'licit', n.balance, n.score, 'licit', 'licit', 12,
      3, 3, n.balance*0.1, 8, 0.05, 2.5, 0.08, 0.04, 0.5+Math.random()*0.4, 0.5+Math.random()*0.4, n.x, n.y);
  }

  // Licit edges
  for (let i = 0; i < licitNodes.length - 1; i++) {
    insertEdge.run(`edge_licit_${i}`, licitNodes[i].id, licitNodes[i+1].id,
      0.5+Math.random()*5, Date.now()-7200000, 12, 0.15, 3.2, 0, `0xlicit${i}tx`, 0.05);
  }

  // ── Rings ──────────────────────────────────────────────────────────────────
  insertRing.run('ring_syn_1', 'Synthetic Identity Credit Churn Ring',
    'Synthetic Identity Ring', 0.94, 88.4,
    JSON.stringify(synNodes.map(n=>n.id)),
    JSON.stringify(synNodes.map((_,i)=>`edge_syn_${i}`)),
    '2.4 hours ago', 'Investigating', 12,
    '6-node circular credit churn mesh cycling 88.4 BTC with near-identical temporal velocity patterns. All nodes exhibit burst scores >0.84 and circularity indices >0.92.');

  insertRing.run('ring_smurf_1', 'Smurfing & Fan-In Structuring to Ransomware Sink',
    'Smurfing & Layering', 0.97, 49.5,
    JSON.stringify(['node_sink_ransomware',...smurfNames.map((_,i)=>`node_smurf_${i+1}`)]),
    JSON.stringify(smurfNames.map((_,i)=>`edge_smurf_${i}`)),
    '1.1 hours ago', 'Flagged', 12,
    '5 smurf mules each depositing exactly 9.9 BTC (below 10.0 CTR threshold) into a single darknet ransomware sink. Classic structuring pattern.');

  insertRing.run('ring_peel_1', 'Peel Chain Exfiltration via CoinJoin Mixer',
    'Peel Chain Exfiltration', 0.91, 14.0,
    JSON.stringify(['node_mixer_wasabi',...peelNames.map((_,i)=>`node_peel_${i+1}`)]),
    JSON.stringify(peelNames.map((_,i)=>`edge_peel_${i}`)),
    '45 minutes ago', 'Investigating', 12,
    'Multi-hop peel chain where each hop peels off 3.5 BTC into a Wasabi CoinJoin pool while forwarding remaining balance.');

  console.log(`✓ Seeded ${synNodes.length + 5 + 4 + 1 + licitNodes.length} nodes, ${synNodes.length + 5 + 4 + licitNodes.length - 1} edges, 3 rings`);
};

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  try {
    const payload = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: number; username: string; role: string };
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ─── Routes ──────────────────────────────────────────────────────────────────

// Public health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', engine: 'GraphGuard AI API', uptime: process.uptime() });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!row || !bcrypt.compareSync(password, row.password)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ userId: row.id, username: row.username, role: row.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: row.id, username: row.username, role: row.role } });
});

// Get nodes (protected)
app.get('/api/nodes', authMiddleware, (_req, res) => {
  const rows = db.prepare('SELECT * FROM nodes').all() as any[];
  const nodes = rows.map(r => ({
    id: r.id, label: r.label, address: r.address, type: r.type,
    balance: r.balance, anomalyScore: r.anomalyScore,
    predictedClass: r.predictedClass, groundTruth: r.groundTruth,
    timeStep: r.timeStep,
    features: {
      inDegree: r.inDegree, outDegree: r.outDegree,
      transactedVolumeBtc: r.transactedVolumeBtc, feeRateSats: r.feeRateSats,
      avgNeighborRisk: r.avgNeighborRisk, temporalVelocity: r.temporalVelocity,
      burstScore: r.burstScore, circularityIndex: r.circularityIndex,
    },
    embedding: [r.embeddingX, r.embeddingY] as [number, number],
    x: r.posX, y: r.posY,
  }));
  res.json(nodes);
});

// Get edges (protected)
app.get('/api/edges', authMiddleware, (_req, res) => {
  const rows = db.prepare('SELECT * FROM edges').all() as any[];
  const edges = rows.map(r => ({
    id: r.id, source: r.source, target: r.target,
    amount: r.amount, timestamp: r.timestamp, timeStep: r.timeStep,
    attentionWeight: r.attentionWeight, latencyMs: r.latencyMs,
    isFlagged: !!r.isFlagged, txHash: r.txHash,
    anomalyContribution: r.anomalyContribution,
  }));
  res.json(edges);
});

// Get rings (protected)
app.get('/api/rings', authMiddleware, (_req, res) => {
  const rows = db.prepare('SELECT * FROM rings').all() as any[];
  const rings = rows.map(r => ({
    id: r.id, title: r.title, patternType: r.patternType,
    riskScore: r.riskScore, totalVolume: r.totalVolume,
    nodeIds: JSON.parse(r.nodeIds), edgeIds: JSON.parse(r.edgeIds),
    detectionTime: r.detectionTime, status: r.status,
    timeStep: r.timeStep, explanation: r.explanation,
  }));
  res.json(rings);
});

// ─── Init & Start ────────────────────────────────────────────────────────────
seedUsers();
seedGraphData();

app.listen(PORT, () => {
  console.log(`\n🚀 GraphGuard AI API running at http://localhost:${PORT}`);
  console.log(`   POST /api/auth/login  → Get JWT token`);
  console.log(`   GET  /api/nodes       → Graph nodes (auth required)`);
  console.log(`   GET  /api/edges       → Transaction edges (auth required)`);
  console.log(`   GET  /api/rings       → Anomalous rings (auth required)`);
  console.log(`   GET  /api/health      → Public health check\n`);
});
