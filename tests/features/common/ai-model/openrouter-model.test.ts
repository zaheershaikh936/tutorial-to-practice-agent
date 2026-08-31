import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpenRouterError } from "@openrouter/sdk/models/errors";

const { sendMock, OpenRouterMock } = vi.hoisted(() => {
    const sendMock = vi.fn();
    class OpenRouterMock {
        chat = { send: sendMock };
    }
    return { sendMock, OpenRouterMock };
});

vi.mock("@openrouter/sdk", () => ({ OpenRouter: OpenRouterMock }));

const { OpenRouterModel } = await import("@/features/common/ai-model/openrouter-model");

class TestModel extends OpenRouterModel {
    constructor() {
        super("test/default-model", undefined, "test-key");
    }
}

function makeStream(contents: string[]): ReadableStream {
    return new ReadableStream({
        start(controller) {
            for (const content of contents) {
                controller.enqueue({ choices: [{ delta: { content } }] });
            }
            controller.close();
        },
    });
}

function makeRetryableError(statusCode = 503): OpenRouterError {
    const request = new Request("https://openrouter.ai/api/v1/chat/completions");
    const response = new Response("unavailable", { status: statusCode });
    return new OpenRouterError("Service Unavailable", { response, request, body: "unavailable" });
}

describe("OpenRouterModel.generate", () => {
    beforeEach(() => {
        sendMock.mockReset();
    });

    it("returns the concatenated stream content on success", async () => {
        sendMock.mockResolvedValueOnce(makeStream(["Hello, ", "world!"]));

        const output = await new TestModel().generate("hi");

        expect(output).toBe("Hello, world!");
        expect(sendMock).toHaveBeenCalledTimes(1);
    });

    it("retries once on a transient 503 and succeeds on the second attempt", async () => {
        sendMock.mockRejectedValueOnce(makeRetryableError(503)).mockResolvedValueOnce(makeStream(["recovered"]));

        const output = await new TestModel().generate("hi");

        expect(output).toBe("recovered");
        expect(sendMock).toHaveBeenCalledTimes(2);
    });

    it("does not retry a non-retryable 400 and throws immediately", async () => {
        const error = makeRetryableError(400);
        sendMock.mockRejectedValueOnce(error);

        await expect(new TestModel().generate("hi")).rejects.toBe(error);
        expect(sendMock).toHaveBeenCalledTimes(1);
    });

    it("gives up after repeated transient failures", async () => {
        const error = makeRetryableError(503);
        sendMock.mockRejectedValueOnce(error).mockRejectedValueOnce(error).mockRejectedValueOnce(error);

        await expect(new TestModel().generate("hi")).rejects.toBe(error);
        expect(sendMock).toHaveBeenCalledTimes(3);
    }, 10000);
});
