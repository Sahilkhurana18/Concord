"use client";

import { useState, useRef, useEffect } from "react";
import { apiFetch } from "../lib/apiClient";

export function DocTitle({
  docId,
  initialTitle,
  editable,
}: {
  docId: string;
  initialTitle: string;
  editable: boolean;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function save() {
    const trimmed = draft.trim();
    setEditing(false);
    if (!trimmed || trimmed === title) {
      setDraft(title);
      return;
    }
    setTitle(trimmed); // optimistic
    try {
      await apiFetch(`/api/docs/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
    } catch {
      setTitle(title); // revert on failure
      setDraft(title);
    }
  }

  if (!editable) {
    return <h1 className="text-2xl font-display font-medium">{title}</h1>;
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") {
            setDraft(title);
            setEditing(false);
          }
        }}
        className="text-2xl font-display font-medium bg-transparent border-b border-accent outline-none w-full max-w-md"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-2xl font-display font-medium text-left hover:text-accent transition-colors"
      title="Click to rename"
    >
      {title}
    </button>
  );
}
