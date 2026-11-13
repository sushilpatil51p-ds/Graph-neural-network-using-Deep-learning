# GraphGuard AI

<div align="center">

**Dynamic Spatio-Temporal Graph Neural Network for Real-Time Fraud Topology & AML Detection**

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PayPal](https://img.shields.io/badge/PayPal-Sandbox_SDK-003087?logo=paypal&logoColor=white)](https://developer.paypal.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> 🏆 **PayPal AI Hackathon Submission** — Meaningful PayPal & AI Integration

</div>

---

## Overview

GraphGuard AI bridges live **PayPal Developer Sandbox** transactions directly into an in-memory **Spatio-Temporal Graph Neural Network (ST-GNN)** and **Google Gemini 2.0 Flash** compliance engine.

Instead of analyzing transactions in isolation, GraphGuard models payments as **directional edges** within a continuous relational graph — immediately exposing multi-hop financial crimes as they happen:

| Crime Pattern | Detection Method |
|---|---|
| 🔴 Synthetic Identity Rings | GATv2 circular attention weight clustering |
| 🟠 Smurfing / CTR Structuring | Fan-in velocity scoring below $10k threshold |
| 🟣 Peel Chain Mixer Exfiltration | Multi-hop topological embedding drift |
| 🟡 Burst Layering Attacks | Temporal velocity spike + burst score |

---

## Architecture

```
                              [ User Checkout ]
                                     │
                                     ▼
                 ┌────────────────────────────────────────┐
                 │     PayPal Developer Sandbox SDK       │
                 │  (Smart Buttons / Capture Completed)   │
                 └───────────────────┬────────────────────┘
                                     │  PAYMENT.CAPTURE.COMPLETED
                                     ▼
                 ┌────────────────────────────────────────┐
                 │    Express REST API  /api/process-tx   │
                 │       Node.js 24  ·  SQLite (in-mem)   │
                 └──────────┬─────────────────────────────┘
                            │
            ┌───────────────┴────────────────┐
            ▼                                ▼
┌──────────────────────────┐   ┌─────────────────────────────┐
│  ST-GNN  ·  Memgraph     │   │    Google Gemini 2.0 Flash  │
│  • GATv2 Spatial Attn    │   │  • FinTech AML Audit Report │
│  • GRU Temporal Recur.   │   │  • Executive Risk Summary   │
│  • 166-Dim Elliptic Emb. │   │  • Regulatory Playbook      │
│  • ONNX INT8 ARM NEON    │   │  • FinCEN SAR Form 111      │
└────────────┬─────────────┘   └──────────────┬──────────────┘
             │                                │
             └────────────────┬───────────────┘
                              ▼
              ┌──────────────────────────────────┐
              │  Live React Dashboard & Canvas   │
              │  • Directional Particle Pulses   │
              │  • Pulsing Halo on Flagged Nodes │
              │  • 50–100 TPS Streaming Engine   │
              │  • Instant FinCEN SAR Export     │
              └──────────────────────────────────┘
```

---

## Features

### 🧠 Spatio-Temporal Graph Neural Network
- **GATv2** (Graph Attention Network v2) spatial message-passing with learnable attention weights `α_uv` across multi-hop transaction neighborhoods
- **GRU** temporal recurrence layer processes structural shifts across 49 sliding time-step windows (Elliptic dataset)
- **ONNX Runtime** INT8 quantization targeting ARM NEON SIMD registers for zero-cost Oracle Cloud Free Tier deployment
- Real-time anomaly scoring from `0.00` (clean) to `1.00` (critical illicit) on every node

### 💳 PayPal Developer Sandbox Integration
- Live **PayPal Smart Buttons** (Orders v2 Capture API) embedded directly in the dashboard
- One-click **Instant Simulate** mode for rapid hackathon demos
- 4 preset fraud scenarios: Licit Commerce, Smurfing/CTR, Synthetic Mule Ring, Mixer Exfiltration
- Every captured payment hits `POST /api/process-transaction`, upserts nodes + edges in SQLite, and optionally creates a frozen AML ring

### 🤖 Google Gemini 2.0 Flash — AI Compliance Engine
- For every transaction, Gemini generates a full **FinTech Fraud & AML Compliance Audit Report**
- Tailored per scenario: explains *why* the graph topology is suspicious, referencing specific GNN feature values
- Deterministic fallback engine built-in — demo never fails even without an API key
- Outputs actionable **regulatory playbook recommendations** (FinCEN 31 CFR § 1010.410, SAR Form 111 filing)

### 📊 Interactive Live Dashboard
- **Graph Topology Canvas** — WebGL-accelerated canvas with pan/zoom, drag nodes, pulsing anomaly halos, directional particle flows
- **Latent Manifold** — 2D scatter plot of GNN node embeddings showing illicit cluster separation
- **Memgraph Cypher Console** — Execute Cypher-like queries against the in-memory graph store
- **Anomaly Alerts Panel** — Real-time ring detection sidebar with Freeze, SAR, and Cypher drill-down actions
- **Node Inspector Drawer** — Full feature vector, embedding, neighborhood risk, and transaction history for any selected node
- **Edge Telemetry Modal** — ARM CPU load, ONNX engine stats, memory usage, TPS telemetry

### 🔐 Authentication & Backend
- JWT-based login (`jsonwebtoken` + `bcryptjs`)
- Node.js 24 native `node:sqlite` — no external database required
- Two default accounts: `analyst / graphguard2024` and `admin / admin2024`

---

## Quick Start

### Prerequisites
- **Node.js** v20+ (v24 recommended)
- **npm** v10+

### 1. Clone & Install

```bash
git clone https://github.com/sushilpatil51p-ds/Graph-neural-network-using-Deep-learning.git
cd graphguard-ai
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```env
# Google Gemini API key — Free at https://aistudio.google.com/apikey
# Leave empty to use the built-in deterministic fallback (demo still works!)
VITE_GEMINI_API_KEY=""

# PayPal Developer Sandbox — https://developer.paypal.com/dashboard/applications/sandbox
# 'test' enables PayPal sandbox UI without real credentials
VITE_PAYPAL_CLIENT_ID="test"
PAYPAL_CLIENT_ID="your_sandbox_client_id"
PAYPAL_CLIENT_SECRET="your_sandbox_client_secret"
PAYPAL_MODE="sandbox"

# Backend
VITE_API_URL="http://localhost:3001"
API_PORT=3001
JWT_SECRET="graphguard-dev-secret-key-2024"
```

### 3. Run Full-Stack

```bash
npm run dev:full
```

This starts:
- **Vite frontend** at `http://localhost:3000`
- **Express + SQLite backend** at `http://localhost:3001`

### 4. Login

| Role | Username | Password |
|---|---|---|
| Analyst | `analyst` | `graphguard2024` |
| Admin | `admin` | `admin2024` |

---

## Demo Walkthrough (3-Minute Hackathon Guide)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Log in as `analyst` | Topology graph loads — green licit institutions on the right, red/amber fraud rings on the left |
| 2 | Observe baseline | 49-step temporal scrubber, 75 TPS live stream, ARM telemetry badge |
| 3 | Click **"Simulate Live PayPal Transaction"** | Select **Scenario 1: Licit Commerce** ($149.99) → Instant Simulate |
| 4 | Show result | Green `CLEAR / LOW RISK` verdict, Gemini compliance summary, node appears in graph |
| 5 | Select **Scenario 2: Smurfing / CTR** ($9,850) → Execute | Red pulsing node connects to Darknet Ransomware Sink |
| 6 | Highlight Gemini output | "$10,000 CTR threshold avoidance · 31 CFR § 1010.410 escrow hold recommendation" |
| 7 | Click **"Open Full PayPal Compliance Dossier"** | Show auto-generated FinCEN SAR Form 111 export |
| 8 | Go to **Latent Manifold** tab | Show illicit cluster separation in 2D embedding space |
| 9 | Click **Inject Burst Attack** | Watch 4 new mule nodes form a live circular ring in real time |

---

## API Reference

All protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | ❌ | Server health + uptime |
| `POST` | `/api/auth/login` | ❌ | Returns JWT token |
| `GET` | `/api/nodes` | ✅ | All graph nodes |
| `GET` | `/api/edges` | ✅ | All transaction edges |
| `GET` | `/api/rings` | ✅ | Detected anomalous rings |
| `POST` | `/api/process-transaction` | ❌ | Ingest PayPal tx into ST-GNN |

### POST `/api/process-transaction`

```json
{
  "orderId": "PAYPAL-SBX-12345678",
  "captureId": "CAP-ABCD1234",
  "senderName": "Alice Johnson",
  "senderEmail": "alice@example.com",
  "receiverEntity": "darknet_ransomware",
  "amount": 9850.00,
  "currency": "USD",
  "scenario": "smurfing_structuring"
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "TX-PP-12345678",
  "status": "FROZEN",
  "riskScore": 0.94,
  "isSuspicious": true,
  "verdict": "CRITICAL / FROZEN",
  "topologyPattern": "Smurfing & Fan-In Structuring",
  "gnnExplanation": "ST-GNN message-passing flagged amount just below $10k CTR threshold...",
  "newNode": { ... },
  "newEdge": { ... }
}
```

---

## Fraud Patterns Detected

### 🔴 Synthetic Identity Credit Churn Ring
6-node circular mesh with near-identical temporal velocities and burst scores > 0.84. GAT attention weights `α_uv > 0.90` confirm circular fund routing. **Risk: 94%**

### 🟠 Smurfing & Fan-In Structuring
5 mule accounts each depositing exactly 9.9 BTC (below the $10,000 CTR reporting threshold) into a single darknet ransomware sink. Classic structuring pattern under 31 CFR § 1010.410. **Risk: 97%**

### 🟣 Peel Chain Exfiltration via CoinJoin Mixer
Multi-hop peel chain where each hop peels off 3.5 BTC into a Wasabi CoinJoin privacy pool while forwarding the remaining balance. **Risk: 91%**

### 🟡 Rapid Layering Burst Attack (Real-Time Inject)
4 high-velocity nodes cycling 8.8 BTC each with near-simultaneous timestamp execution detected by ST-GNN spatial attention. Inject via the **"Inject Burst Attack"** button. **Risk: 97%**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 19, TypeScript 5.8, Vite 6 |
| **Styling** | Tailwind CSS v4, `@tailwindcss/vite` |
| **Icons** | Lucide React |
| **Animations** | Motion (Framer Motion v12) |
| **Graph Rendering** | Native HTML5 Canvas (WebGL-accelerated) |
| **ML Runtime** | ONNX Runtime Web (`onnxruntime-web`) |
| **GNN Architecture** | GATv2 + GRU (simulated, ONNX-ready) |
| **Generative AI** | Google Gemini 2.0 Flash (`@google/genai`) |
| **Payments** | PayPal Orders v2 SDK (`@paypal/react-paypal-js`) |
| **Backend** | Node.js 24, Express 4, TypeScript + `tsx` |
| **Database** | Node.js native `node:sqlite` (in-memory) |
| **Auth** | JWT (`jsonwebtoken`), `bcryptjs` |
| **Dev Tooling** | `concurrently`, `tsx watch`, `typescript` |
| **Containerization** | Docker + Docker Compose + nginx |

---

## Project Structure

```
graphguard-ai/
├── src/
│   ├── components/
│   │   ├── GraphCanvas.tsx          # Canvas-based graph renderer with particles
│   │   ├── Header.tsx               # Top nav with live TPS + telemetry badges
│   │   ├── AnomalyAlertsPanel.tsx   # Real-time ring detection sidebar
│   │   ├── NodeDetailDrawer.tsx     # Node inspector with feature vectors
│   │   ├── EmbeddingScatterPlot.tsx # 2D latent manifold scatter plot
│   │   ├── CypherConsole.tsx        # Memgraph Cypher query terminal
│   │   ├── TemporalControls.tsx     # Time scrubber + TPS streaming controls
│   │   ├── PayPalCheckoutModal.tsx  # PayPal sandbox checkout + GNN bridge
│   │   ├── SarExportModal.tsx       # FinCEN SAR Form 111 auto-generator
│   │   ├── ArchitectureModal.tsx    # System architecture deep-dive
│   │   ├── EdgeTelemetryModal.tsx   # ARM CPU + ONNX telemetry panel
│   │   └── LoginPage.tsx            # JWT auth login screen
│   ├── context/
│   │   └── AuthContext.tsx          # JWT auth state + localStorage persistence
│   ├── data/
│   │   └── ellipticSampleData.ts    # Elliptic AML dataset sample + streaming generator
│   ├── engine/
│   │   ├── stgnnModel.ts            # ST-GNN GAT + GRU simulation engine
│   │   └── onnxInference.ts         # ONNX Runtime Web session wrapper
│   ├── services/
│   │   ├── api.ts                   # REST API client (fetch + auth)
│   │   ├── gemini.ts                # Gemini SAR narrative generator
│   │   └── geminiPayPal.ts          # Gemini PayPal compliance audit
│   ├── types/
│   │   └── index.ts                 # Shared TypeScript type definitions
│   ├── App.tsx                      # Root app + dashboard orchestration
│   ├── main.tsx                     # React entry point
│   └── index.css                    # Tailwind v4 + custom scrollbars + animations
├── server.ts                        # Express REST API + SQLite + JWT backend
├── notebooks/                       # Python GNN training notebooks
├── model/                           # ONNX model artifacts
├── Dockerfile                       # Production Docker image
├── docker-compose.yml               # Multi-service compose (app + nginx)
├── nginx.conf                       # Reverse proxy config
├── vite.config.ts                   # Vite build configuration
├── tsconfig.json                    # TypeScript configuration
├── .env.example                     # Environment variable template
└── package.json                     # Scripts + dependencies
```

---

## Docker Deployment

```bash
# Build and start with Docker Compose
docker compose up --build

# Access at http://localhost:3000
```

The Docker setup includes:
- **Multi-stage build** — TypeScript compiled, assets optimized
- **nginx** reverse proxy on port 80 → Vite static files on :3000, API on :3001
- **ARM64-compatible** — built for Oracle Cloud Free Tier (Ampere A1, 4 OCPU, 24GB RAM)

---

## Roadmap

- [x] Phase 1 — Environment setup, SQLite schema, graph seed data
- [x] Phase 2 — ST-GNN GAT + GRU architecture (simulation)
- [x] Phase 3 — ONNX INT8 export & ARM NEON quantization wrapper
- [x] Phase 4 — Memgraph real-time trigger integration (simulated)
- [x] Phase 5 — 50–100 TPS stress testing (live dashboard)
- [x] Phase 6 — Full dashboard, PayPal SDK, Gemini AI, SAR export
- [ ] WebSocket push streaming layer (server → client live events)
- [ ] Python PyTorch Geometric model training on full Elliptic dataset
- [ ] Production Memgraph Platform Docker deployment
- [ ] FinCEN SAR e-filing API integration

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ for the **PayPal AI Hackathon**

*GraphGuard AI — Because financial crime never sleeps.*

</div>
