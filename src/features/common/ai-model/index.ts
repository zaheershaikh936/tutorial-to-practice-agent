import { AiModel } from "./base";
import { ClaudeModel } from "./anthropic";

export { AiModel } from "./base";
export { ClaudeModel } from "./anthropic";
/**
 * Registry of available providers. Adding a new provider (e.g. OpenAI, Gemini)
 * means adding one entry here - no other code needs to change.
 */
const providers: Record<string, () => AiModel> = { claude: () => new ClaudeModel() };

/**
 * Resolves an AiModel by provider name, defaulting to the AI_PROVIDER env var
 * (or "claude"). Callers depend only on the AiModel abstraction.
 */

const defaultProvider = process.env.AI_PROVIDER || "claude"
export function getAiModel(provider: string = defaultProvider): AiModel {
  const factory = providers[provider];
  if (!factory) throw new Error(`Unknown AI provider "${provider}". Available: ${Object.keys(providers).join(", ")}`);
  return factory();
}
