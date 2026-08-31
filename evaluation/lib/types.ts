export type TestCaseCategory = "normal" | "edge" | "invalid" | "ambiguous" | "duplicate";

export interface TestCase {
  id: string;
  category: TestCaseCategory;
  input: string;
  notes: string;
}

export type ErrorKind =
  | "preflight_rejected"
  | "invalid_json"
  | "schema_validation_failed"
  | "insufficient_content"
  | "verification_failed"
  | "other_error"
  | "none";

export interface CaseRunResult {
  caseId: string;
  category: TestCaseCategory;
  implementation: "baseline" | "advanced";
  ranWithoutThrowing: boolean;
  errorKind: ErrorKind;
  errorMessage: string | null;
  verificationAllPassed: boolean | null;
  conceptBypassable: boolean | null;
  durationMs: number;
  externalCalls: number;
  pipelineStepCalls: number;
  retries: number;
}

export interface ImplementationMetrics {
  totalCases: number;
  completed: number;
  threw: number;
  successRate: number;
  verifiedCount: number;
  verifiedSuccessRate: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  totalExternalCalls: number;
  averageExternalCallsPerCase: number;
  totalRetries: number;
  successfulRecoveriesAfterRetry: number;
  preflightRejections: number;
  schemaValidationFailures: number;
  insufficientContentReports: number;
  verificationFailuresCaught: number;
  otherErrors: number;
  errorsByKind: Record<ErrorKind, number>;
}
