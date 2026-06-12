"use client";

import Link from "next/link";
import { useTickets } from "@/hooks/useTickets";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import type { Ticket } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  royalty_and_payments: "Royalty & Payments",
  isbn_and_metadata: "ISBN & Metadata",
  printing_and_quality: "Printing & Quality",
  distribution: "Distribution",
  book_status: "Book Status",
  general_inquiry: "General Inquiry",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <Link
      href={`/author/tickets/${ticket.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <div
        className="animate-fade-in"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "14px 18px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "8px 16px",
          transition: "box-shadow 0.15s ease, border-color 0.15s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-md)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-emerald-200)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "";
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
        }}
      >
        {/* Left: subject + meta */}
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: "0 0 6px",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-text-base)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {ticket.subject}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--color-text-subtle)" }}>
              {CATEGORY_LABELS[ticket.category] ?? ticket.category}
            </span>
            <span style={{ color: "var(--color-border)", fontSize: 12 }}>·</span>
            <span style={{ fontSize: 12, color: "var(--color-text-subtle)" }}>
              {formatDate(ticket.created_at)}
            </span>
          </div>
        </div>

        {/* Right: badges */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 5,
            flexShrink: 0,
          }}
        >
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>
    </Link>
  );
}

function TicketListSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 70, borderRadius: "var(--radius-md)" }}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "64px 24px", maxWidth: 380, margin: "0 auto" }}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "var(--color-emerald-50)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          margin: "0 auto 20px",
        }}
      >
        🎫
      </div>
      <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700 }}>No tickets yet</h2>
      <p style={{ margin: "0 0 24px", color: "var(--color-text-muted)", fontSize: 14, lineHeight: 1.6 }}>
        Haven&apos;t heard back yet? Submit a support query and our team will get back to you.
      </p>
      <Link href="/author/tickets/new" className="btn btn-primary" style={{ display: "inline-flex" }}>
        Submit a Query
      </Link>
    </div>
  );
}

export default function AuthorTicketsPage() {
  const { data: tickets, isLoading, isError } = useTickets();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-emerald-600)",
            }}
          >
            Author Portal
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            My Tickets
          </h1>
          <p style={{ margin: "6px 0 0", color: "var(--color-text-muted)", fontSize: 14 }}>
            Your support queries and their current status.
          </p>
        </div>
        <Link
          href="/author/tickets/new"
          className="btn btn-primary"
          style={{ display: "inline-flex", flexShrink: 0 }}
        >
          + New Query
        </Link>
      </div>

      {/* Error */}
      {isError && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: "var(--radius-md)",
            padding: "14px 18px",
            color: "#dc2626",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          ⚠️ Failed to load tickets. Please refresh the page.
        </div>
      )}

      {isLoading && <TicketListSkeleton />}
      {!isLoading && !isError && tickets?.length === 0 && <EmptyState />}

      {!isLoading && tickets && tickets.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tickets.map((ticket) => (
            <TicketRow key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
