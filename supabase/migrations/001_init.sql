-- BookLeaf schema (RLS intentionally disabled — access control in app layer)

CREATE TYPE user_role AS ENUM ('author', 'admin');

CREATE TYPE ticket_status AS ENUM (
  'open',
  'in_progress',
  'resolved',
  'closed'
);

CREATE TYPE ticket_category AS ENUM (
  'royalty_and_payments',
  'isbn_and_metadata',
  'printing_and_quality',
  'distribution',
  'book_status',
  'general_inquiry'
);

CREATE TYPE priority_level AS ENUM ('critical', 'high', 'medium', 'low');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'author',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  isbn TEXT NOT NULL,
  genre TEXT NOT NULL,
  pub_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('published', 'in_production')),
  mrp NUMERIC(10, 2) NOT NULL,
  copies_sold INTEGER NOT NULL DEFAULT 0,
  royalty_earned NUMERIC(12, 2) NOT NULL DEFAULT 0,
  royalty_paid NUMERIC(12, 2) NOT NULL DEFAULT 0
);

CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  book_id UUID REFERENCES books (id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  category ticket_category NOT NULL DEFAULT 'general_inquiry',
  priority priority_level NOT NULL DEFAULT 'medium',
  priority_reason TEXT,
  ai_category_overridden BOOLEAN NOT NULL DEFAULT FALSE,
  ai_priority_overridden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ticket_assignments (
  ticket_id UUID PRIMARY KEY REFERENCES tickets (id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_books_author_id ON books (author_id);
CREATE INDEX idx_tickets_author_id ON tickets (author_id);
CREATE INDEX idx_tickets_book_id ON tickets (book_id);
CREATE INDEX idx_tickets_status ON tickets (status);
CREATE INDEX idx_tickets_priority ON tickets (priority);
CREATE INDEX idx_ticket_responses_ticket_id ON ticket_responses (ticket_id);
