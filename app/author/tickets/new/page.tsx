import { TicketForm } from "@/components/tickets/TicketForm";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Query — BookLeaf Author Portal",
  description: "Submit a support query to the BookLeaf team. We respond within 24 hours.",
};

export default function NewTicketPage() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: 680 }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/author/tickets"
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ← My Tickets
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
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
          Support
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Submit a Support Query
        </h1>
        <p style={{ margin: "6px 0 0", color: "var(--color-text-muted)", fontSize: 14 }}>
          Describe your issue and our team will respond within 24 hours. Your query will be automatically classified and prioritised.
        </p>
      </div>

      {/* Form card */}
      <div className="card" style={{ padding: "28px 32px" }}>
        <TicketForm />
      </div>

      {/* Info footer */}
      <div
        style={{
          marginTop: 20,
          padding: "14px 18px",
          background: "var(--color-emerald-50)",
          border: "1px solid var(--color-emerald-100)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "var(--color-emerald-800)" }}>
            Tips for a faster resolution
          </p>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: "var(--color-emerald-700)", lineHeight: 1.7 }}>
            <li>Include your book title and ISBN when applicable</li>
            <li>Mention specific dates, amounts, or reference numbers</li>
            <li>Be as specific as possible about the issue</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
