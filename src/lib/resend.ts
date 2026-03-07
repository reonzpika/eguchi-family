import { Resend } from "resend";

let _client: Resend | null = null;

const RESEND_ERROR =
  "RESEND_API_KEY is not set. Please add it to your .env.local file.";

function getResend(): Resend {
  if (_client) return _client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(RESEND_ERROR);
  }
  _client = new Resend(apiKey);
  return _client;
}

/** Stub used when RESEND_API_KEY is missing; throws only when send() is called. */
function getResendStub(): { emails: { send: (opts: unknown) => Promise<never> } } {
  return {
    emails: {
      send: async () => {
        throw new Error(RESEND_ERROR);
      },
    },
  };
}

/** Lazy client so build does not require RESEND_API_KEY. */
export default {
  get emails() {
    try {
      return getResend().emails;
    } catch {
      return getResendStub().emails;
    }
  },
};
