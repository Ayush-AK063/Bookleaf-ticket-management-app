import { NextResponse } from "next/server";
import { isErrorResponse, requireAuth } from "@/lib/api/auth";

export async function GET() {
  const result = await requireAuth();
  if (isErrorResponse(result)) {
    return result;
  }

  return NextResponse.json({
    user: {
      id: result.id,
      email: result.email,
      role: result.role,
    },
  });
}
