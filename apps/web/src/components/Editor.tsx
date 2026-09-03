"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Placeholder from "@tiptap/extension-placeholder";
import { useCollaborativeDoc } from "../hooks/useCollaborativeDoc";
import { SyncStatusBadge } from "./SyncStatusBadge";
import { ExportButtons } from "./ExportButtons";
import { InviteModal } from "./InviteModal";
import { ShareLinkButton } from "./ShareLinkButton";
import { Toolbar } from "./Toolbar";
import { useState } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:1234";
const randomColor = () =>
  ["#f97316", "#22c55e", "#3b82f6", "#ec4899", "#a855f7"][Math.floor(Math.random() * 5)];

export function Editor({
  docId,
  userName,
  readOnly = false,
}: {
  docId: string;
  userName: string;
  readOnly?: boolean;
}) {
  const { ydoc, status, isOffline, awareness } = useCollaborativeDoc(docId, WS_URL);
  const [showInvite, setShowInvite] = useState(false);

  const editor = useEditor(
    {
      editable: !readOnly,
      extensions: [
        StarterKit.configure({ history: false }), // Yjs handles undo/redo history
        Collaboration.configure({ document: ydoc }),
        Placeholder.configure({
          placeholder: readOnly ? "" : "Start writing — this saves as you go, even offline...",
        }),
        ...(awareness
          ? [
              CollaborationCursor.configure({
                provider: { awareness },
                user: { name: userName, color: randomColor() },
              }),
            ]
          : []),
      ],
      immediatelyRender: false,
    },
    [ydoc, awareness, readOnly]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <SyncStatusBadge status={status} isOffline={isOffline} />
        <div className="flex gap-2">
          <ExportButtons targetId="doc-content" />
          {!readOnly && (
            <>
              <ShareLinkButton docId={docId} />
              <button
                onClick={() => setShowInvite(true)}
                className="px-3 py-1.5 text-sm rounded-md border border-border text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Invite collaborator
              </button>
            </>
          )}
        </div>
      </div>

      {!readOnly && editor && <Toolbar editor={editor} />}

      <div
        id="doc-content"
        className={`prose dark:prose-invert max-w-none border border-border ${
          readOnly ? "rounded-lg" : "rounded-b-lg border-t-0"
        } p-5 bg-paper text-ink font-sans focus-within:ring-1 focus-within:ring-accent transition-shadow`}
      >
        <EditorContent editor={editor} />
      </div>

      {showInvite && <InviteModal docId={docId} onClose={() => setShowInvite(false)} />}
    </div>
  );
}
