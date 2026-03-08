import openai from "@/lib/openai";

const SUMMARISATION_SYSTEM_PROMPT = `あなたは江口ファミリーの専用AIビジネスコーチです。
会話の内容をもとに、ビジネスアイデアを整理してまとめてください。

必ず以下のJSON形式のみで返答してください。他のテキストは含めないでください：

{
  "title": "アイデアの短いタイトル（20文字以内）",
  "summary": "アイデアの整理された説明（150文字程度、ポジティブなトーンで）",
  "suggestions": [
    "具体的な提案1（実行しやすいもの）",
    "具体的な提案2",
    "具体的な提案3"
  ],
  "nextStep": "今すぐできる最初のアクション（1つだけ、具体的に）"
}`;

export type Message = {
  role: "agent" | "user";
  content: string;
  options?: string[];
};

export type FullSummaryResult = {
  title: string;
  summary: string;
  suggestions: string[];
  nextStep: string;
};

export async function generateFullSummary(
  chatHistory: Message[]
): Promise<FullSummaryResult | null> {
  if (chatHistory.length === 0) return null;

  const chatHistoryText = chatHistory
    .map((msg) => {
      const role = msg.role === "agent" ? "コーチ" : "ユーザー";
      return `${role}: ${msg.content}`;
    })
    .join("\n");

  const userMessage = `以下の会話をもとに、ビジネスアイデアをまとめてください。

会話の内容：
${chatHistoryText}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SUMMARISATION_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
  });

  const responseText = completion.choices[0]?.message?.content;
  if (!responseText) return null;

  const clean = responseText.replace(/```json|```/g, "").trim();
  try {
    const parsed = JSON.parse(clean);
    return {
      title: typeof parsed.title === "string" ? parsed.title.slice(0, 100) : "新しいアイデア",
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : [],
      nextStep: typeof parsed.nextStep === "string" ? parsed.nextStep : "",
    };
  } catch {
    return null;
  }
}
