import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const adminClerkId = process.env.ADMIN_CLERK_ID;
    if (userId !== adminClerkId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createAdminClient();

    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, email, role, created_at, clerk_id")
      .order("created_at", { ascending: true });

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json([]);
    }

    // For each user, count their ideas and projects
    const membersWithCounts = await Promise.all(
      users.map(async (user) => {
        const [ideasResult, projectsResult] = await Promise.all([
          supabase
            .from("ideas")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

        return {
          ...user,
          ideasCount: ideasResult.count || 0,
          projectsCount: projectsResult.count || 0,
        };
      })
    );

    return NextResponse.json(membersWithCounts);
  } catch (error) {
    console.error("Error in admin members API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
