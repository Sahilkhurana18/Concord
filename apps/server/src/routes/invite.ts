import { Router } from "express";
import { sendInviteEmail } from "../lib/email";
import { prisma } from "db";
import { requireUser } from "../lib/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { randomUUID } from "crypto";
import type { InviteRequest } from "shared/types";

const router = Router();

router.post("/", requireUser, asyncHandler(async (req, res) => {
  const { docId, email, permission } = req.body as InviteRequest;
  const inviter = req.user!;

  if (!docId || !email || !permission) {
    return res.status(400).json({ error: "docId, email, and permission are required" });
  }

  const doc = await prisma.doc.findUnique({ where: { id: docId } });
  if (!doc) return res.status(404).json({ error: "Document not found" });
  if (doc.ownerId !== inviter.id) {
    return res.status(403).json({ error: "Only the owner can invite collaborators" });
  }

  const inviteToken = randomUUID();

  await prisma.collaborator.upsert({
    where: { docId_email: { docId, email } },
    update: { permission, status: "invited" },
    create: { docId, email, permission, status: "invited" },
  });

  const acceptUrl = `${process.env.WEB_ORIGIN}/invite/${inviteToken}?doc=${docId}`;

  try {
    await sendInviteEmail({
      to: email,
      docTitle: doc.title,
      acceptUrl,
      permission,
    });
  } catch (err) {
    console.error("[invite] Failed to send invite email:", err);
    return res.status(502).json({ error: "Invite was recorded, but the email failed to send." });
  }

  res.json({ ok: true, invitedBy: inviter.id });
}));

export default router;
