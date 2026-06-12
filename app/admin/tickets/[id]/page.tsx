"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminTicket } from "@/hooks/useAdminTicket";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { AIDraftComposer } from "@/components/admin/AIDraftComposer";
import type { TicketStatus, Priority, TicketCategory } from "@/types";
import { renderTextWithAttachments } from "@/lib/utils/markdown";
import { useSSE } from "@/hooks/useSSE";

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: "royalty_and_payments", label: "Royalty & Payments" },
  { value: "isbn_and_metadata", label: "ISBN & Metadata" },
  { value: "printing_and_quality", label: "Printing & Quality" },
  { value: "distribution", label: "Distribution" },
  { value: "book_status", label: "Book Status" },
  { value: "general_inquiry", label: "General Inquiry" },
];

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p
      style={{
        margin: "0 0 14px",
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        color: "var(--color-text-subtle)",
      }}
    >
      {title}
    </p>
  );
}

export default function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { data: user } = useAuth();
  const { data, isLoading, isError } = useAdminTicket(id);

  const [savingField, setSavingField] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Sync real-time author responses
  useSSE(id, (msg) => {
    if (msg.type === "NEW_RESPONSE" || msg.type === "STATUS_UPDATE") {
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets", id] });
      // Invalidate AI draft so it regenerates with the new response
      queryClient.invalidateQueries({ queryKey: ["admin", "ai_draft", id] });
    }
  });

  async function patchTicket(updates: Record<string, string>) {
    const key = Object.keys(updates)[0];
    setSavingField(key);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin", "tickets", id] });
        queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      }
    } finally {
      setSavingField(null);
    }
  }

  async function assignToMe() {
    setAssigning(true);
    try {
      const res = await fetch(`/api/admin/tickets/${id}/assign`, {
        method: "POST",
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin", "tickets", id] });
      }
    } finally {
      setAssigning(false);
    }
  }

  if (isLoading) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 900 }}>
        <div className="skeleton" style={{ height: 16, width: 120, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 30, width: 320, marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
          <div>
            <div className="card" style={{ padding: 20 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 14, marginBottom: 14, width: `${70 + i * 5}%` }} />
              ))}
            </div>
          </div>
          <div>
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 14, marginBottom: 12 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 900 }}>
        <Link href="/admin/dashboard" style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}>
          ← Dashboard
        </Link>
        <div style={{ marginTop: 24, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "var(--radius-md)", padding: "20px 24px", color: "#dc2626" }}>
          ⚠️ Ticket not found.
        </div>
      </div>
    );
  }

  const ticket = data;
  const isAssignedToMe = ticket.assignment?.admin_id === user?.id;
  const publicResponses = ticket.responses.filter((r) => !r.is_internal);
  const allResponses = ticket.responses;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1000 }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/admin/dashboard"
          style={{ fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          ← Dashboard
        </Link>
      </div>

      {/* Ticket heading */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
          {ticket.subject}
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-subtle)" }}>
          Submitted {formatDate(ticket.created_at)}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>
        {/* ── LEFT PANEL ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Author info */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <SectionHeader title="Author" />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--color-emerald-500), var(--color-emerald-700))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {(ticket.author?.email ?? "?")[0].toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                  {ticket.author?.email?.split("@")[0] ?? "—"}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-subtle)" }}>
                  {ticket.author?.email ?? "—"}
                </p>
              </div>
            </div>
            {ticket.book && (
              <div style={{ padding: "9px 12px", background: "var(--color-zinc-50)", borderRadius: "var(--radius-md)", fontSize: 12 }}>
                <span style={{ color: "var(--color-text-subtle)" }}>Book: </span>
                <span style={{ fontWeight: 600 }}>{ticket.book.title}</span>
                <br />
                <span style={{ color: "var(--color-text-subtle)", fontFamily: "monospace" }}>
                  {ticket.book.isbn}
                </span>
              </div>
            )}
            {!ticket.book && (
              <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-subtle)" }}>
                General / Account Level
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <SectionHeader title="Controls" />

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Status */}
              <OverrideField
                label="Status"
                id="status-select"
                loading={savingField === "status"}
              >
                <select
                  id="status-select"
                  value={ticket.status}
                  onChange={(e) => patchTicket({ status: e.target.value })}
                  className="input"
                  style={{ fontSize: 13, padding: "7px 10px", cursor: "pointer" }}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </OverrideField>

              {/* Priority */}
              <OverrideField
                label="Priority"
                id="priority-select"
                loading={savingField === "priority"}
                aiOverridden={ticket.ai_priority_overridden}
                aiReason={ticket.priority_reason}
              >
                <select
                  id="priority-select"
                  value={ticket.priority}
                  onChange={(e) => patchTicket({ priority: e.target.value })}
                  className="input"
                  style={{ fontSize: 13, padding: "7px 10px", cursor: "pointer" }}
                >
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </OverrideField>

              {/* Category */}
              <OverrideField
                label="Category"
                id="category-select"
                loading={savingField === "category"}
                aiOverridden={ticket.ai_category_overridden}
              >
                <select
                  id="category-select"
                  value={ticket.category}
                  onChange={(e) => patchTicket({ category: e.target.value })}
                  className="input"
                  style={{ fontSize: 13, padding: "7px 10px", cursor: "pointer" }}
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </OverrideField>
            </div>
          </div>

          {/* Assignment */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <SectionHeader title="Assignment" />
            {ticket.assignment ? (
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--color-text-muted)" }}>
                  Assigned to{" "}
                  <strong>
                    {isAssignedToMe ? "you" : ticket.assignment.admin?.email}
                  </strong>
                </p>
                {!isAssignedToMe && (
                  <button
                    onClick={assignToMe}
                    disabled={assigning}
                    className="btn btn-ghost"
                    style={{ width: "100%", fontSize: 13 }}
                  >
                    {assigning ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
                    Reassign to me
                  </button>
                )}
              </div>
            ) : (
              <button
                id="assign-to-me-btn"
                onClick={assignToMe}
                disabled={assigning}
                className="btn btn-primary"
                style={{ width: "100%", fontSize: 13 }}
              >
                {assigning ? (
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                ) : "Assign to Me"}
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Original query */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <SectionHeader title="Author's Query" />
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.75,
                color: "var(--color-text-base)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {renderTextWithAttachments(ticket.description)}
            </p>
          </div>

          {/* Response thread (public + internal) */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <SectionHeader title={`Responses (${allResponses.length})`} />
            {allResponses.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0 }}>
                No responses yet. Use the composer below to reply.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 500, overflowY: "auto", paddingRight: 8 }}>
                {allResponses.map((resp, i) => (
                  <div
                    key={resp.id}
                    className="animate-fade-in"
                    style={{
                      animationDelay: `${i * 40}ms`,
                      background: resp.is_internal ? "#fffdf0" : "#f0fdf4",
                      border: `1px solid ${resp.is_internal ? "#fde68a" : "#bbf7d0"}`,
                      borderRadius: "var(--radius-md)",
                      padding: "12px 16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: resp.is_internal ? "#92400e" : "var(--color-emerald-700)" }}>
                        {resp.responder?.email?.split("@")[0] ?? "Admin"}
                      </span>
                      {resp.is_internal && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            background: "#fde68a",
                            color: "#78350f",
                            padding: "1px 7px",
                            borderRadius: 999,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Internal
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: "var(--color-text-subtle)", marginLeft: "auto" }}>
                        {formatDate(resp.created_at)}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {resp.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Draft Composer */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <SectionHeader title="AI Draft Composer" />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  background: "var(--color-emerald-50)",
                  color: "var(--color-emerald-700)",
                  border: "1px solid var(--color-emerald-200)",
                  padding: "2px 8px",
                  borderRadius: 999,
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                  marginBottom: 14,
                }}
              >
                GPT-4o-mini ✨
              </span>
            </div>
            <AIDraftComposer ticketId={id} adminId={user?.id ?? ""} />
          </div>
        </div>
      </div>
    </div>
  );
}

function OverrideField({
  label,
  id,
  loading,
  aiOverridden,
  aiReason,
  children,
}: {
  label: string;
  id: string;
  loading?: boolean;
  aiOverridden?: boolean;
  aiReason?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
        <label htmlFor={id} className="input-label" style={{ margin: 0 }}>
          {label}
        </label>
        {aiOverridden && (
          <span
            title="This value was manually changed from the AI suggestion"
            style={{
              fontSize: 10,
              fontWeight: 700,
              background: "#eff6ff",
              color: "#1e40af",
              padding: "1px 7px",
              borderRadius: 999,
              letterSpacing: "0.04em",
            }}
          >
            Edited
          </span>
        )}
        {loading && <span className="spinner" style={{ width: 12, height: 12, color: "var(--color-emerald-600)", marginLeft: "auto" }} />}
      </div>
      {children}
      {aiReason && label === "Priority" && (
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--color-text-subtle)", fontStyle: "italic" }}>
          AI: {aiReason}
        </p>
      )}
    </div>
  );
}
