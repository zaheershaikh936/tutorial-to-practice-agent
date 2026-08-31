/**
 * Hackathon submission script: runs the existing 4-step agent pipeline
 * (concept extraction -> exercise generation -> test generation ->
 * self-verification) across every entry in tutorials.json and saves each
 * run as a labeled trajectory file in trajectories/<id>.json.
 *
 * This does NOT reimplement the pipeline - it calls the same model.generate
 * calls, prompts, and parseModelJson validation that
 * src/features/common/ai-model/pipeline.ts uses. It only orchestrates them
 * differently so every step's raw input/output can be captured and so a
 * failed self-verification can trigger one retry of steps 2-3 instead of
 * throwing immediately.
 *
 * Usage: npx tsx trajectories/generate-trajectories.ts
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getAiModel, type AiModel } from "../src/features/common/ai-model";
import { parseModelJson } from "../src/features/common/ai-model/json-response";
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
  type ConceptExtractionResponse,
  type ConceptExtractionResult,
  type ExerciseGenerationResult,
  type TestCaseGenerationResult,
  type SelfVerificationResult,
} from "../src/features/common/ai-model/utils/prompts";
import { extractYoutubeVideoId } from "../src/features/common/youtube/extract-video-id";
import { fetchYoutubeTranscript } from "../src/features/common/youtube/fetch-transcript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..");

interface TutorialEntry {
  id: string;
  source_type: "youtube_url" | "blog_text";
  source: string;
}

interface StepRecord<TParsed> {
  input: unknown;
  raw_output: string;
  parsed: TParsed;
}

interface Trajectory {
  id: string;
  source_type: string;
  source: string;
  fetched_input_text: string;
  step1_concept_extraction: StepRecord<ConceptExtractionResponse> | Record<string, never>;
  step2_exercise_generation: StepRecord<ExerciseGenerationResult> | Record<string, never>;
  step3_test_generation: StepRecord<TestCaseGenerationResult> | Record<string, never>;
  step4_self_verification: StepRecord<SelfVerificationResult> | Record<string, never>;
  retry_occurred: boolean;
  retry_details: {
    reason: string;
    failed_attempt: {
      step2_exercise_generation: StepRecord<ExerciseGenerationResult>;
      step3_test_generation: StepRecord<TestCaseGenerationResult>;
      step4_self_verification: StepRecord<SelfVerificationResult>;
    };
  } | null;
  timestamp: string;
  error?: string;
}

/** Loads .env.local / .env the same way this project's other tooling expects them. */
function loadEnvFiles(): void {
  for (const file of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(path.join(REPO_ROOT, file));
    } catch {
      // File is optional.
    }
  }
}

async function fetchInputText(entry: TutorialEntry): Promise<string> {
  if (entry.source_type === "youtube_url") {
    const videoId = extractYoutubeVideoId(entry.source);
    if (!videoId) {
      throw new Error(`Could not extract a YouTube video id from "${entry.source}"`);
    }
    const transcript = await fetchYoutubeTranscript(videoId);
    return transcript.transcriptText;
  }
  if (entry.source_type === "blog_text") {
    return entry.source;
  }
  throw new Error(`Unknown source_type "${(entry as TutorialEntry).source_type}"`);
}

// Steps below mirror pipeline.ts's calls exactly (same prompts, same
// parseModelJson validation) - they just return the raw + parsed data
// instead of only the parsed data, and let the caller decide what to do
// on a step-4 failure instead of throwing.

async function runConceptExtraction(model: AiModel, transcript: string): Promise<StepRecord<ConceptExtractionResponse>> {
  const raw = await model.generate(transcript, CONCEPT_EXTRACTION_SYSTEM_PROMPT);
  const parsed = parseModelJson(raw, ConceptExtractionResponseSchema, "Concept extraction");
  return { input: transcript, raw_output: raw, parsed };
}

async function runExerciseGeneration(
  model: AiModel,
  concept: ConceptExtractionResult,
): Promise<StepRecord<ExerciseGenerationResult>> {
  const input = JSON.stringify(concept);
  const raw = await model.generate(input, EXERCISE_GENERATION_SYSTEM_PROMPT);
  const parsed = parseModelJson(raw, ExerciseGenerationResultSchema, "Exercise generation");
  return { input: concept, raw_output: raw, parsed };
}

async function runTestCaseGeneration(
  model: AiModel,
  exercise: ExerciseGenerationResult,
): Promise<StepRecord<TestCaseGenerationResult>> {
  const input = {
    problem_statement: exercise.problem_statement,
    starter_code: exercise.starter_code,
    concept_tested: exercise.concept_tested,
  };
  const raw = await model.generate(JSON.stringify(input), TEST_CASE_GENERATION_SYSTEM_PROMPT);
  const parsed = parseModelJson(raw, TestCaseGenerationResultSchema, "Test case generation");
  return { input, raw_output: raw, parsed };
}

