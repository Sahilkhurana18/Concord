"use client";

import { SignInButton } from "../../components/SignInButton";

export default function SignInPage() {
  return (
    <main className="max-w-lg mx-auto mt-32 text-center px-6">
      <h1 className="font-display text-3xl font-medium mb-2">Sign in to Concord</h1>
      <p className="text-muted mb-8">Sign in with your Google account to continue.</p>
      <div className="flex justify-center">
        <SignInButton />
      </div>
    </main>
  );
}
