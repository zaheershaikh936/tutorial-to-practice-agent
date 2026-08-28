import Anthropic from "@anthropic-ai/sdk";
import { AiModel } from "./base";

const DEFAULT_MODEL = "claude-opus-5";

export class ClaudeModel extends AiModel {
  private readonly model: string;
  private readonly client: Anthropic;

  constructor() {
    super();
    this.model = process.env.CLAUDE_MODEL || DEFAULT_MODEL;
    this.client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  }

  public async generate(message: string, system?: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      ...(system ? { system } : {}),
      messages: [{ role: "user", content: message }],
    });

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text",
    );
    return textBlock?.text ?? "";
  }
}
