import { GoogleGenAI, Type } from "@google/genai";
import { HeritageSite } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function searchSitesWithAI(query: string, sites: HeritageSite[]): Promise<string[]> {
  if (!query.trim()) return sites.map(s => s.id);

  try {
    const siteContext = sites.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      location: s.location.address,
      description: s.description.substring(0, 100) + "..."
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a heritage travel assistant. Given a user search query and a list of heritage sites in India, return the IDs of the sites that best match the query. 
      
      User Query: "${query}"
      
      Sites:
      ${JSON.stringify(siteContext, null, 2)}
      
      Return only a JSON array of site IDs, ordered by relevance. If no sites match, return an empty array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    const resultIds = Array.isArray(result) ? result : [];
    
    // If AI returns nothing but we have a query, try a simple keyword fallback
    if (resultIds.length === 0 && query.trim().length > 0) {
      const search = query.toLowerCase();
      return sites
        .filter(s => 
          s.name.toLowerCase().includes(search) || 
          s.category.toLowerCase().includes(search) ||
          s.location.address.toLowerCase().includes(search)
        )
        .map(s => s.id);
    }
    
    return resultIds;
  } catch (error) {
    console.error("AI Search Error:", error);
    // Fallback to basic keyword matching if AI fails
    const search = query.toLowerCase();
    return sites
      .filter(s => 
        s.name.toLowerCase().includes(search) || 
        s.category.toLowerCase().includes(search) ||
        s.location.address.toLowerCase().includes(search)
      )
      .map(s => s.id);
  }
}
