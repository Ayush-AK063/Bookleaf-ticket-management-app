import { isErrorResponse, requireRole } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";
import { sseService } from "@/lib/sse/service";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const user = await requireRole(["author"]);
  if (isErrorResponse(user)) {
    return user;
  }

  const { id: ticketId } = await context.params;
  const supabase = await createClient();

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", ticketId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (error) {
    return serverError("Failed to verify ticket");
  }
  if (!ticket) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let writerRef: { write: (chunk: string) => void } | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const writer = {
        write(chunk: string) {
          controller.enqueue(encoder.encode(chunk));
        },
      };
      writerRef = writer;
      sseService.addConnection(ticketId, writer);
      controller.enqueue(encoder.encode(": connected\n\n"));

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          if (heartbeat) {
            clearInterval(heartbeat);
          }
        }
      }, 30000);
    },
    cancel() {
      if (heartbeat) {
        clearInterval(heartbeat);
      }
      if (writerRef) {
        sseService.removeConnection(ticketId, writerRef);
      }
    },
  });

  request.signal.addEventListener("abort", () => {
    if (heartbeat) {
      clearInterval(heartbeat);
    }
    if (writerRef) {
      sseService.removeConnection(ticketId, writerRef);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
