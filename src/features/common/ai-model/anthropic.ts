import { OpenRouter } from "@openrouter/sdk";
import { AiModel } from "./base";

const DEFAULT_MODEL = "anthropic/claude-opus-5";

export class ClaudeModel extends AiModel {
  private readonly model: string;
  private readonly client: OpenRouter;

  constructor() {
    super();
    this.model = process.env.CLAUDE_MODEL || DEFAULT_MODEL;
    this.client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
  }

  public async generate(message: string, system?: string): Promise<string> {
    const response = await this.client.chat.send({
      chatRequest: {
        model: this.model,
        messages: [
          ...(system ? [{ role: "system" as const, content: system }] : []),
          { role: "user" as const, content: message },
        ],
        stream: true,
      },
    });

    if (!(response instanceof ReadableStream)) {
      throw new Error("Expected a streamed response from OpenRouter");
    }

    let output = "";
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) output += content;
    }
    return output;
  }
}
