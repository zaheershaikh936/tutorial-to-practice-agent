import { describe, expect, it } from "vitest";
import {
    TopicSummaryResponseSchema,
    isTopicSummaryRejection,
} from "@/features/common/ai-model/utils/prompts/topic-summary";

describe("TopicSummaryResponseSchema", () => {
    it("accepts a programming-related summary", () => {
        const result = TopicSummaryResponseSchema.safeParse({
            is_programming_related: true,
            summary: "This video teaches the two-pointer technique for arrays.",
        });
        expect(result.success).toBe(true);
    });

    it("accepts a non-programming rejection", () => {
        const result = TopicSummaryResponseSchema.safeParse({
            is_programming_related: false,
            reason: "This is a cooking video about baking bread.",
        });
        expect(result.success).toBe(true);
    });

    it("rejects a programming response missing summary", () => {
        const result = TopicSummaryResponseSchema.safeParse({ is_programming_related: true });
        expect(result.success).toBe(false);
    });

    it("rejects a non-programming response missing reason", () => {
        const result = TopicSummaryResponseSchema.safeParse({ is_programming_related: false });
        expect(result.success).toBe(false);
    });
});

describe("isTopicSummaryRejection", () => {
    it("returns true for a rejection response", () => {
        expect(isTopicSummaryRejection({ is_programming_related: false, reason: "a vlog" })).toBe(true);
    });

    it("returns false for a successful summary", () => {
        expect(
            isTopicSummaryRejection({ is_programming_related: true, summary: "teaches recursion" }),
        ).toBe(false);
    });
});
