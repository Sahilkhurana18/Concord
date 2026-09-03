"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-3 py-1.5 text-sm rounded-md border border-border text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
    >
      Sign out
    </button>
  );
}
