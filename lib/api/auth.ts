import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types";
import { jsonError } from "./errors";

export type SessionUser = Profile;

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return profile as SessionUser;
}

export async function requireAuth(): Promise<
  SessionUser | ReturnType<typeof jsonError>
> {
  const user = await getSessionUser();
  if (!user) {
    return jsonError(401, "Unauthorised");
  }
  return user;
}

export async function requireRole(
  roles: UserRole[],
): Promise<SessionUser | ReturnType<typeof jsonError>> {
  const result = await requireAuth();
  if (isErrorResponse(result)) {
    return result;
  }
  if (!roles.includes(result.role)) {
    return jsonError(403, "Forbidden");
  }
  return result;
}

export function isErrorResponse(
  value: SessionUser | ReturnType<typeof jsonError>,
): value is ReturnType<typeof jsonError> {
  return value instanceof Response;
}
