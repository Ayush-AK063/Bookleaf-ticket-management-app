import OpenAI from "openai";
import type { TicketCategory, Priority } from "@/types";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Client (lazy-init to avoid errors when key is missing at build time) ──────
let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

// ─── Types ──────────────────────────────────────────────────────────────────────
export type ClassificationResult = {
  category: TicketCategory;
  confidence: number;
  priority: Priority;
  priority_reason: string;
};

const VALID_CATEGORIES: TicketCategory[] = [
  "royalty_and_payments",
  "isbn_and_metadata",
  "printing_and_quality",
  "distribution",
  "book_status",
  "general_inquiry",
];

const VALID_PRIORITIES: Priority[] = ["critical", "high", "medium", "low"];

// ─── Classification + Priority Scoring ──────────────────────────────────────────
export async function classifyAndPrioritize(
  subject: string,
  description: string,
): Promise<ClassificationResult> {
  const FALLBACK: ClassificationResult = {
    category: "general_inquiry",
    confidence: 0,
    priority: "medium",
    priority_reason: "Default classification — AI unavailable.",
  };

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your-openai-api-key-here") {
    return FALLBACK;
  }

  try {
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content: `You are a ticket classifier for BookLeaf Publishing, a self-publishing company.
Analyse the support ticket and return ONLY valid JSON. No explanation. No preamble.

Categories (choose exactly one):
- royalty_and_payments
- isbn_and_metadata
- printing_and_quality
- distribution
- book_status
- general_inquiry

Priority calibration:
- critical: Financial urgency (unpaid royalties, payout errors), legal threats, book unavailable for purchase
- high: Metadata errors visible to customers, production significantly delayed, book not on major platform
- medium: Standard queries, timeline updates, general questions
- low: Cosmetic changes, author bio updates, informational queries

Return this exact JSON shape:
{
  "category": "<category_slug>",
  "confidence": <0.0-1.0>,
  "priority": "critical" | "high" | "medium" | "low",
  "priority_reason": "<one sentence explaining the priority assignment>"
}`,
        },
        {
          role: "user",
          content: `Subject: ${subject}\nDescription: ${description}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as Partial<ClassificationResult>;

    const category =
      VALID_CATEGORIES.includes(parsed.category as TicketCategory)
        ? (parsed.category as TicketCategory)
        : "general_inquiry";

    const priority =
      VALID_PRIORITIES.includes(parsed.priority as Priority)
        ? (parsed.priority as Priority)
        : "medium";

    return {
      category,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.8,
      priority,
      priority_reason: typeof parsed.priority_reason === "string"
        ? parsed.priority_reason
        : "AI-assigned priority.",
    };
  } catch (err) {
    console.error("[AI classify error]", err);
    return FALLBACK;
  }
}

// ─── Draft Response Generation ───────────────────────────────────────────────────
const DRAFT_SYSTEM_PROMPT = `You are a senior support agent for BookLeaf Publishing.
Draft a helpful, empathetic, and specific response to an author's support ticket.

TONE RULES:
1. Always acknowledge the author's concern before addressing it
2. Be specific — reference actual book titles, ISBNs, and dates when provided
3. Never use phrases like "We'll look into this" without a specific timeline
4. Always end with a clear next step or expected timeline
5. Use the author's name if available (use their email prefix if no name)
6. Be professional but warm — not corporate
7. Keep responses concise — under 200 words unless the issue requires detail

KNOWLEDGE BASE:
- Royalty payouts: processed on the 15th of every month for previous month's sales. Disputes resolved within 5–7 business days.
- ISBN updates: require 3–5 business days to propagate across platforms.
- Printing issues: author must submit photographic evidence. Replacement copies dispatched within 10 business days.
- Distribution (Flipkart, Amazon, etc.): listing delays of up to 15 business days after publication are normal. Escalated cases resolved in 5 business days.
- Book status / production: standard production timeline is 4–6 weeks after final manuscript approval.
- Author bio / metadata: changes processed within 3 business days via the author portal.
- Escalation email: support@bookleaf.in — for urgent cases only.

SAMPLE Q&A:
Q: "I haven't received my royalty payment for last month."
A: "Thank you for reaching out. Royalty payments are processed on the 15th of each month for the prior month's sales. If today is past the 15th and you still haven't received your payment, please reply with your bank account details on file so we can verify. We'll resolve any discrepancy within 5 business days."

Q: "My book isn't showing on Amazon."
A: "Thank you for flagging this. New listings can take up to 15 business days to appear on Amazon after publication confirmation. If it's been longer than that, please share your ISBN and we'll escalate to our distribution team immediately — you'll hear back within 2 business days."

Draft a response for the following ticket. Read the original query and the conversation history (if any), and write the next reply to the author. Output ONLY the response body — no subject line, no sign-off.`;

export async function generateDraft(ticketId: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your-openai-api-key-here") {
    throw new Error("AI_UNAVAILABLE");
  }

  const supabase = createAdminClient();
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select(
      `
      id,
      subject,
      description,
      category,
      priority,
      author:profiles!tickets_author_id_fkey(id, email),
      book:books(id, title, isbn),
      responses:ticket_responses(
        id,
        message,
        is_internal,
        created_at,
        responder:profiles!ticket_responses_responder_id_fkey(id, role)
      )
    `,
    )
    .eq("id", ticketId)
    .maybeSingle();

  if (error || !ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  // Build context message
  const authorEmail = (ticket.author as { email?: string } | null)?.email ?? "Author";
  const authorName = authorEmail.split("@")[0];
  const book = ticket.book as { title?: string; isbn?: string } | null;
  const bookContext = book?.title
    ? `Book: ${book.title} (ISBN: ${book.isbn})`
    : "Account-level query (no specific book linked)";

  const responses = ticket.responses as unknown as { message: string, is_internal: boolean, responder?: { role: string } | { role: string }[] }[] | null;
  const publicHistory = responses
    ?.filter(r => !r.is_internal)
    ?.map(r => {
      const role = Array.isArray(r.responder) ? r.responder[0]?.role : r.responder?.role;
      return `${role === 'author' ? 'Author' : 'Support'}: ${r.message}`;
    })
    ?.join("\n\n") || "No prior replies.";

  const userMessage = [
    `Author: ${authorName} (${authorEmail})`,
    `Subject: ${ticket.subject}`,
    `Category: ${ticket.category}`,
    `Priority: ${ticket.priority}`,
    bookContext,
    `\n--- Original Query ---\n${ticket.description}`,
    `\n--- Conversation History ---\n${publicHistory}`,
  ].join("\n");

  try {
    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 500,
      messages: [
        { role: "system", content: DRAFT_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    const draft = completion.choices[0]?.message?.content?.trim();
    if (!draft) throw new Error("EMPTY_RESPONSE");
    return draft;
  } catch (err) {
    console.error("[AI draft error]", err);
    throw new Error("AI_UNAVAILABLE");
  }
}
