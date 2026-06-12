"use client";

import type { AdminTicketFilters } from "@/hooks/useAdminTickets";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "royalty_and_payments", label: "Royalty & Payments" },
  { value: "isbn_and_metadata", label: "ISBN & Metadata" },
  { value: "printing_and_quality", label: "Printing & Quality" },
  { value: "distribution", label: "Distribution" },
  { value: "book_status", label: "Book Status" },
  { value: "general_inquiry", label: "General Inquiry" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "critical", label: "🔴 Critical" },
  { value: "high", label: "🟡 High" },
  { value: "medium", label: "🔵 Medium" },
  { value: "low", label: "⚪ Low" },
];

interface FilterBarProps {
  filters: AdminTicketFilters;
  onChange: (filters: AdminTicketFilters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  function update(key: keyof AdminTicketFilters, value: string) {
    onChange({ ...filters, [key]: value || undefined });
  }

  const hasActiveFilters =
    filters.status || filters.category || filters.priority || filters.from || filters.to;

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
        marginBottom: 20,
        padding: "14px 18px",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--color-text-subtle)",
          marginRight: 4,
          whiteSpace: "nowrap",
        }}
      >
        🔽 Filter
      </span>

      <FilterSelect
        id="filter-status"
        value={filters.status ?? ""}
        options={STATUS_OPTIONS}
        onChange={(v) => update("status", v)}
      />
      <FilterSelect
        id="filter-category"
        value={filters.category ?? ""}
        options={CATEGORY_OPTIONS}
        onChange={(v) => update("category", v)}
      />
      <FilterSelect
        id="filter-priority"
        value={filters.priority ?? ""}
        options={PRIORITY_OPTIONS}
        onChange={(v) => update("priority", v)}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          id="filter-from"
          type="date"
          value={filters.from ?? ""}
          onChange={(e) => update("from", e.target.value)}
          className="input"
          style={{ width: 140, padding: "7px 10px", fontSize: 13 }}
          title="From date"
        />
        <span style={{ color: "var(--color-text-subtle)", fontSize: 12 }}>→</span>
        <input
          id="filter-to"
          type="date"
          value={filters.to ?? ""}
          onChange={(e) => update("to", e.target.value)}
          className="input"
          style={{ width: 140, padding: "7px 10px", fontSize: 13 }}
          title="To date"
        />
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => onChange({})}
          className="btn btn-ghost"
          style={{ fontSize: 12, padding: "5px 12px", color: "#ef4444" }}
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}

function FilterSelect({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input"
      style={{ width: "auto", padding: "7px 10px", fontSize: 13, cursor: "pointer" }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
