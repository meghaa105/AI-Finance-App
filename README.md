# FinVue AI - Smart Personal Finance Hub

FinVue AI is a sophisticated, military-grade personal finance "command center" designed for high-fidelity financial auditing, behavioral intelligence, and AI-driven wealth advisory. Tailored for the Indian economic landscape, it leverages the **Google Gemini 3 Flash** model to provide real-time forensic insights into your cash flow.

![FinVue AI Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000)

## 🚀 Key Features

### 1. Forensic Intelligence Hub
Go beyond simple bar charts. The Intelligence tab performs a behavioral audit on your transactions:
- **Burn Rate Velocity**: Tracks your daily spending speed against historical baselines to detect "lifestyle inflation."
- **Merchant Concentration Index**: Measures "ecosystem lock-in" by calculating what percentage of wealth flows to a single entity (e.g., Amazon, Zomato).
- **Temporal Impulse Radar**: Identifies "Guilty Windows"—specific days (like weekends) where spend volume significantly deviates from norms.
- **Fixed Drain Audit**: Analyzes recurring subscription fatigue and monthly leakage.
- **Micro-Leak Detection**: Specifically flags high-frequency micro-UPI transfers (₹10–₹200) that aggregate into significant monthly outflows.

### 2. Bharat AI Advisor
A dedicated strategic core that acts as a Senior Financial Advisor:
- **Portfolio Pulse**: Analyzes your entire transaction history to provide health scores and macro-trend summaries.
- **Category Deep-Dive**: Target specific sectors (e.g., "Food & Dining") for a 3-month efficiency audit.
- **Forensic Import**: Paste raw, unstructured statement text, and the AI will clean, cluster, and audit it instantly.
- **Strategic Roadmap**: Tailored advice including Indian instruments like NPS, SIPs, and Section 80C optimizations.

### 3. Historical Ledger & Ingestion
- **Statement Ingestion**: A robust CSV parser with intelligent header mapping to import bank statements from any major Indian bank.
- **Audit Workflow**: Mark transactions as *Verified*, *Flagged*, or *Pending* to maintain a clean "source of truth."
- **Advanced Filtering**: Filter by date range, transaction type, or merchant keyword with real-time feedback.

### 4. Wealth Guardrails
- **Budget Tracking**: Visual progress bars for category-specific limits.
- **Savings Goals**: Milestone tracking for "Emergency Funds" or "Home Downpayments" with percentage-based completion logic.

## 🛠 Tech Stack

- **Framework**: React 19 (ES6 Modules)
- **AI Core**: Google Gemini API (`@google/genai`)
- **Styling**: Tailwind CSS (Sophisticated Dark/Light modes, Glassmorphism)
- **Charts**: Recharts (High-performance SVG charting)
- **State Management**: React Hooks + LocalStorage Persistence
- **Typography**: Inter (Black & Bold weights for a "fintech" feel)

## 🏁 Getting Started

### Prerequisites
- A Google Gemini API Key.
- A modern browser with ES6 Module support.

### Environment Configuration
The application expects the following environment variable:
- `process.env.API_KEY`: Your Google Gemini API key.

### Installation
Since this is an ESM-based project, no heavy build step is required if using a compatible runner.
1. Clone the repository.
2. Ensure your execution context has access to the Gemini API key.
3. Open `index.html` via a local development server (like VS Code Live Server).

## 📂 Project Structure

```text
├── components/
│   ├── AIAdvisor.tsx            # AI Strategic Hub
│   ├── ForensicIntelligence.tsx  # Behavioral Analytics
│   ├── HistoricalLedger.tsx     # Transaction Database
│   ├── DashboardCharts.tsx      # SVG Visualizations
│   ├── FloatingChat.tsx         # Real-time AI Assistant
│   └── ...                      # UI Components (Budget, Goals, etc.)
├── services/
│   └── geminiService.ts         # Google GenAI Integration
├── constants.tsx                # Initial state & App constants
├── types.ts                     # TypeScript interfaces & enums
├── App.tsx                      # Root Application Controller
└── index.html                   # Entry point with Tailwind & ESM map
```

## 🛡 Security & Privacy
- **Client-Side Processing**: All data is stored in your browser's `localStorage`.
- **Stateless AI**: Data sent to Gemini is for ephemeral analysis only and is not "remembered" across sessions unless persisted in your own storage.

---
*Built for the next generation of financial transparency.*