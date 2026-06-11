# 📚 BookLeaf Publishing — Author Support & Communication Portal
## Full Architecture, Detailed Planning & Implementation Guide

> **Assignment Type:** Full-Stack Developer Assignment (Technical Assignment 1 of 2)
> **Timeline:** 5 Days | **Structure:** 5 Phases | **Deliverables:** 2 Portals (Author + Admin)
> **Core Feature:** AI-Powered Ticket Classification, Priority Scoring & Draft Response Generation

---

## Table of Contents

1. [Project Context & Business Problem](#1-project-context--business-problem)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Complete Technology Stack](#3-complete-technology-stack)
4. [Database Schema — Full Design](#4-database-schema--full-design)
5. [Backend Architecture — API & Auth](#5-backend-architecture--api--auth)
6. [Frontend Architecture — Author Portal](#6-frontend-architecture--author-portal)
7. [Frontend Architecture — Admin Portal](#7-frontend-architecture--admin-portal)
8. [AI Integration Architecture](#8-ai-integration-architecture)
9. [Real-Time Communication (SSE)](#9-real-time-communication-sse)
10. [Phase-by-Phase Implementation Plan](#10-phase-by-phase-implementation-plan)
    - [Phase 1 — Setup & Database (Day 1)](#phase-1--setup--database-day-1)
    - [Phase 2 — Backend & APIs (Day 2)](#phase-2--backend--apis-day-2)
    - [Phase 3 — Author Portal (Day 3)](#phase-3--author-portal-day-3)
    - [Phase 4 — Admin Portal + AI (Day 4)](#phase-4--admin-portal--ai-day-4)
    - [Phase 5 — Deploy & Docs (Day 5)](#phase-5--deploy--docs-day-5)
11. [Security Architecture](#11-security-architecture)
12. [Error Handling Strategy](#12-error-handling-strategy)
13. [Evaluation Criteria Mapping](#13-evaluation-criteria-mapping)
14. [Feature Checklist — Every Requirement](#14-feature-checklist--every-requirement)
15. [Future Improvements & Known Limitations](#15-future-improvements--known-limitations)

---

## 1. Project Context & Business Problem

### About BookLeaf Publishing
BookLeaf Publishing is a self-publishing company operating in **India and the United States**. At their current scale:
- **1,200+ books published per month**
- **22,000+ title catalog** across genres
- **Thousands of active authors** at any given time

### The Core Problem
Author queries are currently handled **manually by the support team**. This creates:
- Delayed response times as ticket volume scales with the catalog
- Growing backlog of unresolved author queries
- Inconsistent response quality across agents
- No automated prioritisation — urgent financial issues (unpaid royalties) sit in the same queue as cosmetic requests (bio updates)
- High manual effort per ticket: reading, categorising, researching, writing a response

### The Solution
A **two-portal web application** that:
1. Gives authors a self-service interface to track their books, royalties, and raise support tickets
2. Gives admins an intelligent queue with AI-assisted classification, priority scoring, and response drafting
3. Connects both portals via real-time updates so authors see admin responses without refresh

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                  │
│   ┌──────────────────────┐    ┌──────────────────────────┐      │
│   │   AUTHOR PORTAL      │    │      ADMIN PORTAL        │      │
│   │   Next.js 14 (RSC)   │    │   Next.js 14 (App Router)│      │
│   │   Tailwind + shadcn  │    │   Tailwind + shadcn/ui   │      │
│   │   React Query        │    │   React Query            │      │
│   └──────────┬───────────┘    └─────────────┬────────────┘      │
│              │  SSE Listener                 │  REST Calls       │
│              │  REST Calls                   │                   │
└──────────────┼───────────────────────────────┼───────────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                         │
│                   Node.js + Express Server                       │
│                                                                  │
│   ┌───────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│   │JWT Auth   │  │  RBAC        │  │  Zod Validation      │    │
│   │Middleware │  │  Middleware  │  │  (All POST/PATCH)    │    │
│   └───────────┘  └──────────────┘  └──────────────────────┘    │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                   ROUTE HANDLERS                         │  │
│   │  /api/auth/*  /api/books  /api/tickets  /api/admin/*    │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              AI SERVICE LAYER                           │   │
│   │  Classification  │  Priority Scoring  │  Draft Gen     │   │
│   │  (On ticket create)                   │  (On demand)   │   │
│   └──────────────────────────────────────┬──────────────────┘   │
└─────────────────────────────────────────┼───────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                       │
                    ▼                      ▼                       ▼
        ┌───────────────────┐  ┌───────────────────┐  ┌──────────────────┐
        │  PostgreSQL DB    │  │  Claude Haiku 3   │  │  SSE Streams     │
        │  (Railway Hosted) │  │  (Anthropic API)  │  │  (Per Ticket ID) │
        │  Prisma ORM       │  │                   │  │                  │
        └───────────────────┘  └───────────────────┘  └──────────────────┘
```

### Deployment Architecture

```
GitHub (Private Repo)
        │
        ├── /frontend  ──── Vercel (Auto-deploy from main)
        │                   └── NEXT_PUBLIC_API_URL → Railway backend
        │
        └── /backend   ──── Railway
                            ├── Node.js + Express server
                            └── PostgreSQL database
                                Environment Variables:
                                  DB_URL, JWT_SECRET, ANTHROPIC_API_KEY
```

### Monorepo Structure

```
bookleaf-portal/
├── frontend/                    # Next.js 14 App
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── author/
│   │   │   ├── layout.tsx       # Author layout with sidebar
│   │   │   ├── books/
│   │   │   │   └── page.tsx     # My Books page
│   │   │   ├── tickets/
│   │   │   │   ├── page.tsx     # My Tickets list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx # Submit support query
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Ticket detail + SSE listener
│   │   ├── admin/
│   │   │   ├── layout.tsx       # Admin layout with sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx     # Stats bar + ticket queue
│   │   │   └── tickets/
│   │   │       └── [id]/
│   │   │           └── page.tsx # Ticket detail + AI draft
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Root redirect
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── books/
│   │   │   ├── BookCard.tsx
│   │   │   └── RoyaltySummary.tsx
│   │   ├── tickets/
│   │   │   ├── TicketForm.tsx
│   │   │   ├── TicketThread.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── PriorityBadge.tsx
│   │   └── admin/
│   │       ├── TicketQueue.tsx
│   │       ├── FilterBar.tsx
│   │       ├── AIDraftComposer.tsx
│   │       └── StatsBar.tsx
│   ├── lib/
│   │   ├── api.ts               # Axios/fetch instance
│   │   ├── auth.ts              # Auth helpers
│   │   └── sse.ts               # SSE EventSource wrapper
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useBooks.ts
│   │   ├── useTickets.ts
│   │   └── useSSE.ts
│   └── types/
│       └── index.ts             # Shared TypeScript types
│
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── books.ts
│   │   │   ├── tickets.ts
│   │   │   └── admin.ts
│   │   ├── middleware/
│   │   │   ├── authenticate.ts  # JWT verification
│   │   │   ├── authorize.ts     # RBAC role check
│   │   │   └── validate.ts      # Zod wrapper
│   │   ├── services/
│   │   │   ├── ai.service.ts    # All Claude API calls
│   │   │   └── sse.service.ts   # SSE connection manager
│   │   ├── schemas/
│   │   │   └── zod.schemas.ts   # All Zod schemas
│   │   └── index.ts             # Express app entry
│   └── prisma/
│       ├── schema.prisma        # Database schema
│       └── seed.ts              # Seed script (bookleaf_sample_data.json)
│
├── .env.example                 # All env vars documented (no values)
├── .eslintrc.json
├── .prettierrc
├── .husky/
│   └── pre-commit               # Lint + format on commit
└── README.md
```

---

## 3. Complete Technology Stack

### Frontend

| Technology | Version | Purpose | Justification |
|---|---|---|---|
| **Next.js** | 14 (App Router) | React framework | File-based routing, React Server Components (RSC), built-in API routes, production-grade |
| **Tailwind CSS** | 3.x | Styling | Utility-first, no context switching, responsive breakpoints built-in |
| **shadcn/ui** | Latest | UI components | Accessible, unstyled Radix primitives + Tailwind — consistent design system without reinventing components |
| **React Query** | TanStack v5 | Server state | Handles caching, background refetching, loading states, error states out of the box |
| **TypeScript** | 5.x | Type safety | Catches bugs at compile time, especially useful for API response shapes |

### Backend

| Technology | Version | Purpose | Justification |
|---|---|---|---|
| **Node.js** | 20 LTS | Runtime | Familiar, large ecosystem, non-blocking I/O suits SSE connections |
| **Express** | 4.x | HTTP framework | Lightweight, minimal abstraction, large middleware ecosystem |
| **Prisma** | 5.x | ORM | Type-safe queries auto-generated from schema, handles migrations, cleaner than raw SQL for this scope |
| **JWT** | (jsonwebtoken) | Auth tokens | Stateless auth — no session store needed, scales horizontally |
| **bcrypt** | Latest | Password hashing | Industry standard for password hashing, configurable cost factor |
| **Zod** | 3.x | Validation | Runtime schema validation, TypeScript-first, shareable between FE and BE |

### Database

| Technology | Purpose | Justification |
|---|---|---|
| **PostgreSQL** | Primary database | Relational model fits perfectly — authors → books → tickets → responses all have FK relationships; ACID transactions for financial data (royalties) |

### AI

| Technology | Purpose | Justification |
|---|---|---|
| **Anthropic Claude Haiku 3** | Classification, priority scoring, draft responses | Fast (~1–2s), cheapest Anthropic model, high quality for structured JSON tasks, appropriate for a support system at scale |

### Infrastructure

| Service | What runs on it | Why |
|---|---|---|
| **Vercel** | Next.js frontend | Zero-config deploy from GitHub, auto SSL, global CDN, free tier sufficient |
| **Railway** | Express backend + PostgreSQL | Single platform for API + DB, easy env var management, free tier + low-cost upgrade |

### Developer Tooling

| Tool | Purpose |
|---|---|
| **ESLint** | Code linting — enforces consistent patterns |
| **Prettier** | Auto-formatting — no style debates |
| **Husky** | Pre-commit hooks — runs lint + format before every commit |
| **.env.example** | Documents all environment variables without values — never commit actual keys |

---

## 4. Database Schema — Full Design

### Entity Relationship Diagram

```
users
  ├── id (PK)
  ├── email (UNIQUE)
  ├── password_hash
  ├── role  ──────────────── 'author' | 'admin'
  └── created_at
        │
        │ 1 : N
        ▼
books
  ├── id (PK)
  ├── author_id (FK → users.id)
  ├── title
  ├── isbn
  ├── genre
  ├── pub_date
  ├── status  ────────────── 'published' | 'in_production'
  ├── mrp
  ├── copies_sold
  ├── royalty_earned
  └── royalty_paid
       [computed: royalty_pending = royalty_earned - royalty_paid]
        │
        │ 1 : N (nullable FK)
        ▼
tickets
  ├── id (PK)
  ├── author_id (FK → users.id)
  ├── book_id (FK → books.id, NULLABLE)  ← NULL = account-level/general query
  ├── subject
  ├── description
  ├── status  ─────────────── 'open' | 'in_progress' | 'resolved' | 'closed'
  ├── category  ───────────── AI-assigned (overrideable)
  ├── priority  ───────────── AI-assigned (overrideable)
  ├── priority_reason  ────── AI explanation shown to admin
  ├── ai_category_overridden (BOOLEAN)
  ├── ai_priority_overridden (BOOLEAN)
  └── created_at
        │
        │ 1 : N
        ▼
ticket_responses
  ├── id (PK)
  ├── ticket_id (FK → tickets.id)
  ├── responder_id (FK → users.id)
  ├── message
  ├── is_internal  ─────────── true = admin-only note, false = visible to author
  └── created_at

ticket_assignments (JOIN TABLE)
  ├── ticket_id (FK → tickets.id)
  ├── admin_id (FK → users.id)
  └── assigned_at
```

### Prisma Schema Definition

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  author
  admin
}

enum TicketStatus {
  open
  in_progress
  resolved
  closed
}

enum TicketCategory {
  royalty_and_payments
  isbn_and_metadata
  printing_and_quality
  distribution
  book_status
  general_inquiry
}

enum Priority {
  critical
  high
  medium
  low
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         Role     @default(author)
  createdAt    DateTime @default(now()) @map("created_at")

  books              Book[]
  tickets            Ticket[]
  responses          TicketResponse[]
  assignedTickets    TicketAssignment[]

  @@map("users")
}

model Book {
  id            String   @id @default(cuid())
  authorId      String   @map("author_id")
  title         String
  isbn          String
  genre         String
  pubDate       DateTime @map("pub_date")
  status        String   // 'published' | 'in_production'
  mrp           Float
  copiesSold    Int      @default(0) @map("copies_sold")
  royaltyEarned Float    @default(0) @map("royalty_earned")
  royaltyPaid   Float    @default(0) @map("royalty_paid")

  author  User     @relation(fields: [authorId], references: [id])
  tickets Ticket[]

  @@map("books")
}

model Ticket {
  id                   String         @id @default(cuid())
  authorId             String         @map("author_id")
  bookId               String?        @map("book_id")
  subject              String
  description          String
  status               TicketStatus   @default(open)
  category             TicketCategory @default(general_inquiry)
  priority             Priority       @default(medium)
  priorityReason       String?        @map("priority_reason")
  aiCategoryOverridden Boolean        @default(false) @map("ai_category_overridden")
  aiPriorityOverridden Boolean        @default(false) @map("ai_priority_overridden")
  createdAt            DateTime       @default(now()) @map("created_at")

  author     User               @relation(fields: [authorId], references: [id])
  book       Book?              @relation(fields: [bookId], references: [id])
  responses  TicketResponse[]
  assignment TicketAssignment?

  @@map("tickets")
}

model TicketResponse {
  id          String   @id @default(cuid())
  ticketId    String   @map("ticket_id")
  responderId String   @map("responder_id")
  message     String
  isInternal  Boolean  @default(false) @map("is_internal")
  createdAt   DateTime @default(now()) @map("created_at")

  ticket    Ticket @relation(fields: [ticketId], references: [id])
  responder User   @relation(fields: [responderId], references: [id])

  @@map("ticket_responses")
}

model TicketAssignment {
  ticketId   String   @id @map("ticket_id")
  adminId    String   @map("admin_id")
  assignedAt DateTime @default(now()) @map("assigned_at")

  ticket Ticket @relation(fields: [ticketId], references: [id])
  admin  User   @relation(fields: [adminId], references: [id])

  @@map("ticket_assignments")
}
```

### Computed Field: royalty_pending

`royalty_pending` is **not stored** in the database — it is computed at query time or in the API response layer:

```typescript
// In API response transformer
const booksWithComputed = books.map(book => ({
  ...book,
  royaltyPending: book.royaltyEarned - book.royaltyPaid,
}));
```

### Edge Cases to Handle in Schema/Seed

| Edge Case | How Handled |
|---|---|
| Book in production | `status = 'in_production'` — royalty fields exist but UI suppresses them |
| Book with zero royalties | `royaltyEarned = 0, royaltyPaid = 0` — royaltyPending = 0, shown as gray (no amber highlight) |
| Ticket with no book | `bookId = NULL` — dropdown selection = "General / Account Level" |
| Ticket created before AI response | Defaults: `category = general_inquiry`, `priority = medium` |
| Admin overrides AI classification | `aiCategoryOverridden = true` — UI shows "AI suggested: X" notice |

---

## 5. Backend Architecture — API & Auth

### Authentication Flow

```
POST /api/auth/login
  │
  ├─ Validate body with Zod: { email: string, password: string }
  │
  ├─ Find user by email in DB
  │   └─ If not found → 401 "Invalid credentials"
  │
  ├─ bcrypt.compare(plainPassword, user.passwordHash)
  │   └─ If mismatch → 401 "Invalid credentials"
  │
  ├─ Sign JWT: { userId, role, email }
  │   └─ Secret: process.env.JWT_SECRET
  │   └─ Expiry: 7d
  │
  └─ Set httpOnly cookie: { token: JWT, httpOnly: true, secure: true, sameSite: 'strict' }
     └─ Return: { user: { id, email, role } }
```

### JWT Auth Middleware

```typescript
// middleware/authenticate.ts
export const authenticate = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Unauthorised' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role, email }
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
};
```

### RBAC Middleware

```typescript
// middleware/authorize.ts
export const authorizeRole = (allowedRoles: string[]) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Usage:
router.get('/admin/tickets', authenticate, authorizeRole(['admin']), handler);
router.get('/books', authenticate, authorizeRole(['author']), handler);
```

### Complete API Endpoints Reference

#### Author Endpoints

| Method | Endpoint | Auth | Description | Response |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | None | Email + password login | `{ user }` + httpOnly cookie |
| `POST` | `/api/auth/logout` | Author/Admin JWT | Clear auth cookie | `{ message }` |
| `GET` | `/api/books` | Author JWT | Author's own books with computed royalty_pending | `Book[]` |
| `POST` | `/api/tickets` | Author JWT | Create ticket. Triggers AI classification + priority | `Ticket` |
| `GET` | `/api/tickets` | Author JWT | Author's own tickets only | `Ticket[]` |
| `GET` | `/api/tickets/:id` | Author JWT | Full ticket + public responses only | `Ticket + Response[]` |
| `GET` | `/api/tickets/:id/stream` | Author JWT | SSE stream — live response updates | `EventStream` |

#### Admin Endpoints

| Method | Endpoint | Auth | Description | Response |
|---|---|---|---|---|
| `GET` | `/api/admin/tickets` | Admin JWT | All tickets, filterable + sortable | `Ticket[]` |
| `GET` | `/api/admin/tickets/:id` | Admin JWT | Full ticket + ALL responses (incl. internal) + author info | `Ticket + Response[] + User` |
| `PATCH` | `/api/admin/tickets/:id` | Admin JWT | Update status, category (override AI), priority (override AI) | `Ticket` |
| `POST` | `/api/admin/tickets/:id/respond` | Admin JWT | Send response. `is_internal` flag for admin-only notes | `TicketResponse` |
| `POST` | `/api/admin/tickets/:id/assign` | Admin JWT | Assign ticket to requesting admin | `TicketAssignment` |
| `GET` | `/api/admin/authors` | Admin JWT | All authors with book counts | `User[]` |
| `GET` | `/api/admin/ai/draft/:id` | Admin JWT | On-demand AI draft for a ticket | `{ draft: string }` |

#### Query Filters for `/api/admin/tickets`

```
GET /api/admin/tickets?status=open&category=royalty_and_payments&priority=critical&from=2024-01-01&to=2024-12-31
```

| Filter | Values |
|---|---|
| `status` | `open` \| `in_progress` \| `resolved` \| `closed` |
| `category` | `royalty_and_payments` \| `isbn_and_metadata` \| `printing_and_quality` \| `distribution` \| `book_status` \| `general_inquiry` |
| `priority` | `critical` \| `high` \| `medium` \| `low` |
| `from`, `to` | ISO date strings |

#### Default Sort Order (Admin Ticket Queue)

```
ORDER BY
  CASE priority
    WHEN 'critical' THEN 1
    WHEN 'high'     THEN 2
    WHEN 'medium'   THEN 3
    WHEN 'low'      THEN 4
  END ASC,
  created_at ASC  -- oldest unresolved first within same priority tier
```

### Validation (Zod)

```typescript
// schemas/zod.schemas.ts

export const CreateTicketSchema = z.object({
  bookId: z.string().optional(),
  subject: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
});

export const RespondToTicketSchema = z.object({
  message: z.string().min(1).max(10000),
  isInternal: z.boolean().default(false),
});

export const UpdateTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  category: z.enum([...CATEGORIES]).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### Standard Error Response Shape

```typescript
// Always consistent across all endpoints
{
  error: string,       // Human-readable message
  field?: string,      // Specific field name if validation error
  code?: string        // Optional machine-readable code
}

// HTTP status codes:
// 400 — Validation error (bad request body/params)
// 401 — Unauthorised (missing/invalid JWT)
// 403 — Forbidden (wrong role)
// 404 — Not found (resource doesn't exist or belongs to another user)
// 500 — Server error (unexpected — should never be caused by bad input)
```

---

## 6. Frontend Architecture — Author Portal

### Route Map

```
/ (root)
└── Redirect to /author/books if author cookie, /admin/dashboard if admin cookie, else /login

/login
└── Login form → sets httpOnly cookie → redirects by role

/author/ (protected layout — author role only)
├── /author/books         → My Books page
├── /author/tickets        → My Tickets list
├── /author/tickets/new    → Submit Support Query form
└── /author/tickets/[id]   → Ticket detail + SSE listener
```

### Route Guard Implementation

```typescript
// In Next.js middleware.ts (runs on every request)
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const isAuthPage = request.nextUrl.pathname === '/login';
  const isAuthorRoute = request.nextUrl.pathname.startsWith('/author');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (!token && (isAuthorRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    const decoded = decodeJwt(token); // lightweight decode, no verify
    if (isAdminRoute && decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/author/books', request.url));
    }
    if (isAuthPage) {
      return NextResponse.redirect(
        decoded.role === 'admin' ? new URL('/admin/dashboard', request.url) : new URL('/author/books', request.url)
      );
    }
  }
}
```

### Page Specifications

#### Login Page (`/login`)
- Clean, centered form layout
- Fields: Email, Password
- Client-side validation (Zod) before submit
- On success: cookie set by API, redirect based on decoded role
- On error: inline error message below form — **no alert boxes**

#### My Books Page (`/author/books`)
- Data: `GET /api/books` via React Query
- Layout: responsive card grid (1 col mobile, 2 col tablet, 3 col desktop)
- Each `BookCard` shows:
  - Title, ISBN, Genre, Publication Date
  - Status badge (colour-coded: green = Published, orange = In Production)
  - MRP
  - Royalty summary: Earned / Paid / Pending
  - ⚠️ If `status = 'in_production'`: hide royalty figures, show "In Production" indicator instead
  - ⚠️ If `royaltyPending > 0`: highlight Pending in **amber**
- Empty state: clean zero-state design (not a blank page)
- Loading state: skeleton cards matching the card grid layout

#### Submit Support Query Page (`/author/tickets/new`)
- Book dropdown: author's book list + "General / Account Level" option
  - Populated from React Query cache of `/api/books`
- Subject input: required, min 5 chars, max 200 chars
- Description textarea: required, min 20 chars, max 5000 chars
  - Live character count shown (e.g., "234 / 5000")
- File attachment input: styled file picker — UI present, actual upload is bonus
- Submit button: disabled until valid
- On success: show confirmation toast/message, redirect to `/author/tickets` after 2s
- Validation: field-level inline error messages below each input

#### My Tickets Page (`/author/tickets`)
- Data: `GET /api/tickets` via React Query
- Ticket list: newest first
- Each row/card shows: Subject, Book/Account Level, Category, Priority badge, Status badge, Date
- Clicking a ticket navigates to `/author/tickets/[id]`
- Status badge colours:
  - Open → blue
  - In Progress → amber
  - Resolved → green
  - Closed → gray
- Empty state: "No tickets submitted yet" with CTA button to new ticket form

#### Ticket Detail Page (`/author/tickets/[id]`)
- Full ticket thread: original query + all admin responses (public only — `is_internal=false`)
- SSE EventSource connects on mount for live updates
- SSE disconnects on component unmount (cleanup)
- New admin responses auto-append without page refresh
- Shows: ticket subject, book linked (or "Account Level"), category, priority, status, date
- No response composer — authors cannot reply (one-way thread from admin)

### Sidebar Navigation (Author)
- My Books
- My Tickets (with unresolved count badge)
- Submit Query (CTA button)
- User info + Logout
- Mobile: hamburger menu, collapsible sidebar

---

## 7. Frontend Architecture — Admin Portal

### Route Map

```
/admin/ (protected layout — admin role only)
├── /admin/dashboard        → Stats bar + full ticket queue
└── /admin/tickets/[id]     → Full ticket detail + AI draft composer
```

### Admin Dashboard Page (`/admin/dashboard`)

#### Stats Bar (top of page, computed from DB aggregations)
- Total tickets (all time)
- Open tickets count (status = 'open' or 'in_progress')
- Critical tickets count (priority = 'critical')
- Average response time (computed from ticket creation to first response)

#### Ticket Queue Table
- Columns: #, Author, Subject, Category, Priority, Status, Created At, Assigned To
- Default sort: Critical → High → Medium → Low, then oldest first within tier
- Filter bar: Status | Category | Priority | Date range — independently combinable
- Priority badge colours: Critical = red, High = amber, Medium = blue, Low = gray
- Clickable row → navigate to `/admin/tickets/[id]`
- Pagination: needed for large datasets (future improvement — initially show last 50)

### Admin Ticket Detail Page (`/admin/tickets/[id]`)

#### Author Info Panel (sidebar/header)
- Author name, email
- Book affected (title + ISBN), or "Account Level" if no book linked
- Submission date and time

#### AI Classification Display
- Current category (dropdown for override)
- "AI suggested: [original category]" shown if overridden
- Override dropdown saves via `PATCH /api/admin/tickets/:id`

#### AI Priority Display
- Current priority (dropdown for override)
- Priority reason shown as tooltip or footnote (the `priority_reason` field from AI)
- "Edited" indicator if overridden by admin

#### Status Dropdown
- Open → In Progress → Resolved → Closed
- Status update triggers SSE push to author's open ticket stream

#### Ticket Thread
- All responses shown: public responses + internal notes
- Internal notes styled: yellow/cream background, "Internal Note" badge
- Public responses styled: white background, no badge

#### AI Draft Response Composer
- On page load: `GET /api/admin/ai/draft/:id` call (on-demand, not on ticket creation)
- Draft populates an editable textarea
- Admin edits freely before sending
- **If AI call fails**: blank textarea + "AI draft unavailable — please write manually" banner
- Toggle: Public Response | Internal Note (clearly visible, prevents accidental exposure of internal notes)
- Send button: calls `POST /api/admin/tickets/:id/respond`

#### Assign to Me Button
- If unassigned: "Assign to me" button
- If assigned to current admin: "Assigned to you" badge
- If assigned to another admin: shows their name

---

## 8. AI Integration Architecture

### AI Features Overview

Three distinct AI operations, each with its own call strategy:

| Operation | When | Batched | Model | Approx Tokens |
|---|---|---|---|---|
| **Classification** | On ticket creation | ✅ Yes (with priority) | Claude Haiku 3 | ~200–300 per call |
| **Priority Scoring** | On ticket creation | ✅ Yes (with classification) | Claude Haiku 3 | ~200–300 per call |
| **Draft Response** | On admin opening a ticket | ❌ No (on-demand only) | Claude Haiku 3 | ~1,200–1,500 per call |

### AI Ticket Classification

#### The 6 Categories

| Category | Examples |
|---|---|
| **Royalty & Payments** | "Haven't received royalties in 6 months", "My payout calculation is wrong" |
| **ISBN & Metadata** | "Wrong author name on Amazon listing", "ISBN update request" |
| **Printing & Quality** | "Binding issue in printed copies", "Wrong interior formatting" |
| **Distribution** | "Book not showing on Flipkart", "International distribution issue" |
| **Book Status** | "When will my book go live?", "Production timeline update" |
| **General Inquiry** | Account questions, billing, onboarding, anything not fitting above |

#### Classification + Priority Combined Prompt

```
SYSTEM:
You are a ticket classifier for BookLeaf Publishing, a self-publishing company.
Analyse the ticket and return ONLY valid JSON. No explanation. No preamble.

Categories (choose exactly one):
- royalty_and_payments
- isbn_and_metadata
- printing_and_quality
- distribution
- book_status
- general_inquiry

Priority calibration:
- critical: Financial urgency (unpaid royalties, payout errors), legal threats, book unavailable for purchase
- high: Metadata errors visible to customers, production significantly delayed
- medium: Standard queries, timeline updates, general questions
- low: Cosmetic changes, author bio updates, informational queries

Return format:
{
  "category": "<category_slug>",
  "confidence": <0.0-1.0>,
  "priority": "critical" | "high" | "medium" | "low",
  "priority_reason": "<one sentence explaining priority assignment>"
}

USER:
Subject: {ticket.subject}
Description: {ticket.description}
```

#### Priority Calibration Examples

| Ticket Description | Expected Priority | Reason |
|---|---|---|
| "No royalty payment received for 6 months" | **Critical** | Financial urgency, specific duration |
| "Update author bio on Amazon" | **Low** | Cosmetic, no urgency |
| "Book not appearing on Flipkart" | **High** | Customer-facing, revenue-impacting |
| "When will my book go to print?" | **Medium** | Standard status inquiry |
| "Wrong cover image uploaded" | **High** | Customer-visible error |

#### Fallback on Classification Failure
```typescript
// If AI call throws or returns unparseable JSON:
await prisma.ticket.update({
  where: { id: ticket.id },
  data: {
    category: 'general_inquiry',  // safe default
    priority: 'medium',           // safe default
    priorityReason: null,
  }
});
// Ticket is still created and visible — system never blocks on AI
```

### AI Draft Response Generation

#### The Knowledge Base (System Prompt Context)

The Knowledge Base is injected **once as a system prompt** — not repeated per message — for token efficiency. It covers:

1. **BookLeaf tone rules (7 rules)**:
   - Empathetic, not defensive
   - Specific, not vague (use actual timelines/figures)
   - No corporate deflection ("We'll look into this" is banned)
   - Action-oriented — every response ends with a clear next step
   - Use the author's name when available
   - Acknowledge the impact of the issue
   - Set realistic expectations — don't over-promise

2. **6 sample Q&A examples** from the assignment document (few-shot examples injected into system prompt)

3. **Ticket-specific context** (in the user message):
   - Ticket subject
   - Ticket description
   - Linked book title and ISBN (if applicable)
   - Author name

#### Draft Response Prompt

```
SYSTEM:
You are a senior support agent for BookLeaf Publishing.
Your job is to draft a helpful, empathetic, and specific response to an author's support ticket.

TONE RULES:
1. Always acknowledge the author's concern before addressing it
2. Be specific — reference actual book titles, ISBNs, and dates when provided
3. Never use phrases like "We'll look into this" without a specific timeline
4. Always end with a clear next step or expected timeline
5. Use the author's name if available
6. Be professional but warm — not corporate
7. Keep responses concise — under 200 words unless the issue requires detail

KNOWLEDGE BASE:
[BookLeaf standard responses, escalation policies, typical timelines, contact info]

SAMPLE Q&A:
Q: "How long does royalty payout take?"
A: "Royalty payouts are processed on the 15th of every month for the previous month's sales. ..."
[... 5 more examples ...]

Draft a response for the following ticket. Do not add a subject line or sign-off — just the body.

USER:
Author: {author.name}
Subject: {ticket.subject}
Description: {ticket.description}
Book: {book.title} (ISBN: {book.isbn}) [or "Account-level query" if no book]
```

#### On-Demand Loading Strategy

```typescript
// services/ai.service.ts

export async function generateDraft(ticketId: string): Promise<string> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { author: true, book: true }
  });

  const systemPrompt = buildSystemPrompt(); // includes Knowledge Base + tone rules
  const userMessage = buildDraftUserMessage(ticket);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-3-20240307',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });
    return response.content[0].text;
  } catch (error) {
    console.error('[AI Draft Error]', error);
    throw new Error('AI_UNAVAILABLE'); // caught by route handler
  }
}
```

### Cost Estimation

| Operation | Tokens/Call | Daily Volume (est.) | Daily Cost (est.) |
|---|---|---|---|
| Classification + Priority | ~250 input + 50 output | 30 tickets/day | ~$0.003 |
| Draft Response | ~1,200 input + 250 output | 20 admin views/day | ~$0.02 |
| **Monthly total** | | | **< $1.00** |

*Based on Haiku 3 pricing. Volume assumptions based on assignment seed data scale.*

---

## 9. Real-Time Communication (SSE)

### Why SSE Over WebSockets

| Factor | SSE | WebSockets |
|---|---|---|
| Direction | Server → Client (one-way) | Bidirectional |
| Use case fit | ✅ Admin sends update, author sees it | ❌ Overkill — no client-to-server needed |
| Library requirement | ✅ None — built into Express + browser | ❌ Requires `ws` library |
| Firewall/proxy compatibility | ✅ HTTP-based, passes most proxies | ❌ Can be blocked |
| Implementation complexity | ✅ Simple | ❌ More complex handshake |

### SSE Implementation

#### Backend — SSE Endpoint

```typescript
// routes/tickets.ts
router.get('/:id/stream', authenticate, authorizeRole(['author']), async (req, res) => {
  const ticketId = req.params.id;

  // Verify ticket belongs to this author
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, authorId: req.user.userId }
  });
  if (!ticket) return res.status(404).json({ error: 'Not found' });

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Register connection
  sseService.addConnection(ticketId, res);

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 30000);

  // Cleanup on client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    sseService.removeConnection(ticketId, res);
  });
});
```

#### SSE Service (Connection Manager)

```typescript
// services/sse.service.ts
const connections = new Map<string, Set<Response>>();

export const sseService = {
  addConnection(ticketId: string, res: Response) {
    if (!connections.has(ticketId)) connections.set(ticketId, new Set());
    connections.get(ticketId)!.add(res);
  },
  removeConnection(ticketId: string, res: Response) {
    connections.get(ticketId)?.delete(res);
  },
  push(ticketId: string, data: object) {
    const clients = connections.get(ticketId);
    if (!clients) return;
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    clients.forEach(res => res.write(payload));
  }
};
```

#### Triggering SSE Push from Admin Response

```typescript
// In POST /api/admin/tickets/:id/respond
const response = await prisma.ticketResponse.create({ ... });

// Only push if the new response is public (not internal)
if (!response.isInternal) {
  sseService.push(ticketId, {
    type: 'NEW_RESPONSE',
    response: {
      id: response.id,
      message: response.message,
      createdAt: response.createdAt,
      responder: { name: 'BookLeaf Support' }
    }
  });
}

// Always push status changes
if (statusChanged) {
  sseService.push(ticketId, { type: 'STATUS_UPDATE', status: newStatus });
}
```

#### Frontend — SSE Listener

```typescript
// hooks/useSSE.ts
export function useSSE(ticketId: string, onMessage: (data: any) => void) {
  useEffect(() => {
    const source = new EventSource(`/api/tickets/${ticketId}/stream`, {
      withCredentials: true
    });

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch { /* ignore malformed events */ }
    };

    source.onerror = () => {
      source.close();
      // Fallback: poll every 30 seconds
      const poll = setInterval(() => refetch(), 30000);
      return () => clearInterval(poll);
    };

    return () => source.close(); // cleanup on unmount
  }, [ticketId]);
}
```

---

## 10. Phase-by-Phase Implementation Plan

---

### Phase 1 — Setup & Database (Day 1)

**Goal:** Working monorepo, configured tooling, validated database schema, seed data loaded.

**No user-visible output — but everything downstream depends on getting this right.**

#### Checklist

- [ ] `git init` private repo — add evaluator email as collaborator immediately
- [ ] Create `/frontend` and `/backend` directories
- [ ] Init Next.js 14 in `/frontend`: `npx create-next-app@latest frontend --typescript --tailwind --app`
- [ ] Init Express in `/backend`: `npm init -y`, install dependencies
- [ ] Install frontend deps: `react-query @tanstack/react-query`, `shadcn/ui`, `zod`, `axios`
- [ ] Install backend deps: `express`, `prisma`, `@prisma/client`, `jsonwebtoken`, `bcryptjs`, `zod`, `cors`, `cookie-parser`
- [ ] Configure ESLint + Prettier in both workspaces
- [ ] Set up Husky pre-commit hook: `npx husky-init && npm install`
- [ ] Create `.env.example` at root with all variable names (no values)
- [ ] Create `.gitignore` ensuring `.env` is excluded — verify with `git status`
- [ ] `npx prisma init` in `/backend` — configure `schema.prisma`
- [ ] Write full Prisma schema (5 tables as designed above)
- [ ] `npx prisma migrate dev --name init` — generates migration + DB tables
- [ ] Write `prisma/seed.ts` using `bookleaf_sample_data.json`
  - Hash all passwords with `bcryptjs`
  - Seed 10 authors + 18 books + 3–4 test admin accounts
  - Cover all edge cases: published books, in-production books, zero royalties
- [ ] Run `npx prisma db seed` — verify all rows in DB
- [ ] `npx prisma studio` — visually verify relationships and data look correct

#### Environment Variables (`.env.example`)
```
# Database
DATABASE_URL=postgresql://user:password@host:5432/bookleaf

# Auth
JWT_SECRET=your-secure-random-string-here

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### Test Credentials to Seed

| Role | Email | Password |
|---|---|---|
| Author 1 | author1@test.com | TestPass123 |
| Author 2 | author2@test.com | TestPass123 |
| Admin 1 | admin1@bookleaf.com | AdminPass123 |
| Admin 2 | admin2@bookleaf.com | AdminPass123 |

---

### Phase 2 — Backend & APIs (Day 2)

**Goal:** All API endpoints functional, tested, with auth, RBAC, validation, and SSE scaffold.

**This phase is worth 15% of the score. Clean RESTful naming and error responses are explicitly evaluated.**

#### Checklist

- [ ] Set up Express app with middleware: `cors`, `cookie-parser`, `express.json()`
- [ ] Configure CORS: allow Next.js dev origin (`localhost:3000`) with credentials
- [ ] Build `authenticate` middleware (JWT verify from httpOnly cookie)
- [ ] Build `authorizeRole` middleware (RBAC by role array)
- [ ] Build `validate` middleware (Zod schema wrapper)
- [ ] Write all Zod schemas: `LoginSchema`, `CreateTicketSchema`, `RespondToTicketSchema`, `UpdateTicketSchema`
- [ ] Implement `POST /api/auth/login` — bcrypt compare, JWT sign, set cookie
- [ ] Implement `POST /api/auth/logout` — clear cookie
- [ ] Implement `GET /api/books` — author's books + computed `royaltyPending`
- [ ] Implement `POST /api/tickets` — create ticket + trigger AI (stub AI for now if Phase 4 not done)
- [ ] Implement `GET /api/tickets` — author's own tickets only
- [ ] Implement `GET /api/tickets/:id` — ticket + public responses only
- [ ] Implement `GET /api/tickets/:id/stream` — SSE endpoint with heartbeat
- [ ] Implement `GET /api/admin/tickets` — all tickets with filter query params + urgency sort
- [ ] Implement `GET /api/admin/tickets/:id` — full ticket + all responses + author info
- [ ] Implement `PATCH /api/admin/tickets/:id` — update status/category/priority + set override flags
- [ ] Implement `POST /api/admin/tickets/:id/respond` — create response + SSE push
- [ ] Implement `POST /api/admin/tickets/:id/assign` — assign to requesting admin
- [ ] Implement `GET /api/admin/authors` — author list with book counts
- [ ] Implement `GET /api/admin/ai/draft/:id` — on-demand AI draft (stub returns placeholder for now)
- [ ] Test all endpoints with Postman or REST client — document in collection
- [ ] Verify 401 on missing token, 403 on wrong role, 404 on unknown resource, 400 on bad body

---

### Phase 3 — Author Portal (Day 3)

**Goal:** Fully functional, responsive author-facing UI connected to real API endpoints.

#### Checklist

- [ ] Configure Next.js middleware for route protection (redirect unauthenticated to `/login`)
- [ ] Build Login page with form validation + error messages
- [ ] Set up React Query provider in root layout
- [ ] Build author layout with responsive sidebar (hamburger on mobile)
- [ ] Build `useAuth` hook (session check via cookie + React Query)
- [ ] Build `useBooks` hook (`GET /api/books`)
- [ ] Build `useTickets` hook (`GET /api/tickets`)
- [ ] Build `BookCard` component with all fields + status badge + royalty summary
  - ⚠️ Suppress royalty display for `in_production` books
  - ⚠️ Amber highlight if `royaltyPending > 0`
- [ ] Build `My Books` page with card grid, loading skeletons, empty state
- [ ] Build `TicketForm` with book dropdown (from React Query cache), subject, description, character count, file input UI
- [ ] Build `Submit Query` page with success state + redirect
- [ ] Build `StatusBadge` component (colour-coded by status)
- [ ] Build `PriorityBadge` component (colour-coded by priority)
- [ ] Build `My Tickets` list page with empty state
- [ ] Build `Ticket Detail` page with public thread
- [ ] Wire up SSE EventSource in ticket detail using `useSSE` hook
- [ ] Test: login as two different authors — confirm they only see their own books and tickets
- [ ] Test: SSE — send a response as admin, confirm it appears in author view without refresh
- [ ] Test: responsive layout at 375px (mobile), 768px (tablet), 1280px (desktop)

---

### Phase 4 — Admin Portal + AI Integration (Day 4)

**Goal:** Fully functional admin portal with working AI classification, priority scoring, and draft generation.

**This is the highest-weighted phase: AI Integration (25%) + Architecture (25%) = 50% of total score.**

#### Checklist — Admin UI

- [ ] Build admin layout with sidebar navigation
- [ ] Build `StatsBar` component (computed aggregations from DB — not hardcoded)
- [ ] Build `FilterBar` component (Status, Category, Priority, Date range filters)
- [ ] Build `TicketQueue` table with urgency-first sort + colour-coded priority badges
- [ ] Build `Admin Ticket Detail` page:
  - [ ] Author info panel
  - [ ] AI category display + override dropdown (+ "AI suggested" indicator)
  - [ ] Priority display + override dropdown + priority_reason tooltip + "Edited" indicator
  - [ ] Status dropdown (triggers SSE push)
  - [ ] Full ticket thread (public + internal notes styled differently)
  - [ ] Response composer with Public/Internal toggle
  - [ ] "Assign to me" button

#### Checklist — AI Integration

- [ ] Set up Anthropic client in `ai.service.ts`
- [ ] Implement `classifyAndPrioritise(ticket)` — single call, returns `{ category, confidence, priority, priority_reason }`
- [ ] Wire into `POST /api/tickets` — call AI after saving ticket, update DB with results
- [ ] Implement `generateDraft(ticketId)` — on-demand, returns draft string
- [ ] Wire into `GET /api/admin/ai/draft/:id`
- [ ] Test classification with diverse ticket descriptions:
  - [ ] "No royalties for 6 months" → Critical + royalty_and_payments
  - [ ] "Update author bio" → Low + general_inquiry
  - [ ] "Book not on Flipkart" → High + distribution
- [ ] Test draft quality — verify tone matches Knowledge Base rules
- [ ] Test graceful degradation:
  - [ ] Temporarily break AI API key — confirm ticket still creates with defaults
  - [ ] Confirm admin draft shows "unavailable" banner, textarea is empty but functional
- [ ] Test admin override: change AI category → verify "AI suggested: X" shown

---

### Phase 5 — Deploy & Docs (Day 5)

**Goal:** Live URL working end-to-end, comprehensive documentation, 1-page write-up submitted.

#### Checklist — Deployment

- [ ] Push all code to private GitHub repo
- [ ] Railway: create new project, add PostgreSQL plugin + Node service
- [ ] Set Railway env vars: `DATABASE_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY`
- [ ] Deploy backend to Railway — verify health endpoint responds
- [ ] Run seed script on production DB: `npx prisma db seed`
- [ ] Vercel: import GitHub repo, configure to deploy `/frontend`
- [ ] Set Vercel env vars: `NEXT_PUBLIC_API_URL` → Railway backend URL
- [ ] Update CORS config in Express to allow Vercel domain
- [ ] End-to-end smoke test on live URL:
  - [ ] Login as author → see books → submit ticket → see AI classification
  - [ ] Login as admin → see ticket in queue → view detail → AI draft loads → send response
  - [ ] Author side → new response appears without refresh (SSE working)
  - [ ] Admin override category → "AI suggested" badge appears
- [ ] `git grep -r "sk-ant\|JWT_SECRET\|password"` — confirm no keys in code
- [ ] Add evaluator email as GitHub collaborator

#### Checklist — README

- [ ] Local setup instructions (fresh clone → running app in < 5 steps)
- [ ] Environment variable documentation (every key, what it's for, where to get it)
- [ ] Architecture decisions section (Next.js choice, Express choice, PostgreSQL, SSE vs WS)
- [ ] AI integration section (prompt strategy, token budget, error handling, cost estimates)
- [ ] API documentation (every endpoint, method, auth, request body, response shape)
- [ ] Test credentials table (clearly formatted, obvious placement)
- [ ] Known limitations section
- [ ] Future improvements section

#### Checklist — 1-Page Write-Up

- [ ] Section 1: What you prioritised (core flow + AI integration first, why)
- [ ] Section 2: Trade-offs made (SSE vs WS, Haiku vs GPT-4o, batching, Prisma vs raw SQL)
- [ ] Section 3: Known limitations (no email notifications, no file upload, no search, limited pagination)
- [ ] Section 4: How you'd evolve it (webhook notifications, analytics dashboard, vector search over KB, rate limiting, SLA tracking)

---

## 11. Security Architecture

### API Key Security (Critical — Explicitly Evaluated)

```bash
# Pre-submission checklist — run these commands before final submission

# Check for any API keys or secrets in committed code
git grep -r "sk-ant" .
git grep -r "JWT_SECRET" .
git grep -r "password123" .
git log --all --full-diff -p -- . | grep -E "(sk-ant|API_KEY=)"

# Verify .gitignore excludes .env files
cat .gitignore | grep env

# Check .env.example only has variable names, no values
cat .env.example
```

### httpOnly Cookie for JWT Storage

```typescript
// Why httpOnly cookies instead of localStorage:
// localStorage is accessible to JavaScript → vulnerable to XSS attacks
// httpOnly cookies are inaccessible to JavaScript → XSS cannot steal the token

res.cookie('token', jwt, {
  httpOnly: true,     // JS cannot access via document.cookie
  secure: true,       // Only sent over HTTPS (production)
  sameSite: 'strict', // CSRF protection — only sent on same-origin requests
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
});
```

### Author Data Isolation

```typescript
// Authors must NEVER see each other's data
// Every author endpoint includes authorId filter

// GET /api/tickets — returns ONLY requesting author's tickets
const tickets = await prisma.ticket.findMany({
  where: { authorId: req.user.userId }, // ← never omit this
});

// GET /api/tickets/:id — verify ownership before returning
const ticket = await prisma.ticket.findFirst({
  where: { id: ticketId, authorId: req.user.userId }, // ← ownership check
});
if (!ticket) return res.status(404).json({ error: 'Not found' });
// Returns 404 (not 403) to avoid revealing ticket existence to other authors
```

### RBAC Protection for Admin Routes

```typescript
// All /admin/* routes require both authenticate + authorizeRole(['admin'])
// Authors hitting admin routes get 403 Forbidden
// Never expose internal notes (is_internal=true) to author-facing endpoints

// GET /api/tickets/:id — public responses only
const responses = await prisma.ticketResponse.findMany({
  where: { ticketId, isInternal: false }, // ← filter internal notes
});
```

---

## 12. Error Handling Strategy

### Layered Error Handling

```
Request
  → Zod Validation Middleware (400 for bad input)
    → Auth Middleware (401 for missing/invalid JWT)
      → RBAC Middleware (403 for wrong role)
        → Route Handler (404 for not found, business logic errors)
          → AI Service (graceful degradation, never blocks ticket creation)
            → Global Error Handler (500 for unexpected errors)
```

### AI Graceful Degradation (Critical Requirement)

```typescript
// POST /api/tickets
try {
  const ticket = await prisma.ticket.create({ data: ticketData });

  // AI is best-effort — never block ticket creation on AI failure
  try {
    const ai = await classifyAndPrioritise(ticket);
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        category: ai.category,
        priority: ai.priority,
        priorityReason: ai.priority_reason,
      }
    });
  } catch (aiError) {
    console.error('[AI Classification Failed]', aiError);
    // Ticket already created with safe defaults from schema
    // category defaults to 'general_inquiry', priority to 'medium'
  }

  return res.status(201).json(ticket);
} catch (dbError) {
  return res.status(500).json({ error: 'Failed to create ticket' });
}
```

---

## 13. Evaluation Criteria Mapping

| Criterion | Weight | How This Plan Addresses It |
|---|---|---|
| **AI Integration Quality** | **25%** | Phase 4: batched classification+priority, on-demand draft, full Knowledge Base in system prompt, graceful degradation on failure, token cost optimisation documented in README |
| **Architecture & Code Quality** | **25%** | Monorepo structure, separation of concerns (routes/middleware/services), TypeScript throughout, Zod validation, consistent error shapes, meaningful Prisma schema |
| **API Design** | **15%** | RESTful conventions throughout, JWT+RBAC on every route, Zod validation on all mutations, Postman collection in README, standard error shape |
| **Functionality & Completeness** | **15%** | Both portals fully functional, complete ticket lifecycle (create→classify→assign→respond→resolve), SSE real-time, all edge cases in seed data handled |
| **Product Thinking** | **10%** | Urgency-first sort, amber royalty highlights, in_production book handling, AI override indicators, internal note styling, author data isolation, empty states |
| **Documentation** | **10%** | Comprehensive README (setup, architecture, API docs, test credentials), 1-page write-up (trade-offs, limitations, future improvements), meaningful commit history |

### Priority Rule
> **AI Integration (25%) + Architecture (25%) = 50% of total score.**
>
> If time runs short on Day 5, prioritise Phase 4 completion over bonus features. A working AI integration with graceful degradation beats a feature-complete but AI-broken submission.

---

## 14. Feature Checklist — Every Requirement

### Authentication
- [ ] Login page with email + password
- [ ] JWT stored as httpOnly cookie (not localStorage)
- [ ] Auth middleware on all protected routes
- [ ] RBAC: authors blocked from `/admin/*` routes
- [ ] Route guards in Next.js middleware (redirect unauthenticated users)
- [ ] Persistent auth state across browser refreshes

### Author Portal — My Books
- [ ] Card grid of author's own books (never other authors' books)
- [ ] Title, ISBN, Genre, Publication Date, Status badge (colour-coded), MRP on each card
- [ ] Royalty summary: Earned / Paid / Pending per book
- [ ] Pending royalty highlighted amber if > 0
- [ ] In-production books: royalty figures hidden, status indicator shown
- [ ] Empty state for authors with no books
- [ ] Loading skeletons while fetching

### Author Portal — Submit Support Query
- [ ] Book dropdown populated from author's actual book list
- [ ] "General / Account Level" option in dropdown
- [ ] Subject line input with validation
- [ ] Description textarea with live character count
- [ ] File attachment input (UI present)
- [ ] Client-side validation with field-level error messages
- [ ] Success state + redirect to My Tickets on submission

### Author Portal — My Tickets
- [ ] Ticket list, newest first
- [ ] Status badge (colour-coded by status)
- [ ] Empty state when no tickets
- [ ] Click-through to ticket detail

### Author Portal — Ticket Detail
- [ ] Full thread: original query + public admin responses
- [ ] Internal admin notes NOT shown (filtered at API level)
- [ ] SSE listener: auto-appends new responses without refresh
- [ ] SSE disconnects on page unmount

### Admin Portal — Dashboard
- [ ] Stats bar: Total, Open, Critical, Avg response time (from DB — not hardcoded)
- [ ] Ticket queue table with all tickets
- [ ] Filter bar: Status + Category + Priority + Date range (independently combinable)
- [ ] Default sort: Critical first, then oldest unresolved
- [ ] Colour-coded priority badges (red/amber/blue/gray)

### Admin Portal — Ticket Detail
- [ ] Full thread: ALL responses + internal notes (yellow, "Internal" badge)
- [ ] Author info panel: name, email, book, submission date
- [ ] AI category display + override dropdown + "AI suggested: X" when overridden
- [ ] Priority display + override + priority_reason tooltip + "Edited" indicator
- [ ] Status dropdown (triggers SSE push to author)
- [ ] Response composer with Public/Internal toggle
- [ ] "Assign to me" button + current assignee display

### AI Integration
- [ ] Auto-classification on ticket creation (6 categories)
- [ ] Priority scoring batched with classification (single API call)
- [ ] `priority_reason` stored and shown to admin
- [ ] Admin can override category (with indicator)
- [ ] Admin can override priority (with indicator)
- [ ] On-demand draft generation when admin opens ticket
- [ ] Knowledge Base + tone rules injected as system prompt
- [ ] Draft in editable textarea (admin always reviews before sending)
- [ ] Graceful degradation: AI failure → defaults applied, ticket still created
- [ ] Graceful degradation: Draft failure → "AI unavailable" banner, blank textarea still usable

### Real-Time
- [ ] SSE endpoint: `/api/tickets/:id/stream`
- [ ] Push new public responses to author
- [ ] Push status changes to author
- [ ] 30-second polling fallback if SSE fails
- [ ] Heartbeat to keep SSE connection alive

### Database & Data
- [ ] Seed script using `bookleaf_sample_data.json`
- [ ] 10 authors + 18 books seeded
- [ ] Passwords hashed with bcrypt (never plaintext)
- [ ] Edge cases covered: published, in-production, zero royalties, pending payouts

### Security
- [ ] No API keys hardcoded anywhere in source
- [ ] `.env` in `.gitignore`, only `.env.example` committed
- [ ] Authors cannot access other authors' data
- [ ] Internal notes not exposed to author-facing endpoints
- [ ] Git history checked for exposed secrets before submission

### Deployment
- [ ] Frontend on Vercel with correct env vars
- [ ] Backend + DB on Railway with correct env vars
- [ ] Production DB seeded with test data
- [ ] End-to-end smoke test completed on live URLs
- [ ] Evaluator added as GitHub collaborator

### Documentation
- [ ] README: local setup (works from fresh clone)
- [ ] README: all env vars documented
- [ ] README: architecture decisions
- [ ] README: AI integration + prompt strategy + cost estimates
- [ ] README: API documentation (every endpoint)
- [ ] README: test credentials table
- [ ] README: known limitations
- [ ] README: future improvements
- [ ] 1-page write-up: priorities, trade-offs, limitations, evolution

---

## 15. Future Improvements & Known Limitations

### Known Limitations (for Write-Up)

| Limitation | Impact |
|---|---|
| No email notifications | Authors don't know when their ticket is updated unless they log in |
| No file attachment upload | File input is UI-only; attachments cannot actually be stored |
| No search | No full-text search across tickets or books |
| No pagination | Performance degrades with very large ticket volumes |
| No rate limiting | AI endpoint and ticket creation could be abused |
| Single admin per ticket | No multi-admin collaboration or escalation workflows |
| No audit log | No trail of who changed what on a ticket |

### Future Improvements (for Write-Up)

| Improvement | Business Value |
|---|---|
| **Webhook/Email notifications** | Authors notified on ticket updates — reduces "checking in" tickets |
| **Analytics dashboard** | Category trends, avg resolution time, agent performance metrics |
| **Vector search over Knowledge Base** | Retrieve relevant KB articles per ticket — more accurate AI drafts |
| **Rate limiting (per user + per IP)** | Prevent abuse of ticket creation and AI endpoints |
| **Ticket SLA tracking** | Automatic escalation if ticket breaches response time threshold |
| **Multi-author accounts** | Publishers managing multiple authors under one account |
| **AI confidence threshold** | Only auto-apply AI classification if confidence > 0.8; else flag for manual |
| **Canned responses library** | Admin can insert pre-approved responses for common queries |
| **Bulk ticket actions** | Reassign, close, or categorise multiple tickets simultaneously |

---

*Document generated from: `BookLeaf_Project_Plan.docx`*
*Architecture and planning by: Full analysis of all project requirements, constraints, and evaluation criteria*
