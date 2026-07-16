// Mail utility to send broadcast announcements
export async function sendEmailBroadcast({
  to,
  subject,
  content,
  senderName,
}: {
  to: string[];
  subject: string;
  content: string;
  senderName: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  console.log(`[Mail Broadcast] Sending to ${to.length} recipients:`, to);
  console.log(`[Mail Broadcast] Subject: ${subject}`);
  console.log(`[Mail Broadcast] Content: ${content.substring(0, 100)}...`);

  if (!apiKey) {
    console.warn(
      "[Mail Broadcast] RESEND_API_KEY is not set. Email broadcast logged to console."
    );
    return { success: true, mocked: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${senderName} <announcements@rotaract3192.org>`,
        to: to,
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
            <h2 style="color: #0f172a; margin-top: 0;">${subject}</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${content}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 11px;">Sent from the Rotaract District 3192 Portal. You received this because of your role in your Rotaract Club.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("[Mail Broadcast] Error sending email via Resend:", error);
    return { success: false, error };
  }
}
