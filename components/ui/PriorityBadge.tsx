import type { Priority } from "@/types";

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; bg: string; color: string }
> = {
  critical: {
    label: "Critical",
    bg: "var(--color-priority-critical-bg)",
    color: "var(--color-priority-critical)",
  },
  high: {
    label: "High",
    bg: "var(--color-priority-high-bg)",
    color: "var(--color-priority-high)",
  },
  medium: {
    label: "Medium",
    bg: "var(--color-priority-medium-bg)",
    color: "var(--color-priority-medium)",
  },
  low: {
    label: "Low",
    bg: "var(--color-priority-low-bg)",
    color: "var(--color-priority-low)",
  },
};

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({
  priority,
  className = "",
}: PriorityBadgeProps) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium;
  return (
    <span
      className={`badge ${className}`}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}
