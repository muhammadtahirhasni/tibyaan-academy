import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { titleEn, titleUr, titleAr, message, type, userIds, sendEmail, link } = body;

    if (!titleEn || !message) {
      return NextResponse.json({ error: "Title and message required" }, { status: 400 });
    }

    const db = getDb();

    // Determine target users
    let targetUserIds: string[] = [];
    if (userIds && userIds.length > 0) {
      targetUserIds = userIds;
    } else {
      // Send to all users
      const allUsers = await db.select({ id: users.id }).from(users);
      targetUserIds = allUsers.map((u) => u.id);
    }

    // Insert notifications for all target users
    const notificationValues = targetUserIds.map((userId: string) => ({
      userId,
      type: type || "system" as const,
      titleEn,
      titleUr: titleUr || null,
      titleAr: titleAr || null,
      message,
      link: link || null,
      emailSent: sendEmail || false,
    }));

    if (notificationValues.length > 0) {
      await db.insert(notifications).values(notificationValues);
    }

    // Email sending (if Resend configured and sendEmail is true)
    if (sendEmail && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Get email addresses for target users
        const targetUsers = await db
          .select({ email: users.email })
          .from(users)
          .where(sql`id = ANY(${targetUserIds})`);

        for (const targetUser of targetUsers) {
          await resend.emails.send({
            from: "Tibyaan Academy <noreply@tibyaan.com>",
            to: targetUser.email,
            subject: titleEn,
            text: message,
          });
        }
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      sent: targetUserIds.length,
    });
  } catch (error) {
    console.error("Send notification error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
