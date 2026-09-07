import { OpenRouterModel } from "./openrouter-model";

const DEFAULT_MODEL = "minimax/minimax-m3:free";

export class ClaudeModel extends OpenRouterModel {
  constructor() {
    super(DEFAULT_MODEL, process.env.CLAUDE_MODEL, process.env.OPENROUTER_API_KEY);
  }
}
