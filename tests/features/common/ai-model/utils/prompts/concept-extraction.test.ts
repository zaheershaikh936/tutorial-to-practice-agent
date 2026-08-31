import { describe, expect, it } from "vitest";
import { isConceptExtractionError } from "@/features/common/ai-model/utils/prompts/concept-extraction";
import type {
    ConceptExtractionError,
    ConceptExtractionResult,
} from "@/features/common/ai-model/utils/prompts/concept-extraction";

describe("isConceptExtractionError", () => {
    it("returns true for an error response", () => {
        const error: ConceptExtractionError = { error: "insufficient_content", reason: "too short" };
        expect(isConceptExtractionError(error)).toBe(true);
    });

    it("returns false for a successful extraction result", () => {
        const result: ConceptExtractionResult = {
            core_concept: "two-pointer technique",
            prerequisites: ["arrays"],
            language: "Python",
            difficulty: "intermediate",
            multiple_concepts_flag: false,
            multiple_concepts_note: "",
        };
        expect(isConceptExtractionError(result)).toBe(false);
    });
});
