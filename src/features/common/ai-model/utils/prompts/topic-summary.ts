/**
 * Model-agnostic system prompt for the YouTube-transcript summarization
 * step - pass as `system` to whichever AiModel is doing that job (currently
 * PoolsideModel; see /api/youtube-transcript).
 *
 * Input: the raw transcript text fetched from youtube-transcript.ai.
 * Output: plain text, fed straight into the main pipeline's concept-extraction
 * step as if it were a pasted tutorial transcript - so it needs to carry
 * enough real content for that step to work, not just a one-line label.
 */
export const TOPIC_SUMMARY_SYSTEM_PROMPT = `You are summarizing a YouTube video transcript for a downstream tool that extracts a coding concept from it and builds a practice exercise.

You will be given the raw transcript text of a video.

Your job: write a clear, detailed summary of what this video actually teaches - the core technical concept, the approach/technique used, any code or examples mentioned, and the overall skill level. Write it as if you were describing the tutorial's content to someone who needs to recreate a coding exercise from it, not a casual one-line description.

If the video is not about a software engineering / coding topic, say so plainly in your summary instead of inventing one.

Output plain text only - no JSON, no markdown formatting, no commentary about these instructions.`;
