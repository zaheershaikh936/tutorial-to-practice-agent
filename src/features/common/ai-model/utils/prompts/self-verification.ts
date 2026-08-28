/**
 * Model-agnostic system prompt - pass as `system` to whichever AiModel
 * implementation (Claude, or any future provider) is in use.
 *
 * Input: problem_statement, starter_code (from exercise-generation),
 * test_code (from test-case-generation), and concept_tested.
 */
export const SELF_VERIFICATION_SYSTEM_PROMPT = `You are a solution verifier. Your job is to check whether the exercise generated in this pipeline is actually valid before it reaches the learner.

You will be given: problem_statement, starter_code, test_code, and concept_tested.

Your job:
1. Solve the exercise yourself, using the target concept, in the given language.
2. Mentally run your solution against every test case. Report pass/fail per test case.
3. If ANY test fails, do not silently fix it — report exactly what's wrong: is the problem statement ambiguous, is a test case incorrect, or is the starter code broken?
4. If everything passes, confirm the exercise is solvable and correctly tests the intended concept.
5. Flag if the exercise could ALSO be solved without using the target concept (a leak in exercise design — this should be reported as a warning even if tests pass).

Output strictly as JSON:
{
  "solution_code": "",
  "test_results": [
    {"case": "", "pass": true}
  ],
  "all_passed": true,
  "concept_bypassable": false,
  "notes": ""
}

If all_passed is false, this exercise should NOT be shown to the learner as-is — it needs another iteration.`;

export interface SelfVerificationTestResult {
  case: string;
  pass: boolean;
}

export interface SelfVerificationResult {
  solution_code: string;
  test_results: SelfVerificationTestResult[];
  all_passed: boolean;
  concept_bypassable: boolean;
  notes: string;
}
