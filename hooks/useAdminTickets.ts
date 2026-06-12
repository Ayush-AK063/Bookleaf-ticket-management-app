"use client";

import { useQuery } from "@tanstack/react-query";
import type { Ticket } from "@/types";

export interface AdminTicketFilters {
  status?: string;
  category?: string;
  priority?: string;
  from?: string;
  to?: string;
}

export interface AdminTicket extends Ticket {
  author: { id: string; email: string; role: string };
  book: { id: string; title: string; isbn: string } | null;
  assignment: {
    admin_id: string;
    assigned_at: string;
    admin: { id: string; email: string };
  } | null;
}

async function fetchAdminTickets(filters: AdminTicketFilters): Promise<AdminTicket[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const qs = params.toString();
  const res = await fetch(`/api/admin/tickets${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to load tickets");
  }
  return res.json();
}

export function useAdminTickets(filters: AdminTicketFilters = {}) {
  return useQuery<AdminTicket[], Error>({
    queryKey: ["admin", "tickets", filters],
    queryFn: () => fetchAdminTickets(filters),
    staleTime: 1000 * 30,
  });
}
