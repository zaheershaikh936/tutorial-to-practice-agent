import { z } from "zod";

export const pipelineInputSchema = z.object({
    message: z.string("a tutorial transcript. Paste the full text, not a single question",
    ).min(30, "Message must be at least 30 characters long"),
});
