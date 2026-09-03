import { Router } from "express";
import { prisma } from "db";
import { requireUser } from "../lib/auth";
import { asyncHandler } from "../lib/asyncHandler";

const router = Router();

// List docs the user owns or collaborates on.
router.get("/", requireUser, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const email = req.user!.email;

  const owned = await prisma.doc.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
  });

  const sharedWithMe = await prisma.doc.findMany({
    where: { collaborators: { some: { email, status: "accepted" } } },
    orderBy: { updatedAt: "desc" },
  });

  res.json({ owned, sharedWithMe });
}));

router.post("/", requireUser, asyncHandler(async (req, res) => {
  const { title } = req.body as { title?: string };
  const doc = await prisma.doc.create({
    data: { title: title?.trim() || "Untitled Document", ownerId: req.user!.id },
  });
  res.status(201).json(doc);
}));

router.get("/:id", requireUser, asyncHandler(async (req, res) => {
  const doc = await prisma.doc.findUnique({
    where: { id: req.params.id },
    include: { collaborators: true },
  });
  if (!doc) return res.status(404).json({ error: "Not found" });

  const isOwner = doc.ownerId === req.user!.id;
  const isCollaborator = doc.collaborators.some(
    (c) => c.email === req.user!.email && c.status === "accepted"
  );
  if (!isOwner && !isCollaborator) return res.status(403).json({ error: "Forbidden" });

  res.json(doc);
}));

router.patch("/:id", requireUser, asyncHandler(async (req, res) => {
  const { title } = req.body as { title?: string };
  if (!title?.trim()) return res.status(400).json({ error: "title is required" });

  const doc = await prisma.doc.findUnique({ where: { id: req.params.id } });
  if (!doc) return res.status(404).json({ error: "Not found" });
  if (doc.ownerId !== req.user!.id) {
    return res.status(403).json({ error: "Only the owner can rename this document" });
  }

  const updated = await prisma.doc.update({
    where: { id: req.params.id },
    data: { title: title.trim() },
  });
  res.json(updated);
}));

// Delete a document. Cascades to its collaborators and share links
// automatically (onDelete: Cascade on both relations in schema.prisma).
router.delete("/:id", requireUser, asyncHandler(async (req, res) => {
  const doc = await prisma.doc.findUnique({ where: { id: req.params.id } });
  if (!doc) return res.status(404).json({ error: "Not found" });
  if (doc.ownerId !== req.user!.id) {
    return res.status(403).json({ error: "Only the owner can delete this document" });
  }

  await prisma.doc.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
}));

export default router;
