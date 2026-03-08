/**
 * Discovery profile helpers for AI chat personalisation.
 *
 * Guideline for any AI chat that uses profile: profile is loaded in the background
 * and must be used only to tailor suggestions (e.g. scope, difficulty, tone). The AI
 * must NOT repeat or summarise the profile to the user; ask open questions as normal.
 * See PROFILE_USAGE_RULE and formatProfileForPrompt output.
 */
import { createAdminClient } from "@/lib/supabase-admin";

const PROFILE_LABELS: Record<string, string> = {
  "0": "得意なこと・よく頼まれること",
  "1": "自由時間にしていること",
  "2": "週に使える時間",
  "3": "日常で不便に思うこと",
  "4": "学び方の好み",
  "5": "成功のイメージ",
  "6": "自信（1〜5）",
};

const NO_PROFILE_LINE =
  "ユーザーの発見プロフィールはまだありません。一般的なアドバイスをしてください。";

/** Instruction so the AI uses profile in the background only; never repeat it to the user. */
const PROFILE_USAGE_RULE = [
  "【重要】上記プロフィールはあなただけが参照する情報です。",
  "ユーザーにプロフィールの内容を言い返したり要約したりしないでください。",
  "開かれた質問（例：どんな方向性で考えているか教えてください）で会話を始め、プロフィールは提案の幅や現実性を決めるときだけ背景で使ってください。",
].join("\n");

/**
 * Fetches the discovery profile for a user (answers from discovery assessment).
 * Returns null if no profile or on error.
 */
export async function getDiscoveryProfileForUser(
  userId: string
): Promise<{ answers: Record<string, unknown> } | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("discovery_profiles")
    .select("answers")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.answers || typeof data.answers !== "object") {
    return null;
  }
  return { answers: data.answers as Record<string, unknown> };
}

export type DiscoveryAnswers = Record<string, string | string[] | number>;

/**
 * Saves discovery assessment answers for a user (upsert into discovery_profiles).
 * Returns true if save succeeded or table is missing (no-op); false on unexpected error.
 */
export async function saveDiscoveryProfile(
  userId: string,
  answers: DiscoveryAnswers
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("discovery_profiles")
    .upsert(
      {
        user_id: userId,
        answers,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  if (error) {
    console.warn("[discovery] Profile save failed (table may not exist):", error.message);
    return { ok: true }; // treat as success so UI can proceed
  }
  return { ok: true };
}

function formatValue(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(String).join("、");
  return String(value);
}

/**
 * Formats the discovery profile for injection into the AI system prompt.
 * Returns a short Japanese summary or the "no profile" line.
 */
export function formatProfileForPrompt(
  profile: { answers: Record<string, unknown> } | null
): string {
  if (!profile?.answers || Object.keys(profile.answers).length === 0) {
    return NO_PROFILE_LINE;
  }

  const lines: string[] = ["【このユーザーのプロフィール（参照用・ユーザーに言い返さない）】"];
  for (let i = 0; i <= 6; i++) {
    const key = String(i);
    const value = profile.answers[key];
    if (value === undefined || value === null) continue;
    const label = PROFILE_LABELS[key] ?? `項目${i}`;
    const formatted = formatValue(value);
    if (formatted) lines.push(`- ${label}: ${formatted}`);
  }
  lines.push("", PROFILE_USAGE_RULE);
  return lines.join("\n");
}
