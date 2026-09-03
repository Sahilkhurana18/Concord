import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { prisma } from "db";
import { SignInButton } from "../components/SignInButton";
import { SignOutButton } from "../components/SignOutButton";
import { ThemeToggle } from "../components/ThemeToggle";
import { DocList } from "../components/DocList";
import { CreateDocButton } from "../components/CreateDocButton";
import { LiveCursorMockup } from "../components/LiveCursorMockup";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="min-h-screen">
        <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="font-display text-lg font-medium">Concord</span>
          <ThemeToggle />
        </header>

        <section className="max-w-5xl mx-auto px-6 pt-12 pb-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.1] font-medium mb-6">
              Write together, even when one of you is offline.
            </h1>
            <p className="text-muted text-lg leading-relaxed mb-8 max-w-md">
              Notes that merge instead of conflict. Keep writing on a plane, in a tunnel, wherever
              — it syncs the moment you're back, no lost work, no manual merging.
            </p>
            <SignInButton />
          </div>
          <LiveCursorMockup />
        </section>
      </main>
    );
  }

  const userId = (session.user as { id: string }).id;
  const email = session.user.email!;

  const [owned, sharedWithMe] = await Promise.all([
    prisma.doc.findMany({ where: { ownerId: userId }, orderBy: { updatedAt: "desc" } }),
    prisma.doc.findMany({
      where: { collaborators: { some: { email, status: "accepted" } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <main className="min-h-screen">
      <header className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="font-display text-lg font-medium">Concord</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted hidden sm:inline">{email}</span>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-medium">Your documents</h1>
          <CreateDocButton />
        </div>

        <DocList title="Owned by you" docs={owned} emptyLabel="Nothing here yet — start your first document." deletable />
        <DocList title="Shared with you" docs={sharedWithMe} emptyLabel="Nothing shared with you yet." />
      </div>
    </main>
  );
}
