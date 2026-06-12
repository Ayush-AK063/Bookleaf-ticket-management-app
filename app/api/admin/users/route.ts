import { NextResponse } from "next/server";
import { isErrorResponse, requireRole } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export async function GET() {
  const user = await requireRole(["admin"]);
  if (isErrorResponse(user)) {
    return user;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, created_at, books(count)")
    .order("email", { ascending: true });

  if (error) {
    return serverError("Failed to fetch users");
  }

  const users = (data ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    created_at: u.created_at,
    book_count: u.books?.[0]?.count ?? 0,
  }));

  return NextResponse.json(users);
}

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["author", "admin"]),
});

export async function POST(req: Request) {
  const adminUser = await requireRole(["admin"]);
  if (isErrorResponse(adminUser)) {
    return adminUser;
  }

  try {
    const body = await req.json();
    const result = CreateUserSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input data", details: result.error.issues }, { status: 400 });
    }

    const { email, password, role } = result.data;
    const adminClient = createAdminClient();

    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      console.error("Auth creation error:", authError);
      return serverError(authError?.message || "Failed to create user account");
    }

    // 2. Add the profile row
    const { error: profileError } = await adminClient
      .from("profiles")
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        role: role,
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Attempt cleanup (delete auth user if profile fails)
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return serverError("Failed to create user profile");
    }

    return NextResponse.json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("User creation unhandled error:", error);
    return serverError("An unexpected error occurred while creating the user");
  }
}
