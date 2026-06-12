export type UserRole = "author" | "admin";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketCategory =
  | "royalty_and_payments"
  | "isbn_and_metadata"
  | "printing_and_quality"
  | "distribution"
  | "book_status"
  | "general_inquiry";

export type Priority = "critical" | "high" | "medium" | "low";

export type BookStatus = "published" | "in_production";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Book {
  id: string;
  author_id: string;
  title: string;
  isbn: string;
  genre: string;
  pub_date: string;
  status: BookStatus;
  mrp: number;
  copies_sold: number;
  royalty_earned: number;
  royalty_paid: number;
}

export interface BookWithPending extends Book {
  royalty_pending: number;
}

export interface Ticket {
  id: string;
  author_id: string;
  book_id: string | null;
  subject: string;
  description: string;
  status: TicketStatus;
  category: TicketCategory;
  priority: Priority;
  priority_reason: string | null;
  ai_category_overridden: boolean;
  ai_priority_overridden: boolean;
  created_at: string;
}

export interface TicketResponse {
  id: string;
  ticket_id: string;
  responder_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  // Included when joining the profiles table
  responder?: {
    id?: string;
    role?: string;
    email?: string;
    name?: string;
  } | any;
}

export interface TicketAssignment {
  ticket_id: string;
  admin_id: string;
  assigned_at: string;
}
