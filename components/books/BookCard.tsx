import type { BookWithPending } from "@/types";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

interface BookCardProps {
  book: BookWithPending;
}

export function BookCard({ book }: BookCardProps) {
  const isInProduction = book.status === "in_production";
  const hasPendingRoyalty = book.royalty_pending > 0;

  const pubDate = new Date(book.pub_date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article
      className="card animate-fade-in"
      style={{ padding: "0", overflow: "hidden" }}
    >
      {/* Header stripe */}
      <div
        style={{
          background: isInProduction
            ? "linear-gradient(135deg, #78716c 0%, #57534e 100%)"
            : "linear-gradient(135deg, var(--color-emerald-600) 0%, var(--color-emerald-800) 100%)",
          padding: "20px 22px 16px",
          color: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                lineHeight: 1.3,
                wordBreak: "break-word",
              }}
            >
              {book.title}
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                opacity: 0.8,
                fontFamily: "monospace",
              }}
            >
              ISBN: {book.isbn}
            </p>
          </div>

          {/* Status badge */}
          <span
            style={{
              flexShrink: 0,
              padding: "3px 10px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              background: isInProduction
                ? "rgba(255,255,255,0.18)"
                : "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            {isInProduction ? "In Production" : "Published"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 22px" }}>
        {/* Meta row */}
        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <MetaItem label="Genre" value={book.genre} />
          <MetaItem label="Published" value={pubDate} />
          <MetaItem label="MRP" value={INR.format(book.mrp)} />
          <MetaItem label="Copies Sold" value={book.copies_sold.toLocaleString("en-IN")} />
        </div>

        {/* Royalty section */}
        {isInProduction ? (
          <div
            style={{
              background: "var(--color-zinc-50)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>⏳</span>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "var(--color-text-muted)",
              }}
            >
              Royalty figures will be available once the book is published.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "var(--color-zinc-50)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <p
              style={{
                margin: 0,
                padding: "10px 14px 8px",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-text-subtle)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              Royalties
            </p>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <tbody>
                <RoyaltyRow label="Earned" value={book.royalty_earned} highlight={false} />
                <RoyaltyRow label="Paid" value={book.royalty_paid} highlight={false} />
                <RoyaltyRow
                  label="Pending"
                  value={book.royalty_pending}
                  highlight={hasPendingRoyalty}
                />
              </tbody>
            </table>
          </div>
        )}
      </div>
    </article>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--color-text-subtle)",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "2px 0 0",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--color-text-base)",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function RoyaltyRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight: boolean;
}) {
  return (
    <tr
      style={{
        borderTop: "1px solid var(--color-border)",
        background: highlight ? "#fffbeb" : "transparent",
      }}
    >
      <td
        style={{
          padding: "8px 14px",
          color: highlight ? "#b45309" : "var(--color-text-muted)",
          fontWeight: highlight ? 600 : 400,
        }}
      >
        {label}
        {highlight && (
          <span style={{ marginLeft: 6, fontSize: 12 }}>⚠️</span>
        )}
      </td>
      <td
        style={{
          padding: "8px 14px",
          textAlign: "right",
          fontWeight: highlight ? 700 : 500,
          color: highlight ? "#b45309" : "var(--color-text-base)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {INR.format(value)}
      </td>
    </tr>
  );
}
