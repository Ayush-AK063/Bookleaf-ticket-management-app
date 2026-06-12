import { NextResponse } from "next/server";
import { classifyAndPrioritize } from "@/lib/ai/service";
import { isErrorResponse, requireRole } from "@/lib/api/auth";
import { jsonError, serverError, validationError } from "@/lib/api/errors";
import { CreateTicketSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import type { Ticket } from "@/types";

export async function GET() {
  const user = await requireRole(["author"]);
  if (isErrorResponse(user)) {
    return user;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return serverError("Failed to fetch tickets");
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const user = await requireRole(["author"]);
  if (isErrorResponse(user)) {
    return user;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const parsed = CreateTicketSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { bookId, subject, description } = parsed.data;
  const supabase = await createClient();

  if (bookId) {
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("id")
      .eq("id", bookId)
      .eq("author_id", user.id)
      .maybeSingle();

    if (bookError) {
      return serverError("Failed to validate book");
    }
    if (!book) {
      return jsonError(400, "Book not found or does not belong to you", "bookId");
    }
  }

  const { data: ticket, error: createError } = await supabase
    .from("tickets")
    .insert({
      author_id: user.id,
      book_id: bookId ?? null,
      subject,
      description,
    })
    .select("*")
    .single();

  if (createError || !ticket) {
    return serverError("Failed to create ticket");
  }

  try {
    const ai = await classifyAndPrioritize(subject, description);
    const { data: updated, error: updateError } = await supabase
      .from("tickets")
      .update({
        category: ai.category,
        priority: ai.priority,
        priority_reason: ai.priority_reason,
      })
      .eq("id", ticket.id)
      .select("*")
      .single();

    if (updateError || !updated) {
      return NextResponse.json(ticket as Ticket, { status: 201 });
    }

    return NextResponse.json(updated as Ticket, { status: 201 });
  } catch {
    return NextResponse.json(ticket as Ticket, { status: 201 });
  }
}
