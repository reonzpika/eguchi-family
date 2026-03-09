import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/projects - List all projects with owner info and descriptions.
 * Uses admin client to bypass RLS (app uses NextAuth, not Supabase Auth).
 * Ensures shared project and all projects are visible on preview/production.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();

    const { data: projectsData, error: projectsError } = await admin
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      return NextResponse.json(
        { error: "プロジェクトの読み込みに失敗しました" },
        { status: 500 }
      );
    }

    if (!projectsData || projectsData.length === 0) {
      return NextResponse.json({ projects: [] });
    }

    const userIds = [...new Set(projectsData.map((p) => p.user_id))];
    const { data: usersData } = await admin
      .from("users")
      .select("id, name, avatar_color")
      .in("id", userIds);

    const userMap = new Map(
      (usersData ?? []).map((u) => [
        u.id,
        { name: u.name, avatar_color: u.avatar_color },
      ])
    );

    const projectsWithMeta = await Promise.all(
      projectsData.map(async (project) => {
        const { data: latestDoc } = await admin
          .from("living_documents")
          .select("content")
          .eq("project_id", project.id)
          .order("version_number", { ascending: false })
          .limit(1)
          .maybeSingle();

        const description = latestDoc?.content
          ? latestDoc.content.slice(0, 60).replace(/\n/g, " ")
          : "説明なし";

        const userInfo = userMap.get(project.user_id) || {
          name: "不明",
          avatar_color: null,
        };

        return {
          ...project,
          users: userInfo,
          description,
        };
      })
    );

    return NextResponse.json({ projects: projectsWithMeta });
  } catch (err) {
    console.error("Error in GET /api/projects:", err);
    return NextResponse.json(
      { error: "プロジェクトの読み込みに失敗しました" },
      { status: 500 }
    );
  }
}
