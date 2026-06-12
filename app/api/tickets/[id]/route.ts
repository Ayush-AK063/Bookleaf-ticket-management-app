import { NextResponse } from "next/server";
import { isErrorResponse, requireRole } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await requireRole(["author"]);
  if (isErrorResponse(user)) {
    return user;
  }

  const { id } = await context.params;
  const supabase = await createClient();

  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("*, book:books(id, title, isbn)")
    .eq("id", id)
    .eq("author_id", user.id)
    .maybeSingle();

  if (ticketError) {
    return serverError("Failed to fetch ticket");
  }
  if (!ticket) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: responses, error: responsesError } = await supabase
    .from("ticket_responses")
    .select("id, ticket_id, responder_id, message, is_internal, created_at")
    .eq("ticket_id", id)
    .eq("is_internal", false)
    .order("created_at", { ascending: true });

  if (responsesError) {
    return serverError("Failed to fetch ticket responses");
  }

  return NextResponse.json({
    ticket,
    responses: responses ?? [],
  });
}
