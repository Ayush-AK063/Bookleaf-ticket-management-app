"use client";

import { useQuery } from "@tanstack/react-query";
import type { BookWithPending } from "@/types";

async function fetchBooks(): Promise<BookWithPending[]> {
  const res = await fetch("/api/books");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to load books");
  }
  return res.json();
}

export function useBooks() {
  return useQuery<BookWithPending[], Error>({
    queryKey: ["books"],
    queryFn: fetchBooks,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
