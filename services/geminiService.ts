
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, FinancialAnalysis, Budget, SavingsGoal, Challenge } from "../types";

export interface UserProfile {
  name?: string;
  goal?: string;
  riskAppetite?: string;
  lifeStage?: string;
}

export interface CardSuggestion {
  cardName: string;
  bank: string;
  annualFee: number;
  rewardRate: string;
  whyThisCard: string;
  estMonthlyCashback: number;
  tier: 'Entry' | 'Mid' | 'Premium';
}

// Exporting ImageSize type for use in VisionBoard component
export type ImageSize = '1K' | '2K' | '4K';

export class GeminiService {
  constructor() {}

  async suggestCreditCards(transactions: Transaction[], profile: UserProfile): Promise<CardSuggestion[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze these 50 recent transactions for ${profile.name || 'the user'}: ${JSON.stringify(transactions.slice(0, 50))}.
    Based on their top spending categories (e.g., Food, Travel, Utilities, Shopping), suggest 3 Indian credit cards that offer the best rewards/cashback.
    
    Return JSON array: [{ "cardName": "...", "bank": "...", "annualFee": 0, "rewardRate": "...", "whyThisCard": "...", "estMonthlyCashback": 0, "tier": "Entry|Mid|Premium" }]`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                cardName: { type: Type.STRING },
                bank: { type: Type.STRING },
                annualFee: { type: Type.NUMBER },
                rewardRate: { type: Type.STRING },
                whyThisCard: { type: Type.STRING },
                estMonthlyCashback: { type: Type.NUMBER },
                tier: { type: Type.STRING }
              },
              required: ["cardName", "bank", "annualFee", "rewardRate", "whyThisCard", "estMonthlyCashback", "tier"]
            }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch (e) {
      return [];
    }
  }

  async generatePersonalizedQuest(transactions: Transaction[], profile: UserProfile): Promise<Partial<Challenge>> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze these transactions: ${JSON.stringify(transactions.slice(0, 50))}.
    The user profile is: ${JSON.stringify(profile)}. User Name: ${profile.name || 'Anonymous'}.
    
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
    goals: SavingsGoal[],
    profile: UserProfile
  ): Promise<FinancialAnalysis> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are a legendary GenZ Wealth Sensei. Analyze this financial profile for ${profile.name || 'the user'}:
    Transactions: ${JSON.stringify(transactions)}
    Budgets: ${JSON.stringify(budgets)}
    Goals: ${JSON.stringify(goals)}
    
    Provide:
    1. Health score (0-100).
    2. A savage but helpful vibe-check summary of spending. Address the user by name. Use punchy GenZ terminology (main character energy, side hustle, L, W, valid, cap).
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
    const prompt = `User Name: ${profile.name || 'Friend'}
    User Profile: ${JSON.stringify(profile)}
    Financial Context: ${JSON.stringify(context)}
    User Question: ${question}
    
    Respond as a cool, hyper-intelligent GenZ Wealth Sensei. Use the user's name periodically. Use Markdown, bolding, and plenty of emojis. Keep it punchy and direct. No corporate speak.`;
    
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
    
    const prompt = `
    TASK: Perform a high-fidelity financial audit for ${profile.name || 'this user'}.
    DATA: ${text}
    USER_PROFILE: ${JSON.stringify(profile)}

    INSTRUCTIONS:
    1. Scan the data for names (e.g., in NEFT descriptions). If you see a name like "MEGHA AGARWAL" and it matches the profile, treat those as primary flows.
    2. If the data includes "goals" or "Side Quests", you MUST create a dedicated section called "QUEST_REALITY_CHECK".
    3. Calculate the "Probability of W" for each goal based on current spending patterns.
    4. Use Markdown tables to compare Budget vs Reality.
    5. Spot anomalies and "L" moves.
    6. Speak like a legendary GenZ Wealth Sensei. Address the user directly by name. Be savage but helpful.
    7. Bold key terms and use emojis.
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

  async generateGoalVisual(prompt: string, size: ImageSize): Promise<string | null> {
    const win = window as any;
    if (typeof window !== 'undefined' && win.aistudio) {
      const hasKey = await win.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await win.aistudio.openSelectKey();
      }
    }

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
      if (error?.message?.includes("Requested entity was not found.") && typeof window !== 'undefined' && win.aistudio) {
        await win.aistudio.openSelectKey();
      }
      return null;
    }
  }
}

export const geminiService = new GeminiService();
