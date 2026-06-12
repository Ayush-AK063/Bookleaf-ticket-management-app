import { NextResponse } from "next/server";
import { jsonError, validationError } from "@/lib/api/errors";
import { LoginSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return jsonError(401, "Invalid credentials");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return jsonError(401, "Invalid credentials");
  }

  return NextResponse.json({
    user: {
      id: profile.id,
      email: profile.email,
      role: profile.role,
    },
  });
}
