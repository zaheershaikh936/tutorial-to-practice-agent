import { describe, expect, it, vi, beforeEach } from "vitest";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock("@/features/lib/http", () => ({
    getHttpClient: () => ({ get: getMock }),
}));

import { parseYoutubeTranscript, fetchYoutubeTranscript } from "@/features/common/youtube/fetch-transcript";

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
});
