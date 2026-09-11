import { inngest } from "@/lib/inngest";
import {
  SITE_URL,
  SUPPORT_EMAIL,
  MAIL_FROM,
  ADMIN_WHATSAPP as SITE_ADMIN_WHATSAPP,
} from "@/lib/site-config";

const ADMIN_EMAIL = SUPPORT_EMAIL;
const ADMIN_WHATSAPP = SITE_ADMIN_WHATSAPP;

// Workflow A — Trial Expiry Reminder
export const trialExpiryWorkflow = inngest.createFunction(
  {
    id: "trial-expiry-reminder",
    triggers: [{ event: "user/trial.started" }],
  },
  async ({ event, step }: { event: { data: { userId: string; userName: string } }; step: any }) => {
    const { userId, userName } = event.data;

    await step.sleep("wait-3-days", "3d");
    await step.run("send-day3-reminder", async () => {
      await sendNotification(ADMIN_WHATSAPP, ADMIN_EMAIL,
        `📚 Trial Reminder: ${userName} - 2 din baaki hain. Abhi enroll karein!`,
        `Trial Reminder: ${userName}`, `User ${userName} ka trial 2 din mein khatam.`
      );
    });

    await step.sleep("wait-2-more-days", "2d");
    await step.run("send-day5-reminder", async () => {
      await sendNotification(ADMIN_WHATSAPP, ADMIN_EMAIL,
        `⏰ Last Day! ${userName} ka trial aaj khatam ho raha hai.`,
        `Last Day Trial: ${userName}`, `${userName} trial last day.`
      );
    });

    await step.sleep("wait-1-more-day", "1d");
    await step.run("send-trial-ended", async () => {
      await sendEmailNotification(ADMIN_EMAIL, `Trial Ended: ${userName}`,
        `User ${userName} (ID: ${userId}) ka trial khatam ho gaya. Follow up karein.`
      );
    });

    return { userId, status: "trial_reminders_sent" };
  }
);

// Workflow B — Welcome Flow
export const welcomeWorkflow = inngest.createFunction(
  {
    id: "welcome-flow",
    triggers: [{ event: "user/signed.up" }],
  },
  async ({ event, step }: { event: { data: { userId: string; userName: string; whatsapp?: string } }; step: any }) => {
    const { userId, userName, whatsapp } = event.data;

    await step.run("send-welcome", async () => {
      const msg = `Assalamu Alaikum ${userName}! 🕌 Tibyaan Academy mein khush amdeed! ${SITE_URL}/dashboard`;
      if (whatsapp) await sendWhatsAppMessage(whatsapp, msg);
    });

    await step.sleep("wait-24-hours", "24h");
    await step.run("send-how-was-class", async () => {
      if (whatsapp) await sendWhatsAppMessage(whatsapp, `Assalamu Alaikum ${userName}! Pehli class kaisi rahi? 😊`);
    });

    await step.sleep("wait-7-days", "7d");
    await step.run("send-review-request", async () => {
      if (whatsapp) await sendWhatsAppMessage(whatsapp, `JazakAllah ${userName}! Review karein: ${SITE_URL}/reviews`);
    });

    return { userId, status: "welcome_flow_complete" };
  }
);

// Workflow C — Student Inactivity Alert
export const inactivityWorkflow = inngest.createFunction(
  {
    id: "student-inactivity-alert",
    triggers: [{ event: "user/login.detected" }],
  },
  async ({ event, step }: { event: { data: { userId: string; userName: string; whatsapp?: string } }; step: any }) => {
    const { userId, userName, whatsapp } = event.data;

    await step.sleep("wait-4-days", "4d");
    await step.run("check-and-notify", async () => {
      if (whatsapp) await sendWhatsAppMessage(whatsapp, `Assalamu Alaikum ${userName}! ❤️ Aapki yaad aa rahi hai! Tibyaan Academy wapas aayein.`);
    });

    await step.sleep("wait-3-more-days", "3d");
    await step.run("send-comeback-email", async () => {
      await sendEmailNotification(ADMIN_EMAIL, `Inactive Student: ${userName}`,
        `Student ${userName} (ID: ${userId}) 7 dinon se login nahi hua.`
      );
    });

    return { userId, status: "inactivity_notifications_sent" };
  }
);

// Workflow D — API Limit Monitor
export const apiLimitMonitor = inngest.createFunction(
  {
    id: "api-limit-monitor",
    triggers: [{ cron: "0 * * * *" }],
  },
  async ({ step }: { step: any }) => {
    await step.run("check-api-usage", async () => {
      // Placeholder for actual API usage check
      const usagePercent = 0;
      if (usagePercent > 95) {
        await sendWhatsAppMessage(ADMIN_WHATSAPP, `🚨 URGENT: Claude API usage is at ${usagePercent}%!`);
        await sendEmailNotification(ADMIN_EMAIL, "URGENT: Claude API Near Limit", `Usage: ${usagePercent}%`);
      } else if (usagePercent > 80) {
        await sendEmailNotification(ADMIN_EMAIL, "Warning: Claude API Usage High", `Usage: ${usagePercent}%`);
      }
    });
  }
);

// Workflow E — Weekly SEO Report
export const weeklySeoreport = inngest.createFunction(
  {
    id: "weekly-seo-report",
    triggers: [{ cron: "0 4 * * 5" }], // Friday 4 AM UTC = 9 AM PKT
  },
  async ({ step }: { step: any }) => {
    await step.run("generate-seo-report", async () => {
      const report = `Tibyaan Academy - Weekly SEO Report (${new Date().toDateString()})\n\nPlatform: ${SITE_URL}\nStatus: Active`;
      await sendEmailNotification(ADMIN_EMAIL, "Weekly SEO Report — Tibyaan Academy", report);
    });
  }
);

// Helper functions
async function sendWhatsAppMessage(to: string, message: string) {
  const whatsappKey = process.env.WHATSAPP_API_KEY;
  if (!whatsappKey) {
    console.log(`[WhatsApp Mock] To: ${to} | Message: ${message}`);
    return;
  }
  console.log(`[WhatsApp] Sending to ${to}: ${message}`);
}

async function sendEmailNotification(to: string, subject: string, body: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: MAIL_FROM, to, subject, text: body }),
    });
    if (!response.ok) console.error("Email send failed:", await response.text());
  } catch (err) {
    console.error("Email error:", err);
  }
}

async function sendNotification(whatsapp: string, email: string, waMsg: string, emailSubject: string, emailBody: string) {
  await sendWhatsAppMessage(whatsapp, waMsg);
  await sendEmailNotification(email, emailSubject, emailBody);
}
