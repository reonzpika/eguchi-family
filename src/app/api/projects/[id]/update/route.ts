import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { createServerComponentClient } from "@/lib/supabase-server";
import resend from "@/lib/resend";
import { render } from "@react-email/render";
import ProjectUpdatedEmail from "@/lib/emails/ProjectUpdatedEmail";

const UPDATE_SYSTEM_PROMPT = `あなたは江口ファミリーの専用AIビジネスコーチです。
既存のリビングドキュメントに新しい内容を自然に統合してください。
既存の内容を改善しながら、新しい情報を組み込んでください。

必ず以下のJSON形式のみで返答してください：
{
  "content": "更新されたドキュメント全文（マークダウン形式）",
  "changeSummary": "変更内容の要約（1文、日本語）"
}`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { newContent } = body;

    if (!newContent || !newContent.trim()) {
      return NextResponse.json(
        { error: "newContent is required" },
        { status: 400 }
      );
    }

    // Look up user in Supabase
    const supabase = await createServerComponentClient();
    const { data: dbUser, error: userError } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("clerk_id", userId)
      .single();

    if (userError || !dbUser) {
      console.error("Error finding user:", userError);
      return NextResponse.json(
        { error: "ユーザーが見つかりませんでした。" },
        { status: 404 }
      );
    }

    // Fetch project and verify ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, user_id, title")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "プロジェクトが見つかりませんでした。" },
        { status: 404 }
      );
    }

    if (project.user_id !== dbUser.id) {
      return NextResponse.json(
        { error: "このプロジェクトを更新する権限がありません。" },
        { status: 403 }
      );
    }

    // Fetch current latest living document
    const { data: currentDoc, error: docError } = await supabase
      .from("living_documents")
      .select("content, version_number")
      .eq("project_id", projectId)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    if (docError || !currentDoc) {
      return NextResponse.json(
        { error: "リビングドキュメントが見つかりませんでした。" },
        { status: 404 }
      );
    }

    // Call OpenAI to merge content
    const userMessage = `以下のリビングドキュメントに、新しいブレインストーミングの内容を統合してください。
既存の内容を改善しながら、新しい情報を自然に組み込んでください。
変更の要約も1文で教えてください。

既存のドキュメント：
${currentDoc.content}

新しい内容：
${newContent}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: UPDATE_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return NextResponse.json(
        { error: "AIの処理中にエラーが発生しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    // Strip markdown code fences if present
    const clean = responseText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      return NextResponse.json(
        { error: "AIの処理中にエラーが発生しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    if (!parsed.content || !parsed.changeSummary) {
      return NextResponse.json(
        { error: "AIの応答形式が正しくありませんでした。" },
        { status: 500 }
      );
    }

    // Get next version number
    const nextVersion = (currentDoc.version_number || 0) + 1;

    // Insert new living document version
    const { error: insertError } = await supabase
      .from("living_documents")
      .insert({
        project_id: projectId,
        content: parsed.content,
        version_number: nextVersion,
        change_summary: parsed.changeSummary,
      });

    if (insertError) {
      console.error("Error creating new version:", insertError);
      return NextResponse.json(
        { error: "バージョンの作成に失敗しました。" },
        { status: 500 }
      );
    }

    // Prepare email sending (non-blocking)
    // For MVP, all members receive all project update emails.
    // Per-user notification preferences can be added in a future phase.
    const emailPromise = (async () => {
      try {
        // Fetch all family members
        const { data: allUsers, error: usersError } = await supabase
          .from("users")
          .select("id, name, email")
          .neq("id", dbUser.id); // Exclude the user who made the update

        if (usersError || !allUsers || allUsers.length === 0) {
          console.error("Error fetching users for email:", usersError);
          return;
        }

        // Get project URL
        const projectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}`;

        // Render email template
        const emailHtml = await render(
          ProjectUpdatedEmail({
            memberName: dbUser.name || "メンバー",
            projectTitle: project.title,
            changeSummary: parsed.changeSummary,
            projectUrl,
          })
        );

        // Send emails to all family members
        const emailSends = allUsers.map((user) =>
          resend.emails.send({
            from: "eguchi-workspace@clinicpro.co.nz",
            to: user.email,
            subject: `🌸 ${dbUser.name || "メンバー"}さんが「${project.title}」を更新しました`,
            html: emailHtml,
          })
        );

        await Promise.all(emailSends);
      } catch (error) {
        console.error("Error sending notification emails:", error);
        // Don't throw - email failures shouldn't affect the API response
      }
    })();

    // Start email sending but don't await it
    // This ensures the response is returned quickly while emails are sent in the background
    emailPromise.catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in document update:", error);
    return NextResponse.json(
      { error: "ドキュメントの更新中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
