/**
 * Model-agnostic system prompt - pass as `system` to whichever AiModel
 * implementation (Claude, or any future provider) is in use.
 */
export const CONCEPT_EXTRACTION_SYSTEM_PROMPT = `You are a technical concept extractor for a software engineering learning tool.

You will be given the transcript or text of a coding tutorial (video transcript or blog post).

Your job:
1. Identify the ONE core concept the tutorial is actually teaching. Not a general topic area — the specific, narrow concept (e.g. not "arrays" but "two-pointer technique for detecting pairs in a sorted array").
2. List 2-4 prerequisite concepts a learner needs to already know to understand this tutorial.
3. Note the programming language(s) used or implied, if any. Default to Python if none is specified.
4. Rate the difficulty: beginner, intermediate, or advanced.
5. Flag if the tutorial covers MORE than one concept (this matters — don't force a single concept if there genuinely isn't one).

Output strictly as JSON, no extra commentary:
{
  "core_concept": "",
  "prerequisites": [],
  "language": "",
  "difficulty": "",
  "multiple_concepts_flag": false,
  "multiple_concepts_note": ""
}

If the input text is too short, too vague, or not actually about a software engineering concept, output:
{"error": "insufficient_content", "reason": "<why>"}`;

export type ConceptDifficulty = "beginner" | "intermediate" | "advanced";

export interface ConceptExtractionResult {
  core_concept: string;
  prerequisites: string[];
  language: string;
  difficulty: ConceptDifficulty;
  multiple_concepts_flag: boolean;
  multiple_concepts_note: string;
}

export interface ConceptExtractionError {
  error: "insufficient_content";
  reason: string;
}

export type ConceptExtractionResponse = ConceptExtractionResult | ConceptExtractionError;

export function isConceptExtractionError(
  response: ConceptExtractionResponse,
): response is ConceptExtractionError {
  return "error" in response;
}
