import { NextResponse } from "next/server";
import { isErrorResponse, requireRole } from "@/lib/api/auth";
import { withRoyaltyPendingMany } from "@/lib/api/books";
import { serverError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/types";

export async function GET() {
  const user = await requireRole(["author"]);
  if (isErrorResponse(user)) {
    return user;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("author_id", user.id)
    .order("pub_date", { ascending: false });

  if (error) {
    return serverError("Failed to fetch books");
  }

  return NextResponse.json(withRoyaltyPendingMany((data ?? []) as Book[]));
}
