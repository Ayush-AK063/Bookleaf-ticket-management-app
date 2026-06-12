import { NextResponse } from "next/server";
import { isErrorResponse, requireRole } from "@/lib/api/auth";
import { jsonError, serverError, validationError } from "@/lib/api/errors";
import { RespondToTicketSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const user = await requireRole(["author"]);
  if (isErrorResponse(user)) {
    return user;
  }

  const { id: ticketId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  // Reuse the RespondToTicketSchema which checks for a message
  const parsed = RespondToTicketSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { message } = parsed.data;
  const supabase = await createClient();

  // Verify the ticket belongs to the author
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", ticketId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (ticketError) {
    return serverError("Failed to verify ticket");
  }
  if (!ticket) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Insert response (always public for author)
  const { data: response, error: createError } = await supabase
    .from("ticket_responses")
    .insert({
      ticket_id: ticketId,
      responder_id: user.id,
      message,
      is_internal: false,
    })
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
    .single();

  if (createError || !response) {
    return serverError("Failed to create response");
  }

  // Broadcast to the channel so the admin sees it
  const channel = supabase.channel(`ticket-${ticketId}`);
  await channel.send({
    type: "broadcast",
    event: "TICKET_UPDATE",
    payload: {
      type: "NEW_RESPONSE",
      response: {
        id: response.id,
        message: response.message,
        created_at: response.created_at,
        responder: { id: user.id, name: "Author" },
      },
    },
  });

  return NextResponse.json(response, { status: 201 });
}
