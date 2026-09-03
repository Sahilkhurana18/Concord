import { Resend } from "resend";
import type { Permission } from "shared/types";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInviteEmailArgs {
  to: string;
  docTitle: string;
  acceptUrl: string;
  permission: Permission;
}

export async function sendInviteEmail({ to, docTitle, acceptUrl, permission }: SendInviteEmailArgs) {
  const permissionLabel = permission === "edit" ? "edit" : "view";

  // Resend's SDK does NOT throw on API-level errors (e.g. an unverified
  // "from" domain) — it resolves normally with an `error` field populated
  // instead. Checking that explicitly is required, or a rejected send
  // looks identical to a successful one from our code's perspective.
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Concord <onboarding@resend.dev>",
    to,
    subject: `You've been invited to collaborate on "${docTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>You're invited to collaborate</h2>
        <p>You've been given <strong>${permissionLabel}</strong> access to "<strong>${docTitle}</strong>".</p>
        <a href="${acceptUrl}"
           style="display:inline-block;padding:10px 20px;background:#111;color:#fff;
                  border-radius:6px;text-decoration:none;margin-top:12px;">
          Open document
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px;">
          If you weren't expecting this, you can ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[email] Resend rejected the send:", error);
    throw new Error(`Failed to send invite email: ${error.message}`);
  }

  console.log("[email] Invite email sent, Resend id:", data?.id);
}
