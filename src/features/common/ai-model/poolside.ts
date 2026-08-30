import { OpenRouterModel } from "./openrouter-model";

const DEFAULT_MODEL = "poolside/laguna-s-2.1:free";

/**
 * A separate, fixed model used only for the YouTube-transcript summarization
 * step (see /api/youtube-transcript) - not part of the main pipeline's
 * provider registry, since it's always this specific model for this
 * specific job, not something AI_PROVIDER switches.
 */
export class PoolsideModel extends OpenRouterModel {
  constructor() {
    super(DEFAULT_MODEL, process.env.POOLSIDE_MODEL, process.env.OPENROUTER_API_KEY_POOLSIDE);
  }
}
