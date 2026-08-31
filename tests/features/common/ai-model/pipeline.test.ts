import { describe, expect, it, vi } from "vitest";
import { AiModel } from "@/features/common/ai-model/base";
import { runPipeline } from "@/features/common/ai-model/pipeline";
import {
    CONCEPT_EXTRACTION_SYSTEM_PROMPT,
    EXERCISE_GENERATION_SYSTEM_PROMPT,
    TEST_CASE_GENERATION_SYSTEM_PROMPT,
    SELF_VERIFICATION_SYSTEM_PROMPT,
} from "@/features/common/ai-model/utils/prompts";

const VALID_TRANSCRIPT =
    "In this tutorial we walk through the two-pointer technique for solving array problems. " +
    "We start with a sorted array and place one pointer at the beginning and another at the " +
    "end, then move them toward each other based on whether the current sum is too small or " +
    "too large, narrowing down on the target pair in linear time.";

const CONCEPT = {
    core_concept: "two-pointer technique",
    prerequisites: ["arrays"],
    language: "JavaScript",
    difficulty: "intermediate",
    multiple_concepts_flag: false,
    multiple_concepts_note: "",
};

const EXERCISE = {
    title: "Pair Sum",
    problem_statement: "Find two numbers that sum to a target.",
    starter_code: "function pairSum(nums, target) {}",
    hint: "Try two pointers.",
    concept_tested: "two-pointer technique",
};

const TEST_CASES = {
    test_code: "test('works', () => { expect(pairSum([1,2],3)).toEqual([0,1]); });",
    test_case_notes: [{ case: "works", checks: "returns matching indices" }],
};

const VERIFICATION = {
    solution_code: "function pairSum(nums, target) { /* ... */ }",
    test_results: [{ case: "works", pass: true }],
    all_passed: true,
    concept_bypassable: false,
    notes: "Looks good.",
};

/** A fake AiModel that returns a canned response per system prompt. */
class FakeModel extends AiModel {
    constructor(private responses: Record<string, string>) {
        super();
    }

    public async generate(_message: string, system?: string): Promise<string> {
        if (!system || !(system in this.responses)) {
            throw new Error(`FakeModel: no canned response for system prompt: ${system}`);
        }
        return this.responses[system];
    }
}

function happyPathModel(overrides: Partial<Record<string, string>> = {}) {
    return new FakeModel({
        [CONCEPT_EXTRACTION_SYSTEM_PROMPT]: JSON.stringify(CONCEPT),
        [EXERCISE_GENERATION_SYSTEM_PROMPT]: JSON.stringify(EXERCISE),
        [TEST_CASE_GENERATION_SYSTEM_PROMPT]: JSON.stringify(TEST_CASES),
        [SELF_VERIFICATION_SYSTEM_PROMPT]: JSON.stringify(VERIFICATION),
        ...overrides,
    });
}

