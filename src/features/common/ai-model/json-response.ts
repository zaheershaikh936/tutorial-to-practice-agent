import { z } from "zod";

/**
 * Strips a ```json ... ``` fence if the model wrapped its output in one,
 * parses it, then validates the shape against `schema`. Prompts demand
 * strict JSON, but models sometimes fence it, omit a field, or return the
 * wrong type for one - this turns that into a clear error instead of an
 * `undefined` bug surfacing downstream.
 */
export function parseModelJson<T>(raw: string, schema: z.ZodType<T>, stepName: string): T {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonText = fenced ? fenced[1] : raw;

  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new Error(`${stepName} returned invalid JSON: ${raw.slice(0, 200)}`);
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`${stepName} returned data that doesn't match the expected shape: ${result.error.message}`);
  }
  return result.data;
}
