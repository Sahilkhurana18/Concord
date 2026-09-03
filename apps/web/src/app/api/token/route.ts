import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";
import { authOptions } from "../../../lib/auth";

// The web app and the Express sync/API server live on different domains in
// production. Modern browsers (Chrome's third-party cookie deprecation, in
// particular) can block cookies on cross-site requests even with
// SameSite=None; Secure set correctly — so we don't rely on cookies for
// that boundary at all. Instead, the client fetches a short-lived signed
// token from this same-origin endpoint (which CAN read the session cookie,
// since it's a same-site request to the Next.js app itself) and sends that
// token explicitly as an Authorization header to the Express server.
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  if (!session?.user?.email || !userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const token = jwt.sign(
    { sub: userId, email: session.user.email },
    process.env.API_TOKEN_SECRET ?? "dev-api-token-secret-change-me",
    { expiresIn: "5m" }
  );

  return NextResponse.json({ token });
}
