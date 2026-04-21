-- ============================================================
-- StackFind - Playground Premium & Profiles
-- ============================================================

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  playground_usage_count int not null default 0,
  is_premium_playground boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Policy to allow profile creation on signup (security definer function handles it)
-- but we need to ensure the profile exists for existing users too.
-- One-time sync for existing users:
-- insert into public.profiles (id, email)
-- select id, email from auth.users
-- on conflict (id) do nothing;
