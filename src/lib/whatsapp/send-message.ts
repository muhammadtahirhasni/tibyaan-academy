const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<SendMessageResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.error("WhatsApp not configured: missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID");
    return { success: false, error: "WhatsApp not configured" };
  }

  // Normalize phone number (remove spaces, dashes, ensure starts with country code)
  const normalizedTo = to.replace(/[\s\-()]/g, "").replace(/^\+/, "");

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: normalizedTo,
          type: "text",
          text: { body: text },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("WhatsApp API error:", response.status, errorBody);
      return {
        success: false,
        error: `WhatsApp API error ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("WhatsApp send error:", message);
    return { success: false, error: message };
  }
}
