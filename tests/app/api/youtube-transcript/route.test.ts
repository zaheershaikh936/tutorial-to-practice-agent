import { describe, expect, it, vi, beforeEach } from "vitest";

const { generateMock } = vi.hoisted(() => ({ generateMock: vi.fn() }));

vi.mock("@/features/common/ai-model/poolside", () => {
    class PoolsideModel {
        generate = generateMock;
    }
    return { PoolsideModel };
});

const { fetchYoutubeTranscriptMock } = vi.hoisted(() => ({ fetchYoutubeTranscriptMock: vi.fn() }));

vi.mock("@/features/common/youtube/fetch-transcript", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/features/common/youtube/fetch-transcript")>();
    return { ...actual, fetchYoutubeTranscript: fetchYoutubeTranscriptMock };
});

import { POST } from "@/app/api/youtube-transcript/route";
import { YoutubeTranscriptError } from "@/features/common/youtube/fetch-transcript";

function makeRequest(body: unknown): Request {
    return new Request("http://localhost/api/youtube-transcript", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

const SAMPLE_TRANSCRIPT = {
    title: "Two Pointer Technique",
    sourceVideoUrl: "https://www.youtube.com/watch?v=abcdefghijk",
    language: "en",
    duration: "5:00",
    wordCount: 500,
    transcriptText: "In this video we cover the two-pointer technique for arrays and how it applies to sorted input.",
};

const VIDEO_URL = "https://www.youtube.com/watch?v=abcdefghijk";

describe("POST /api/youtube-transcript", () => {
    beforeEach(() => {
        generateMock.mockReset();
        fetchYoutubeTranscriptMock.mockReset();
    });

    it("rejects a video whose transcript isn't about programming", async () => {
        fetchYoutubeTranscriptMock.mockResolvedValue(SAMPLE_TRANSCRIPT);
        generateMock.mockResolvedValue(
            JSON.stringify({ is_programming_related: false, reason: "a music video" }),
        );

        const res = await POST(makeRequest({ videoUrl: VIDEO_URL }));
        const body = await res.json();

        expect(res.status).toBe(422);
        expect(body.error).toMatch(/doesn't look like a programming tutorial/i);
        expect(body.error).toMatch(/a music video/);
    });

    it("returns the summary for a programming-related video", async () => {
        fetchYoutubeTranscriptMock.mockResolvedValue(SAMPLE_TRANSCRIPT);
        generateMock.mockResolvedValue(
            JSON.stringify({ is_programming_related: true, summary: "Teaches the two-pointer technique." }),
        );

        const res = await POST(makeRequest({ videoUrl: VIDEO_URL }));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.topicSummary).toBe("Teaches the two-pointer technique.");
        expect(body.title).toBe(SAMPLE_TRANSCRIPT.title);
    });

    it("surfaces a friendly message (not the raw axios error) when the transcript service returns 403", async () => {
        fetchYoutubeTranscriptMock.mockRejectedValue(
            new YoutubeTranscriptError(
                "The transcript service blocked this request - it may be rate-limiting or restricting automated access right now. Try again in a moment, or try a different video.",
                502,
            ),
        );

        const res = await POST(makeRequest({ videoUrl: VIDEO_URL }));
        const body = await res.json();

        expect(res.status).toBe(502);
        expect(body.error).not.toMatch(/status code 403/i);
        expect(body.error).toMatch(/blocked this request/i);
    });

    it("returns 400 when the URL doesn't contain a recognizable video id", async () => {
        const res = await POST(makeRequest({ videoUrl: "not a url" }));
        expect(res.status).toBe(400);
    });
});
