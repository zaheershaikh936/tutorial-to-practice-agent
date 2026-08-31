import { getHttpClient, HttpRequestError } from "@/features/lib/http";

/** A transcript-fetch failure with an HTTP status suitable for the API response. */
export class YoutubeTranscriptError extends Error {
    constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
        this.name = "YoutubeTranscriptError";
    }
}

/**
 * Translates the transcript service's raw HTTP failure into a message a
 * user can actually act on - "Request failed with status code 403" tells
 * them nothing about whether to retry, wait, or pick a different video.
 */
function toYoutubeTranscriptError(error: unknown): YoutubeTranscriptError {
    if (!(error instanceof HttpRequestError)) {
        return new YoutubeTranscriptError("Could not reach the transcript service. Please try again.", 502);
    }

    switch (error.status) {
        case 401:
        case 403:
            return new YoutubeTranscriptError(
                "The transcript service blocked this request - it may be rate-limiting or restricting automated access right now. Try again in a moment, or try a different video.",
                502,
            );
        case 404:
            return new YoutubeTranscriptError("No transcript could be found for this video.", 404);
        case 429:
            return new YoutubeTranscriptError(
                "The transcript service is rate-limiting requests right now. Please wait a moment and try again.",
                429,
            );
        default:
            if (error.status !== undefined && error.status >= 500) {
                return new YoutubeTranscriptError(
                    "The transcript service is temporarily unavailable. Please try again shortly.",
                    502,
                );
            }
            return new YoutubeTranscriptError(
                "Could not fetch this video's transcript. Please try again or use a different video.",
                502,
            );
    }
}

export interface YoutubeTranscript {
    title: string;
    sourceVideoUrl: string;
    language: string;
    duration: string;
    wordCount: number;
    transcriptText: string;
}

/**
 * Parses youtube-transcript.ai's plain-text response, e.g.:
 *
 * # Transcript: <title>
 *
 * Source video: <url>
 * Language: en · Duration: 3:27 · Words: 481
 * ...
 *
 * ## Transcript
 * [0:01] some words ...
 */
export function parseYoutubeTranscript(raw: string): YoutubeTranscript {
    const [header = "", body = ""] = raw.split(/\n##\s*Transcript\s*\n/);

    const title = header.match(/^#\s*Transcript:\s*(.+)$/m)?.[1]?.trim() ?? "Unknown title";
    const sourceVideoUrl = header.match(/^Source video:\s*(.+)$/m)?.[1]?.trim() ?? "";
    const meta = header.match(/^Language:\s*(\S+)\s*·\s*Duration:\s*(\S+)\s*·\s*Words:\s*(\d+)/m);

    const transcriptText = body
        .replace(/\[?\d{1,2}:\d{2}(?::\d{2})?\]?/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return {
        title,
        sourceVideoUrl,
        language: meta?.[1] ?? "",
        duration: meta?.[2] ?? "",
        wordCount: meta ? Number(meta[3]) : 0,
        transcriptText,
    };
}

export async function fetchYoutubeTranscript(videoId: string): Promise<YoutubeTranscript> {
    const client = getHttpClient("youtubeTranscript");
    try {
        const res = await client.get<string>(`/transcript/${videoId}.txt`, {
            responseType: "text",
        });
        return parseYoutubeTranscript(res.data);
    } catch (error) {
        throw toYoutubeTranscriptError(error);
    }
}
