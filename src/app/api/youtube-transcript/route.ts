import { NextResponse } from "next/server";
import { extractYoutubeVideoId } from "@/features/common/youtube/extract-video-id";
import { fetchYoutubeTranscript } from "@/features/common/youtube/fetch-transcript";
import { PoolsideModel } from "@/features/common/ai-model/poolside";
import { TOPIC_SUMMARY_SYSTEM_PROMPT } from "@/features/common/ai-model/utils/prompts";

export async function POST(req: Request) {
    let videoUrl: unknown;
    try {
        ({ videoUrl } = await req.json());
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (typeof videoUrl !== "string" || !videoUrl.trim()) {
        return NextResponse.json(
            { error: "`videoUrl` is required and must be a non-empty string" },
            { status: 400 },
        );
    }

    const videoId = extractYoutubeVideoId(videoUrl);
    if (!videoId) {
        return NextResponse.json(
            { error: "Could not find a YouTube video id in that URL" },
            { status: 400 },
        );
    }

    try {
        const transcript = await fetchYoutubeTranscript(videoId);
        if (!transcript.transcriptText) {
            return NextResponse.json(
                { error: "This video has no transcript available" },
                { status: 422 },
            );
        }

        const poolside = new PoolsideModel();
        const topicSummary = await poolside.generate(transcript.transcriptText, TOPIC_SUMMARY_SYSTEM_PROMPT);

        return NextResponse.json({
            topicSummary,
            title: transcript.title,
            sourceVideoUrl: transcript.sourceVideoUrl,
        });
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
