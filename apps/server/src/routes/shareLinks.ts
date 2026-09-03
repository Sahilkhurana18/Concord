import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "db";
import { requireUser } from "../lib/auth";
import type { CreateShareLinkRequest } from "shared/types";

const router = Router();
const SECRET = process.env.SHARE_LINK_SECRET ?? "dev-secret-change-me";

// Create a share link. The JWT itself encodes docId + permission + expiry,
// so *verifying* a link needs no DB lookup — just a signature check. We also
// persist a row so links can be listed and revoked from the doc's settings.
router.post("/", requireUser, async (req, res) => {
  const { docId, permission, expiresInHours } = req.body as CreateShareLinkRequest;
  const requester = req.user!;

  if (!docId || !permission) {
    return res.status(400).json({ error: "docId and permission are required" });
  }

  const doc = await prisma.doc.findUnique({ where: { id: docId } });
  if (!doc) return res.status(404).json({ error: "Document not found" });
  if (doc.ownerId !== requester.id) {
    return res.status(403).json({ error: "Only the owner can create share links" });
  }

  const expiresAt = expiresInHours ? new Date(Date.now() + expiresInHours * 3600_000) : null;
  const token = jwt.sign(
    { docId, permission },
    SECRET,
    expiresInHours ? { expiresIn: `${expiresInHours}h` } : {}
  );

  await prisma.shareLink.create({ data: { token, docId, permission, expiresAt } });

  res.json({ token, docId, permission, expiresAt });
});

// Verify a share link token — called when someone opens a /doc/:id?token=... URL.
// Checks both the JWT signature/expiry AND the DB row, so a revoked link
// (deleted or flagged) is rejected even before its JWT would naturally expire.
router.get("/verify", async (req, res) => {
  const { token } = req.query as { token?: string };
  if (!token) return res.status(400).json({ error: "token is required" });

  try {
    const decoded = jwt.verify(token, SECRET) as { docId: string; permission: string };

    const record = await prisma.shareLink.findUnique({ where: { token } });
    if (!record || record.revokedAt) {
      return res.status(401).json({ valid: false, error: "Link has been revoked" });
    }

    res.json({ valid: true, ...decoded });
  } catch {
    res.status(401).json({ valid: false, error: "Invalid or expired link" });
  }
});

// Revoke a share link without waiting for its JWT to expire.
router.delete("/:token", requireUser, async (req, res) => {
  const record = await prisma.shareLink.findUnique({ where: { token: req.params.token } });
  if (!record) return res.status(404).json({ error: "Link not found" });

  const doc = await prisma.doc.findUnique({ where: { id: record.docId } });
  if (doc?.ownerId !== req.user!.id) {
    return res.status(403).json({ error: "Only the owner can revoke this link" });
  }

  await prisma.shareLink.update({ where: { token: req.params.token }, data: { revokedAt: new Date() } });
  res.json({ ok: true });
});

export default router;
