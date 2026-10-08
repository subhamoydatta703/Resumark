import { scanContent, GuardrailBlockedError, type GuardrailStage } from "./scanner";
import { analyzeWithGemini } from "../services/geminiService";
import { AnalysisResultSchema } from "../utils/validation";

function removeCodeFence(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

async function requireAllowed(stage: GuardrailStage, content: string): Promise<void> {
  const result = await scanContent(stage, content);
  if (result.decision === "BLOCK") {
    console.warn(`Guardrail blocked ${stage.toLowerCase()} content: ${result.reasonCode}`, {
      categories: result.categories,
    });
    throw new GuardrailBlockedError(result);
  }
}

/**
 * Runs the full resume-analysis safety boundary. Only schema-valid, guardrail-
 * approved data is returned to the worker for persistence and later delivery.
 */
export async function analyzeResumeWithGuardrails(extractedText: string) {
  await requireAllowed("INPUT", extractedText);

  const generatedText = await analyzeWithGemini(extractedText);
  const cleanedText = removeCodeFence(generatedText);
  await requireAllowed("OUTPUT", cleanedText);

  const parsedAnalysis = JSON.parse(cleanedText);
  const validatedAnalysis = AnalysisResultSchema.parse(parsedAnalysis);

  // Scan canonical JSON as well, so output checks do not depend on whitespace
  // or code-fence formatting in the original Gemini response.
  await requireAllowed("OUTPUT", JSON.stringify(validatedAnalysis));

  return validatedAnalysis;
}
