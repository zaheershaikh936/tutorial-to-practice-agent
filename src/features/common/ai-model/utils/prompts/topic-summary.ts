import { z } from "zod";

/**
 * Model-agnostic system prompt for the YouTube-transcript summarization
 * step - pass as `system` to whichever AiModel is doing that job (currently
 * PoolsideModel; see /api/youtube-transcript).
 *
 * Input: the raw transcript text fetched from youtube-transcript.ai.
 * Output: strict JSON (see TopicSummaryResponseSchema below) so the route
 * can reject non-programming videos before they ever reach the main
 * pipeline, instead of forwarding whatever prose the model wrote.
 */
export const TOPIC_SUMMARY_SYSTEM_PROMPT = `You are summarizing a YouTube video transcript for a downstream tool that extracts a coding concept from it and builds a practice exercise.

You will be given the raw transcript text of a video.

First, decide whether this video is actually about a software engineering / coding topic (a tutorial, walkthrough, or explanation of a technique, tool, language, or framework).

If it IS about coding: write a clear, detailed summary of what this video actually teaches - the core technical concept, the approach/technique used, any code or examples mentioned, and the overall skill level. Write it as if you were describing the tutorial's content to someone who needs to recreate a coding exercise from it, not a casual one-line description.

If it is NOT about a coding topic (e.g. music, vlogs, cooking, gaming, unrelated tech news), do not invent a coding summary - just report what the video is actually about.

Output strictly as JSON, no extra commentary:

If it IS about coding:
{"is_programming_related": true, "summary": "<detailed summary>"}

If it is NOT about coding:
{"is_programming_related": false, "reason": "<brief description of what the video is actually about>"}`;

export const TopicSummarySuccessSchema = z.object({
  is_programming_related: z.literal(true),
  summary: z.string().min(1),
});

export type TopicSummarySuccess = z.infer<typeof TopicSummarySuccessSchema>;

export const TopicSummaryRejectionSchema = z.object({
  is_programming_related: z.literal(false),
  reason: z.string().min(1),
});

export type TopicSummaryRejection = z.infer<typeof TopicSummaryRejectionSchema>;

export const TopicSummaryResponseSchema = z.union([TopicSummarySuccessSchema, TopicSummaryRejectionSchema]);

export type TopicSummaryResponse = z.infer<typeof TopicSummaryResponseSchema>;

export function isTopicSummaryRejection(
  response: TopicSummaryResponse,
): response is TopicSummaryRejection {
  return response.is_programming_related === false;
}
