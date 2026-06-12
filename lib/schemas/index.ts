import { z } from "zod";

export const TICKET_CATEGORIES = [
  "royalty_and_payments",
  "isbn_and_metadata",
  "printing_and_quality",
  "distribution",
  "book_status",
  "general_inquiry",
] as const;

export const PRIORITIES = ["critical", "high", "medium", "low"] as const;

export const TICKET_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "closed",
] as const;

export const BOOK_STATUSES = ["published", "in_production"] as const;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const CreateBookSchema = z.object({
  author_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  isbn: z.string().min(10).max(20),
  genre: z.string().min(1).max(100),
  pub_date: z.string(),
  status: z.enum(BOOK_STATUSES),
  mrp: z.number().min(0),
  copies_sold: z.number().min(0).default(0),
  royalty_earned: z.number().min(0).default(0),
  royalty_paid: z.number().min(0).default(0),
});

export const CreateTicketSchema = z.object({
  bookId: z.string().uuid().optional(),
  subject: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
});

export const RespondToTicketSchema = z.object({
  message: z.string().min(1).max(10000),
  isInternal: z.boolean().default(false),
});

export const UpdateTicketSchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  category: z.enum(TICKET_CATEGORIES).optional(),
  priority: z.enum(PRIORITIES).optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateBookInput = z.infer<typeof CreateBookSchema>;
export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type RespondToTicketInput = z.infer<typeof RespondToTicketSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;
