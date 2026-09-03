"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../lib/apiClient";

export function CreateDocButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function createDoc() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Document" }),
      });
      const doc = await res.json();
      router.push(`/doc/${doc.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={createDoc}
      disabled={loading}
      className="px-4 py-2 text-sm rounded-md text-paper disabled:opacity-50 transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--accent)" }}
    >
      {loading ? "Creating..." : "New document"}
    </button>
  );
}
