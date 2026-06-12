"use client";

import { useQuery } from "@tanstack/react-query";
import type { TicketResponse } from "@/types";
import type { AdminTicket } from "./useAdminTickets";

export interface AdminTicketDetail extends AdminTicket {
  responses: (TicketResponse & {
    responder: { id: string; email: string; role: string };
  })[];
}

async function fetchAdminTicket(id: string): Promise<AdminTicketDetail> {
  const res = await fetch(`/api/admin/tickets/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to load ticket");
  }
  return res.json();
}

export function useAdminTicket(id: string) {
  return useQuery<AdminTicketDetail, Error>({
    queryKey: ["admin", "tickets", id],
    queryFn: () => fetchAdminTicket(id),
    enabled: Boolean(id),
    staleTime: 1000 * 20,
  });
}
