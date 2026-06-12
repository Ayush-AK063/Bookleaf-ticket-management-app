"use client";

import { useMemo } from "react";
import type { AdminTicket } from "./useAdminTickets";

export interface AdminStats {
  total: number;
  open: number;
  critical: number;
  avgResponseTimeHours: number | null;
}

export function useAdminStats(tickets: AdminTicket[] | undefined): AdminStats {
  return useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return { total: 0, open: 0, critical: 0, avgResponseTimeHours: null };
    }

    const total = tickets.length;
    const open = tickets.filter(
      (t) => t.status === "open" || t.status === "in_progress",
    ).length;
    const critical = tickets.filter((t) => t.priority === "critical").length;

    return {
      total,
      open,
      critical,
      avgResponseTimeHours: null, // Computed from response data when available on detail views
    };
  }, [tickets]);
}
