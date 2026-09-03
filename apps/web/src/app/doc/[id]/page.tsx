import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "../../../lib/auth";
import { prisma } from "db";
import { Editor } from "../../../components/Editor";
import { SignOutButton } from "../../../components/SignOutButton";
import { ThemeToggle } from "../../../components/ThemeToggle";
import { DocTitle } from "../../../components/DocTitle";
import jwt from "jsonwebtoken";

const SHARE_LINK_SECRET = process.env.SHARE_LINK_SECRET ?? "dev-secret-change-me";

async function resolveAccess(docId: string, token: string | undefined, userEmail: string | null) {
  const doc = await prisma.doc.findUnique({ where: { id: docId }, include: { collaborators: true } });
  if (!doc) return { doc: null, permission: null };

  if (token) {
    try {
      const decoded = jwt.verify(token, SHARE_LINK_SECRET) as { docId: string; permission: "view" | "edit" };
      if (decoded.docId === docId) return { doc, permission: decoded.permission };
    } catch {
      // fall through to normal auth check below
    }
  }

  if (!userEmail) return { doc, permission: null };

  if (doc.ownerId && userEmail) {
    const isOwner = (await prisma.user.findUnique({ where: { id: doc.ownerId } }))?.email === userEmail;
    if (isOwner) return { doc, permission: "edit" as const };
  }

  const collaborator = doc.collaborators.find((c) => c.email === userEmail && c.status === "accepted");
  if (collaborator) return { doc, permission: collaborator.permission as "view" | "edit" };

  return { doc, permission: null };
}

export default async function DocPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { token?: string };
}) {
  const session = await getServerSession(authOptions);
  const { doc, permission } = await resolveAccess(params.id, searchParams.token, session?.user?.email ?? null);

  if (!doc) {
    return <main className="max-w-2xl mx-auto py-16 text-center text-muted px-6">Document not found.</main>;
  }

  if (!permission) {
    if (!session?.user) redirect(`/sign-in?callbackUrl=/doc/${params.id}`);
    return (
      <main className="max-w-2xl mx-auto py-16 text-center text-muted px-6">
        You don't have access to this document.
      </main>
    );
  }

  const isOwner = session?.user?.email
    ? (await prisma.user.findUnique({ where: { id: doc.ownerId } }))?.email === session.user.email
    : false;

  return (
    <main className="max-w-3xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-sm text-muted hover:text-accent transition-colors">
          ← All documents
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session?.user && <SignOutButton />}
        </div>
      </div>

      <div className="mb-5">
        <DocTitle docId={doc.id} initialTitle={doc.title} editable={isOwner} />
      </div>

      <Editor
        docId={doc.id}
        userName={session?.user?.name ?? session?.user?.email ?? "Guest"}
        readOnly={permission === "view"}
      />
    </main>
  );
}
