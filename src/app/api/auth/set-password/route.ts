import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getMemberById } from "@/lib/family-members";
import { createAdminClient } from "@/lib/supabase-admin";

const BCRYPT_ROUNDS = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { member_id, password } = body;

    if (!member_id || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "member_id and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const member = getMemberById(member_id);
    if (!member) {
      return NextResponse.json(
        { error: "Invalid member" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from("users")
      .select("id, password_hash")
      .eq("member_id", member_id)
      .single();

    if (existing?.password_hash) {
      return NextResponse.json(
        { error: "Password already set for this member" },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    if (existing) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ password_hash, name: member.name, role: member.role })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Error updating password:", updateError);
        return NextResponse.json(
          { error: "Failed to set password" },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabase.from("users").insert({
        member_id: member.member_id,
        name: member.name,
        role: member.role,
        password_hash,
        avatar_color: null,
      });

      if (insertError) {
        console.error("Error creating user:", insertError);
        return NextResponse.json(
          { error: "Failed to set password" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
