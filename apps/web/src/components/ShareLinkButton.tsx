"use client";

import { useState } from "react";
import type { Permission } from "shared/types";
import { apiFetch } from "../lib/apiClient";

export function ShareLinkButton({ docId }: { docId: string }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function createAndCopyLink(permission: Permission) {
    setLoading(true);
    try {
      const res = await apiFetch("/api/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId, permission }),
      });
      const { token } = await res.json();
      const url = `${window.location.origin}/doc/${docId}?token=${token}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={() => createAndCopyLink("view")}
      disabled={loading}
      title="Copies a link anyone can open to view this document — they won't be able to edit it"
      className="px-3 py-1.5 text-sm rounded-md border border-border text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
    >
      {copied ? "View link copied!" : loading ? "Creating link..." : "Share view-only link"}
    </button>
  );
}
