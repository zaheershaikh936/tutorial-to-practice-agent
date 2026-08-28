import { CONCEPT_EXTRACTION_SYSTEM_PROMPT } from "./concept-extraction";
import { EXERCISE_GENERATION_SYSTEM_PROMPT } from "./exercise-generation";
import { TEST_CASE_GENERATION_SYSTEM_PROMPT } from "./test-case-generation";
import { SELF_VERIFICATION_SYSTEM_PROMPT } from "./self-verification";

export * from "./concept-extraction";
export * from "./exercise-generation";
export * from "./test-case-generation";
export * from "./self-verification";
export * from "./baseline";

export type PipelineStepName =
  | "concept-extraction"
  | "exercise-generation"
  | "test-case-generation"
  | "self-verification";

export interface PipelineStep {
  name: PipelineStepName;
  systemPrompt: string;
}

/**
 * The agent pipeline, in execution order. Each step's output feeds the next:
 * Step 1 — Concept Extraction   -> ConceptExtractionResult
 * Step 2 — Exercise Generation  -> ExerciseGenerationResult
 * Step 3 — Test Case Generation -> TestCaseGenerationResult
 * Step 4 — Self-Verification    -> SelfVerificationResult
 *
 * (The baseline prompt is intentionally excluded - it's a single-shot
 * comparison point, not a pipeline step.)
 */
export const PIPELINE_STEPS: readonly PipelineStep[] = [
  { name: "concept-extraction", systemPrompt: CONCEPT_EXTRACTION_SYSTEM_PROMPT },
  { name: "exercise-generation", systemPrompt: EXERCISE_GENERATION_SYSTEM_PROMPT },
  { name: "test-case-generation", systemPrompt: TEST_CASE_GENERATION_SYSTEM_PROMPT },
  { name: "self-verification", systemPrompt: SELF_VERIFICATION_SYSTEM_PROMPT },
] as const;
