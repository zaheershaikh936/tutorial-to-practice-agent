import { AiModel } from "./base";
import { getAiModel } from "./index";
import {
  CONCEPT_EXTRACTION_SYSTEM_PROMPT,
  EXERCISE_GENERATION_SYSTEM_PROMPT,
  TEST_CASE_GENERATION_SYSTEM_PROMPT,
  SELF_VERIFICATION_SYSTEM_PROMPT,
  isConceptExtractionError,
  type ConceptExtractionResult,
  type ConceptExtractionResponse,
  type ExerciseGenerationResult,
  type TestCaseGenerationResult,
  type SelfVerificationResult,
} from "./utils/prompts";

export interface PipelineResult {
  concept: ConceptExtractionResult;
  exercise: ExerciseGenerationResult;
  testCases: TestCaseGenerationResult;
  verification: SelfVerificationResult;
}

/**
 * Strips a ```json ... ``` fence if the model wrapped its output in one,
 * then parses. Every step prompt demands strict JSON, but models sometimes
 * fence it anyway.
 */
function parseJson<T>(raw: string): T {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonText = fenced ? fenced[1] : raw;
  return JSON.parse(jsonText) as T;
}

/**
 * Runs the four-step agent pipeline end-to-end, each step's output feeding
 * the next: concept-extraction -> exercise-generation -> test-case-generation
 * -> self-verification. Throws if any step returns unparsable output or if
 * concept-extraction reports insufficient_content.
 */
export async function runPipeline(
  transcript: string,
  model: AiModel = getAiModel(),
): Promise<PipelineResult> {
  const conceptRaw = await model.generate(transcript, CONCEPT_EXTRACTION_SYSTEM_PROMPT);
  const conceptResponse = parseJson<ConceptExtractionResponse>(conceptRaw);
  if (isConceptExtractionError(conceptResponse)) {
    throw new Error(`Concept extraction failed: ${conceptResponse.reason}`);
  }
  const concept = conceptResponse;

  const exerciseRaw = await model.generate(JSON.stringify(concept), EXERCISE_GENERATION_SYSTEM_PROMPT);
  const exercise = parseJson<ExerciseGenerationResult>(exerciseRaw);

  const testCasesRaw = await model.generate(
    JSON.stringify({
      problem_statement: exercise.problem_statement,
      starter_code: exercise.starter_code,
      concept_tested: exercise.concept_tested,
    }),
    TEST_CASE_GENERATION_SYSTEM_PROMPT,
  );
  const testCases = parseJson<TestCaseGenerationResult>(testCasesRaw);

  const verificationRaw = await model.generate(
    JSON.stringify({
      problem_statement: exercise.problem_statement,
      starter_code: exercise.starter_code,
      test_code: testCases.test_code,
      concept_tested: exercise.concept_tested,
    }),
    SELF_VERIFICATION_SYSTEM_PROMPT,
  );
  const verification = parseJson<SelfVerificationResult>(verificationRaw);

  return { concept, exercise, testCases, verification };
}
