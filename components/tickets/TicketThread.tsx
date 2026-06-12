import type { TicketResponse } from "@/types";

interface TicketThreadProps {
  responses: TicketResponse[];
  currentUserId?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function TicketThread({ responses, currentUserId }: TicketThreadProps) {
  if (responses.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "var(--color-text-muted)",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
        <p style={{ margin: 0, fontSize: 14 }}>
          No responses yet. The support team will reply here shortly.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {responses.map((resp, i) => {
        const isAuthor = resp.responder?.role === "author" || resp.responder_id === currentUserId;

        return (
          <div
            key={resp.id}
            className="animate-fade-in"
            style={{
              animationDelay: `${i * 60}ms`,
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              flexDirection: isAuthor ? "row-reverse" : "row",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: isAuthor
                  ? "linear-gradient(135deg, var(--color-blue-600), var(--color-blue-800))"
                  : "linear-gradient(135deg, var(--color-emerald-600), var(--color-emerald-800))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                boxShadow: isAuthor
                  ? "0 2px 6px rgb(37 99 235 / 0.3)"
                  : "0 2px 6px rgb(5 150 105 / 0.3)",
              }}
            >
              {isAuthor ? "You" : "BL"}
            </div>

            {/* Message bubble */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: isAuthor ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  marginBottom: 6,
                  flexWrap: "wrap",
                  flexDirection: isAuthor ? "row-reverse" : "row",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isAuthor ? "var(--color-blue-700)" : "var(--color-emerald-700)",
                  }}
                >
                  {isAuthor ? "You" : "BookLeaf Support"}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-subtle)",
                  }}
                >
                  {formatDate(resp.created_at)}
                </span>
              </div>

              <div
                style={{
                  background: isAuthor ? "#eff6ff" : "#f0fdf4",
                  border: `1px solid ${isAuthor ? "#bfdbfe" : "#bbf7d0"}`,
                  borderRadius: isAuthor
                    ? "var(--radius-md) 0 var(--radius-md) var(--radius-md)"
                    : "0 var(--radius-md) var(--radius-md) var(--radius-md)",
                  padding: "14px 16px",
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "var(--color-text-base)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  textAlign: "left",
                }}
              >
                {resp.message}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
