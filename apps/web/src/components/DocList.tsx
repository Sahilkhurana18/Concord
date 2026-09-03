import Link from "next/link";

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
}: {
  title: string;
  docs: DocSummary[];
  emptyLabel: string;
}) {
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
              <span className="text-xs text-muted whitespace-nowrap ml-4">
                edited {timeAgo(doc.updatedAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
