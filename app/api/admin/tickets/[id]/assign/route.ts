import { NextResponse } from "next/server";
import { isErrorResponse, requireRole } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const user = await requireRole(["admin"]);
  if (isErrorResponse(user)) {
    return user;
  }

  const { id: ticketId } = await context.params;
  const supabase = await createClient();

  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", ticketId)
    .maybeSingle();

  if (ticketError) {
    return serverError("Failed to verify ticket");
  }
  if (!ticket) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: assignment, error: assignError } = await supabase
    .from("ticket_assignments")
    .upsert(
      {
        ticket_id: ticketId,
        admin_id: user.id,
        assigned_at: new Date().toISOString(),
      },
      { onConflict: "ticket_id" },
    )
    .select("*")
    .single();

  if (assignError || !assignment) {
    return serverError("Failed to assign ticket");
  }

  return NextResponse.json(assignment, { status: 201 });
}
