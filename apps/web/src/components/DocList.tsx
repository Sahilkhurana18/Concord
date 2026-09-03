"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../lib/apiClient";

interface DocSummary {
  id: string;
  title: string;
  updatedAt: Date;
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function DocList({
  title,
  docs,
  emptyLabel,
  deletable = false,
}: {
  title: string;
  docs: DocSummary[];
  emptyLabel: string;
  deletable?: boolean;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(e: React.MouseEvent, docId: string, docTitle: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${docTitle}"? This can't be undone.`)) return;

    setDeletingId(docId);
    try {
      await apiFetch(`/api/docs/${docId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mb-10">
      <h2 className="text-sm font-medium text-muted mb-2">{title}</h2>
      {docs.length === 0 ? (
        <p className="text-sm text-muted border-t border-border pt-4">{emptyLabel}</p>
      ) : (
        <div className="border-t border-border">
          {docs.map((doc) => (
            <Link
              key={doc.id}
              href={`/doc/${doc.id}`}
              className="flex items-baseline justify-between py-3.5 border-b border-border group"
            >
              <span className="font-display text-base group-hover:text-accent transition-colors">
                {doc.title}
              </span>
              <span className="flex items-center gap-3 ml-4">
                <span className="text-xs text-muted whitespace-nowrap">
                  edited {timeAgo(doc.updatedAt)}
                </span>
                {deletable && (
                  <button
                    onClick={(e) => handleDelete(e, doc.id, doc.title)}
                    disabled={deletingId === doc.id}
                    aria-label={`Delete ${doc.title}`}
                    title="Delete document"
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-opacity disabled:opacity-50"
                  >
                    {deletingId === doc.id ? (
                      "…"
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                      </svg>
                    )}
                  </button>
                )}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
