import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // JWT session — the Express API doesn't read this cookie directly;
  // it verifies a separate short-lived token issued by /api/token instead
  // (see apps/web/src/lib/apiClient.ts), since cross-site cookies are
  // unreliable in modern browsers regardless of SameSite configuration.
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // Keep the user id on the JWT so both the web app and the Express API
    // can identify the requester without a DB round-trip.
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { id?: string }).id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
};
