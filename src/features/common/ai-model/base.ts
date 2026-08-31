import { NextResponse } from "next/server";

/**
 * Template method base: subclasses only implement `generate` (provider-specific
 * call); request parsing, validation, and error handling.
 */
export abstract class AiModel {
  /**
   * `system` is set by server-side callers (routes, the pipeline orchestrator) -
   * never taken from client-supplied request bodies, so a caller can't override
   * which system prompt runs.
   */
  public abstract generate(message: string, system?: string): Promise<string>;

  public async callAPI(req: Request, system?: string): Promise<NextResponse> {
    let message: unknown;
    try {
      ({ message } = await req.json());
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (typeof message !== "string" || !message.trim()) return NextResponse.json({ error: "`message` is required and must be a non-empty string" }, { status: 400 });

    try {
      const output = await this.generate(message, system);
      return NextResponse.json({ output });
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }
}
