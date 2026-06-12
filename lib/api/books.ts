import type { Book, BookWithPending } from "@/types";

export function withRoyaltyPending(book: Book): BookWithPending {
  const earned = Number(book.royalty_earned);
  const paid = Number(book.royalty_paid);

  return {
    ...book,
    mrp: Number(book.mrp),
    royalty_earned: earned,
    royalty_paid: paid,
    royalty_pending: earned - paid,
  };
}

export function withRoyaltyPendingMany(books: Book[]): BookWithPending[] {
  return books.map(withRoyaltyPending);
}
