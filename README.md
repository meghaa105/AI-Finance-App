# FinVue AI - Smart Personal Finance Hub

FinVue AI is a sophisticated, military-grade personal finance "command center" designed for high-fidelity financial auditing, behavioral intelligence, and AI-driven wealth advisory. Tailored for the Indian economic landscape, it leverages the **Google Gemini 3 Flash** model to provide real-time forensic insights into your cash flow.

![FinVue AI Dashboard](https://drive.google.com/file/d/1mptcRsEsY4TtcG6g6i3eztHEseOoe_Hv/view?usp=sharing)

## 🚀 Key Features

### Forensic Intelligence Hub
Go beyond simple bar charts. The Intelligence tab performs a behavioral audit on your transactions:
- **Burn Rate Velocity**: Tracks your daily spending speed against historical baselines to detect "lifestyle inflation."
- **Merchant Concentration Index**: Measures "ecosystem lock-in" by calculating what percentage of wealth flows to a single entity (e.g., Amazon, Zomato).
- **Temporal Impulse Radar**: Identifies "Guilty Windows"—specific days (like weekends) where spend volume significantly deviates from norms.
- **Fixed Drain Audit**: Analyzes recurring subscription fatigue and monthly leakage.
- **Micro-Leak Detection**: Specifically flags high-frequency micro-UPI transfers (₹10–₹200) that aggregate into significant monthly outflows.

### ⚡ Smart Insights & Analytics
- **Behavioral Spending Trends:** The `SmartInsights` engine analyzes week-over-week burn rates and flags anomalous spending spikes.
- **Predictive Budgeting:** Forecasts end-of-month budget adherence based on current daily average spending.
- **Interactive Visualizations:** High-performance charting using `Chart.js` for income vs. expense breakdowns and category heatmaps.

### Bharat AI Advisor
A dedicated strategic core that acts as a Senior Financial Advisor:
- **Portfolio Pulse**: Analyzes your entire transaction history to provide health scores and macro-trend summaries.
- **Category Deep-Dive**: Target specific sectors (e.g., "Food & Dining") for a 3-month efficiency audit.
- **Forensic Import**: Paste raw, unstructured statement text, and the AI will clean, cluster, and audit it instantly.
- **Strategic Roadmap**: Tailored advice including Indian instruments like NPS, SIPs, and Section 80C optimizations.

### Historical Ledger & Ingestion
- **Statement Ingestion**: A robust CSV parser with intelligent header mapping to import bank statements from any major Indian bank.
- **Audit Workflow**: Mark transactions as *Verified*, *Flagged*, or *Pending* to maintain a clean "source of truth."
- **Advanced Filtering**: Filter by date range, transaction type, or merchant keyword with real-time feedback.

### Wealth Guardrails
- **Budget Tracking**: Visual progress bars for category-specific limits.
- **Savings Goals**: Milestone tracking for "Emergency Funds" or "Home Downpayments" with percentage-based completion logic.

### 🎨 Modern UI/UX
- **Smooth Animations:** Integrated `Framer Motion` and `GSAP` for fluid page transitions and micro-interactions.
- **Responsive & Themed:** Fully responsive Tailwind CSS architecture with native support for Light/Dark modes.

---

## 🏗️ System Architecture & AI Integration

FinVue AI is architected as a **stateless, client-side progressive web application (PWA)**. By eliminating a traditional backend database, the application achieves zero-latency interactions and total data sovereignty.

### 1. AI Integration Strategy
We utilize a multi-model approach via the `@google/genai` SDK to balance speed and capability:

* **Deterministic Data Structuring (Gemini 3 Flash):** Enforces strict JSON Schema generation for categorization and tagging. This ensures the LLM returns parsable objects (e.g., `CardSuggestion[]`) rather than conversational prose.
* **Multimodal Goal Synthesis (Gemini 3 Flash Image):** Generates dynamic, high-fidelity visual representations for "Wealth Boss Battles" and Savings Goals using `gemini-3-flash-image`.
* **Forensic Text Ingestion (Gemini 3 Pro):** Acts as a "Forensic Financial Auditor" to parse highly unstructured Indian bank statement narratives (NEFT/IMPS) into structured Markdown tables.

### 2. Data Flow & State Management
1.  **Ingestion:** Data is parsed locally via PapaParse or PDF.js.
2.  **State:** Data is held in React Context/Hooks and persisted to `localStorage`.
3.  **AI Augmentation:** A subset of transaction history (e.g., the last 50 transactions) is serialized into the prompt context to optimize token usage.
4.  **Execution:** Requests are sent directly from the client to the Google GenAI endpoint.
5.  **Rendering:** JSON responses are immediately reflected in the UI via Recharts or the AI Advisor chat.

### 3. Prompt Engineering Patterns
- **Persona Adoption:** The AI is instructed to act as a "GenZ Wealth Sensei" to keep advice engaging.
- **Few-Shot Prompting:** Providing schema structures and expected rules for "no-spend" quest evaluations.
- **Context Window Optimization:** Aggregating data into macro-statistics (Total In/Out) to reduce latency and costs.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 13](https://nextjs.org/) (App Router)
- **UI Library**: [React 18](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Visualizations**: [Chart.js](https://www.chartjs.org/) & [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://greensock.com/gsap/)
- **AI Integration**: Google AI Studio (Gemini 3 Flash & Pro)

---

## 🏁 Getting Started

### Prerequisites
- A Google Gemini API Key.
- A modern browser with ES6 Module support.
- npm or yarn

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

 ## 🔒 Privacy Guarantee
 This application does **not** have a backend server or a remote database.
- All data is stored strictly in your browser's `localStorage`.
- Parsing of CSVs and standard text occurs completely offline.
- If utilizing AI features (like complex PDF statement parsing via Gemini), the text is sent ephemerally to the LLM endpoint but is never saved by the application- *Note:
Clearing your browser cache/data will remove your transaction history unless you have manually exported it.*

 ## 📄 License
 MIT License - feel free to use, modify, and deploy for personal use.

