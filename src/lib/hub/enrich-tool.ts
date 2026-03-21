import openai from "@/lib/openai";
import type { HubMissionDraft, HubToolProfile } from "@/types/hub";

const SYSTEM = `あなたは家族向けのAIツール紹介アシスタントです。出力は必ず有効なJSONのみ（説明文やマークダウン禁止）。
日本語で、非技術者にも分かる短い文にしてください。`;

export interface EnrichToolInput {
  name: string;
  website_url?: string | null;
  note?: string | null;
}

export interface EnrichToolResult {
  profile: HubToolProfile;
  mission_draft: HubMissionDraft;
}

export async function enrichToolWithAI(
  input: EnrichToolInput
): Promise<EnrichToolResult> {
  const userParts = [
    `ツール名: ${input.name}`,
    input.website_url ? `公式URL: ${input.website_url}` : "",
    input.note ? `家族からのメモ: ${input.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const schemaHint = `{
  "profile": {
    "summary": "1〜2文でこのツールでできること",
    "good_for": ["向いている用途3つまで"],
    "bad_for": ["向いていない用途2〜3つ"],
    "cautions": ["プライバシー・誤情報・利用上の注意を短く2〜4つ"],
    "extra_sections": [{"title": "セクション名", "body": "補足（任意）"}]
  },
  "mission_draft": {
    "title": "今日のミッション（短く具体的）",
    "estimated_minutes": 10,
    "steps": ["手順1", "手順2", "手順3"],
    "prompt_blocks": [{"label": "コピー用", "text": "そのまま貼れるプロンプト"}],
    "done_criteria": ["完成の確認1", "確認2"]
  }
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `${userParts}\n\n次のJSONスキーマに従って埋めてください:\n${schemaHint}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("empty AI response");
  }

  const parsed = JSON.parse(raw) as {
    profile?: HubToolProfile;
    mission_draft?: HubMissionDraft;
  };

  if (!parsed.profile || !parsed.mission_draft) {
    throw new Error("invalid AI JSON shape");
  }

  return {
    profile: {
      summary: parsed.profile.summary ?? "",
      good_for: parsed.profile.good_for ?? [],
      bad_for: parsed.profile.bad_for ?? [],
      cautions: parsed.profile.cautions ?? [],
      extra_sections: parsed.profile.extra_sections ?? [],
    },
    mission_draft: {
      title: parsed.mission_draft.title ?? "はじめてのミッション",
      estimated_minutes: parsed.mission_draft.estimated_minutes ?? 10,
      steps: Array.isArray(parsed.mission_draft.steps)
        ? parsed.mission_draft.steps
        : [],
      prompt_blocks: Array.isArray(parsed.mission_draft.prompt_blocks)
        ? parsed.mission_draft.prompt_blocks
        : [],
      done_criteria: Array.isArray(parsed.mission_draft.done_criteria)
        ? parsed.mission_draft.done_criteria
        : [],
    },
  };
}
