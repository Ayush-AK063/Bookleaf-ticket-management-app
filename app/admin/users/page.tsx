"use client";

import { useUsers, useCreateUser, useCreateBook } from "@/hooks/useUsers";
import { useState } from "react";

function TableSkeleton() {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", background: "var(--color-zinc-50)" }}>
        <div className="skeleton" style={{ width: 120, height: 16 }} />
      </div>
      <div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              padding: "16px 20px",
              borderBottom: i === 4 ? "none" : "1px solid var(--color-border)",
              alignItems: "center",
              gap: 16
            }}
          >
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="skeleton" style={{ width: 150, height: 14 }} />
              <div className="skeleton" style={{ width: 220, height: 12 }} />
            </div>
            <div className="skeleton" style={{ width: 80, height: 14 }} />
            <div className="skeleton" style={{ width: 100, height: 14 }} />
            <div className="skeleton" style={{ width: 100, height: 14 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { data: users, isLoading, isError } = useUsers();
  const createUser = useCreateUser();
  const createBook = useCreateBook();
  
  // User Modal State
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"author" | "admin">("author");
  const [formError, setFormError] = useState("");

  // Book Modal State
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [bookFormError, setBookFormError] = useState("");
  const [bookData, setBookData] = useState({
    title: "",
    isbn: "",
    genre: "",
    pub_date: new Date().toISOString().split('T')[0],
    status: "published",
    mrp: 0,
    copies_sold: 0,
    royalty_earned: 0,
    royalty_paid: 0,
  });

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }

    try {
      await createUser.mutateAsync({ email, password, role });
      setShowModal(false);
      setEmail("");
      setPassword("");
      setRole("author");
    } catch (err: any) {
      setFormError(err.message || "Failed to create user");
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookFormError("");

    if (!selectedAuthorId) return;

    try {
      await createBook.mutateAsync({
        author_id: selectedAuthorId,
        ...bookData,
      });
      setShowBookModal(false);
      setBookData({
        title: "",
        isbn: "",
        genre: "",
        pub_date: new Date().toISOString().split('T')[0],
        status: "published",
        mrp: 0,
        copies_sold: 0,
        royalty_earned: 0,
        royalty_paid: 0,
      });
      setSelectedAuthorId(null);
    } catch (err: any) {
      setBookFormError(err.message || "Failed to create book");
    }
  };

  return (
    <>
      <div className="animate-fade-in relative">
        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#1e40af",
              }}
            >
              Admin Portal
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
              User Management
            </h1>
            <p style={{ margin: "6px 0 0", color: "var(--color-text-muted)", fontSize: 14 }}>
              Directory of all registered authors and admins.
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{ background: "#1e40af", color: "#fff", boxShadow: "0 4px 12px rgba(30, 64, 175, 0.3)" }}
          >
            <span style={{ fontSize: 16 }}>+</span> Add User
          </button>
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
            ⚠️ Failed to load users. Please refresh the page.
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && <TableSkeleton />}

        {/* Users table */}
        {!isLoading && !isError && users && (
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead style={{ background: "var(--color-zinc-50)", borderBottom: "1px solid var(--color-border)" }}>
                  <tr>
                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>User</th>
                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</th>
                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Books</th>
                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Joined</th>
                    <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-text-muted)" }}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr
                        key={user.id}
                        style={{
                          borderBottom: index === users.length - 1 ? "none" : "1px solid var(--color-border)",
                          background: "var(--color-surface)",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--color-zinc-50)"}
                        onMouseLeave={e => e.currentTarget.style.background = "var(--color-surface)"}
                      >
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: user.role === 'admin' 
                                  ? "linear-gradient(135deg, #3b82f6, #1e40af)"
                                  : "linear-gradient(135deg, var(--color-emerald-400), var(--color-emerald-700))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 700,
                              }}
                            >
                              {user.email?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-base)" }}>
                                {user.email}
                              </div>
                              <div style={{ fontSize: 12, color: "var(--color-text-subtle)", fontFamily: "monospace", marginTop: 2 }}>
                                ID: {user.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          {user.role === 'admin' ? (
                            <span className="badge" style={{ background: "#eff6ff", color: "#1e40af" }}>
                              Admin
                            </span>
                          ) : (
                            <span className="badge" style={{ background: "var(--color-emerald-50)", color: "var(--color-emerald-700)" }}>
                              Author
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          {user.role === 'author' ? (
                            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-base)" }}>
                              {user.book_count} {user.book_count === 1 ? 'Book' : 'Books'}
                            </span>
                          ) : (
                            <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
                            {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          {user.role === 'author' ? (
                            <button
                              onClick={() => {
                                setSelectedAuthorId(user.id);
                                setShowBookModal(true);
                              }}
                              className="btn btn-outline"
                              style={{ padding: "6px 12px", fontSize: 13 }}
                            >
                              + Add Book
                            </button>
                          ) : (
                            <span style={{ color: "var(--color-text-subtle)" }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal Overlay */}
      {showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div className="card animate-fade-in" style={{
            width: "100%",
            maxWidth: 400,
            background: "var(--color-surface)",
            padding: 24,
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-xl)"
          }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700 }}>Add New User</h2>
            
            {formError && (
              <div style={{ background: "#fef2f2", color: "#dc2626", padding: "10px 14px", borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleUserSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="input-label">Email Address</label>
                <input 
                  type="email" 
                  className="input" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="author@bookleaf.com"
                  required
                />
              </div>

              <div>
                <label className="input-label">Password</label>
                <input 
                  type="password" 
                  className="input" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                />
              </div>

              <div>
                <label className="input-label">Account Role</label>
                <select 
                  className="input" 
                  value={role}
                  onChange={e => setRole(e.target.value as "author" | "admin")}
                  style={{ cursor: "pointer" }}
                >
                  <option value="author">Author (Standard Access)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1, background: "#1e40af" }}
                  disabled={createUser.isPending}
                >
                  {createUser.isPending ? <span className="spinner" /> : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Book Modal Overlay */}
      {showBookModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div className="card animate-fade-in" style={{
            width: "100%",
            maxWidth: 500,
            background: "var(--color-surface)",
            padding: 24,
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-xl)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700 }}>Add Book for Author</h2>
            
            {bookFormError && (
              <div style={{ background: "#fef2f2", color: "#dc2626", padding: "10px 14px", borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
                {bookFormError}
              </div>
            )}

            <form onSubmit={handleBookSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="input-label">Book Title</label>
                <input 
                  type="text" 
                  className="input" 
                  value={bookData.title}
                  onChange={e => setBookData({...bookData, title: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label">ISBN</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={bookData.isbn}
                    onChange={e => setBookData({...bookData, isbn: e.target.value})}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Genre</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={bookData.genre}
                    onChange={e => setBookData({...bookData, genre: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Publication Date</label>
                  <input 
                    type="date" 
                    className="input" 
                    value={bookData.pub_date}
                    onChange={e => setBookData({...bookData, pub_date: e.target.value})}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Status</label>
                  <select 
                    className="input" 
                    value={bookData.status}
                    onChange={e => setBookData({...bookData, status: e.target.value})}
                  >
                    <option value="published">Published</option>
                    <option value="in_production">In Production</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label">MRP (₹)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={bookData.mrp}
                    onChange={e => setBookData({...bookData, mrp: parseFloat(e.target.value)})}
                    required
                    min={0}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Copies Sold</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={bookData.copies_sold}
                    onChange={e => setBookData({...bookData, copies_sold: parseInt(e.target.value)})}
                    required
                    min={0}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Royalty Earned (₹)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={bookData.royalty_earned}
                    onChange={e => setBookData({...bookData, royalty_earned: parseFloat(e.target.value)})}
                    required
                    min={0}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Royalty Paid (₹)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={bookData.royalty_paid}
                    onChange={e => setBookData({...bookData, royalty_paid: parseFloat(e.target.value)})}
                    required
                    min={0}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  style={{ flex: 1 }}
                  onClick={() => setShowBookModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1, background: "#1e40af" }}
                  disabled={createBook.isPending}
                >
                  {createBook.isPending ? <span className="spinner" /> : "Save Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
