import OpenAI from "openai";

let _client: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing credentials. Set the OPENAI_API_KEY environment variable."
    );
  }
  _client = new OpenAI({ apiKey });
  return _client;
}

/** Lazy client so build does not require OPENAI_API_KEY. */
export default {
  get chat() {
    return getOpenAI().chat;
  },
};
