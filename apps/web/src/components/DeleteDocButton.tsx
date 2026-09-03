"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../lib/apiClient";

export function DeleteDocButton({ docId, docTitle }: { docId: string; docTitle: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${docTitle}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/docs/${docId}`, { method: "DELETE" });
      router.push("/");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="px-3 py-1.5 text-sm rounded-md border border-border text-muted hover:text-red-500 hover:border-red-300 dark:hover:border-red-800 transition-colors disabled:opacity-50"
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
