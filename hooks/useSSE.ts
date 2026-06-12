"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export interface SSEMessage {
  type: "NEW_RESPONSE" | "STATUS_UPDATE";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export function useSSE(
  ticketId: string | null | undefined,
  onMessage: (data: SSEMessage) => void,
) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!ticketId) return;

    const supabase = createClient();
    
    // Subscribe to a specific channel for this ticket
    const channel = supabase.channel(`ticket-${ticketId}`);

    channel
      .on(
        "broadcast",
        { event: "TICKET_UPDATE" },
        (payload) => {
          if (payload.payload) {
            onMessageRef.current(payload.payload as SSEMessage);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to ticket-${ticketId} realtime channel`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);
}
