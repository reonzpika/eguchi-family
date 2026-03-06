import { NextRequest, NextResponse } from "next/server";
import { getMemberById } from "@/lib/family-members";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const member_id = searchParams.get("member_id");

    if (!member_id) {
      return NextResponse.json(
        { error: "member_id is required" },
        { status: 400 }
      );
    }

    if (!getMemberById(member_id)) {
      return NextResponse.json(
        { error: "Invalid member" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data } = await supabase
      .from("users")
      .select("password_hash")
      .eq("member_id", member_id)
      .single();

    return NextResponse.json({
      hasPassword: Boolean(data?.password_hash),
    });
  } catch (error) {
    console.error("Auth status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
