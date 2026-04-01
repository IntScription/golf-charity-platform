create extension if not exists "pgcrypto";

create type public.user_role as enum ('subscriber', 'admin');
create type public.subscription_status as enum ('active', 'inactive', 'canceled', 'past_due', 'lapsed');
create type public.draw_type as enum ('random', 'algorithmic');
create type public.draw_status as enum ('draft', 'simulated', 'published');
create type public.review_status as enum ('pending', 'approved', 'rejected');
create type public.payment_status as enum ('pending', 'paid');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'subscriber',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  price numeric(10,2) not null check (price >= 0),
  billing_interval text not null check (billing_interval in ('month', 'year')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.subscription_plans(id) on delete set null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status public.subscription_status not null default 'inactive',
  current_period_start timestamptz,
  current_period_end timestamptz,
  renewal_date timestamptz,
  created_at timestamptz not null default now()
);

create table public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  website_url text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.user_charity_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  charity_id uuid not null references public.charities(id) on delete restrict,
  contribution_percent numeric(5,2) not null check (contribution_percent >= 10 and contribution_percent <= 100),
  created_at timestamptz not null default now()
);

create table public.golf_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score >= 1 and score <= 45),
  played_at date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.draws (
  id uuid primary key default gen_random_uuid(),
  month integer not null check (month between 1 and 12),
  year integer not null check (year >= 2025),
  draw_type public.draw_type not null,
  status public.draw_status not null default 'draft',
  numbers integer[] not null,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (month, year)
);

create table public.prize_pools (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null unique references public.draws(id) on delete cascade,
  subscriber_count integer not null default 0,
  total_pool_amount numeric(12,2) not null default 0,
  pool_5_amount numeric(12,2) not null default 0,
  pool_4_amount numeric(12,2) not null default 0,
  pool_3_amount numeric(12,2) not null default 0,
  rollover_in numeric(12,2) not null default 0,
  rollover_out numeric(12,2) not null default 0
);

create table public.draw_entries (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  scores_snapshot integer[] not null,
  matched_count integer not null default 0 check (matched_count between 0 and 5),
  prize_amount numeric(12,2) not null default 0,
  result_tier text not null default 'none' check (result_tier in ('none', 'match_3', 'match_4', 'match_5')),
  created_at timestamptz not null default now(),
  unique (draw_id, user_id)
);

create table public.winner_claims (
  id uuid primary key default gen_random_uuid(),
  draw_entry_id uuid not null unique references public.draw_entries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  proof_file_path text,
  review_status public.review_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  stripe_payment_intent_id text,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'usd',
  type text not null check (type in ('subscription', 'donation', 'payout')),
  status text not null,
  created_at timestamptz not null default now()
);
