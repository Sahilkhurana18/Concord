import { Router } from "express";
import { prisma } from "db";
import { requireUser } from "../lib/auth";
import { asyncHandler } from "../lib/asyncHandler";

const router = Router();

// Called when a logged-in user opens their invite link. Marks them as an
// accepted collaborator so they show up in the doc's collaborator list and
// the doc appears in their "shared with me" dashboard section.
router.post("/", requireUser, asyncHandler(async (req, res) => {
  const { docId } = req.body as { docId?: string };
  const email = req.user!.email;

  if (!docId) return res.status(400).json({ error: "docId is required" });

  const collaborator = await prisma.collaborator.findUnique({
    where: { docId_email: { docId, email } },
  });

  if (!collaborator) {
    return res.status(404).json({ error: "No invite found for this email" });
  }

  await prisma.collaborator.update({
    where: { docId_email: { docId, email } },
    data: { status: "accepted" },
  });

  res.json({ ok: true, docId });
}));

export default router;
