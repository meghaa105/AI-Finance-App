# FinVue AI: System Architecture & AI Integration

## 1. System Overview
FinVue AI is architected as a **stateless, client-side progressive web application (PWA)** that leverages local browser storage for data persistence and Google's Gemini LLMs for ephemeral, real-time financial intelligence. 

By eliminating the need for a traditional backend database, the application achieves **zero-latency interactions** (excluding network calls to the LLM) and guarantees **100% user data privacy**—a critical requirement for financial applications.

## 2. AI Integration Strategy
The core of FinVue AI relies on the `@google/genai` SDK. We utilize a multi-model approach to balance speed, cost, and capability:

### 2.1. Deterministic Data Structuring (Gemini 3 Flash)
For high-frequency tasks like categorization, tagging, and credit card recommendations, we utilize **Gemini 3 Flash**.
- **Challenge:** LLMs natively output unstructured text, which breaks UI components expecting strict data types.
- **Solution:** We enforce strict JSON Schema generation using the `responseSchema` configuration in the API. This guarantees that the LLM returns parsable objects (e.g., `CardSuggestion[]` or `Challenge`) rather than conversational prose, allowing seamless integration with React state.

### 2.2. Multimodal Goal Synthesis (Gemini 3 Flash Image)
For the "Wealth Boss Battles" and Savings Goals, we generate dynamic, high-fidelity visual representations of the user's financial objectives.
- **Implementation:** The user's text-based goal is augmented via a prompt pipeline to request a "High-quality, photorealistic visualization" and sent to `gemini-3-flash-image`.
- **Output:** The resulting base64 encoded image is rendered directly in the client, providing a gamified, highly personalized experience without requiring external image hosting.

### 2.3. Forensic Text Ingestion (Gemini 3 Pro)
Bank statements in India often contain highly unstructured, poorly formatted text (e.g., NEFT/IMPS narratives).
- **Implementation:** We pass the raw text dump to **Gemini 3 Pro** with a highly constrained system prompt instructing it to act as a "Forensic Financial Auditor."
- **Output:** The model parses the narrative, identifies anomalies, and outputs Markdown-formatted tables and health scores that the React frontend parses and renders into interactive dashboards.

## 3. Data Flow & State Management
1. **Ingestion:** Bank statement data is parsed locally via PapaParse (CSV) or manually pasted.
2. **State:** Data is held in React Context/Hooks and persisted to `localStorage`.
3. **AI Augmentation:** When an insight is requested, a subset of the transaction history (e.g., the last 50 transactions to optimize token usage) is serialized into the prompt context.
4. **Execution:** The request is sent directly from the client to the Google GenAI endpoint.
5. **Rendering:** The JSON response is parsed and immediately reflected in the UI (e.g., Recharts visualizations or the AI Advisor chat).

## 4. Prompt Engineering Patterns
We utilize several advanced prompt engineering patterns:
- **Persona Adoption:** The AI is strictly instructed to act as a "GenZ Wealth Sensei," ensuring the tone remains engaging and avoids generic corporate finance advice.
- **Few-Shot Prompting:** When evaluating transactions, we provide the schema structure and expected rules (e.g., "If it's a 'no-spend' quest, any transaction in the restricted category is an L").
- **Context Window Optimization:** Instead of sending the user's entire multi-year financial history, we aggregate data into macro-statistics (Total In, Total Out, Category Averages) and only send raw arrays for recent transactions. This drastically reduces latency and token costs.

## 5. Future Scalability
While currently a client-side application, the architecture is designed to support a Backend-for-Frontend (BFF) pattern. The `GeminiService` class can easily be migrated to a Node.js/Edge function layer to hide the API key and implement rate-limiting, should the application move to a SaaS model.
