"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface AIDraftComposerProps {
  ticketId: string;
  adminId: string;
}

type ResponseMode = "public" | "internal";

export function AIDraftComposer({ ticketId, adminId }: AIDraftComposerProps) {
  const queryClient = useQueryClient();

  const [draft, setDraft] = useState("");
  const [draftLoading, setDraftLoading] = useState(true);
  const [draftUnavailable, setDraftUnavailable] = useState(false);

  const [mode, setMode] = useState<ResponseMode>("public");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDraftLoading(true);
    setDraftUnavailable(false);

    fetch(`/api/admin/ai/draft/${ticketId}`)
      .then((r) => r.json())
      .then((data: { draft: string | null; unavailable?: boolean }) => {
        if (cancelled) return;
        if (data.unavailable || !data.draft) {
          setDraftUnavailable(true);
          setDraft("");
        } else {
          setDraft(data.draft);
        }
      })
      .catch(() => {
        if (!cancelled) setDraftUnavailable(true);
      })
      .finally(() => {
        if (!cancelled) setDraftLoading(false);
      });

    return () => { cancelled = true; };
  }, [ticketId]);

  async function handleSend() {
    if (!draft.trim()) return;
    setSending(true);
    setSendError(null);
    setSendSuccess(false);

    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: draft.trim(),
          isInternal: mode === "internal",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSendError(err.error ?? "Failed to send response.");
        return;
      }

      setSendSuccess(true);
      setDraft("");
      // Refresh ticket detail
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets", ticketId] });
      setTimeout(() => setSendSuccess(false), 4000);
    } catch {
      setSendError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      {/* AI unavailable banner */}
      {draftUnavailable && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "var(--radius-md)",
            padding: "10px 14px",
            fontSize: 13,
            color: "#92400e",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <span>⚠️</span>
          <span>AI draft unavailable — please write your response manually below.</span>
        </div>
      )}

      {/* Draft loading skeleton */}
      {draftLoading && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span className="spinner" style={{ width: 14, height: 14, color: "var(--color-emerald-600)" }} />
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              Generating AI draft with GPT-4o-mini…
            </span>
          </div>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 14, marginBottom: 8, width: `${85 - i * 8}%` }}
            />
          ))}
        </div>
      )}

      {/* Mode toggle */}
      {!draftLoading && (
        <div style={{ display: "flex", gap: 0, marginBottom: 12, border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden", width: "fit-content" }}>
          {(["public", "internal"] as ResponseMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "7px 18px",
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: mode === m
                  ? m === "internal" ? "#fffbeb" : "var(--color-emerald-50)"
                  : "var(--color-surface)",
                color: mode === m
                  ? m === "internal" ? "#92400e" : "var(--color-emerald-700)"
                  : "var(--color-text-muted)",
                transition: "all 0.15s ease",
              }}
            >
              {m === "public" ? "🌐 Public Response" : "🔒 Internal Note"}
            </button>
          ))}
        </div>
      )}

      {/* Mode hint */}
      {!draftLoading && (
        <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--color-text-subtle)" }}>
          {mode === "internal"
            ? "🔒 Internal notes are only visible to admins — the author cannot see this."
            : "🌐 Public responses are visible to the author and trigger a real-time notification."}
        </p>
      )}

      {/* Textarea */}
      {!draftLoading && (
        <textarea
          id="draft-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            mode === "internal"
              ? "Write an internal note for your team…"
              : "Write your response to the author…"
          }
          rows={8}
          className="input"
          style={{
            resize: "vertical",
            minHeight: 160,
            fontFamily: "inherit",
            background: mode === "internal" ? "#fffdf0" : "var(--color-surface)",
            borderColor: mode === "internal" ? "#fde68a" : "var(--color-border)",
          }}
        />
      )}

      {/* Send error */}
      {sendError && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 14px",
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: "var(--radius-md)",
            color: "#dc2626",
            fontSize: 13,
          }}
        >
          ⚠️ {sendError}
        </div>
      )}

      {/* Send success */}
      {sendSuccess && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 14px",
            background: "var(--color-emerald-50)",
            border: "1px solid var(--color-emerald-200)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-emerald-700)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          ✅ {mode === "internal" ? "Internal note saved." : "Response sent to author."}
        </div>
      )}

      {/* Send button */}
      {!draftLoading && (
        <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
          <button
            id="send-response-btn"
            onClick={handleSend}
            disabled={sending || !draft.trim()}
            className="btn btn-primary"
            style={{
              background: mode === "internal" ? "#d97706" : undefined,
              minWidth: 160,
            }}
          >
            {sending ? (
              <>
                <span className="spinner" style={{ width: 15, height: 15 }} />
                Sending…
              </>
            ) : mode === "internal" ? (
              "Save Internal Note"
            ) : (
              "Send Response →"
            )}
          </button>

          {draft.length > 0 && (
            <span style={{ fontSize: 12, color: "var(--color-text-subtle)" }}>
              {draft.length} chars
            </span>
          )}
        </div>
      )}
    </div>
  );
}
