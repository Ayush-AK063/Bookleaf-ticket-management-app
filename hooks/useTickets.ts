"use client";

import { useQuery } from "@tanstack/react-query";
import type { Ticket, TicketResponse } from "@/types";

async function fetchTickets(): Promise<Ticket[]> {
  const res = await fetch("/api/tickets");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to load tickets");
  }
  return res.json();
}

export function useTickets() {
  return useQuery<Ticket[], Error>({
    queryKey: ["tickets"],
    queryFn: fetchTickets,
    staleTime: 1000 * 30, // 30 seconds — tickets need to be fairly fresh
  });
}

// ─── Single ticket detail ────────────────────────────────────────────────

export interface TicketDetail {
  ticket: Ticket & { book?: { title: string; isbn: string } | null };
  responses: TicketResponse[];
}

async function fetchTicket(id: string): Promise<TicketDetail> {
  const res = await fetch(`/api/tickets/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to load ticket");
  }
  return res.json();
}

export function useTicket(id: string) {
  return useQuery<TicketDetail, Error>({
    queryKey: ["tickets", id],
    queryFn: () => fetchTicket(id),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}
