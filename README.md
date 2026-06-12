# 📚 BookLeaf Publishing — Author Support & Communication Portal

An intelligent, real-time ticketing system designed for self-published authors and support admins. Built to solve the scalability challenges of author support queues, this portal features AI-powered ticket classification, priority scoring, automated draft responses, and real-time live chat capabilities.

## 🚀 Key Features
* **Author Portal:** Track published books, royalty payouts, and submit support tickets.
* **Admin Portal:** Manage support queues with intelligent sorting, filtering, and assignment.
* **AI Integration:** Uses GPT-4o-mini to auto-classify tickets, assign priority scores, and draft contextual responses based on conversation history.
* **Real-time Sync:** Powered by Supabase Realtime Channels, allowing instant chat-like functionality between authors and admins without page refreshes.
* **Role-Based Access Control:** Secure isolation between Authors and Admins.

---

## 🛠 Technology Stack

### Frontend & Core Framework
* **Next.js 14** (App Router, Server Actions)
* **React 18**
* **TypeScript**
* **Tailwind CSS** (Styling)
* **React Query (TanStack)** (Server State Management)
* **Lucide React** (Icons)

### Backend & Infrastructure
* **Supabase** (PostgreSQL Database, Authentication, Real-time WebSockets)
* **OpenAI API** (GPT-4o-mini for AI Classification and Generation)
* **Zod** (Schema Validation)

---

## ⚙️ Local Setup & Installation

### 1. Prerequisites
Ensure you have the following installed:
* Node.js (v18+)
* npm or yarn
* A Supabase account ([supabase.com](https://supabase.com))
* An OpenAI API Key

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd bookleaf
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Variables
Copy the example environment file and fill in your credentials:
```bash
cp .env.example .env.local
```
Update `.env.local` with your Supabase URL, Anon Key, Service Role Key, and OpenAI API Key.

### 5. Supabase Initialization & Database Seeding
Initialize the database tables and policies:
1. Navigate to your Supabase project's SQL Editor.
2. Run the `supabase/migrations/001_init.sql` script to create the schema.
3. Run the local database seeder to populate mock authors, books, and admins:
```bash
npm run db:seed
```

### 6. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your browser.

---

## 🔑 Test Credentials (Demo Accounts)

You can log in to the portal using the following pre-seeded test accounts:

| Role   | Email                  | Password      |
|--------|------------------------|---------------|
| Author | author1@test.com       | TestPass123   |
| Author | author2@test.com       | TestPass123   |
| Admin  | admin1@bookleaf.com    | AdminPass123  |
| Admin  | admin2@bookleaf.com    | AdminPass123  |

---

## 🧠 AI Architecture

The system utilizes GPT-4o-mini for high-speed, cost-effective intelligent operations:

1. **Auto-Classification & Priority Scoring:** When an author submits a ticket, the AI evaluates the description and subject to assign it to one of six categories (e.g., Royalty & Payments, Distribution) and assigns a Priority Score (Critical, High, Medium, Low) based on financial or customer-impacting urgency.
2. **Draft Response Generation:** Admins can trigger an AI-generated draft response that contextually reads the ticket history and formulates an empathetic, actionable response based on BookLeaf's established tone guidelines.

---

## 📡 Real-Time Communication

The platform uses **Supabase Realtime (WebSockets)** to establish broadcast channels between Authors and Admins.
* When an admin responds, the author's screen updates instantly.
* When an author replies, the admin's queue and ticket view update instantly.
* The system utilizes React Query cache invalidation hooked to the WebSocket listener to guarantee single-source-of-truth state management.

---

## 📝 1-Page Architecture Write-Up

### 1. Priorities
The primary priority during development was to create a **resilient, real-time core loop** (Ticket Creation -> AI Evaluation -> Admin Response -> Instant Author Sync). The focus was on ensuring that data fetching, caching, and real-time invalidation worked perfectly together before polishing secondary UI elements. Supabase was chosen over Express+Prisma to significantly accelerate authentication and real-time deployment.

### 2. Trade-offs Made
* **Next.js API Routes over Express Server:** Opted for Next.js App Router API endpoints instead of a separate Express backend. This reduces infrastructure complexity and allows sharing standard TypeScript types seamlessly across the stack.
* **Supabase Realtime over SSE:** Replaced Server-Sent Events (SSE) with Supabase WebSockets. SSE struggles with bi-directional chat and requires manual connection pooling. Supabase handles the WebSocket infrastructure out-of-the-box.
* **GPT-4o-mini over Claude:** Transitioned to GPT-4o-mini due to its superior structured JSON output reliability and high-speed response generation, which is critical for real-time support queues.

### 3. Known Limitations
* **Pagination:** The ticket queues currently fetch all data at once. While fine for a demo, a production environment requires cursor-based pagination.
* **Email Notifications:** The system does not currently integrate with an SMTP provider (e.g., SendGrid) to email users when they receive offline responses.
* **File Uploads:** The UI supports file attachment selection, but actual Supabase Storage bucket integration is currently pending.

### 4. Future Evolution
* **Vector Search over Knowledge Base:** Integrating a vector database (like Supabase pgvector) to allow the AI to perform RAG (Retrieval-Augmented Generation) against a library of company support docs to generate even more precise drafts.
* **Advanced Analytics Dashboard:** Building charting interfaces to track Average Resolution Time, SLA breaches, and ticket volume per category.
* **Webhook Notifications:** Emitting webhooks to external services (like Slack or Discord) when "Critical" priority tickets are raised.
