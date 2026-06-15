import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

// Initialize the Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function analyzeWithGemini(extractedText: string): Promise<string> {
  try {
    if(!extractedText) {
      throw new Error("No extracted text provided");
    }
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
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

// runAIBackend();
