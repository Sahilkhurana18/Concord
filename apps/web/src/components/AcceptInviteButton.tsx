"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../lib/apiClient";

export function AcceptInviteButton({ docId }: { docId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId }),
      });
      if (!res.ok) throw new Error();
      router.push(`/doc/${docId}`);
    } catch {
      setError("Couldn't accept this invite. It may have been sent to a different email address.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={accept}
        disabled={loading}
        className="px-4 py-2 text-sm rounded-md text-paper disabled:opacity-50 transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--accent)" }}
      >
        {loading ? "Accepting..." : "Accept invite"}
      </button>
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  );
}
