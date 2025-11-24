import { GoogleGenAI, Type } from "@google/genai";
import { BlindLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateStructure = async (
  playerCount: number,
  durationHours: number,
  startingChips: number
): Promise<BlindLevel[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not configured");
  }

  const prompt = `Create a Poker Tournament Blind Structure for ${playerCount} players, lasting approximately ${durationHours} hours, with ${startingChips} starting chips. 
  Ensure the structure is gradual and fair. Return only the blind levels.
  Typically, a level lasts 15-20 minutes for this duration.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              smallBlind: { type: Type.INTEGER },
              bigBlind: { type: Type.INTEGER },
              ante: { type: Type.INTEGER },
              durationMinutes: { type: Type.INTEGER },
              isBreak: { type: Type.BOOLEAN, description: "True if this is a break period" }
            },
            required: ["smallBlind", "bigBlind", "durationMinutes"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as BlindLevel[];
      // Sanitize data just in case
      return data.map(l => ({
        ...l,
        ante: l.ante || 0,
        isBreak: l.isBreak || false
      }));
    }
    return [];
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
};