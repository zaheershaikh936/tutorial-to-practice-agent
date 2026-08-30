import { describe, expect, it } from "vitest";
import { AiModel } from "@/features/common/ai-model/base";
import { runPipeline } from "@/features/common/ai-model/pipeline";
import {
    CONCEPT_EXTRACTION_SYSTEM_PROMPT,
    EXERCISE_GENERATION_SYSTEM_PROMPT,
    TEST_CASE_GENERATION_SYSTEM_PROMPT,
    SELF_VERIFICATION_SYSTEM_PROMPT,
} from "@/features/common/ai-model/utils/prompts";

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
        const result = await runPipeline("some tutorial transcript", happyPathModel());

        expect(result.concept).toEqual(CONCEPT);
        expect(result.exercise).toEqual(EXERCISE);
        expect(result.testCases).toEqual(TEST_CASES);
        expect(result.verification).toEqual(VERIFICATION);
    });

    it("strips a ```json fence if the model wraps its output in one", async () => {
        const model = happyPathModel({
            [CONCEPT_EXTRACTION_SYSTEM_PROMPT]: "```json\n" + JSON.stringify(CONCEPT) + "\n```",
        });

        const result = await runPipeline("transcript", model);
        expect(result.concept).toEqual(CONCEPT);
    });

    it("throws with the reason when concept-extraction reports insufficient_content", async () => {
        const model = happyPathModel({
            [CONCEPT_EXTRACTION_SYSTEM_PROMPT]: JSON.stringify({
                error: "insufficient_content",
                reason: "not about a coding topic",
            }),
        });

        await expect(runPipeline("transcript", model)).rejects.toThrow(
            "Concept extraction failed: not about a coding topic",
        );
    });

    it("propagates a JSON parse failure from any step", async () => {
        const model = happyPathModel({
            [EXERCISE_GENERATION_SYSTEM_PROMPT]: "not valid json",
        });

        await expect(runPipeline("transcript", model)).rejects.toThrow();
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

        await runPipeline("the transcript", model);

        expect(seen[0]).toBe("the transcript");
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
});
