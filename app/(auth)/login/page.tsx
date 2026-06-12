"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Link from "next/link";

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FieldErrors = Partial<Record<"email" | "password" | "root", string>>;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const result = LoginSchema.safeParse({ email, password });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors({
        email: flat.email?.[0],
        password: flat.password?.[0],
      });
      return false;
    }
    setErrors({});
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors({ root: data.error ?? "Invalid email or password." });
        return;
      }

      // Redirect based on role
      const role: string = data.user?.role;
      router.push(role === "admin" ? "/admin/dashboard" : "/author/books");
      router.refresh();
    } catch {
      setErrors({ root: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const isValid = email.length > 0 && password.length >= 8;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 30%, #f9fafb 100%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, var(--color-emerald-500), var(--color-emerald-800))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 14px",
              boxShadow: "0 8px 24px rgb(5 150 105 / 0.3)",
            }}
          >
            📖
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 800,
              color: "var(--color-text-base)",
              letterSpacing: "-0.03em",
            }}
          >
            BookLeaf Publishing
          </h1>
          <p style={{ margin: "6px 0 0", color: "var(--color-text-muted)", fontSize: 14 }}>
            Sign in to the Author Support Portal
          </p>
        </div>

        {/* Card */}
        <div
          className="card"
          style={{
            padding: "32px 36px",
            boxShadow: "var(--shadow-xl)",
            borderRadius: "var(--radius-xl)",
          }}
        >
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Root error */}
            {errors.root && (
              <div
                role="alert"
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: "var(--radius-md)",
                  padding: "11px 14px",
                  color: "#dc2626",
                  fontSize: 13,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>⚠️</span>
                {errors.root}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="input-label" htmlFor="email-input">
                Email address
              </label>
              <input
                id="email-input"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                className={`input ${errors.email ? "error" : ""}`}
              />
              {errors.email && <span className="input-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div>
              <label className="input-label" htmlFor="password-input">
                Password
              </label>
              <input
                id="password-input"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                className={`input ${errors.password ? "error" : ""}`}
              />
              {errors.password && <span className="input-error">{errors.password}</span>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              className="btn btn-primary"
              disabled={!isValid || loading}
              style={{ marginTop: 4, padding: "11px 18px", fontSize: 15, fontWeight: 600 }}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in…
                </>
              ) : (
                "Sign in →"
              )}
            </button>
          </form>
        </div>


        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--color-text-subtle)" }}>
          <Link href="/" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
