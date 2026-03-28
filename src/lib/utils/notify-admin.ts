/**
 * Send admin email notification for important events
 * Uses Resend API for transactional emails
 */

const ADMIN_EMAIL = "admin@tibyaan.com";

export async function notifyAdminNewSignup({
  email,
  fullName,
  role,
}: {
  email: string;
  fullName: string;
  role: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured — skipping admin notification");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Tibyaan Academy <notifications@tibyaan.com>",
        to: [ADMIN_EMAIL],
        subject: `New ${role} signup: ${fullName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #15803d;">New ${role === "teacher" ? "Teacher" : "Student"} Signup</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #666;">Name</td>
                <td style="padding: 8px;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #666;">Email</td>
                <td style="padding: 8px;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #666;">Role</td>
                <td style="padding: 8px;">${role}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #666;">Time</td>
                <td style="padding: 8px;">${new Date().toISOString()}</td>
              </tr>
            </table>
            <p style="margin-top: 16px; color: #999; font-size: 12px;">
              Tibyaan Academy Admin Notification
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Admin notification email failed:", text);
    }
  } catch (err) {
    console.error("Failed to send admin notification:", err);
  }
}
