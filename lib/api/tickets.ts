import type { Priority, Ticket } from "@/types";

const PRIORITY_RANK: Record<Priority, number> = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
};

export function sortTicketsByUrgency<T extends Pick<Ticket, "priority" | "created_at">>(
  tickets: T[],
): T[] {
  return [...tickets].sort((a, b) => {
    const priorityDiff =
      PRIORITY_RANK[a.priority as Priority] -
      PRIORITY_RANK[b.priority as Priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}