describe("runPipeline", () => {
    it("chains all four steps into a PipelineResult", async () => {
        const result = await runPipeline(VALID_TRANSCRIPT, happyPathModel());

        expect(result.concept).toEqual(CONCEPT);
        expect(result.exercise).toEqual(EXERCISE);
        expect(result.testCases).toEqual(TEST_CASES);
        expect(result.verification).toEqual(VERIFICATION);
    });

    it("strips a ```json fence if the model wraps its output in one", async () => {
        const model = happyPathModel({
            [CONCEPT_EXTRACTION_SYSTEM_PROMPT]: "```json\n" + JSON.stringify(CONCEPT) + "\n```",
        });

        const result = await runPipeline(VALID_TRANSCRIPT, model);
        expect(result.concept).toEqual(CONCEPT);
    });

    it("throws with the reason when concept-extraction reports insufficient_content", async () => {
        const model = happyPathModel({
            [CONCEPT_EXTRACTION_SYSTEM_PROMPT]: JSON.stringify({
                error: "insufficient_content",
                reason: "not about a coding topic",
            }),
        });

        await expect(runPipeline(VALID_TRANSCRIPT, model)).rejects.toThrow(
            "Concept extraction failed: not about a coding topic",
        );
    });

    it("propagates a JSON parse failure from any step", async () => {
        const model = happyPathModel({
            [EXERCISE_GENERATION_SYSTEM_PROMPT]: "not valid json",
        });

        await expect(runPipeline(VALID_TRANSCRIPT, model)).rejects.toThrow(
            "Exercise generation returned invalid JSON",
        );
    });

    it("rejects a step's output when it's valid JSON but missing a required field", async () => {
        const model = happyPathModel({
            [EXERCISE_GENERATION_SYSTEM_PROMPT]: JSON.stringify({
                title: "Pair Sum",
                problem_statement: "Find two numbers that sum to a target.",
                hint: "Try two pointers.",
                concept_tested: "two-pointer technique",
                // starter_code omitted
            }),
        });

        await expect(runPipeline(VALID_TRANSCRIPT, model)).rejects.toThrow(
            "Exercise generation returned data that doesn't match the expected shape",
        );
    });

    it("rejects a step's output when a field has the wrong type", async () => {
        const model = happyPathModel({
            [TEST_CASE_GENERATION_SYSTEM_PROMPT]: JSON.stringify({
                test_code: 12345,
                test_case_notes: TEST_CASES.test_case_notes,
            }),
        });

        await expect(runPipeline(VALID_TRANSCRIPT, model)).rejects.toThrow(
            "Test case generation returned data that doesn't match the expected shape",
        );
    });

    it("feeds each step's output into the next step's input", async () => {
        const seen: string[] = [];
        const model = new FakeModel({
            [CONCEPT_EXTRACTION_SYSTEM_PROMPT]: JSON.stringify(CONCEPT),
            [EXERCISE_GENERATION_SYSTEM_PROMPT]: JSON.stringify(EXERCISE),
            [TEST_CASE_GENERATION_SYSTEM_PROMPT]: JSON.stringify(TEST_CASES),
            [SELF_VERIFICATION_SYSTEM_PROMPT]: JSON.stringify(VERIFICATION),
        });
        const originalGenerate = model.generate.bind(model);
        model.generate = async (message, system) => {
            seen.push(message);
            return originalGenerate(message, system);
        };

        await runPipeline(VALID_TRANSCRIPT, model);

        expect(seen[0]).toBe(VALID_TRANSCRIPT);
        expect(JSON.parse(seen[1])).toEqual(CONCEPT);
        expect(JSON.parse(seen[2])).toEqual({
            problem_statement: EXERCISE.problem_statement,
            starter_code: EXERCISE.starter_code,
            concept_tested: EXERCISE.concept_tested,
        });
        expect(JSON.parse(seen[3])).toEqual({
            problem_statement: EXERCISE.problem_statement,
            starter_code: EXERCISE.starter_code,
            test_code: TEST_CASES.test_code,
            concept_tested: EXERCISE.concept_tested,
        });
    });

    it("rejects input that's too short to be a tutorial transcript, without calling the model", async () => {
        let called = false;
        const model = new FakeModel({});
        model.generate = async () => {
            called = true;
            return "";
        };

        await expect(runPipeline("What is a closure in JavaScript?", model)).rejects.toThrow(
            /too short/i,
        );
        expect(called).toBe(false);
    });

    it("accepts input right at the minimum word count", async () => {
        const thirtyWords = Array.from({ length: 30 }, (_, i) => `word${i}`).join(" ");
        const result = await runPipeline(thirtyWords, happyPathModel());
        expect(result.concept).toEqual(CONCEPT);
    });

    it("throws when self-verification reports the exercise failed its own test cases", async () => {
        const model = happyPathModel({
            [SELF_VERIFICATION_SYSTEM_PROMPT]: JSON.stringify({
                ...VERIFICATION,
                all_passed: false,
                test_results: [
                    { case: "works", pass: false },
                    { case: "edge case", pass: true },
                ],
                notes: "starter code doesn't compile.",
            }),
        });

        await expect(runPipeline(VALID_TRANSCRIPT, model)).rejects.toThrow(
            'Self-verification failed: the generated exercise did not pass its own test cases (works) - starter code doesn\'t compile.',
        );
    });

    it("does not throw, but warns, when concept_bypassable is true even though all tests pass", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const model = happyPathModel({
            [SELF_VERIFICATION_SYSTEM_PROMPT]: JSON.stringify({
                ...VERIFICATION,
                concept_bypassable: true,
                notes: "solvable with a plain loop, no two-pointer needed.",
            }),
        });

        const result = await runPipeline(VALID_TRANSCRIPT, model);

        expect(result.verification.concept_bypassable).toBe(true);
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('exercise may be solvable without using "two-pointer technique"'),
        );
        warnSpy.mockRestore();
    });
});
