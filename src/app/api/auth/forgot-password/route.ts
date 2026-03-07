import { NextRequest, NextResponse } from "next/server";
import { getMemberById } from "@/lib/family-members";
import resend from "@/lib/resend";

const FROM = "eguchi-family@clinicpro.co.nz";
const TO = "ryo@clinicpro.co.nz";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { member_id } = body;

    if (!member_id || typeof member_id !== "string") {
      return NextResponse.json(
        { error: "member_id is required" },
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

    const now = new Date();
    const timeStr = now.toLocaleString("en-NZ", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Pacific/Auckland",
    });

    const html = `
      <p><strong>Forgot password request</strong></p>
      <p>Someone requested help with their password for the Eguchi Family app.</p>
      <ul>
        <li><strong>Member:</strong> ${member.name} (${member.member_id})</li>
        <li><strong>Time:</strong> ${timeStr}</li>
      </ul>
      <p>You can reset their password via the admin area or by helping them set a new one on the sign-in screen.</p>
    `.trim();

    await resend.emails.send({
      from: FROM,
      to: TO,
      subject: `Eguchi Family: ${member.name} forgot password`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password email error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
