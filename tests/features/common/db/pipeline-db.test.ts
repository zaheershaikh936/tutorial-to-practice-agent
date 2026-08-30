import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { getLatestPipelineResult, saveLatestPipelineResult } from "@/features/common/db/pipeline-db";
import type { PipelineResult } from "@/features/common/ai-model/pipeline";

function fakeResult(coreConcept: string): PipelineResult {
    return {
        concept: {
            core_concept: coreConcept,
            prerequisites: [],
            language: "JavaScript",
            difficulty: "beginner",
            multiple_concepts_flag: false,
            multiple_concepts_note: "",
        },
        exercise: {
            title: "Test exercise",
            problem_statement: "Do the thing.",
            starter_code: "function doTheThing() {}",
            hint: "Think about it.",
            concept_tested: coreConcept,
        },
        testCases: {
            test_code: "test('it works', () => {});",
            test_case_notes: [{ case: "it works", checks: "the basic case" }],
        },
        verification: {
            solution_code: "function doTheThing() { return true; }",
            test_results: [{ case: "it works", pass: true }],
            all_passed: true,
            concept_bypassable: false,
            notes: "",
        },
    };
}

describe("pipeline-db", () => {
    it("returns null when nothing has been saved", async () => {
        expect(await getLatestPipelineResult()).toBeNull();
    });

    it("returns exactly what was saved", async () => {
        const result = fakeResult("recursion");
        await saveLatestPipelineResult(result);

        expect(await getLatestPipelineResult()).toEqual(result);
    });

    it("overwrites the previous save - there is never more than the latest", async () => {
        await saveLatestPipelineResult(fakeResult("first concept"));
        await saveLatestPipelineResult(fakeResult("second concept"));

        const latest = await getLatestPipelineResult();
        expect(latest?.concept.core_concept).toBe("second concept");
    });
});
