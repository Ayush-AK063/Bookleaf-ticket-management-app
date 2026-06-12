import type { AdminStats } from "@/hooks/useAdminStats";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  highlight?: boolean;
  sub?: string;
}

function StatCard({ label, value, icon, highlight, sub }: StatCardProps) {
  return (
    <div
      className="card"
      style={{
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        borderLeft: highlight ? "3px solid #ef4444" : "3px solid transparent",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>
          {label}
        </span>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: highlight ? "#fef2f2" : "var(--color-emerald-50)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
        >
          {icon}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: highlight ? "#dc2626" : "var(--color-text-base)",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      {sub && (
        <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-subtle)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="card" style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div className="skeleton" style={{ width: 100, height: 14 }} />
        <div className="skeleton" style={{ width: 34, height: 34, borderRadius: 10 }} />
      </div>
      <div className="skeleton" style={{ width: 60, height: 32 }} />
    </div>
  );
}

interface StatsBarProps {
  stats: AdminStats;
  isLoading?: boolean;
}

export function StatsBar({ stats, isLoading }: StatsBarProps) {
  if (isLoading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 16,
        marginBottom: 28,
      }}
    >
      <StatCard
        label="Total Tickets"
        value={stats.total}
        icon="🎫"
        sub="All time"
      />
      <StatCard
        label="Open / Active"
        value={stats.open}
        icon="📬"
        sub="Needs attention"
      />
      <StatCard
        label="Critical"
        value={stats.critical}
        icon="🚨"
        highlight={stats.critical > 0}
        sub={stats.critical > 0 ? "Urgent — respond first" : "None outstanding"}
      />
      <StatCard
        label="Resolved"
        value={stats.total - stats.open}
        icon="✅"
        sub="Closed + resolved"
      />
    </div>
  );
}
