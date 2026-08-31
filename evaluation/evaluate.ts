import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ensureBaselineWorktree } from "./lib/worktree";
import { beginRecording, endRecording, loadInstrumentedPipeline, type InstrumentedPipeline } from "./lib/instrumentation";
import { aggregateMetrics, classifyError } from "./lib/metrics";
import { buildResultsJson, printConsoleReport } from "./lib/report";
import type { CaseRunResult, TestCase } from "./lib/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_BRANCH = "feat/baseline-pipeline";

function git(args: string[], cwd: string): string {
  return execFileSync("git", args, { cwd, encoding: "utf-8" }).trim();
}

/** Loads .env.local / .env the same way this project's other tooling expects them, without adding a dotenv dependency. */
function loadEnvFiles(repoRoot: string): void {
  for (const file of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(path.join(repoRoot, file));
    } catch {
      // File is optional - Next.js treats missing .env* the same way.
    }
  }
}

async function loadTestCases(repoRoot: string): Promise<TestCase[]> {
  const testCasesPath = process.env.EVAL_TEST_CASES_PATH ?? path.join(repoRoot, "evaluation/test-cases.json");
  const raw = await readFile(testCasesPath, "utf-8");
  return JSON.parse(raw) as TestCase[];
}

async function runCase(
  pipeline: InstrumentedPipeline,
  testCase: TestCase,
  implementation: "baseline" | "advanced",
): Promise<CaseRunResult> {
  const recorder = beginRecording();
  const start = performance.now();

  let ranWithoutThrowing = false;
  let errorMessage: string | null = null;
  let verificationAllPassed: boolean | null = null;
  let conceptBypassable: boolean | null = null;

  // pipeline.ts logs a real console.warn on a concept_bypassable finding - useful when
  // debugging one case, but it interleaves badly with the one-line-per-case progress
  // output below. We already capture conceptBypassable in the result, so suppress it here.
  const originalWarn = console.warn;
  console.warn = () => {};
  try {
    const result = await pipeline.runPipeline(testCase.input);
    ranWithoutThrowing = true;
    verificationAllPassed = result.verification?.all_passed ?? null;
    conceptBypassable = result.verification?.concept_bypassable ?? null;
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error);
  } finally {
    console.warn = originalWarn;
    endRecording();
  }

  const durationMs = performance.now() - start;
  const errorKind = ranWithoutThrowing ? "none" : classifyError(errorMessage ?? "");
  const retries = Math.max(0, recorder.externalCalls - recorder.pipelineStepCalls);

  return {
    caseId: testCase.id,
    category: testCase.category,
    implementation,
    ranWithoutThrowing,
    errorKind,
    errorMessage,
    verificationAllPassed,
    conceptBypassable,
    durationMs,
    externalCalls: recorder.externalCalls,
    pipelineStepCalls: recorder.pipelineStepCalls,
    retries,
  };
}

function formatCaseOutcome(result: CaseRunResult): string {
  if (!result.ranWithoutThrowing) return `failed (${result.errorKind})`;
  return result.conceptBypassable ? "ok (concept_bypassable warning)" : "ok";
}

async function main(): Promise<void> {
  const repoRoot = git(["rev-parse", "--show-toplevel"], __dirname);
  loadEnvFiles(repoRoot);

  if (!process.env.OPENROUTER_API_KEY) {
    console.error(
      "OPENROUTER_API_KEY is not set (checked .env.local and .env at the repo root).\n" +
        "This evaluation runs the real pipeline against a real model - it cannot produce honest numbers without a working API key.",
    );
    process.exitCode = 1;
    return;
  }

  const allTestCases = await loadTestCases(repoRoot);
  const limit = process.env.EVAL_LIMIT ? Number.parseInt(process.env.EVAL_LIMIT, 10) : undefined;
  const testCases = limit ? allTestCases.slice(0, limit) : allTestCases;
  if (limit) {
    console.log(`EVAL_LIMIT=${limit} set - running ${testCases.length}/${allTestCases.length} test cases.\n`);
  }

  const worktreePath = ensureBaselineWorktree(repoRoot);

  const advancedPipeline = await loadInstrumentedPipeline(
    path.join(repoRoot, "src/features/common/ai-model/pipeline.ts"),
    path.join(repoRoot, "src/features/common/ai-model/anthropic.ts"),
  );
  const baselinePipeline = await loadInstrumentedPipeline(
    path.join(worktreePath, "src/features/common/ai-model/pipeline.ts"),
    path.join(worktreePath, "src/features/common/ai-model/anthropic.ts"),
  );

  console.log(
    `Running ${testCases.length} test cases against BASELINE (${BASELINE_BRANCH}) and ADVANCED ` +
      `(current branch), sequentially, with real API calls.\n`,
  );

  const baselineRuns: CaseRunResult[] = [];
  const advancedRuns: CaseRunResult[] = [];

  for (const testCase of testCases) {
    process.stdout.write(`  [baseline] ${testCase.id} ... `);
    const baselineResult = await runCase(baselinePipeline, testCase, "baseline");
    baselineRuns.push(baselineResult);
    console.log(formatCaseOutcome(baselineResult));

    process.stdout.write(`  [advanced] ${testCase.id} ... `);
    const advancedResult = await runCase(advancedPipeline, testCase, "advanced");
    advancedRuns.push(advancedResult);
    console.log(formatCaseOutcome(advancedResult));
  }

  const baselineMetrics = aggregateMetrics(baselineRuns);
  const advancedMetrics = aggregateMetrics(advancedRuns);

  const provider = process.env.AI_PROVIDER || "claude";
  const model = process.env.CLAUDE_MODEL || "anthropic/claude-opus-5";

  console.log("");
  printConsoleReport(testCases, baselineMetrics, advancedMetrics, { provider, model });

  const pkg = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf-8")) as { version: string };
  const evaluatedBranch = git(["rev-parse", "--abbrev-ref", "HEAD"], repoRoot);

  const resultsJson = buildResultsJson(
    testCases,
    { metrics: baselineMetrics, runs: baselineRuns },
    { metrics: advancedMetrics, runs: advancedRuns },
    { provider, model, evaluatedBranch, baselineBranch: BASELINE_BRANCH, version: pkg.version },
  );

  const resultsPath = path.join(repoRoot, "evaluation/results.json");
  await writeFile(resultsPath, `${JSON.stringify(resultsJson, null, 2)}\n`, "utf-8");
  console.log(`Full machine-readable results written to ${path.relative(repoRoot, resultsPath)}`);
}

main().catch((error) => {
  console.error("Evaluation failed:", error);
  process.exitCode = 1;
});
