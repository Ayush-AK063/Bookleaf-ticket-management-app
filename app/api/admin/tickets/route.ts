import { NextResponse } from "next/server";
import { isErrorResponse, requireRole } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";
import { sortTicketsByUrgency } from "@/lib/api/tickets";
import { createClient } from "@/lib/supabase/server";
import type { Ticket } from "@/types";

export async function GET(request: Request) {
  const user = await requireRole(["admin"]);
  if (isErrorResponse(user)) {
    return user;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const priority = searchParams.get("priority");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const supabase = await createClient();
  let query = supabase.from("tickets").select(
    `
      *,
      author:profiles!tickets_author_id_fkey(id, email, role),
      book:books(id, title, isbn),
      assignment:ticket_assignments(
        admin_id,
        assigned_at,
        admin:profiles!ticket_assignments_admin_id_fkey(id, email)
      )
    `,
  );

  if (status) {
    query = query.eq("status", status);
  }
  if (category) {
    query = query.eq("category", category);
  }
  if (priority) {
    query = query.eq("priority", priority);
  }
  if (from) {
    query = query.gte("created_at", from);
  }
  if (to) {
    query = query.lte("created_at", to);
  }

  const { data, error } = await query;

  if (error) {
    return serverError("Failed to fetch tickets");
  }

  const sorted = sortTicketsByUrgency((data ?? []) as Ticket[]);
  return NextResponse.json(sorted);
}
