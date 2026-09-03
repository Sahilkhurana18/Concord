import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebsocketProvider } from "y-websocket";

export type SyncStatus = "offline" | "syncing" | "synced";

interface UseCollaborativeDocResult {
  ydoc: Y.Doc;
  status: SyncStatus;
  isOffline: boolean;
  awareness: WebsocketProvider["awareness"] | null;
}

/**
 * Sets up a Yjs document that:
 *  1. Persists every change to IndexedDB immediately (works with zero network).
 *  2. Opportunistically syncs to the WebSocket server when online.
 *
 * Because Yjs CRDTs are conflict-free by construction, we never need to
 * choose between "local" and "remote" versions — updates from both sources
 * merge automatically, in any order, any number of times.
 */
export function useCollaborativeDoc(docId: string, wsUrl: string): UseCollaborativeDocResult {
  const ydocRef = useRef<Y.Doc | null>(null);
  const [status, setStatus] = useState<SyncStatus>("offline");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [awareness, setAwareness] = useState<WebsocketProvider["awareness"] | null>(null);

  if (!ydocRef.current) {
    ydocRef.current = new Y.Doc();
  }
  const ydoc = ydocRef.current;

  useEffect(() => {
    // 1. Local persistence — this is what makes the app usable offline.
    // Every transaction on `ydoc` is written to IndexedDB automatically.
    const persistence = new IndexeddbPersistence(docId, ydoc);

    persistence.on("synced", () => {
      // Local IndexedDB copy has loaded into memory — safe to render.
      console.log(`[${docId}] loaded from IndexedDB`);
    });

    // 2. Network sync — reconnects automatically, and is a no-op when offline.
    const provider = new WebsocketProvider(wsUrl, docId, ydoc, {
      connect: navigator.onLine,
    });

    provider.on("status", ({ status: wsStatus }: { status: string }) => {
      setStatus(wsStatus === "connected" ? "synced" : "syncing");
    });

    setAwareness(provider.awareness);

    const handleOnline = () => {
      setIsOffline(false);
      provider.connect(); // reconnect and flush queued local changes
    };
    const handleOffline = () => {
      setIsOffline(true);
      setStatus("offline");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      provider.destroy();
      persistence.destroy();
    };
  }, [docId, wsUrl, ydoc]);

  return { ydoc, status, isOffline, awareness };
}
