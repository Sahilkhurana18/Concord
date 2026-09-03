import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../lib/auth";
import { AcceptInviteButton } from "../../../components/AcceptInviteButton";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { doc?: string };
}) {
  const session = await getServerSession(authOptions);
  const docId = searchParams.doc;

  if (!docId) {
    return <main className="max-w-lg mx-auto py-16 text-center text-muted px-6">Invalid invite link.</main>;
  }

  if (!session?.user) {
    redirect(`/sign-in?callbackUrl=/invite/${params.token}?doc=${docId}`);
  }

  return (
    <main className="max-w-lg mx-auto mt-32 text-center px-6">
      <h1 className="font-display text-3xl font-medium mb-2">You've been invited</h1>
      <p className="text-muted mb-8">
        Accept to add this document to your dashboard as {session.user.email}.
      </p>
      <AcceptInviteButton docId={docId} />
    </main>
  );
}
