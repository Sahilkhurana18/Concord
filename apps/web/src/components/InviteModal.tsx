"use client";

import { useState } from "react";
import type { Permission } from "shared/types";
import { apiFetch } from "../lib/apiClient";

export function InviteModal({ docId, onClose }: { docId: string; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<Permission>("edit");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function sendInvite() {
    setStatus("sending");
    try {
      const res = await apiFetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId, email, permission }),
      });
      if (!res.ok) throw new Error("Invite failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-paper text-ink rounded-lg p-6 w-96 shadow-xl border border-border">
        <h3 className="font-display text-lg font-medium mb-3">Invite a collaborator</h3>
        <input
          type="email"
          placeholder="[email protected]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-border bg-transparent rounded-md px-3 py-2 mb-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <select
          value={permission}
          onChange={(e) => setPermission(e.target.value as Permission)}
          className="w-full border border-border bg-paper rounded-md px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="edit">Can edit</option>
          <option value="view">Can view</option>
        </select>

        {status === "sent" ? (
          <p className="text-sm mb-3" style={{ color: "var(--synced)" }}>Invite sent to {email}.</p>
        ) : status === "error" ? (
          <p className="text-sm mb-3 text-red-500">Something went wrong. Try again.</p>
        ) : null}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            Close
          </button>
          <button
            onClick={sendInvite}
            disabled={!email || status === "sending"}
            className="px-3 py-1.5 text-sm rounded-md text-paper disabled:opacity-50 transition-opacity" style={{ backgroundColor: "var(--accent)" }}
          >
            {status === "sending" ? "Sending..." : "Send invite"}
          </button>
        </div>
      </div>
    </div>
  );
}
