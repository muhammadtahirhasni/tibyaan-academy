import { getDb } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { BaseAgent } from "./base-agent";
import type { AgentName, AgentTask } from "./types";

const NOTIFICATION_TEMPLATES: Record<
  string,
  { titleEn: string; titleUr: string; titleAr: string }
> = {
  match_request: {
    titleEn: "New Student Request",
    titleUr: "نئی طالب علم کی درخواست",
    titleAr: "طلب طالب جديد",
  },
  match_accepted: {
    titleEn: "Teacher Accepted Your Request",
    titleUr: "استاد نے آپ کی درخواست قبول کر لی",
    titleAr: "المعلم قبل طلبك",
  },
  match_rejected: {
    titleEn: "Match Request Update",
    titleUr: "درخواست کی تازہ کاری",
    titleAr: "تحديث طلب المطابقة",
  },
  video_approved: {
    titleEn: "Your Video Has Been Approved",
    titleUr: "آپ کی ویڈیو منظور ہو گئی",
    titleAr: "تمت الموافقة على الفيديو الخاص بك",
  },
  video_rejected: {
    titleEn: "Video Review Update",
    titleUr: "ویڈیو جائزے کی تازہ کاری",
    titleAr: "تحديث مراجعة الفيديو",
  },
  new_message: {
    titleEn: "New Message",
    titleUr: "نیا پیغام",
    titleAr: "رسالة جديدة",
  },
  new_recording: {
    titleEn: "New Class Recording Available",
    titleUr: "نئی کلاس ریکارڈنگ دستیاب ہے",
    titleAr: "تسجيل فصل جديد متاح",
  },
};

export class NotificationAgent extends BaseAgent {
  name: AgentName = "notification-agent";
  systemPrompt = `You are a notification system for Tibyaan Academy.
You format and route notifications to users in their preferred language.`;

  protected async run(task: AgentTask) {
    switch (task.type) {
      case "send_notification":
        return this.sendNotification(task);
      case "send_email":
        return this.sendEmail(task);
      default:
        throw new Error(
          `NotificationAgent: unsupported task type ${task.type}`
        );
    }
  }

  private async sendNotification(task: AgentTask) {
    const { userId, type, data } = task.input as {
      userId: string;
      type: string;
      data: Record<string, string>;
    };

    const template = NOTIFICATION_TEMPLATES[type];
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    const db = getDb();
    const result = await db
      .insert(notifications)
      .values({
        userId,
        type: type as "match_request" | "match_accepted" | "match_rejected" | "video_approved" | "video_rejected" | "new_message" | "new_recording" | "system",
        titleEn: template.titleEn,
        titleUr: template.titleUr,
        titleAr: template.titleAr,
        message: data.message ?? template.titleEn,
        link: data.link ?? null,
      })
      .returning({ id: notifications.id });

    return {
      output: {
        notificationId: result[0]?.id,
        sent: true,
      },
      tokensUsed: 0,
    };
  }

  private async sendEmail(task: AgentTask) {
    const { to, templateType, data, locale } = task.input as {
      to: string;
      templateType: string;
      data: Record<string, string>;
      locale: string;
    };

    // Use Resend API for email
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return {
        output: { sent: false, error: "RESEND_API_KEY not configured" },
        tokensUsed: 0,
      };
    }

    const template = NOTIFICATION_TEMPLATES[templateType];
    const subject = template
      ? locale === "ur"
        ? template.titleUr
        : locale === "ar"
          ? template.titleAr
          : template.titleEn
      : "Tibyaan Academy Notification";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Tibyaan Academy <noreply@tibyaan.com>",
        to: [to],
        subject,
        html: `<div style="font-family:sans-serif;direction:${locale === "ur" || locale === "ar" ? "rtl" : "ltr"}">
          <h2>${subject}</h2>
          <p>${data.message ?? ""}</p>
          ${data.link ? `<a href="${data.link}">View Details</a>` : ""}
        </div>`,
      }),
    });

    const result = await response.json();

    return {
      output: {
        sent: response.ok,
        messageId: (result as { id?: string }).id ?? null,
      },
      tokensUsed: 0,
    };
  }
}
