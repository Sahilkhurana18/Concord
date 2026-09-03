import { SyncStatus } from "../hooks/useCollaborativeDoc";

export function SyncStatusBadge({ status, isOffline }: { status: SyncStatus; isOffline: boolean }) {
  const label = isOffline ? "Offline — saved locally" : status === "synced" ? "Synced" : "Syncing...";

  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <span
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: isOffline ? "var(--muted)" : status === "synced" ? "var(--synced)" : "#d9a441",
        }}
      />
      {label}
    </div>
  );
}
