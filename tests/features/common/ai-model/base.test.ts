import { describe, expect, it } from "vitest";
import { AiModel } from "@/features/common/ai-model/base";

class TestModel extends AiModel {
    constructor(private impl: (message: string, system?: string) => Promise<string>) {
        super();
    }

    public async generate(message: string, system?: string): Promise<string> {
        return this.impl(message, system);
    }
}

function postRequest(body: unknown): Request {
    return new Request("http://localhost/api/test", {
        method: "POST",
        body: typeof body === "string" ? body : JSON.stringify(body),
    });
}

describe("AiModel.callAPI", () => {
    it("returns 400 for an invalid JSON body", async () => {
        const model = new TestModel(async () => "unused");
        const response = await model.callAPI(postRequest("not json"));

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "Invalid JSON body" });
    });

    it("returns 400 when message is missing", async () => {
        const model = new TestModel(async () => "unused");
        const response = await model.callAPI(postRequest({}));

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toMatch(/message.*required/i);
    });

    it("returns 400 when message is an empty/whitespace string", async () => {
        const model = new TestModel(async () => "unused");
        const response = await model.callAPI(postRequest({ message: "   " }));

        expect(response.status).toBe(400);
    });

    it("returns 400 when message is not a string", async () => {
        const model = new TestModel(async () => "unused");
        const response = await model.callAPI(postRequest({ message: 123 }));

        expect(response.status).toBe(400);
    });

    it("calls generate with the message and returns its output as JSON", async () => {
        const model = new TestModel(async (message) => `echo: ${message}`);
        const response = await model.callAPI(postRequest({ message: "hello" }));

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ output: "echo: hello" });
    });

    it("passes the `system` argument through to generate, not from the request body", async () => {
        let receivedSystem: string | undefined;
        const model = new TestModel(async (_message, system) => {
            receivedSystem = system;
            return "ok";
        });

        await model.callAPI(postRequest({ message: "hi", system: "ignored" }), "the real system prompt");

        expect(receivedSystem).toBe("the real system prompt");
    });

    it("returns 500 with the error message when generate throws an Error", async () => {
        const model = new TestModel(async () => {
            throw new Error("provider is down");
        });
        const response = await model.callAPI(postRequest({ message: "hi" }));

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: "provider is down" });
    });

    it("returns 500 with a generic message when generate throws a non-Error", async () => {
        const model = new TestModel(async () => {
            throw "raw string throw";
        });
        const response = await model.callAPI(postRequest({ message: "hi" }));

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: "Unknown error" });
    });
});
