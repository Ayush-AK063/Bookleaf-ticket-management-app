import { NextResponse } from "next/server";
import { isErrorResponse, requireRole } from "@/lib/api/auth";
import { jsonError, serverError, validationError } from "@/lib/api/errors";
import { UpdateTicketSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await requireRole(["admin"]);
  if (isErrorResponse(user)) {
    return user;
  }

  const { id } = await context.params;
  const supabase = await createClient();

  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select(
      `
        *,
        author:profiles!tickets_author_id_fkey(id, email, role, created_at),
        book:books(id, title, isbn, status),
        assignment:ticket_assignments(
          admin_id,
          assigned_at,
          admin:profiles!ticket_assignments_admin_id_fkey(id, email)
        )
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (ticketError) {
    return serverError("Failed to fetch ticket");
  }
  if (!ticket) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: responses, error: responsesError } = await supabase
    .from("ticket_responses")
    .select(
      `
        id,
        ticket_id,
        responder_id,
        message,
        is_internal,
        created_at,
        responder:profiles!ticket_responses_responder_id_fkey(id, email, role)
      `,
    )
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  if (responsesError) {
    return serverError("Failed to fetch ticket responses");
  }

  return NextResponse.json({
    ...ticket,
    responses: responses ?? [],
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await requireRole(["admin"]);
  if (isErrorResponse(user)) {
    return user;
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const parsed = UpdateTicketSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return serverError("Failed to fetch ticket");
  }
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  const { status, category, priority } = parsed.data;

  if (status !== undefined) {
    updates.status = status;
  }
  if (category !== undefined) {
    updates.category = category;
    if (category !== existing.category) {
      updates.ai_category_overridden = true;
    }
  }
  if (priority !== undefined) {
    updates.priority = priority;
    if (priority !== existing.priority) {
      updates.ai_priority_overridden = true;
    }
  }

  if (Object.keys(updates).length === 0) {
    return jsonError(400, "No valid fields to update");
  }

  const { data: updated, error: updateError } = await supabase
    .from("tickets")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !updated) {
    return serverError("Failed to update ticket");
  }

  if (status !== undefined && status !== existing.status) {
    const channel = supabase.channel(`ticket-${id}`);
    await channel.send({
      type: "broadcast",
      event: "TICKET_UPDATE",
      payload: {
        type: "STATUS_UPDATE",
        status,
      },
    });
  }

  return NextResponse.json(updated);
}
