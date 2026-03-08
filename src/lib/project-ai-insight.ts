import { createAdminClient } from "@/lib/supabase-admin";
import openai from "@/lib/openai";

/**
 * Persist an AI insight for the project (shown in At A Glance).
 */
export async function updateProjectAiInsight(
  projectId: string,
  insight: string
): Promise<void> {
  if (!insight?.trim()) return;
  try {
    const supabase = createAdminClient();
    await supabase
      .from("projects")
      .update({
        ai_insight: insight.trim().slice(0, 500),
        ai_insight_updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);
  } catch (err) {
    console.error("updateProjectAiInsight error:", err);
  }
}

/**
 * Generate a short celebratory/encouraging insight after milestone completion
 * and save it to the project.
 */
export async function generateMilestoneCompleteInsight(
  projectId: string,
  projectTitle: string,
  milestoneTitle: string,
  progressPercentage: number
): Promise<void> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a warm, supportive Japanese family business coach. Reply with exactly one short sentence in Japanese (max 50 characters). Encouraging and celebratory. No quotes or prefix.",
        },
        {
          role: "user",
          content: `Project: ${projectTitle}. Just completed milestone: ${milestoneTitle}. Overall progress: ${progressPercentage}%. Reply with one short encouraging sentence in Japanese for the project page.`,
        },
      ],
      max_tokens: 80,
    });
    const text = completion.choices[0]?.message?.content?.trim();
    if (text) await updateProjectAiInsight(projectId, text);
  } catch (err) {
    console.error("generateMilestoneCompleteInsight error:", err);
  }
}
