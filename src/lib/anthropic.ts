import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Single source of truth for the model. Bump here, not in each route, so an
// in-app AI call can never silently point at a retired model again.
export const CLAUDE_MODEL = "claude-sonnet-4-6";

export default anthropic;
