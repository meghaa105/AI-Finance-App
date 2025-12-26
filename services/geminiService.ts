import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, FinancialAnalysis, Budget, SavingsGoal } from "../types";

export interface UserProfile {
  goal?: string;
  riskAppetite?: string;
  lifeStage?: string;
}

/**
 * Supported image sizes for the high-quality image generation model.
 */
export type ImageSize = '1K' | '2K' | '4K';

export class GeminiService {
  constructor() {}

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
    const prompt = `Audit this raw text: "${text}". 
    The user is: ${JSON.stringify(profile)}. 
    Find the receipts, spot the anomalies, and tell them how to win. Use Markdown tables for data. Be direct and use GenZ slang correctly.`;
    
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

  /**
   * Generates a visual representation of a financial goal using the Gemini 3 Pro Image model.
   * Required to fix errors in components/VisionBoard.tsx.
   */
  async generateGoalVisual(prompt: string, size: ImageSize): Promise<string | null> {
    // Handling API key selection for pro image model as required.
    const win = window as any;
    if (win.aistudio) {
      try {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await win.aistudio.openSelectKey();
          // Assume success after opening the dialog to avoid race conditions.
        }
      } catch (err) {
        console.warn("Key selection dialog issue:", err);
      }
    }

    // Always create a fresh instance before API calls to use the latest environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: size
          }
        },
      });

      // Find and extract the image data from the response parts.
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodedString = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            return `data:${mimeType};base64,${base64EncodedString}`;
          }
        }
      }
      return null;
    } catch (error: any) {
      console.error("Image Synthesis Failed:", error);
      // Reset key selection if the model entity wasn't found (likely due to project/billing status).
      if (error?.message?.includes("Requested entity was not found.") && win.aistudio) {
        await win.aistudio.openSelectKey();
      }
      return null;
    }
  }
}

export const geminiService = new GeminiService();