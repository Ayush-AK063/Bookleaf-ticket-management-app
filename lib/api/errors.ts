import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function jsonError(
  status: number,
  error: string,
  field?: string,
  code?: string,
) {
  return NextResponse.json({ error, field, code }, { status });
}

export function validationError(zodError: ZodError) {
  const issue = zodError.issues[0];
  const field = issue?.path.length ? issue.path.join(".") : undefined;
  return jsonError(400, issue?.message ?? "Validation failed", field);
}

export function serverError(message = "Internal server error") {
  return jsonError(500, message);
}
