"use client";

import { useBooks } from "@/hooks/useBooks";
import { BookCard } from "@/components/books/BookCard";
import Link from "next/link";

function BookCardSkeleton() {
  return (
    <div
      className="card"
      style={{ padding: 0, overflow: "hidden" }}
    >
      <div className="skeleton" style={{ height: 96, borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }} />
      <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {[80, 100, 70, 90].map((w, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="skeleton" style={{ width: 48, height: 10 }} />
              <div className="skeleton" style={{ width: w, height: 13 }} />
            </div>
          ))}
        </div>
        <div className="skeleton" style={{ height: 80 }} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "64px 24px",
        maxWidth: 380,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "var(--color-emerald-50)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          margin: "0 auto 20px",
        }}
      >
        📚
      </div>
      <h2
        style={{
          margin: "0 0 10px",
          fontSize: 18,
          fontWeight: 700,
          color: "var(--color-text-base)",
        }}
      >
        No books yet
      </h2>
      <p style={{ margin: "0 0 24px", color: "var(--color-text-muted)", fontSize: 14, lineHeight: 1.6 }}>
        Your published and in-production titles will appear here once your books are added to the system.
      </p>
      <Link href="/author/tickets/new" className="btn btn-primary" style={{ display: "inline-flex" }}>
        Submit a Query
      </Link>
    </div>
  );
}

export default function AuthorBooksPage() {
  const { data: books, isLoading, isError } = useBooks();

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-emerald-600)",
          }}
        >
          Author Portal
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 800,
            color: "var(--color-text-base)",
            letterSpacing: "-0.02em",
          }}
        >
          My Books
        </h1>
        <p style={{ margin: "6px 0 0", color: "var(--color-text-muted)", fontSize: 14 }}>
          Your published titles and royalty summaries.
        </p>
      </div>

      {/* Error state */}
      {isError && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: "var(--radius-md)",
            padding: "14px 18px",
            color: "#dc2626",
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          ⚠️ Failed to load books. Please refresh the page.
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && books?.length === 0 && <EmptyState />}

      {/* Book grid */}
      {!isLoading && books && books.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
                fontWeight: 500,
              }}
            >
              {books.length} {books.length === 1 ? "title" : "titles"}
            </span>
            {books.some((b) => b.royalty_pending > 0) && (
              <span
                style={{
                  background: "#fffbeb",
                  color: "#b45309",
                  border: "1px solid #fde68a",
                  padding: "2px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                ⚠️ Pending royalties
              </span>
            )}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
