import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentName,
      parentEmail,
      activitiesCount,
      lettersLearned,
      starsEarned,
    } = body;

    if (!studentName || !parentEmail) {
      return NextResponse.json(
        { error: "Student name and parent email are required" },
        { status: 400 }
      );
    }

    const message = `Assalamu Alaikum! Aaj ${studentName} ne ${activitiesCount || 0} activities ki. Seekha: ${lettersLearned || "N/A"}. Stars: ${starsEarned || 0}. MashaAllah! 🌟`;

    // Send email via Resend (if configured)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: "Tibyaan Academy <noreply@tibyaan.com>",
            to: parentEmail,
            subject: `Daily Activity Report — ${studentName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1B4332;">Tibyaan Academy</h2>
                <p style="font-size: 16px; line-height: 1.6;">
                  ${message}
                </p>
                <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; margin-top: 16px;">
                  <p style="margin: 0;"><strong>Activities:</strong> ${activitiesCount || 0}</p>
                  <p style="margin: 8px 0 0;"><strong>Letters:</strong> ${lettersLearned || "N/A"}</p>
                  <p style="margin: 8px 0 0;"><strong>Stars:</strong> ⭐ ${starsEarned || 0}</p>
                </div>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                  — Tibyaan Academy Team
                </p>
              </div>
            `,
          }),
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }

    // WhatsApp via Twilio (placeholder — requires Twilio credentials)
    // In production, this would use the Twilio API to send WhatsApp messages
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_WHATSAPP_FROM;
    const parentPhone = body.parentPhone;

    if (twilioSid && twilioToken && twilioFrom && parentPhone) {
      try {
        const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
        await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              From: `whatsapp:${twilioFrom}`,
              To: `whatsapp:${parentPhone}`,
              Body: message,
            }),
          }
        );
      } catch (whatsappError) {
        console.error("WhatsApp send error:", whatsappError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Parent alert sent",
      preview: message,
    });
  } catch (error) {
    console.error("Parent alert error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
