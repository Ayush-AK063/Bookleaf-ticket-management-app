import { NextResponse } from "next/server";
import { generateDraft } from "@/lib/ai/service";
import { isErrorResponse, requireRole } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await requireRole(["admin"]);
  if (isErrorResponse(user)) {
    return user;
  }

  const { id: ticketId } = await context.params;

  try {
    const draft = await generateDraft(ticketId);
    return NextResponse.json({ draft, unavailable: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN";

    if (message === "TICKET_NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // AI_UNAVAILABLE or any other AI error — graceful degradation
    console.error("[Draft route] AI unavailable:", message);
    return NextResponse.json({ draft: null, unavailable: true });
  }
}
