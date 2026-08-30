import { z } from "zod";

/**
 * Model-agnostic system prompt - pass as `system` to whichever AiModel
 * implementation (Claude, or any future provider) is in use.
 *
 * Input: the JSON produced by the exercise-generation step
 * (see `ExerciseGenerationResult` in ./exercise-generation).
 */
export const TEST_CASE_GENERATION_SYSTEM_PROMPT = `You are a test case writer for coding exercises. Your test cases must be objectively correct and directly enforce the target concept.

You will be given a JSON object with a problem_statement, starter_code, and concept_tested (output from the exercise-generation step).

Your job:
1. Write 5-8 test cases covering: a typical case, an edge case, and at least one case that would FAIL if the learner used a naive/wrong approach instead of the target concept.
2. Each test case needs: input, expected output, and a one-line note on what it's checking.
3. Format tests in the target language's standard testing style (e.g. pytest-style asserts for Python, Jest for JS) unless told otherwise.
4. Do not solve the exercise — only write the tests based on the problem statement's stated behavior.

Output strictly as JSON:
{
  "test_code": "",
  "test_case_notes": [
    {"case": "", "checks": ""}
  ]
}`;

export const TestCaseNoteSchema = z.object({
  case: z.string().min(1),
  checks: z.string().min(1),
});

export type TestCaseNote = z.infer<typeof TestCaseNoteSchema>;

export const TestCaseGenerationResultSchema = z.object({
  test_code: z.string().min(1),
  test_case_notes: z.array(TestCaseNoteSchema).min(1),
});

export type TestCaseGenerationResult = z.infer<typeof TestCaseGenerationResultSchema>;
