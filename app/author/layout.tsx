"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTickets } from "@/hooks/useTickets";
import { useQueryClient } from "@tanstack/react-query";

const NAV_ITEMS = [
  { href: "/author/books", label: "My Books", icon: "📚" },
  { href: "/author/tickets", label: "My Tickets", icon: "🎫" },
  { href: "/author/tickets/new", label: "Submit Query", icon: "✏️" },
];

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "linear-gradient(135deg, var(--color-emerald-500), var(--color-emerald-800))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          boxShadow: "0 4px 12px rgb(5 150 105 / 0.35)",
        }}
      >
        📖
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--color-emerald-800)", letterSpacing: "-0.02em" }}>
          BookLeaf
        </p>
        <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-subtle)", fontWeight: 500 }}>
          Author Portal
        </p>
      </div>
    </div>
  );
}

function NavLink({ item, isActive, onClick }: {
  item: typeof NAV_ITEMS[0];
  isActive: boolean;
  onClick?: () => void;
  openCount?: number;
}) {
  const { data: tickets = [] } = useTickets();
  const openCount = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`sidebar-nav-link ${isActive ? "active" : ""}`}
    >
      <span style={{ fontSize: 16 }}>{item.icon}</span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.href === "/author/tickets" && openCount > 0 && (
        <span
          style={{
            background: "var(--color-emerald-100)",
            color: "var(--color-emerald-700)",
            fontSize: 11,
            fontWeight: 700,
            padding: "1px 8px",
            borderRadius: 999,
          }}
        >
          {openCount}
        </span>
      )}
    </Link>
  );
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      queryClient.clear();
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px" }}>
        <Logo />
      </div>

      <div style={{ height: 1, background: "var(--color-border)", margin: "0 16px" }} />

      {/* Navigation */}
      <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.href}
            item={item}
            isActive={
              item.href === "/author/tickets"
                ? pathname.startsWith("/author/tickets") && !pathname.startsWith("/author/tickets/new")
                : pathname === item.href || pathname.startsWith(item.href + "/")
            }
            onClick={onLinkClick}
          />
        ))}
      </nav>

      {/* User info + Logout */}
      <div style={{ padding: "12px 12px 20px" }}>
        <div style={{ height: 1, background: "var(--color-border)", marginBottom: 12 }} />
        <div
          style={{
            padding: "10px 12px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-zinc-50)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--color-emerald-400), var(--color-emerald-700))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {user?.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-text-base)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email ?? "Loading…"}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-subtle)" }}>Author</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn btn-ghost"
            style={{ width: "100%", fontSize: 13, padding: "7px 10px" }}
          >
            {loggingOut ? (
              <span className="spinner" style={{ width: 14, height: 14 }} />
            ) : (
              "🚪"
            )}
            {loggingOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop sidebar */}
      <aside
        className="sidebar"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        style={{
          display: "flex",
          flexDirection: "column",
          visibility: sidebarOpen ? "visible" : undefined,
        }}
      >
        <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
      </aside>

      {/* Overlay when mobile sidebar open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 99,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Main content */}
      <div className="page-wrapper" style={{ flex: 1 }}>
        {/* Mobile top bar */}
        <div
          style={{
            display: "none",
            padding: "0 16px",
            height: 56,
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
          className="mobile-topbar"
        >
          <style>{`
            @media (max-width: 768px) {
              .mobile-topbar { display: flex !important; }
            }
          `}</style>
          <Logo />
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn btn-ghost"
            style={{ padding: "6px 10px", fontSize: 18 }}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
