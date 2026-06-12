"use client";

import { useQuery } from "@tanstack/react-query";
import type { Profile } from "@/types";

async function fetchMe(): Promise<Profile> {
  const res = await fetch("/api/auth/me");
  if (!res.ok) throw new Error("Not authenticated");
  const data = await res.json();
  return data.user;
}

export function useAuth() {
  return useQuery<Profile, Error>({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
