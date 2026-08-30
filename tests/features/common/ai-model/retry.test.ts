import { describe, expect, it, vi } from "vitest";
import { HTTPClientError, OpenRouterError } from "@openrouter/sdk/models/errors";
import { isRetryableError, withRetry } from "@/features/common/ai-model/retry";

function makeOpenRouterError(statusCode: number): OpenRouterError {
    const request = new Request("https://openrouter.ai/api/v1/chat/completions");
    const response = new Response("error body", { status: statusCode });
    return new OpenRouterError(`status ${statusCode}`, { response, request, body: "error body" });
}

function makeClientError(name: string): HTTPClientError {
    const error = new HTTPClientError(name);
    error.name = name;
    return error;
}

describe("isRetryableError", () => {
    it.each([408, 429, 500, 502, 503, 504])("treats OpenRouterError with status %d as retryable", (status) => {
        expect(isRetryableError(makeOpenRouterError(status))).toBe(true);
    });

    it.each([400, 401, 402, 403, 404, 413, 422])(
        "treats OpenRouterError with status %d as non-retryable",
        (status) => {
            expect(isRetryableError(makeOpenRouterError(status))).toBe(false);
        },
    );

    it("treats a connection-level HTTPClientError as retryable", () => {
        expect(isRetryableError(makeClientError("ConnectionError"))).toBe(true);
        expect(isRetryableError(makeClientError("RequestTimeoutError"))).toBe(true);
    });

    it("treats a malformed-request HTTPClientError as non-retryable", () => {
        expect(isRetryableError(makeClientError("InvalidRequestError"))).toBe(false);
        expect(isRetryableError(makeClientError("RequestAbortedError"))).toBe(false);
    });

    it("treats an unrelated error as non-retryable", () => {
        expect(isRetryableError(new Error("boom"))).toBe(false);
    });
});

describe("withRetry", () => {
    it("returns the result immediately when fn succeeds on the first try", async () => {
        const fn = vi.fn().mockResolvedValue("ok");
        const result = await withRetry(fn, { baseDelayMs: 0 });
        expect(result).toBe("ok");
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("retries a retryable error and succeeds once fn recovers", async () => {
        const fn = vi
            .fn()
            .mockRejectedValueOnce(makeOpenRouterError(503))
            .mockRejectedValueOnce(makeOpenRouterError(429))
            .mockResolvedValueOnce("ok");

        const result = await withRetry(fn, { baseDelayMs: 0, maxAttempts: 3 });

        expect(result).toBe("ok");
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it("throws immediately without retrying a non-retryable error", async () => {
        const error = makeOpenRouterError(400);
        const fn = vi.fn().mockRejectedValue(error);

        await expect(withRetry(fn, { baseDelayMs: 0 })).rejects.toBe(error);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("gives up after maxAttempts and throws the last error", async () => {
        const error = makeOpenRouterError(503);
        const fn = vi.fn().mockRejectedValue(error);

        await expect(withRetry(fn, { baseDelayMs: 0, maxAttempts: 3 })).rejects.toBe(error);
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it("uses a custom isRetryable predicate when provided", async () => {
        const fn = vi.fn().mockRejectedValueOnce(new Error("custom transient")).mockResolvedValueOnce("ok");

        const result = await withRetry(fn, {
            baseDelayMs: 0,
            isRetryable: (error) => error instanceof Error && error.message === "custom transient",
        });

        expect(result).toBe("ok");
        expect(fn).toHaveBeenCalledTimes(2);
    });
});
