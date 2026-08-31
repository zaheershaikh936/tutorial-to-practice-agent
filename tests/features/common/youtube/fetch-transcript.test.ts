import { describe, expect, it, vi, beforeEach } from "vitest";
import { HttpRequestError } from "@/features/lib/http";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock("@/features/lib/http", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/features/lib/http")>();
    return { ...actual, getHttpClient: () => ({ get: getMock }) };
});

import {
    parseYoutubeTranscript,
    fetchYoutubeTranscript,
    YoutubeTranscriptError,
} from "@/features/common/youtube/fetch-transcript";

const SAMPLE_TRANSCRIPT = `# Transcript: Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)

Source video: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Language: en · Duration: 3:27 · Words: 481
Other available languages: a-en (en) [auto], de-DE (de-DE), ja (ja), pt-BR (pt-BR), es-419 (es-419)
To request a specific language: https://youtube-transcript.ai/transcript/dQw4w9WgXcQ.txt?lang=LANG_CODE
Interactive version (ask the video, AI summary, chapter outline, notes, subtitle download): https://youtube-transcript.ai/transcript?v=dQw4w9WgXcQ

## Transcript
[0:01] [♪♪♪] ♪ We're no strangers to love ♪ ♪ You know the rules and so do I ♪ ♪ A full commitment's what I'm thinking of ♪
0:31] ♪ You wouldn't get this from any other guy ♪ ♪ I just wanna tell you how I'm feeling ♪ ♪ Gotta make you understand ♪`;

describe("parseYoutubeTranscript", () => {
    it("extracts the title, source url, language, duration, and word count", () => {
        const result = parseYoutubeTranscript(SAMPLE_TRANSCRIPT);

        expect(result.title).toBe("Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)");
        expect(result.sourceVideoUrl).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        expect(result.language).toBe("en");
        expect(result.duration).toBe("3:27");
        expect(result.wordCount).toBe(481);
    });

    it("strips both [m:ss] and stray m:ss] timestamp markers from the transcript body", () => {
        const result = parseYoutubeTranscript(SAMPLE_TRANSCRIPT);

        expect(result.transcriptText).not.toMatch(/\[?\d+:\d{2}\]?/);
        expect(result.transcriptText).toContain("We're no strangers to love");
        expect(result.transcriptText).toContain("You wouldn't get this from any other guy");
    });

    it("collapses whitespace in the transcript body", () => {
        const result = parseYoutubeTranscript(SAMPLE_TRANSCRIPT);
        expect(result.transcriptText).not.toMatch(/\s{2,}/);
    });

    it("falls back to sane defaults when the header is missing fields", () => {
        const result = parseYoutubeTranscript("\n## Transcript\nsome text");

        expect(result.title).toBe("Unknown title");
        expect(result.sourceVideoUrl).toBe("");
        expect(result.language).toBe("");
        expect(result.duration).toBe("");
        expect(result.wordCount).toBe(0);
        expect(result.transcriptText).toBe("some text");
    });

    it("returns an empty transcriptText when there is no ## Transcript section at all", () => {
        const result = parseYoutubeTranscript("# Transcript: Untitled\n\nSource video: https://example.com");
        expect(result.transcriptText).toBe("");
    });
});

describe("fetchYoutubeTranscript", () => {
    beforeEach(() => {
        getMock.mockReset();
    });

    it("fetches the right endpoint and parses the response", async () => {
        getMock.mockResolvedValue({ data: SAMPLE_TRANSCRIPT });

        const result = await fetchYoutubeTranscript("dQw4w9WgXcQ");

        expect(getMock).toHaveBeenCalledWith("/transcript/dQw4w9WgXcQ.txt", { responseType: "text" });
        expect(result.title).toBe("Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)");
        expect(result.wordCount).toBe(481);
    });

    it("turns a 403 into an actionable message instead of 'Request failed with status code 403'", async () => {
        getMock.mockRejectedValue(new HttpRequestError("Request failed with status code 403", 403));

        await expect(fetchYoutubeTranscript("dQw4w9WgXcQ")).rejects.toThrow(
            /blocked this request.*rate-limiting|restricting automated access/i,
        );
    });

    it("maps a 403/401 to a YoutubeTranscriptError with a 502 status", async () => {
        getMock.mockRejectedValue(new HttpRequestError("Request failed with status code 403", 403));

        try {
            await fetchYoutubeTranscript("dQw4w9WgXcQ");
            expect.unreachable("expected fetchYoutubeTranscript to throw");
        } catch (error) {
            expect(error).toBeInstanceOf(YoutubeTranscriptError);
            expect((error as YoutubeTranscriptError).status).toBe(502);
        }
    });

    it("maps a 404 to 'no transcript found' with a 404 status", async () => {
        getMock.mockRejectedValue(new HttpRequestError("Request failed with status code 404", 404));

        try {
            await fetchYoutubeTranscript("dQw4w9WgXcQ");
            expect.unreachable("expected fetchYoutubeTranscript to throw");
        } catch (error) {
            expect(error).toBeInstanceOf(YoutubeTranscriptError);
            expect((error as YoutubeTranscriptError).status).toBe(404);
            expect((error as Error).message).toMatch(/no transcript could be found/i);
        }
    });

    it("maps a 429 to a rate-limit message with a 429 status", async () => {
        getMock.mockRejectedValue(new HttpRequestError("Request failed with status code 429", 429));

        try {
            await fetchYoutubeTranscript("dQw4w9WgXcQ");
            expect.unreachable("expected fetchYoutubeTranscript to throw");
        } catch (error) {
            expect(error).toBeInstanceOf(YoutubeTranscriptError);
            expect((error as YoutubeTranscriptError).status).toBe(429);
            expect((error as Error).message).toMatch(/rate-limiting requests/i);
        }
    });

    it("maps a 5xx to a temporarily-unavailable message with a 502 status", async () => {
        getMock.mockRejectedValue(new HttpRequestError("Request failed with status code 503", 503));

        try {
            await fetchYoutubeTranscript("dQw4w9WgXcQ");
            expect.unreachable("expected fetchYoutubeTranscript to throw");
        } catch (error) {
            expect(error).toBeInstanceOf(YoutubeTranscriptError);
            expect((error as YoutubeTranscriptError).status).toBe(502);
            expect((error as Error).message).toMatch(/temporarily unavailable/i);
        }
    });

    it("maps a network failure with no status to a generic unreachable message", async () => {
        getMock.mockRejectedValue(new HttpRequestError("Network Error"));

        try {
            await fetchYoutubeTranscript("dQw4w9WgXcQ");
            expect.unreachable("expected fetchYoutubeTranscript to throw");
        } catch (error) {
            expect(error).toBeInstanceOf(YoutubeTranscriptError);
            expect((error as Error).message).toMatch(/could not (reach|fetch)/i);
        }
    });
});
