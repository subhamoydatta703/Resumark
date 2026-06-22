import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

// Initialize the Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function analyzeWithGemini(extractedText: string): Promise<string> {
  if(!extractedText) {
    throw new Error("No extracted text provided");
  }

  const maxRetries = 3;
  let delay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
         model: "gemini-3.1-flash-lite",
contents: `
Analyze the following resume.

Return ONLY valid JSON.

{
  "candidateInfo": {
    "name": "",
    "email": "",
    "phone": "",
    "location": ""
  },
  "summary": "",
  "skills": [],
  "strengths": [],
  "improvements": [],
  "overallScore": 0,
  "atsScore": 0,
  "formattingScore": 0,
  "suggestedRoles": []
}

Rules:
- Return ONLY JSON.
- Do not include markdown.
- Do not include explanation text.
- Do not wrap JSON in code blocks.
- Scores must be integers between 0 and 100.
- If information is missing, use null or an empty string.

Resume:
${extractedText}
`, 
      });

      // console.log("Gemini Response:\n", response.text);
      return response.text ?? "";
    } catch (error: any) {
      console.error(`Attempt ${attempt} calling Gemini API failed:`, error);
      
      const isTransient = error?.status === 503 || error?.status === 429 || 
                          (error?.message && (error.message.includes("503") || error.message.includes("high demand") || error.message.includes("429") || error.message.includes("UNAVAILABLE")));

      if (isTransient && attempt < maxRetries) {
        console.log(`Transient error (503/429/UNAVAILABLE) encountered. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed to call Gemini API after maximum retries");
}

// runAIBackend();
