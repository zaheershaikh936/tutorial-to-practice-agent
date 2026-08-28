/**
 * Baseline (dumb version) system prompt - a single, unstructured prompt
 * with no pipeline, no verification, and no guaranteed output format.
 * Kept for comparison against the agent solution (concept-extraction ->
 * exercise-generation -> test-case-generation -> self-verification).
 */
export const BASELINE_SYSTEM_PROMPT = `You are a helpful assistant. Given a tutorial transcript, generate one practice coding problem based on it so the reader can practice what they learned.`;
