import type { CaseRunResult, ImplementationMetrics, TestCase } from "./types";

const RULE = "=".repeat(56);
const SUBRULE = "-".repeat(56);

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function ms(n: number): string {
  return `${Math.round(n)}ms`;
}

function pad(label: string, width = 24): string {
  return label.padEnd(width, " ");
}

function printImplementationBlock(title: string, m: ImplementationMetrics): void {
  console.log(title);
  console.log(SUBRULE);
  console.log(`${pad("Completed:")}${m.completed}`);
  console.log(`${pad("Threw:")}${m.threw}`);
  console.log(`${pad("Success rate:")}${pct(m.successRate)}`);
  console.log(`${pad("Verified success rate:")}${pct(m.verifiedSuccessRate)} (completed AND self-verification all_passed)`);
  console.log(`${pad("Average latency:")}${ms(m.averageLatencyMs)}`);
  console.log(`${pad("p95 latency:")}${ms(m.p95LatencyMs)}`);
  console.log(`${pad("External LLM calls:")}${m.totalExternalCalls} (avg ${m.averageExternalCallsPerCase.toFixed(2)}/case)`);
  console.log(`${pad("Retries observed:")}${m.totalRetries}`);
  console.log(`${pad("Recovered after retry:")}${m.successfulRecoveriesAfterRetry}`);
  console.log(`${pad("Preflight rejections:")}${m.preflightRejections} (rejected before any API call)`);
  console.log(`${pad("Schema/JSON failures:")}${m.schemaValidationFailures}`);
  console.log(`${pad("insufficient_content:")}${m.insufficientContentReports}`);
  console.log(`${pad("Verification catches:")}${m.verificationFailuresCaught} (thrown, not shipped)`);
  console.log(`${pad("Other errors:")}${m.otherErrors}`);
  console.log("");
}

function safePctPointDelta(advanced: number, baseline: number): string {
  const points = (advanced - baseline) * 100;
  const sign = points >= 0 ? "+" : "";
  return `${sign}${points.toFixed(1)} percentage points`;
}

/**
 * Plain percent change of `advanced` relative to `baseline` - no assumption
 * about which direction counts as "better", since that depends on the
 * metric (fewer calls is good, higher success rate is good). Callers label
 * the direction themselves from the actual measured sign.
 */
function percentChange(advanced: number, baseline: number, zeroLabel: string): string {
  if (baseline === 0) {
    return advanced === 0 ? "0% (both 0)" : `n/a (baseline had 0 ${zeroLabel})`;
  }
  const change = ((advanced - baseline) / baseline) * 100;
  const sign = change > 0 ? "+" : change < 0 ? "-" : "";
  return `${sign}${Math.abs(change).toFixed(1)}%`;
}

export function printConsoleReport(
  testCases: TestCase[],
  baseline: ImplementationMetrics,
  advanced: ImplementationMetrics,
  config: { model: string; provider: string },
): void {
  console.log(RULE);
  console.log("Frontier Engineering Evaluation");
  console.log(RULE);
  console.log("");
  console.log(`Test cases:       ${testCases.length}`);
  console.log(`Provider/model:   ${config.provider} / ${config.model}`);
  console.log("");

  printImplementationBlock("BASELINE (feat/baseline-pipeline)", baseline);
  printImplementationBlock("ADVANCED (this branch)", advanced);

  console.log("IMPROVEMENT");
  console.log(SUBRULE);
  console.log(`${pad("Success rate:")}${safePctPointDelta(advanced.successRate, baseline.successRate)}`);
  console.log(
    `${pad("Verified success rate:")}${safePctPointDelta(advanced.verifiedSuccessRate, baseline.verifiedSuccessRate)}`,
  );
  console.log(
    `${pad("Latency change:")}${percentChange(advanced.averageLatencyMs, baseline.averageLatencyMs, "latency")} ` +
      `(advanced avg ${ms(advanced.averageLatencyMs)} vs baseline avg ${ms(baseline.averageLatencyMs)}; ` +
      `${advanced.averageLatencyMs <= baseline.averageLatencyMs ? "advanced was faster" : "advanced was slower"})`,
  );
  console.log(
    `${pad("External call change:")}${percentChange(advanced.totalExternalCalls, baseline.totalExternalCalls, "external calls")} ` +
      `(advanced ${advanced.totalExternalCalls} vs baseline ${baseline.totalExternalCalls} total calls)`,
  );
  console.log(
    `${pad("Silent bad ships:")}baseline shipped ${baselineSilentBadShips(baseline)} exercise(s) that failed self-verification without surfacing it; advanced caught ${advanced.verificationFailuresCaught}`,
  );
  console.log(RULE);
}

function baselineSilentBadShips(baseline: ImplementationMetrics): number {
  return Math.max(0, baseline.completed - baseline.verifiedCount);
}

export interface ResultsJson {
  timestamp: string;
  project: { name: string; version: string; evaluatedBranch: string; baselineBranch: string };
  configuration: { provider: string; model: string; testCaseCount: number };
  testCases: TestCase[];
  baseline: { metrics: ImplementationMetrics; runs: CaseRunResult[] };
  advanced: { metrics: ImplementationMetrics; runs: CaseRunResult[] };
  improvement: {
    successRateDeltaPercentagePoints: number;
    verifiedSuccessRateDeltaPercentagePoints: number;
    averageLatencyDeltaMs: number;
    externalCallDeltaTotal: number;
  };
  notes: string[];
}

export function buildResultsJson(
  testCases: TestCase[],
  baseline: { metrics: ImplementationMetrics; runs: CaseRunResult[] },
  advanced: { metrics: ImplementationMetrics; runs: CaseRunResult[] },
  config: { provider: string; model: string; evaluatedBranch: string; baselineBranch: string; version: string },
): ResultsJson {
  return {
    timestamp: new Date().toISOString(),
    project: {
      name: "tutorial-to-practice-agent",
      version: config.version,
      evaluatedBranch: config.evaluatedBranch,
      baselineBranch: config.baselineBranch,
    },
    configuration: {
      provider: config.provider,
      model: config.model,
      testCaseCount: testCases.length,
    },
    testCases,
    baseline,
    advanced,
    improvement: {
      successRateDeltaPercentagePoints: (advanced.metrics.successRate - baseline.metrics.successRate) * 100,
      verifiedSuccessRateDeltaPercentagePoints:
        (advanced.metrics.verifiedSuccessRate - baseline.metrics.verifiedSuccessRate) * 100,
      averageLatencyDeltaMs: advanced.metrics.averageLatencyMs - baseline.metrics.averageLatencyMs,
      externalCallDeltaTotal: advanced.metrics.totalExternalCalls - baseline.metrics.totalExternalCalls,
    },
    notes: [
      "No request/response caching exists in either implementation (verified by inspection); cache hit/miss metrics are intentionally omitted rather than fabricated.",
      "Neither branch sets a temperature or seed on the model call, so outputs are not deterministic between runs; latency, call counts, and schema/verification outcomes are the reliable signals here, not exact reproducibility of generated exercise text.",
      "'Verified success rate' means the run completed AND the pipeline's own self-verification step reported all_passed=true - it is a proxy for exercise quality grounded in the pipeline's existing verification step, not a separate invented scoring model.",
      "api/pipeline/route.ts is identical on both branches, so this harness calls runPipeline() directly (the code the route calls) rather than running two Next.js servers.",
    ],
  };
}
