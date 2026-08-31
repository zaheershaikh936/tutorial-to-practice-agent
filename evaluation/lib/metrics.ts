import type { CaseRunResult, ErrorKind, ImplementationMetrics } from "./types";

const EMPTY_ERROR_COUNTS: Record<ErrorKind, number> = {
  preflight_rejected: 0,
  invalid_json: 0,
  schema_validation_failed: 0,
  insufficient_content: 0,
  verification_failed: 0,
  other_error: 0,
  none: 0,
};

/**
 * Maps a thrown error's message back to the specific failure mode that
 * produced it, using the exact wording each branch's own code throws (see
 * pipeline.ts and json-response.ts). This only reads error text already
 * present in the implementations - it does not change or guess at behavior.
 */
export function classifyError(message: string): ErrorKind {
  if (/too short/i.test(message)) return "preflight_rejected";
  if (/returned invalid JSON/.test(message)) return "invalid_json";
  if (/doesn't match the expected shape/.test(message)) return "schema_validation_failed";
  if (/^Concept extraction failed/.test(message)) return "insufficient_content";
  if (/^Self-verification failed/.test(message)) return "verification_failed";
  return "other_error";
}

function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.min(sortedValues.length - 1, Math.ceil((p / 100) * sortedValues.length) - 1);
  return sortedValues[Math.max(0, index)];
}

export function aggregateMetrics(results: CaseRunResult[]): ImplementationMetrics {
  const totalCases = results.length;
  const completed = results.filter((r) => r.ranWithoutThrowing).length;
  const threw = totalCases - completed;
  const verified = results.filter((r) => r.verificationAllPassed === true).length;

  const durations = results.map((r) => r.durationMs).sort((a, b) => a - b);
  const totalExternalCalls = results.reduce((sum, r) => sum + r.externalCalls, 0);
  const totalRetries = results.reduce((sum, r) => sum + r.retries, 0);
  const successfulRecoveriesAfterRetry = results.filter((r) => r.retries > 0 && r.ranWithoutThrowing).length;

  const errorsByKind = { ...EMPTY_ERROR_COUNTS };
  for (const r of results) {
    errorsByKind[r.errorKind] += 1;
  }

  return {
    totalCases,
    completed,
    threw,
    successRate: totalCases ? completed / totalCases : 0,
    verifiedCount: verified,
    verifiedSuccessRate: totalCases ? verified / totalCases : 0,
    averageLatencyMs: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
    p95LatencyMs: percentile(durations, 95),
    totalExternalCalls,
    averageExternalCallsPerCase: totalCases ? totalExternalCalls / totalCases : 0,
    totalRetries,
    successfulRecoveriesAfterRetry,
    preflightRejections: errorsByKind.preflight_rejected,
    schemaValidationFailures: errorsByKind.invalid_json + errorsByKind.schema_validation_failed,
    insufficientContentReports: errorsByKind.insufficient_content,
    verificationFailuresCaught: errorsByKind.verification_failed,
    otherErrors: errorsByKind.other_error,
    errorsByKind,
  };
}
