import type { TicketStatus } from "@/types";

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; dot: string; bg: string; color: string }
> = {
  open: {
    label: "Open",
    dot: "#3b82f6",
    bg: "var(--color-status-open-bg)",
    color: "var(--color-status-open)",
  },
  in_progress: {
    label: "In Progress",
    dot: "#f59e0b",
    bg: "var(--color-status-progress-bg)",
    color: "var(--color-status-progress)",
  },
  resolved: {
    label: "Resolved",
    dot: "#10b981",
    bg: "var(--color-status-resolved-bg)",
    color: "var(--color-status-resolved)",
  },
  closed: {
    label: "Closed",
    dot: "#71717a",
    bg: "var(--color-status-closed-bg)",
    color: "var(--color-status-closed)",
  },
};

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  return (
    <span
      className={`badge ${className}`}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.dot,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}
