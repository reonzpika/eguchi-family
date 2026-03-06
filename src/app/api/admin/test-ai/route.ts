import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/family-members";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.member_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(session.user.member_id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Test message
    const testMessage = "「テスト」とだけ日本語で返信してください。";

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: testMessage,
        },
      ],
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      return NextResponse.json(
        { error: "AIからの応答がありませんでした" },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("Error in AI test API:", error);
    return NextResponse.json(
      { error: "AIテスト中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
