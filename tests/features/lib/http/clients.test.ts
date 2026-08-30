import { describe, expect, it } from "vitest";
import { getHttpClient, API_BASE_URLS } from "@/features/lib/http/clients";

describe("getHttpClient", () => {
    it("returns a client whose baseURL matches the registered URL", () => {
        const client = getHttpClient("piston");
        expect(client.defaults.baseURL).toBe(API_BASE_URLS.piston);
    });

    it("returns the same instance on repeated calls with the same name", () => {
        const first = getHttpClient("piston");
        const second = getHttpClient("piston");
        expect(first).toBe(second);
    });

    it("returns a different instance for a different name", () => {
        const piston = getHttpClient("piston");
        const youtubeTranscript = getHttpClient("youtubeTranscript");

        expect(piston).not.toBe(youtubeTranscript);
        expect(youtubeTranscript.defaults.baseURL).toBe(API_BASE_URLS.youtubeTranscript);
    });
});
