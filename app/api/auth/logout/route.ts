import { NextResponse } from "next/server";
import { isErrorResponse, requireAuth } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const result = await requireAuth();
  if (isErrorResponse(result)) {
    return result;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Logged out" });
}
