import { describe, expect, it } from "vitest";
import { createHttpClient } from "@/features/lib/http/create-client";

/** Reaches the response interceptor's rejection handler directly, without a real network call. */
function getResponseErrorInterceptor(client: ReturnType<typeof createHttpClient>) {
    const handlers = (client.interceptors.response as unknown as {
        handlers: Array<{ rejected: (error: unknown) => Promise<never> }>;
    }).handlers;
    return handlers[0].rejected;
}

describe("createHttpClient", () => {
    it("sets the given baseURL", () => {
        const client = createHttpClient("https://example.com");
        expect(client.defaults.baseURL).toBe("https://example.com");
    });

    it("defaults to a 15s timeout and JSON content-type", () => {
        const client = createHttpClient("https://example.com");
        expect(client.defaults.timeout).toBe(15000);
        expect(client.defaults.headers.common["Content-Type"] ?? client.defaults.headers["Content-Type"]).toBeTruthy();
    });

    it("lets config overrides win", () => {
        const client = createHttpClient("https://example.com", { timeout: 5000 });
        expect(client.defaults.timeout).toBe(5000);
    });

    it("normalizes an axios error's response.data.message into a plain Error", async () => {
        const client = createHttpClient("https://example.com");
        const rejected = getResponseErrorInterceptor(client);

        const axiosError = Object.assign(new Error("Request failed with status code 500"), {
            isAxiosError: true,
            response: { data: { message: "upstream service unavailable" } },
        });

        await expect(rejected(axiosError)).rejects.toThrow("upstream service unavailable");
    });

    it("falls back to the axios error's own message when there's no response.data.message", async () => {
        const client = createHttpClient("https://example.com");
        const rejected = getResponseErrorInterceptor(client);

        const axiosError = Object.assign(new Error("Network Error"), { isAxiosError: true });

        await expect(rejected(axiosError)).rejects.toThrow("Network Error");
    });

    it("passes non-axios errors through unchanged", async () => {
        const client = createHttpClient("https://example.com");
        const rejected = getResponseErrorInterceptor(client);

        const plainError = new Error("something else broke");

        await expect(rejected(plainError)).rejects.toBe(plainError);
    });
});
