"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBooks } from "@/hooks/useBooks";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const CreateTicketSchema = z.object({
  bookId: z.string().optional(),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject cannot exceed 200 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description cannot exceed 5000 characters"),
});

type FormErrors = Partial<Record<"bookId" | "subject" | "description" | "root", string>>;

export function TicketForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: books = [] } = useBooks();

  const [bookId, setBookId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);

  const validate = useCallback(() => {
    const result = CreateTicketSchema.safeParse({ bookId: bookId || undefined, subject, description });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors({
        subject: flat.subject?.[0],
        description: flat.description?.[0],
      });
      return false;
    }
    setErrors({});
    return true;
  }, [bookId, subject, description]);

  const isValid =
    subject.length >= 5 && subject.length <= 200 &&
    description.length >= 20 && description.length <= 5000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      let finalDescription = description;

      // Handle file upload if present
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to upload attachment");
        }

        const { url } = await uploadRes.json();

        if (url) {
          // Append attachment as Markdown image/link
          const isImage = file.type.startsWith("image/");
          if (isImage) {
            finalDescription += `\n\n![Attachment](${url})`;
          } else {
            finalDescription += `\n\n[View Attachment](${url})`;
          }
        }
      }

      const body: Record<string, string> = { subject, description: finalDescription };
      if (bookId) body.bookId = bookId;

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({ root: data.error ?? "Failed to submit ticket. Please try again." });
        return;
      }

      // Success
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setToast("✅ Ticket submitted! Redirecting…");
      setTimeout(() => router.push("/author/tickets"), 2000);
    } catch (err: any) {
      setErrors({ root: err.message || "Network error. Please check your connection." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Root error */}
        {errors.root && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              color: "#dc2626",
              fontSize: 14,
            }}
          >
            {errors.root}
          </div>
        )}

        {/* Book selector */}
        <div>
          <label className="input-label" htmlFor="book-select">
            Related Book{" "}
            <span style={{ color: "var(--color-text-subtle)", fontWeight: 400 }}>
              (optional)
            </span>
          </label>
          <select
            id="book-select"
            className="input"
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            style={{ cursor: "pointer" }}
          >
            <option value="">General / Account Level</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} — {b.isbn}
              </option>
            ))}
          </select>
          <span className="input-hint">
            Select a book if your query is related to a specific title.
          </span>
        </div>

        {/* Subject */}
        <div>
          <label className="input-label" htmlFor="subject-input">
            Subject <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="subject-input"
              type="text"
              className={`input ${errors.subject ? "error" : ""}`}
              placeholder="Brief summary of your query…"
              value={subject}
              maxLength={200}
              onChange={(e) => {
                setSubject(e.target.value);
                if (errors.subject) validate();
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            {errors.subject ? (
              <span className="input-error">{errors.subject}</span>
            ) : (
              <span />
            )}
            <span
              className="input-hint"
              style={{
                color:
                  subject.length > 200
                    ? "var(--color-priority-critical)"
                    : "var(--color-text-subtle)",
              }}
            >
              {subject.length} / 200
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="input-label" htmlFor="description-input">
            Description <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <textarea
            id="description-input"
            className={`input ${errors.description ? "error" : ""}`}
            placeholder="Please describe your issue in detail. Include any relevant book titles, dates, or reference numbers…"
            value={description}
            maxLength={5000}
            rows={7}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) validate();
            }}
            style={{ resize: "vertical", minHeight: 140 }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            {errors.description ? (
              <span className="input-error">{errors.description}</span>
            ) : (
              <span className="input-hint">
                Minimum 20 characters required.
              </span>
            )}
            <span
              className="input-hint"
              style={{
                color:
                  description.length > 5000
                    ? "var(--color-priority-critical)"
                    : "var(--color-text-subtle)",
              }}
            >
              {description.length} / 5000
            </span>
          </div>
        </div>

        {/* File attachment */}
        <div>
          <label className="input-label" htmlFor="attachment-input">
            Attachment{" "}
            <span style={{ color: "var(--color-text-subtle)", fontWeight: 400 }}>
              (optional)
            </span>
          </label>
          <label
            htmlFor="attachment-input"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              border: "2px dashed var(--color-border)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              color: file ? "var(--color-emerald-700)" : "var(--color-text-muted)",
              background: file ? "var(--color-emerald-50)" : "transparent",
              borderColor: file ? "var(--color-emerald-400)" : "var(--color-border)",
              fontSize: 13,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!file) (e.currentTarget as HTMLLabelElement).style.borderColor = "var(--color-primary)";
            }}
            onMouseLeave={(e) => {
              if (!file) (e.currentTarget as HTMLLabelElement).style.borderColor = "var(--color-border)";
            }}
          >
            <span style={{ fontSize: 18 }}>📎</span>
            <span>{file ? file.name : "Click to attach a file (PDF, PNG, JPG — max 5MB)"}</span>
          </label>
          <input
            id="attachment-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.gif"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFile(e.target.files[0]);
              }
            }}
          />
          {file && (
            <div style={{ marginTop: 6, display: "flex", justifyContent: "flex-end" }}>
              <button 
                type="button" 
                onClick={() => setFile(null)} 
                style={{ background: "none", border: "none", color: "#dc2626", fontSize: 12, cursor: "pointer", padding: 0 }}
              >
                Remove attachment
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isValid || submitting}
            style={{ minWidth: 140 }}
          >
            {submitting ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16 }} />
                Submitting…
              </>
            ) : (
              "Submit Query"
            )}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => router.push("/author/tickets")}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Toast notification */}
      {toast && (
        <div className="toast toast-success" role="alert">
          {toast}
        </div>
      )}
    </>
  );
}
