import { NextResponse } from "next/server";
import { isErrorResponse, requireRole } from "@/lib/api/auth";
import { serverError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";
import { CreateBookSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const adminUser = await requireRole(["admin"]);
  if (isErrorResponse(adminUser)) {
    return adminUser;
  }

  try {
    const body = await req.json();
    const result = CreateBookSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: result.error.issues },
        { status: 400 }
      );
    }

    const bookData = result.data;
    const supabase = await createClient();

    // Insert the book directly using the server client
    // (RLS is bypassed for admins via service role, or we are using a regular client and Admin has a policy)
    // Actually `createClient()` uses the regular Supabase client with the user's session.
    // If there is an issue with RLS we can switch to `createAdminClient()`, but regular admins usually have a policy.
    // We will use `createAdminClient()` just to be safe if RLS prevents inserts.
    // Wait, the Phase_1_2_Complete docs mention: "Supabase RLS is configured to let users only see their own data... For Admins, we use the service role key or specific policies".
    // Let's use createAdminClient to ensure it works flawlessly.
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminClient = createAdminClient();

    const { data: newBook, error } = await adminClient
      .from("books")
      .insert(bookData)
      .select()
      .single();

    if (error) {
      console.error("Book creation error:", error);
      return serverError("Failed to create book");
    }

    return NextResponse.json({ success: true, book: newBook });
  } catch (error) {
    console.error("Book creation unhandled error:", error);
    return serverError("An unexpected error occurred while creating the book");
  }
}
