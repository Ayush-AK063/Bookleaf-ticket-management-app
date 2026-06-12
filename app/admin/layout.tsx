"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Ticket Queue", icon: "📋" },
  { href: "/admin/users", label: "User Management", icon: "👥" },
];

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "linear-gradient(135deg, #1e40af, #3730a3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          boxShadow: "0 4px 12px rgb(30 64 175 / 0.35)",
        }}
      >
        🛡️
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#1e40af", letterSpacing: "-0.02em" }}>
          BookLeaf
        </p>
        <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-subtle)", fontWeight: 500 }}>
          Admin Portal
        </p>
      </div>
    </div>
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

      {/* Admin badge */}
      <div style={{ padding: "10px 12px 0" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 10px",
            background: "#eff6ff",
            color: "#1e40af",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          🛡️ Admin Access
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "12px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={`sidebar-nav-link ${isActive ? "active" : ""}`}
              style={isActive ? { background: "#eff6ff", color: "#1e40af" } : {}}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
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
                background: "linear-gradient(135deg, #3b82f6, #1e40af)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {user?.email?.[0]?.toUpperCase() ?? "A"}
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
              <p style={{ margin: 0, fontSize: 11, color: "#3b82f6", fontWeight: 600 }}>Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn btn-ghost"
            style={{ width: "100%", fontSize: 13, padding: "7px 10px" }}
          >
            {loggingOut ? <span className="spinner" style={{ width: 14, height: 14 }} /> : "🚪"}
            {loggingOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
      </aside>

      {/* Overlay */}
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

      {/* Main */}
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
          <style>{`@media(max-width:768px){.mobile-topbar{display:flex!important}}`}</style>
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
