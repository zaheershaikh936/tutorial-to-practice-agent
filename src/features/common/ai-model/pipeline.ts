import { AiModel } from "./base";
import { getAiModel } from "./index";
import { parseModelJson } from "./json-response";
import {
  CONCEPT_EXTRACTION_SYSTEM_PROMPT,
  EXERCISE_GENERATION_SYSTEM_PROMPT,
  TEST_CASE_GENERATION_SYSTEM_PROMPT,
  SELF_VERIFICATION_SYSTEM_PROMPT,
  isConceptExtractionError,
  ConceptExtractionResponseSchema,
  ExerciseGenerationResultSchema,
  TestCaseGenerationResultSchema,
  SelfVerificationResultSchema,
  type ConceptExtractionResult,
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
 * Below this word count, input is a one-off question ("what is a closure?")
 * rather than tutorial content - reject it before spending an API call on it.
 */
const MIN_TRANSCRIPT_WORD_COUNT = 30;

function assertValidTranscript(transcript: string): void {
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_TRANSCRIPT_WORD_COUNT) {
    throw new Error(
      `Input is too short (${wordCount} word${wordCount === 1 ? "" : "s"}) to be a tutorial transcript. Paste the full transcript or article text, not a single question or sentence.`,
    );
  }
}

/**
 * Runs the four-step agent pipeline end-to-end, each step's output feeding
 * the next: concept-extraction -> exercise-generation -> test-case-generation
 * -> self-verification. Throws if the input is too short to be real
 * tutorial content, if any step returns unparsable or malformed output, if
 * concept-extraction reports insufficient_content, or if self-verification
 * reports that the exercise fails its own test cases - a bad exercise
 * should never reach the learner silently. A merely bypassable concept
 * (tests pass but the exercise doesn't require the target concept) is
 * logged as a warning rather than thrown, per the self-verification prompt.
 */
export async function runPipeline(
  transcript: string,
  model: AiModel = getAiModel(),
): Promise<PipelineResult> {
  assertValidTranscript(transcript);

  const conceptRaw = await model.generate(transcript, CONCEPT_EXTRACTION_SYSTEM_PROMPT);
  const conceptResponse = parseModelJson(conceptRaw, ConceptExtractionResponseSchema, "Concept extraction");
  if (isConceptExtractionError(conceptResponse)) {
    throw new Error(`Concept extraction failed: ${conceptResponse.reason}`);
  }
  const concept = conceptResponse;

  const exerciseRaw = await model.generate(JSON.stringify(concept), EXERCISE_GENERATION_SYSTEM_PROMPT);
  const exercise = parseModelJson(exerciseRaw, ExerciseGenerationResultSchema, "Exercise generation");

  const testCasesRaw = await model.generate(
    JSON.stringify({
      problem_statement: exercise.problem_statement,
      starter_code: exercise.starter_code,
      concept_tested: exercise.concept_tested,
    }),
    TEST_CASE_GENERATION_SYSTEM_PROMPT,
  );
  const testCases = parseModelJson(testCasesRaw, TestCaseGenerationResultSchema, "Test case generation");

  const verificationRaw = await model.generate(
    JSON.stringify({
      problem_statement: exercise.problem_statement,
      starter_code: exercise.starter_code,
      test_code: testCases.test_code,
      concept_tested: exercise.concept_tested,
    }),
    SELF_VERIFICATION_SYSTEM_PROMPT,
  );
  const verification = parseModelJson(verificationRaw, SelfVerificationResultSchema, "Self-verification");

  if (!verification.all_passed) {
    const failedCases = verification.test_results.filter((t) => !t.pass).map((t) => t.case);
    throw new Error(
      `Self-verification failed: the generated exercise did not pass its own test cases` +
        (failedCases.length ? ` (${failedCases.join(", ")})` : "") +
        (verification.notes ? ` - ${verification.notes}` : ""),
    );
  }

  if (verification.concept_bypassable) {
    console.warn(
      `Self-verification warning: exercise may be solvable without using "${exercise.concept_tested}".` +
        (verification.notes ? ` ${verification.notes}` : ""),
    );
  }

  return { concept, exercise, testCases, verification };
}
