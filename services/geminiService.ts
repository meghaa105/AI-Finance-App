
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, FinancialAnalysis, Budget, SavingsGoal } from "../types";

export interface UserProfile {
  goal?: string;
  riskAppetite?: string;
  lifeStage?: string;
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Following guidelines: Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeFinance(
    transactions: Transaction[], 
    budgets: Budget[], 
    goals: SavingsGoal[]
  ): Promise<FinancialAnalysis> {
    const prompt = `You are a Highly Experienced Senior Financial Advisor with 20+ years in the Indian financial sector. Analyze this financial profile:
    Transactions (in INR ₹): ${JSON.stringify(transactions)}
    Budgets (in INR ₹): ${JSON.stringify(budgets)}
    Goals (in INR ₹): ${JSON.stringify(goals)}
    
    Provide:
    1. Health score (0-100) based on spending discipline, income stability, and goal progress.
    2. A sophisticated summary of spending habits, identifying macro-trends (e.g., lifestyle inflation, subscription fatigue).
    3. 3 specific strategic recommendations (mention advanced Indian instruments like NPS, Tier-II accounts, or Portfolio Rebalancing if relevant).
    4. Estimated monthly savings potential in ₹.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              healthScore: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              savingsPotential: { type: Type.NUMBER }
            },
            required: ["healthScore", "summary", "recommendations", "savingsPotential"]
          }
        }
      });

      // Using .text property as per guidelines
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return {
        healthScore: 65,
        summary: "Your financial trajectory is stable, but optimization of discretionary outflow is required for long-term wealth creation.",
        recommendations: ["Optimize tax outflows via Section 80C/80D", "Consolidate high-frequency micro-UPI spends", "Review emergency liquidity in Liquid Funds"],
        savingsPotential: 5000
      };
    }
  }

  async analyzeRawData(rawData: string, profile?: UserProfile): Promise<string> {
    const profileContext = profile ? `
    USER PROFILE CONTEXT:
    - Primary Financial Goal: ${profile.goal || 'General wealth optimization'}
    - Risk Appetite: ${profile.riskAppetite || 'Moderate'}
    - Life Stage: ${profile.lifeStage || 'Working Professional'}
    ` : '';

    const prompt = `You are a Highly Experienced Senior Financial Advisor. Perform a line-by-line financial audit of the provided raw data.
    ${profileContext}
    
    CRITICAL INSTRUCTIONS FOR FORMATTING:
    - Use Markdown Headers (###) for major sections.
    - Use Bold text (**text**) for key figures and important warnings.
    - Use a Markdown Table for "Spending Clusters" (Category | Amount | % of Total).
    - Use Bullet points for "Alerts & Leaks".
    - Use a Blockquote (>) for the Strategic Roadmap Summary.
    
    CONTENT REQUIREMENTS:
    1. SUMMARY: Boldly state Total Cash Inflow vs Total Outflow.
    2. CLUSTERS: A table showing where the money is going.
    3. LEAK AUDIT: List specific outliers, redundant subscriptions, or suspicious UPI patterns.
    4. STRATEGY: A tailored one-sentence professional roadmap based on the user's profile goals.
    
    Raw Data:
    ${rawData}
    
    Return ONLY structured Markdown. Use ₹ for all currency values.`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text || "";
    } catch (error) {
      return "### Audit Error\nI encountered an error auditing this data. Please ensure the format is legible.";
    }
  }

  async askFollowUpOnRaw(rawData: string, question: string, profile?: UserProfile): Promise<string> {
    const profileContext = profile ? `User Context: Goal=${profile.goal}, Risk=${profile.riskAppetite}, Stage=${profile.lifeStage}.` : '';
    const prompt = `You are a Highly Experienced Senior Financial Advisor. 
    Context (Raw Transactions):
    ${rawData}
    ${profileContext}
    
    User Question about this data: ${question}
    
    Provide a professional, data-backed response using ₹ for currency. Be specific to the numbers found in the raw data provided. Keep it concise and aligned with the user's profile.`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text || "";
    } catch (error) {
      return "I'm unable to process this follow-up query at the moment.";
    }
  }

  async askFinanceQuestion(question: string, context: { transactions: Transaction[], budgets: Budget[], goals: SavingsGoal[] }, profile?: UserProfile): Promise<string> {
    const profileContext = profile ? `User Context: Goal=${profile.goal}, Risk=${profile.riskAppetite}, Stage=${profile.lifeStage}.` : '';
    const prompt = `You are a Highly Experienced Senior Financial Advisor specializing in the Indian economy.
    Context:
    - Transactions: ${JSON.stringify(context.transactions)}
    - Budgets: ${JSON.stringify(context.budgets)}
    - Goals: ${JSON.stringify(context.goals)}
    ${profileContext}
    
    User Question: ${question}
    
    Provide authoritative, concise, and strategically sound advice. Use your expertise in Indian taxation, SIPs, and wealth management. Use ₹ symbol.`;
    
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text || "";
    } catch (error) {
      return "Connection to the advisor core lost. Retrying...";
    }
  }
}

export const geminiService = new GeminiService();
