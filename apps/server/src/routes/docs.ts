import { Router } from "express";
import { prisma } from "db";
import { requireUser } from "../lib/auth";

const router = Router();

// List docs the user owns or collaborates on.
router.get("/", requireUser, async (req, res) => {
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
});

router.post("/", requireUser, async (req, res) => {
  const { title } = req.body as { title?: string };
  const doc = await prisma.doc.create({
    data: { title: title?.trim() || "Untitled Document", ownerId: req.user!.id },
  });
  res.status(201).json(doc);
});

router.get("/:id", requireUser, async (req, res) => {
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
});

router.patch("/:id", requireUser, async (req, res) => {
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
});

export default router;
