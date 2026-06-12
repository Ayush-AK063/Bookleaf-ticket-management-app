import type { TicketCategory, Priority } from "@/types";

type ClassificationResult = {
  category: TicketCategory;
  priority: Priority;
  priority_reason: string;
};

export function stubClassifyAndPrioritize(
  subject: string,
  description: string,
): ClassificationResult {
  const text = `${subject} ${description}`.toLowerCase();

  if (
    text.includes("royalty") ||
    text.includes("payment") ||
    text.includes("payout")
  ) {
    const critical =
      text.includes("month") ||
      text.includes("unpaid") ||
      text.includes("not received");
    return {
      category: "royalty_and_payments",
      priority: critical ? "critical" : "high",
      priority_reason: critical
        ? "Financial urgency detected in ticket text (AI stub)."
        : "Royalty or payment concern detected (AI stub).",
    };
  }

  if (text.includes("isbn") || text.includes("metadata") || text.includes("bio")) {
    return {
      category: text.includes("bio") ? "general_inquiry" : "isbn_and_metadata",
      priority: text.includes("bio") ? "low" : "high",
      priority_reason: text.includes("bio")
        ? "Cosmetic or informational request (AI stub)."
        : "Customer-visible metadata issue (AI stub).",
    };
  }

  if (
    text.includes("flipkart") ||
    text.includes("amazon") ||
    text.includes("distribution")
  ) {
    return {
      category: "distribution",
      priority: "high",
      priority_reason: "Distribution or storefront visibility issue (AI stub).",
    };
  }

  if (text.includes("print") || text.includes("binding") || text.includes("quality")) {
    return {
      category: "printing_and_quality",
      priority: "medium",
      priority_reason: "Printing or quality concern (AI stub).",
    };
  }

  if (text.includes("status") || text.includes("live") || text.includes("production")) {
    return {
      category: "book_status",
      priority: "medium",
      priority_reason: "Book status or timeline inquiry (AI stub).",
    };
  }

  return {
    category: "general_inquiry",
    priority: "medium",
    priority_reason: "Default classification pending full AI integration (Phase 4).",
  };
}

export function stubGenerateDraft(
  subject: string,
  description: string,
): string {
  return [
    "Thank you for contacting BookLeaf Support.",
    "",
    `We received your query regarding "${subject}".`,
    "",
    "Our team is reviewing the details you shared and will follow up with a specific next step shortly.",
    "",
    `[AI draft placeholder — Phase 4 will generate tailored responses. Original message excerpt: "${description.slice(0, 120)}${description.length > 120 ? "…" : ""}"]`,
  ].join("\n");
}
