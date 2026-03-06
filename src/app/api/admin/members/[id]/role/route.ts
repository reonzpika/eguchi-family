import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/family-members";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.member_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(session.user.member_id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: memberId } = await params;

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch current user to get their role
    const { data: member, error: fetchError } = await supabase
      .from("users")
      .select("role")
      .eq("id", memberId)
      .single();

    if (fetchError || !member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Toggle role between 'member' and 'admin'
    const newRole = member.role === "admin" ? "member" : "admin";

    // Update role
    const { error: updateError } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", memberId);

    if (updateError) {
      console.error("Error updating role:", updateError);
      return NextResponse.json(
        { error: "Failed to update role" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, role: newRole });
  } catch (error) {
    console.error("Error in admin role update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
