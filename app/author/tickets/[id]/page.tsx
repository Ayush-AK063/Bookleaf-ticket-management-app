"use client";

import { useState, useCallback } from "react";
import { use } from "react";
import Link from "next/link";
import { useTicket } from "@/hooks/useTickets";
import { useSSE, type SSEMessage } from "@/hooks/useSSE";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { TicketThread } from "@/components/tickets/TicketThread";
import type { TicketResponse, TicketStatus } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { renderTextWithAttachments } from "@/lib/utils/markdown";

const CATEGORY_LABELS: Record<string, string> = {
  royalty_and_payments: "Royalty & Payments",
  isbn_and_metadata: "ISBN & Metadata",
  printing_and_quality: "Printing & Quality",
  distribution: "Distribution",
  book_status: "Book Status",
  general_inquiry: "General Inquiry",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useTicket(id);

  const [currentStatus, setCurrentStatus] = useState<TicketStatus | null>(null);
  const [liveIndicator, setLiveIndicator] = useState(false);

  const responses = data?.responses ?? [];
  const status = currentStatus ?? data?.ticket?.status ?? "open";

  const onSSEMessage = useCallback(
    (msg: SSEMessage) => {
      if (msg.type === "NEW_RESPONSE" || msg.type === "STATUS_UPDATE" || msg.poll) {
        setLiveIndicator(true);
        setTimeout(() => setLiveIndicator(false), 3000);
        
        if (msg.type === "STATUS_UPDATE" && msg.status) {
          setCurrentStatus(msg.status as TicketStatus);
        }
        
        queryClient.invalidateQueries({ queryKey: ["tickets", id] });
      }
    },
    [id, queryClient],
  );

  useSSE(id, onSSEMessage);

  if (isLoading) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 720 }}>
        <div className="skeleton" style={{ height: 18, width: 120, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 32, width: 280, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 200, marginBottom: 28 }} />
        <div className="card" style={{ padding: 28 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 16, marginBottom: 14, width: `${70 + i * 5}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 720 }}>
        <Link href="/author/tickets" style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}>
          ← My Tickets
        </Link>
        <div
          style={{
            marginTop: 32,
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: "var(--radius-md)",
            padding: "20px 24px",
            color: "#dc2626",
          }}
        >
          ⚠️ Ticket not found or you don&apos;t have permission to view it.
        </div>
      </div>
    );
  }

  const { ticket } = data;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720 }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/author/tickets"
          style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          ← My Tickets
        </Link>
      </div>

      {/* Ticket subject & meta */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              flex: 1,
              minWidth: 0,
            }}
          >
            {ticket.subject}
          </h1>
          {/* Live SSE indicator */}
          {liveIndicator && (
            <span
              style={{
                background: "var(--color-emerald-50)",
                color: "var(--color-emerald-700)",
                border: "1px solid var(--color-emerald-200)",
                padding: "3px 10px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                animation: "fade-in 0.25s ease",
              }}
            >
              🟢 Live update
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-subtle)" }}>
          Submitted {formatDate(ticket.created_at)}
        </p>
      </div>

      {/* Ticket info card */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 16,
          }}
        >
          <InfoItem label="Status">
            <StatusBadge status={status} />
          </InfoItem>
          <InfoItem label="Priority">
            <PriorityBadge priority={ticket.priority} />
          </InfoItem>
          <InfoItem
            label="Category"
            value={CATEGORY_LABELS[ticket.category] ?? ticket.category}
          />
          <InfoItem
            label="Related Book"
            value={
              ticket.book
                ? `${ticket.book.title}`
                : "General / Account Level"
            }
          />
        </div>

        {/* Description */}
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--color-border)" }}>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--color-text-subtle)",
            }}
          >
            Your Query
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--color-text-base)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {renderTextWithAttachments(ticket.description)}
          </p>
        </div>
      </div>

      {/* Responses section */}
      <div className="card" style={{ padding: "22px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
            Support Thread
          </h2>
          <span
            style={{
              fontSize: 11,
              color: "var(--color-text-subtle)",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--color-emerald-500)",
                display: "inline-block",
                boxShadow: "0 0 0 2px rgba(16,185,129,0.3)",
              }}
            />
            Live updates enabled
          </span>
        </div>

        <TicketThread responses={responses} currentUserId={ticket.author_id} />
        
        {/* Reply Box */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--color-border)" }}>
          {status === "closed" ? (
            <div
              style={{
                textAlign: "center",
                padding: "16px",
                background: "var(--color-zinc-50)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-muted)",
                fontSize: 14,
                border: "1px solid var(--color-border)",
              }}
            >
              🔒 This ticket has been closed. If you have further questions, please open a new ticket.
            </div>
          ) : (
            <AuthorReplyBox ticketId={id} />
          )}
        </div>
      </div>
    </div>
  );
}

function AuthorReplyBox({ ticketId }: { ticketId: string }) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!reply.trim()) return;
    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply.trim(), isInternal: false }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "Failed to send reply");
        return;
      }

      setReply("");
      queryClient.invalidateQueries({ queryKey: ["tickets", ticketId] });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Type your reply here..."
        className="input"
        rows={4}
        style={{ width: "100%", marginBottom: 12, resize: "vertical", minHeight: 80 }}
      />
      {error && (
        <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 10 }}>
          ⚠️ {error}
        </div>
      )}
      <button
        onClick={handleSend}
        disabled={sending || !reply.trim()}
        className="btn btn-primary"
        style={{ minWidth: 120 }}
      >
        {sending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : "Send Reply"}
      </button>
    </div>
  );
}

function InfoItem({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p
        style={{
          margin: "0 0 5px",
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--color-text-subtle)",
        }}
      >
        {label}
      </p>
      {children ?? (
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--color-text-base)" }}>
          {value}
        </p>
      )}
    </div>
  );
}
