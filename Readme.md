# GraphGuard AI: Dynamic Spatio-Temporal GNN for Real-Time Fraud Topology & AML
### 🏆 PayPal AI Hackathon Submission — Meaningful PayPal & AI Integration

GraphGuard AI bridges live **PayPal Developer Sandbox** transactions directly into an in-memory **Spatio-Temporal Graph Neural Network (ST-GNN)** and **Google Gemini 2.0 Flash** compliance engine.

Instead of analyzing transactions in isolation, GraphGuard models payments as directional edges within a continuous relational graph, immediately exposing multi-hop financial crimes (Synthetic Identity Rings, Structuring/Smurfing below CTR thresholds, and Peel Chain Mixer Exfiltration) as they happen.

---

## ⚡ The PayPal & AI Dual Integration

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
                     │ Express REST API: /api/process-tx      │
                     └───────────────────┬────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
┌───────────────────────────────────────┐   ┌───────────────────────────────────┐
│     ST-GNN & Memgraph Graph Engine    │   │      Google Gemini 2.0 Flash      │
│  • Graph Attention (GAT) Aggregation  │   │  • FinTech AML Compliance Audit   │
│  • Dynamic Node Embedding Drift       │   │  • Executive Risk Finding Summary │
│  • 166-Dim Elliptic Topological Space │   │  • Regulatory Playbook Directives │
│  • Anomaly Scoring (0.00 – 1.00)      │   │  • Structured SAR Form 111 Dossier│
└───────────────────┬───────────────────┘   └─────────────────┬─────────────────┘
                    │                                         │
                    └────────────────────┬────────────────────┘
                                         ▼
                     ┌────────────────────────────────────────┐
                     │ Live React Dashboard & Visual Canvas   │
                     │  • Directional Particle Pulse Flows    │
                     │  • Pulsing Halo on Flagged Senders     │
                     │  • Instant FinCEN SAR Filing Dossier   │
                     └────────────────────────────────────────┘
```

1. **PayPal Sandbox Checkout & Feed**:
   - Use the **"Simulate Live PayPal Transaction"** button in the header.
   - Choose between **Licit Commerce**, **Smurfing / Structuring ($9,850)**, **Synthetic Mule Ring ($4,200)**, or **Mixer Exfil ($18,500)**.
   - Authorize payments using live PayPal Smart Buttons or one-click Instant Capture.
2. **Real-Time ST-GNN Ingestion**:
   - Payments hit `POST /api/process-transaction`, upserting sender/receiver nodes and edges in SQLite / Memgraph.
   - Spatio-temporal message passing computes neighbor risk ($\alpha_{uv}$ attention weights) and updates the 2D latent manifold in real-time.
3. **Gemini 2.0 Flash AI Compliance Audit**:
   - For every transaction, Gemini generates a tailored **FinTech Compliance Audit Report** explaining *why* the transaction was flagged or cleared with actionable regulatory playbook recommendations.

---

## 🚀 Quick Start (Local Run)

### 1. Prerequisites
- **Node.js** (v20+ or v24 recommended)
- **npm** (v10+)
- **Python** (v3.10+ optional, for training ONNX models)

### 2. Environment Configuration
Create or update your `.env` (or `.env.local`):
```env
# Google Gemini API key (Free at https://aistudio.google.com/apikey)
VITE_GEMINI_API_KEY="your_gemini_api_key_here"

# PayPal Developer Sandbox (https://developer.paypal.com/dashboard/applications/sandbox)
VITE_PAYPAL_CLIENT_ID="your_sandbox_client_id"
PAYPAL_CLIENT_ID="your_sandbox_client_id"
PAYPAL_CLIENT_SECRET="your_sandbox_client_secret"
PAYPAL_MODE="sandbox"

# Backend & JWT
VITE_API_URL="http://localhost:3001"
API_PORT=3001
JWT_SECRET="graphguard-dev-secret-key-2024"
```
*(Note: If no Gemini API key is provided, the system falls back to a deterministic FinTech compliance report engine so the demo never fails.)*

### 3. Install & Run Full-Stack (Frontend + Backend)
```bash
# Install dependencies
npm install

# Run Vite frontend (:3000) and Express REST API (:3001) simultaneously
npm run dev:full
```

Open **http://localhost:3000** in your browser.

**Default Login Credentials:**
- Username: `analyst`
- Password: `graphguard2024`

*(Alternative admin account: `admin` / `admin2024`)*

---

## 🎥 3-Minute Demo Video Recording Guide

1. **Sign In**: Log in with `analyst` / `graphguard2024`.
2. **Baseline Overview**: Point out the live topology graph (green = licit institutions, red/amber = flagged syndicates), 49 time-step scrubber, and 75 sustained TPS.
3. **Trigger Licit PayPal Payment**:
   - Click **"Simulate Live PayPal Transaction"** in the top navigation bar.
   - Select Scenario 1: **"Licit Commerce"** ($149.99).
   - Click **"Simulate PayPal Payment Capture & Audit"** (or use the gold PayPal Sandbox button).
   - Show the green **"CLEAR / LOW RISK"** verdict and Gemini compliance explanation.
4. **Trigger AML Smurfing / Structuring Attack**:
   - Select Scenario 2: **"Smurfing / CTR Structuring"** ($9,850.00).
   - Execute capture.
   - Watch the transaction node inject directly into the graph canvas with a pulsing red halo connecting to the Darknet Ransomware Sink.
   - Highlight the **Gemini 2.0 Flash Compliance Summary** flagging the $10,000 threshold avoidance and 31 CFR § 1010.410 escrow hold recommendation.
5. **Regulatory SAR Dossier**: Click **"Open Full PayPal Compliance Dossier"** to view the auto-generated FinCEN Form 111 electronic filing ready for export.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide Icons, `@paypal/react-paypal-js`
- **Machine Learning**: Spatio-Temporal Graph Neural Network (GAT + GRU), ONNX Runtime Web (`onnxruntime-web`), GradientBoostingClassifier
- **Generative AI**: Google Gemini API (`@google/genai`, model `gemini-2.0-flash`)
- **Backend**: Node.js 24 with native SQLite (`node:sqlite`), Express, JWT (`jsonwebtoken`), `bcryptjs`, CORS
- **Payments**: PayPal Developer Sandbox (Orders v2 / Capture API)
