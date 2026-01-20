
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, FinancialAnalysis, Budget, SavingsGoal, Challenge } from "../types";

export interface UserProfile {
  goal?: string;
  riskAppetite?: string;
  lifeStage?: string;
}

// Exporting ImageSize type for use in VisionBoard component
export type ImageSize = '1K' | '2K' | '4K';

export class GeminiService {
  constructor() {}

  async generatePersonalizedQuest(transactions: Transaction[], profile: UserProfile): Promise<Partial<Challenge>> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze these transactions: ${JSON.stringify(transactions.slice(0, 50))}.
    The user profile is: ${JSON.stringify(profile)}.
    
    Identify the user's biggest financial "weakness" (category or specific merchant).
    Generate a "Boss Battle" quest to fix it. 
    
    Archetypes to choose from:
    - "Delivery Dragon" (Food delivery)
    - "Subscription Specter" (Recurring costs)
    - "Commute Kraken" (Transport)
    - "Impulse Imp" (Small random spends)
    - "Retail Rogue" (Shopping)
    
    Return JSON: { "title": "UPPERCASE_NAME", "description": "Short GenZ style goal", "type": "no-spend", "reward": 500 }`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING },
              reward: { type: Type.NUMBER }
            },
            required: ["title", "description", "type", "reward"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      return {
        title: "DEFAULT_BOSS",
        description: "Stay under your budget for 48 hours.",
        type: "no-spend",
        reward: 300
      };
    }
  }

  async generateChallengeOutcome(challenge: any, transactions: Transaction[]): Promise<{ status: 'failed' | 'conquered', roast: string, offendingTransactionId?: string }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Review this quest: "${challenge.title}" - ${challenge.description}. 
    Transactions during quest period: ${JSON.stringify(transactions)}. 
    
    Rules for Quest:
    1. If it's a "no-spend" quest, any transaction in the restricted category or merchant is an automatic L.
    2. Check if the user stayed true to the mission.
    
    If they failed, pinpoint EXACTLY which transaction ID caused the failure. 
    ROAST them savagely in GenZ slang for their lack of discipline. 
    If they succeeded, praise them like a Wealth Lord. 
    
    Return as JSON: { "status": "failed" | "conquered", "roast": "text", "offendingTransactionId": "id_here_or_null" }`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              roast: { type: Type.STRING },
              offendingTransactionId: { type: Type.STRING, nullable: true }
            },
            required: ["status", "roast"]
          }
        }
      });
      return JSON.parse(response.text || '{"status": "failed", "roast": "Technical L."}');
    } catch (e) {
      return { status: 'failed', roast: "Database glitched. You got lucky." };
    }
  }

  async analyzeFinance(
    transactions: Transaction[], 
    budgets: Budget[], 
    goals: SavingsGoal[]
  ): Promise<FinancialAnalysis> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are a legendary GenZ Wealth Sensei. Analyze this financial profile:
    Transactions: ${JSON.stringify(transactions)}
    Budgets: ${JSON.stringify(budgets)}
    Goals: ${JSON.stringify(goals)}
    
    Provide:
    1. Health score (0-100).
    2. A savage but helpful vibe-check summary of spending. Use punchy GenZ terminology (main character energy, side hustle, L, W, valid, cap).
    3. 3 strategic "W" moves tailored for the Indian market (SIPs, specific stock sectors, or high-yield savings).
    4. Monthly savings potential in ₹.
    `;

    try {
      const response = await ai.models.generateContent({
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
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return {
        healthScore: 69,
        summary: "Spending is giving chaos energy. We need to secure the bag properly.",
        recommendations: ["Stop the 2AM Zomato L's", "Start a 2k SIP for that long-term W", "Audit those ghost subscriptions"],
        savingsPotential: 4200
      };
    }
  }

  async askFinanceQuestion(question: string, context: any, profile: UserProfile): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `User Profile: ${JSON.stringify(profile)}
    Financial Context: ${JSON.stringify(context)}
    User Question: ${question}
    
    Respond as a cool, hyper-intelligent GenZ Wealth Sensei. Use Markdown, bolding, and plenty of emojis. Keep it punchy and direct. No corporate speak.`;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text || "I'm drawing a blank. Try rephrasing, bestie.";
    } catch (e) {
      return "My brain is fried. Check your connection.";
    }
  }

  async analyzeRawData(text: string, profile: UserProfile): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Enhanced prompt to ensure Savings Goals (Side Quests) are highlighted
    const prompt = `
    TASK: Perform a high-fidelity financial audit.
    DATA: ${text}
    USER_PROFILE: ${JSON.stringify(profile)}

    INSTRUCTIONS:
    1. If the data includes "goals" or "Side Quests" (e.g., iPhone 16 Pro), you MUST create a dedicated section called "QUEST_REALITY_CHECK".
    2. Calculate the "Probability of W" for each goal based on current spending patterns.
    3. Use Markdown tables to compare Budget vs Reality.
    4. Spot anomalies and "L" moves.
    5. Speak like a legendary GenZ Wealth Sensei. Be savage but helpful.
    6. Bold key terms and use emojis.
    `;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
      });
      return response.text || "Nothing found in that wall of text. Is it even valid?";
    } catch (e) {
      return "Error processing raw data. Big L.";
    }
  }

  // Implementation of generateGoalVisual for VisionBoard.tsx
  async generateGoalVisual(prompt: string, size: ImageSize): Promise<string | null> {
    // Check if API Key selection is needed for pro image model as per guidelines
    const win = window as any;
    if (typeof window !== 'undefined' && win.aistudio) {
      const hasKey = await win.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await win.aistudio.openSelectKey();
        // Assuming success as per race condition mitigation guidelines
      }
    }

    // Creating a new GoogleGenAI instance right before the call to use the latest API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: `High-quality, photorealistic visualization of the following financial goal: ${prompt}` }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: size
          }
        },
      });

      // Find the image part in candidates
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (error: any) {
      console.error("Vision Synthesis Error:", error);
      // Reset key selection if entity not found error occurs
      if (error?.message?.includes("Requested entity was not found.") && typeof window !== 'undefined' && win.aistudio) {
        await win.aistudio.openSelectKey();
      }
      return null;
    }
  }
}

export const geminiService = new GeminiService();
