import { OpenRouter } from "@openrouter/sdk";
import { AiModel } from "./base";

/**
 * Shared base for any AiModel backed by OpenRouter - subclasses just supply
 * a default model id, a model-override env value, and an API key. See
 * ClaudeModel / PoolsideModel.
 */
export abstract class OpenRouterModel extends AiModel {
  private readonly model: string;
  private readonly client: OpenRouter;

  constructor(defaultModel: string, modelOverride: string | undefined, apiKey: string | undefined) {
    super();
    this.model = modelOverride || defaultModel;
    this.client = new OpenRouter({ apiKey });
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
