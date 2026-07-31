-- =============================================
-- 0001_init.sql
-- Core schema: enums, tables, indexes
-- =============================================

-- Enums
create type public.user_role as enum (
  'frontliner',
  'interviewer_1',
  'owner',
  'admin_hr'
);

create type public.candidate_status as enum (
  'waiting',
  'call_session_1',
  'session_1',
  'call_session_2',
  'session_2',
  'passed',
  'failed',
  'finished'
);

create type public.notification_type as enum (
  'check_in',
  'call_session_1',
  'send_session_2',
  'decision',
  'directed',
  'system'
);

create type public.notification_priority as enum (
  'low',
  'medium',
  'high'
);

-- Tables

create table public.roles (
  id bigint generated always as identity primary key,
  name public.user_role not null unique,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.outlets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role public.user_role not null default 'frontliner',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.queue_counters (
  outlet_id uuid not null references public.outlets(id) on delete cascade,
  counter_date date not null,
  last_number int not null default 0,
  primary key (outlet_id, counter_date)
);

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  queue_number text not null unique,
  full_name text not null,
  email text,
  phone text not null,
  position text not null,
  photo_url text not null,
  arrival_time timestamptz not null default now(),
  current_status public.candidate_status not null default 'waiting',
  notes text,
  outlet_id uuid references public.outlets(id),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.candidates replica identity full;

create table public.activity_logs (
  id bigint generated always as identity primary key,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  user_id uuid references public.users(id),
  action text not null,
  old_status public.candidate_status,
  new_status public.candidate_status,
  note text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  target_role public.user_role not null,
  type public.notification_type not null,
  priority public.notification_priority not null default 'medium',
  title text not null,
  message text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indexes

create index idx_candidates_status on public.candidates (current_status);
create index idx_candidates_arrival on public.candidates (arrival_time desc);
create index idx_candidates_outlet on public.candidates (outlet_id);
create index idx_activity_candidate on public.activity_logs (candidate_id, created_at desc);
create index idx_notifications_target on public.notifications (target_role, read, created_at desc);
create index idx_users_role on public.users (role);
