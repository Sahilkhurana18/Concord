"use client";

import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="flex items-center gap-2.5 px-5 py-2.5 rounded-md text-sm font-medium text-paper transition-opacity hover:opacity-90"
      style={{ backgroundColor: "var(--accent)" }}
    >
      <svg width="16" height="16" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C33.6 5.1 29 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C33.6 5.1 29 3 24 3c-7.4 0-13.8 4.1-17.1 10.2z"/>
        <path fill="#4CAF50" d="M24 45c5.1 0 9.7-1.9 13.2-5.1l-6.1-5.2C29.2 36.4 26.7 37 24 37c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.8 40.5 16.3 45 24 45z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.1 5.2C40.9 36 44 30.7 44 24c0-1.4-.1-2.7-.4-3.5z"/>
      </svg>
      Sign in with Google
    </button>
  );
}
