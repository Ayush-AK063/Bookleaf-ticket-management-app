"use client";

import { useState } from "react";
import { useAdminTickets, type AdminTicketFilters } from "@/hooks/useAdminTickets";
import { useAdminStats } from "@/hooks/useAdminStats";
import { StatsBar } from "@/components/admin/StatsBar";
import { FilterBar } from "@/components/admin/FilterBar";
import { TicketQueue } from "@/components/admin/TicketQueue";

export default function AdminDashboardPage() {
  const [filters, setFilters] = useState<AdminTicketFilters>({});
  const { data: tickets, isLoading, isError } = useAdminTickets(filters);
  const stats = useAdminStats(tickets);

  // Stats use unfiltered data — get totals without filters
  const { data: allTickets } = useAdminTickets({});
  const totalStats = useAdminStats(allTickets);

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#3b82f6",
          }}
        >
          Admin Portal
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Ticket Queue
        </h1>
        <p style={{ margin: "6px 0 0", color: "var(--color-text-muted)", fontSize: 14 }}>
          All author support queries, sorted by urgency. Respond to critical tickets first.
        </p>
      </div>

      {/* Stats — always based on full dataset */}
      <StatsBar stats={totalStats} isLoading={isLoading && !allTickets} />

      {/* Filters */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Filtered result count */}
      {!isLoading && tickets && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            fontSize: 13,
            color: "var(--color-text-muted)",
          }}
        >
          <span>{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</span>
          {Object.values(filters).some(Boolean) && (
            <span style={{ color: "#3b82f6", fontWeight: 600 }}>(filtered)</span>
          )}
        </div>
      )}

      {/* Ticket queue */}
      <TicketQueue tickets={tickets} isLoading={isLoading} isError={isError} />
    </div>
  );
}
