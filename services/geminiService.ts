
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION, MODEL_PRO, MODEL_FAST } from "../constants";
import { Cell, SpreadsheetState } from "../types";

export class OmniAIService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: (process.env.API_KEY as string) });
  }

  async processNaturalLanguageInstruction(
    instruction: string, 
    context: SpreadsheetState
  ) {
    // We send a snapshot of the relevant context to the model
    const contextSnippet = Object.entries(context.cells)
      .slice(0, 50) // Limit context for performance/token safety
      .map(([id, cell]) => `${id}: ${cell.computedValue || cell.rawValue}`)
      .join(', ');

    const prompt = `
      User Instruction: ${instruction}
      Current Sheet State (partial): ${contextSnippet}
      
      Respond with a JSON object containing:
      - reasoning: string (explanation of what you'll do)
      - cellUpdates: Array<{id: string, value: string}>
      - suggestions: string[] (other things the user might want)
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_PRO,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reasoning: { type: Type.STRING },
              cellUpdates: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    value: { type: Type.STRING }
                  },
                  required: ["id", "value"]
                }
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["reasoning", "cellUpdates"]
          }
        }
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("AI Error:", error);
      throw error;
    }
  }

  async explainFormula(formula: string) {
    const response = await this.ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Explain what this spreadsheet formula does in simple terms: ${formula}`,
      config: { systemInstruction: "You are a helpful spreadsheet expert assistant." }
    });
    return response.text;
  }
}

export const omniAI = new OmniAIService();
