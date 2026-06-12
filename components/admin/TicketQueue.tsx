"use client";

import Link from "next/link";
import type { AdminTicket } from "@/hooks/useAdminTickets";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

const CATEGORY_SHORT: Record<string, string> = {
  royalty_and_payments: "Royalty",
  isbn_and_metadata: "ISBN/Meta",
  printing_and_quality: "Printing",
  distribution: "Distribution",
  book_status: "Book Status",
  general_inquiry: "General",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TableSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 52, borderRadius: i === 0 ? "var(--radius-md) var(--radius-md) 0 0" : i === 7 ? "0 0 var(--radius-md) var(--radius-md)" : 0 }}
        />
      ))}
    </div>
  );
}

interface TicketQueueProps {
  tickets: AdminTicket[] | undefined;
  isLoading?: boolean;
  isError?: boolean;
}

export function TicketQueue({ tickets, isLoading, isError }: TicketQueueProps) {
  if (isLoading) return <TableSkeleton />;

  if (isError) {
    return (
      <div
        style={{
          padding: "20px",
          background: "#fef2f2",
          border: "1px solid #fca5a5",
          borderRadius: "var(--radius-md)",
          color: "#dc2626",
          fontSize: 14,
        }}
      >
        ⚠️ Failed to load tickets. Please refresh.
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-text-muted)",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
          No tickets match the current filters.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "36px 1fr 140px 100px 90px 90px 100px",
          gap: 12,
          padding: "10px 16px",
          background: "var(--color-zinc-50)",
          borderBottom: "1px solid var(--color-border)",
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--color-text-subtle)",
        }}
      >
        <span>#</span>
        <span>Subject / Author</span>
        <span>Category</span>
        <span>Priority</span>
        <span>Status</span>
        <span>Assigned</span>
        <span>Created</span>
      </div>

      {/* Rows */}
      {tickets.map((ticket, idx) => (
        <Link
          key={ticket.id}
          href={`/admin/tickets/${ticket.id}`}
          style={{ textDecoration: "none", color: "inherit", display: "block" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "36px 1fr 140px 100px 90px 90px 100px",
              gap: 12,
              padding: "12px 16px",
              borderBottom: "1px solid var(--color-border)",
              alignItems: "center",
              transition: "background 0.12s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "var(--color-zinc-50)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "transparent";
            }}
          >
            <span style={{ fontSize: 12, color: "var(--color-text-subtle)", fontVariantNumeric: "tabular-nums" }}>
              {idx + 1}
            </span>

            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "var(--color-text-base)",
                }}
              >
                {ticket.subject}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--color-text-subtle)" }}>
                {ticket.author?.email ?? "—"}
              </p>
            </div>

            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              {CATEGORY_SHORT[ticket.category] ?? ticket.category}
            </span>

            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />

            <span style={{ fontSize: 12, color: "var(--color-text-subtle)" }}>
              {ticket.assignment?.admin?.email
                ? ticket.assignment.admin.email.split("@")[0]
                : "—"}
            </span>

            <span style={{ fontSize: 12, color: "var(--color-text-subtle)", fontVariantNumeric: "tabular-nums" }}>
              {formatDate(ticket.created_at)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