async function runSelfVerification(
  model: AiModel,
  exercise: ExerciseGenerationResult,
  testCases: TestCaseGenerationResult,
): Promise<StepRecord<SelfVerificationResult>> {
  const input = {
    problem_statement: exercise.problem_statement,
    starter_code: exercise.starter_code,
    test_code: testCases.test_code,
    concept_tested: exercise.concept_tested,
  };
  const raw = await model.generate(JSON.stringify(input), SELF_VERIFICATION_SYSTEM_PROMPT);
  const parsed = parseModelJson(raw, SelfVerificationResultSchema, "Self-verification");
  return { input, raw_output: raw, parsed };
}

type EntryStatus = "success" | "retried" | "failed";

async function processEntry(entry: TutorialEntry, model: AiModel): Promise<EntryStatus> {
  const trajectory: Trajectory = {
    id: entry.id,
    source_type: entry.source_type,
    source: entry.source,
    fetched_input_text: "",
    step1_concept_extraction: {},
    step2_exercise_generation: {},
    step3_test_generation: {},
    step4_self_verification: {},
    retry_occurred: false,
    retry_details: null,
    timestamp: new Date().toISOString(),
  };

  try {
    process.stdout.write(`Processing ${entry.id}... `);

    trajectory.fetched_input_text = await fetchInputText(entry);

    const step1 = await runConceptExtraction(model, trajectory.fetched_input_text);
    trajectory.step1_concept_extraction = step1;
    if (isConceptExtractionError(step1.parsed)) {
      throw new Error(`Concept extraction failed: ${step1.parsed.reason}`);
    }
    const concept = step1.parsed;

    let step2 = await runExerciseGeneration(model, concept);
    trajectory.step2_exercise_generation = step2;

    let step3 = await runTestCaseGeneration(model, step2.parsed);
    trajectory.step3_test_generation = step3;

    let step4 = await runSelfVerification(model, step2.parsed, step3.parsed);
    trajectory.step4_self_verification = step4;

    const needsRetry = !step4.parsed.all_passed || step4.parsed.concept_bypassable;
    let status: EntryStatus = "success";

    if (needsRetry) {
      const reason = !step4.parsed.all_passed
        ? "self-verification reported all_passed: false"
        : "self-verification reported concept_bypassable: true";

      console.log(`FAILED verification (${reason}), retrying...`);

      const failedAttempt = {
        step2_exercise_generation: step2,
        step3_test_generation: step3,
        step4_self_verification: step4,
      };

      step2 = await runExerciseGeneration(model, concept);
      step3 = await runTestCaseGeneration(model, step2.parsed);
      step4 = await runSelfVerification(model, step2.parsed, step3.parsed);

      trajectory.step2_exercise_generation = step2;
      trajectory.step3_test_generation = step3;
      trajectory.step4_self_verification = step4;
      trajectory.retry_occurred = true;
      trajectory.retry_details = { reason, failed_attempt: failedAttempt };
      status = "retried";
    }

    await saveTrajectory(entry.id, trajectory);
    console.log(needsRetry ? `${entry.id} retry saved.` : "done");
    return status;
  } catch (error) {
    trajectory.error = error instanceof Error ? error.message : String(error);
    await saveTrajectory(entry.id, trajectory);
    console.log(`FAILED: ${trajectory.error}`);
    return "failed";
  }
}

async function saveTrajectory(id: string, trajectory: Trajectory): Promise<void> {
  const outPath = path.join(REPO_ROOT, "trajectories", `${id}.json`);
  await writeFile(outPath, `${JSON.stringify(trajectory, null, 2)}\n`, "utf-8");
}

async function main(): Promise<void> {
  loadEnvFiles();

  if (!process.env.OPENROUTER_API_KEY) {
    console.error(
      "OPENROUTER_API_KEY is not set (checked .env.local and .env at the repo root).\n" +
        "The pipeline calls a real model and cannot run without a working API key.",
    );
    process.exitCode = 1;
    return;
  }

  const tutorialsPath = path.join(REPO_ROOT, "trajectories", "tutorials.json");
  const entries: TutorialEntry[] = JSON.parse(await readFile(tutorialsPath, "utf-8"));

  await mkdir(path.join(REPO_ROOT, "trajectories"), { recursive: true });

  const model = getAiModel();

  let succeeded = 0;
  let retried = 0;
  let failed = 0;

  for (const entry of entries) {
    const status = await processEntry(entry, model);
    if (status === "success") succeeded += 1;
    else if (status === "retried") retried += 1;
    else failed += 1;
  }

  console.log("\n--- Summary ---");
  console.log(`Total:     ${entries.length}`);
  console.log(`Succeeded: ${succeeded}`);
  console.log(`Retried:   ${retried}`);
  console.log(`Failed:    ${failed}`);
}

main().catch((error) => {
  console.error("Trajectory generation failed:", error);
  process.exitCode = 1;
});
