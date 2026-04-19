-- ============================================================
-- StackFind - Initial Migration
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type pricing_model as enum ('free', 'freemium', 'paid', 'open_source');
create type tool_status as enum ('pending', 'approved', 'rejected');
create type submission_plan as enum ('free', 'fast_track', 'featured');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');

-- ============================================================
-- TABLES
-- ============================================================

-- Categories
create table categories (
  id           uuid primary key default uuid_generate_v4(),
  slug         text not null unique,
  name         text not null,
  description  text,
  icon         text,  -- emoji
  tool_count   int not null default 0,
  created_at   timestamptz not null default now()
);

-- Tools
create table tools (
  id                  uuid primary key default uuid_generate_v4(),
  slug                text not null unique,
  name                text not null,
  tagline             text not null,
  description         text,
  website             text,
  logo_url            text,
  screenshots         jsonb default '[]'::jsonb,
  pricing_model       pricing_model not null default 'free',
  starting_price_usd  numeric(10,2),
  starting_price_inr  numeric(10,2),
  has_inr_billing     boolean not null default false,
  has_gst_invoice     boolean not null default false,
  has_upi             boolean not null default false,
  has_india_support   boolean not null default false,
  is_made_in_india    boolean not null default false,
  status              tool_status not null default 'pending',
  featured_until      timestamptz,
  upvotes             int not null default 0,
  views               int not null default 0,
  submitted_by        uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  approved_at         timestamptz
);

-- Tool <-> Category (many-to-many)
create table tool_categories (
  tool_id      uuid not null references tools(id) on delete cascade,
  category_id  uuid not null references categories(id) on delete cascade,
  primary key (tool_id, category_id)
);

-- Founders
create table founders (
  id           uuid primary key default uuid_generate_v4(),
  slug         text not null unique,
  name         text not null,
  bio          text,
  avatar_url   text,
  city         text,
  twitter      text,
  linkedin     text,
  is_verified  boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Upvotes
create table upvotes (
  user_id     uuid not null references auth.users(id) on delete cascade,
  tool_id     uuid not null references tools(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, tool_id)
);

-- Submissions
create table submissions (
  id              uuid primary key default uuid_generate_v4(),
  email           text not null,
  tool_data       jsonb not null default '{}'::jsonb,
  plan            submission_plan not null default 'free',
  payment_id      text,
  payment_status  payment_status not null default 'pending',
  status          tool_status not null default 'pending',
  created_at      timestamptz not null default now()
);

-- Newsletter Subscriptions
create table newsletter_subs (
  id          uuid primary key default uuid_generate_v4(),
  email       text not null unique,
  confirmed   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_tools_slug        on tools(slug);
create index idx_tools_status      on tools(status);
create index idx_tools_created_at  on tools(created_at desc);
create index idx_tool_categories_tool_id      on tool_categories(tool_id);
create index idx_tool_categories_category_id  on tool_categories(category_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table tools             enable row level security;
alter table categories        enable row level security;
alter table tool_categories   enable row level security;
alter table founders          enable row level security;
alter table upvotes           enable row level security;
alter table submissions       enable row level security;
alter table newsletter_subs   enable row level security;

-- Helper: check if current user is admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid()
    and email = any(
      string_to_array(current_setting('app.admin_emails', true), ',')
    )
  );
$$ language sql security definer stable;

-- ---- tools ----
-- Public: read approved tools only
create policy "tools_public_read" on tools
  for select using (status = 'approved');

-- Authenticated: insert own tools
create policy "tools_auth_insert" on tools
  for insert with check (auth.uid() = submitted_by);

-- Admin: full access
create policy "tools_admin_all" on tools
  for all using (is_admin());

-- ---- categories ----
create policy "categories_public_read" on categories
  for select using (true);

create policy "categories_admin_all" on categories
  for all using (is_admin());

-- ---- tool_categories ----
create policy "tool_categories_public_read" on tool_categories
  for select using (true);

create policy "tool_categories_admin_all" on tool_categories
  for all using (is_admin());

-- ---- founders ----
create policy "founders_public_read" on founders
  for select using (true);

create policy "founders_admin_all" on founders
  for all using (is_admin());

-- ---- upvotes ----
create policy "upvotes_auth_insert" on upvotes
  for insert with check (auth.uid() = user_id);

create policy "upvotes_auth_delete" on upvotes
  for delete using (auth.uid() = user_id);

create policy "upvotes_public_read" on upvotes
  for select using (true);

-- ---- submissions ----
create policy "submissions_public_insert" on submissions
  for insert with check (true);

create policy "submissions_admin_all" on submissions
  for all using (is_admin());

-- ---- newsletter_subs ----
create policy "newsletter_public_insert" on newsletter_subs
  for insert with check (true);

create policy "newsletter_admin_all" on newsletter_subs
  for all using (is_admin());

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Increment tool views
create or replace function increment_tool_views(tool_slug text)
returns void as $$
  update tools set views = views + 1 where slug = tool_slug and status = 'approved';
$$ language sql security definer;

-- Sync upvote count to tools table
create or replace function sync_upvote_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update tools set upvotes = upvotes + 1 where id = NEW.tool_id;
  elsif (TG_OP = 'DELETE') then
    update tools set upvotes = upvotes - 1 where id = OLD.tool_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_sync_upvote_count
  after insert or delete on upvotes
  for each row execute function sync_upvote_count();

-- ============================================================
-- SEED: CATEGORIES
-- ============================================================

insert into categories (slug, name, description, icon) values
  ('writing',          'Writing',          'AI writing assistants and content generators',   '✍️'),
  ('image-generation', 'Image Generation', 'AI image and art generation tools',              '🎨'),
  ('video',            'Video',            'AI video creation and editing tools',             '🎬'),
  ('coding',           'Coding',           'AI coding assistants and developer tools',        '💻'),
  ('productivity',     'Productivity',     'AI tools to boost your workflow',                 '⚡'),
  ('marketing',        'Marketing',        'AI marketing and ad copy tools',                  '📣'),
  ('seo',              'SEO',              'AI SEO and content optimization tools',           '🔍'),
  ('chatbots',         'Chatbots',         'AI chatbot builders and conversational AI',       '🤖'),
  ('automation',       'Automation',       'AI workflow automation and process tools',        '⚙️'),
  ('made-in-india',    'Made in India',    'AI tools built by Indian founders and teams',    '🇮🇳');
