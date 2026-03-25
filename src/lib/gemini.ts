import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function translateManuscript(input: string | { data: string, mimeType: string }) {
  const model = "gemini-3-flash-preview";
  
  let contents: any;
  if (typeof input === 'string') {
    contents = `You are an expert in ancient Indian manuscripts and linguistics. 
    Please translate and interpret the following text from an ancient Indian manuscript. 
    Provide historical context and linguistic significance if possible.
    
    Text: ${input}`;
  } else {
    contents = {
      parts: [
        { text: "You are an expert in ancient Indian manuscripts and linguistics. Please translate and interpret the text in this image from an ancient Indian manuscript. Provide historical context and linguistic significance if possible." },
        { inlineData: input }
      ]
    };
  }

  const response = await ai.models.generateContent({
    model,
    contents,
  });

  return response.text;
}
