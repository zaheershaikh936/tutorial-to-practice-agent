import { getHttpClient } from "@/features/lib/http";

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
    const res = await client.get<string>(`/transcript/${videoId}.txt`, {
        responseType: "text",
    });
    return parseYoutubeTranscript(res.data);
}
