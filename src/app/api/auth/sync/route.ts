import { auth, currentUser } from "@clerk/nextjs/server";
import { createServerComponentClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const supabase = await createServerComponentClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (existingUser) {
      return NextResponse.json({ success: true, message: "User already exists" });
    }

    // Get user details from Clerk
    const name = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || user.username || "User";
    
    const email = user.emailAddresses[0]?.emailAddress || "";

    // Insert new user
    const { error: insertError } = await supabase.from("users").insert({
      clerk_id: userId,
      name: name,
      email: email,
      role: "member",
      avatar_color: null,
    });

    if (insertError) {
      console.error("Error syncing user:", insertError);
      return NextResponse.json(
        { error: "Failed to sync user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in user sync:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
