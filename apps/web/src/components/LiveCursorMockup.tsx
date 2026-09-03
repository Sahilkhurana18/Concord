export function LiveCursorMockup() {
  return (
    <div className="border border-border rounded-lg bg-paper shadow-sm overflow-hidden">
      <div className="border-b border-border px-4 py-2.5 flex items-center justify-between">
        <span className="text-sm text-muted font-sans">Meeting notes</span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--synced)" }} />
          Synced
        </span>
      </div>
      <div className="p-5 font-sans text-sm leading-relaxed relative">
        <p className="mb-3">
          <span className="font-medium">Q3 roadmap review</span> — attendees agreed to prioritize
          the offline sync work before the invite flow.
        </p>
        <p className="relative inline">
          Next step:{" "}
          <span className="relative">
            finalize the timeline
            <span
              className="absolute -top-[1.35em] left-0 whitespace-nowrap text-[10px] font-medium text-white px-1.5 py-0.5 rounded rounded-bl-none"
              style={{ backgroundColor: "#3b82f6" }}
            >
              Priya
            </span>
            <span className="inline-block w-[2px] h-[1.1em] align-middle ml-0.5" style={{ backgroundColor: "#3b82f6" }} />
          </span>{" "}
          with the design team
          <span className="relative inline-block">
            <span className="inline-block w-[2px] h-[1.1em] align-middle ml-0.5 animate-pulse" style={{ backgroundColor: "#f97316" }} />
            <span
              className="absolute -top-[1.35em] left-0 whitespace-nowrap text-[10px] font-medium text-white px-1.5 py-0.5 rounded rounded-bl-none"
              style={{ backgroundColor: "#f97316" }}
            >
              You
            </span>
          </span>
          .
        </p>
      </div>
    </div>
  );
}
