-- =============================================
-- EGG RECRUITMENT — Combined Migration (0001-0004)
-- Copy & paste ALL of this into Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lbuvedzjsohvcyahrkcw/sql/new
-- =============================================

-- ====================
-- PART 1: SCHEMA
-- ====================

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

-- ====================
-- PART 2: FUNCTIONS
-- ====================

-- Auto-sync user from auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.email
    ),
    new.raw_user_meta_data->>'picture'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = excluded.name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();

-- Allowed transitions per role + current status
create or replace function public.allowed_transitions(
  p_role public.user_role,
  p_status public.candidate_status
)
returns public.candidate_status[]
language sql
immutable
set search_path = ''
as $$
  select case
    when p_role = 'admin_hr' then
      array['waiting','call_session_1','session_1','call_session_2','session_2','passed','failed','finished']::public.candidate_status[]

    when p_role = 'frontliner' then
      case p_status
        when 'call_session_1' then array['session_1']::public.candidate_status[]
        when 'call_session_2' then array['session_2']::public.candidate_status[]
        when 'passed' then array['finished']::public.candidate_status[]
        when 'failed' then array['finished']::public.candidate_status[]
        else '{}'::public.candidate_status[]
      end

    when p_role = 'interviewer_1' then
      case p_status
        when 'waiting' then array['call_session_1']::public.candidate_status[]
        when 'session_1' then array['call_session_2']::public.candidate_status[]
        else '{}'::public.candidate_status[]
      end

    when p_role = 'owner' then
      case p_status
        when 'session_2' then array['passed','failed']::public.candidate_status[]
        else '{}'::public.candidate_status[]
      end
  end;
$$;

-- Notification helper per transition
create or replace function public.insert_notification_for_transition(
  p_candidate_id uuid,
  p_queue_number text,
  p_old_status public.candidate_status,
  p_new_status public.candidate_status
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if p_old_status = 'waiting' and p_new_status = 'call_session_1' then
    insert into public.notifications (candidate_id, target_role, type, priority, title, message)
    values (
      p_candidate_id, 'frontliner', 'call_session_1', 'high',
      format('Panggil kandidat %s', p_queue_number),
      format('Panggil kandidat %s untuk masuk ke Session 1', p_queue_number)
    );
  elsif p_old_status = 'session_1' and p_new_status = 'call_session_2' then
    insert into public.notifications (candidate_id, target_role, type, priority, title, message)
    values (
      p_candidate_id, 'frontliner', 'send_session_2', 'high',
      format('Arahkan kandidat %s ke Session 2', p_queue_number),
      format('Kandidat %s selesai Session 1. Arahkan ke Session 2.', p_queue_number)
    );
  elsif p_old_status = 'call_session_2' and p_new_status = 'session_2' then
    insert into public.notifications (candidate_id, target_role, type, priority, title, message)
    values (
      p_candidate_id, 'owner', 'directed', 'low',
      format('Kandidat %s masuk Session 2', p_queue_number),
      format('Kandidat %s sudah diarahkan ke Session 2', p_queue_number)
    );
  elsif p_old_status = 'session_2' and p_new_status = 'passed' then
    insert into public.notifications (candidate_id, target_role, type, priority, title, message)
    values (
      p_candidate_id, 'frontliner', 'decision', 'high',
      format('Kandidat %s LULUS', p_queue_number),
      format('Kandidat %s dinyatakan LULUS. Arahkan untuk briefing.', p_queue_number)
    );
  elsif p_old_status = 'session_2' and p_new_status = 'failed' then
    insert into public.notifications (candidate_id, target_role, type, priority, title, message)
    values (
      p_candidate_id, 'frontliner', 'decision', 'high',
      format('Kandidat %s GAGAL', p_queue_number),
      format('Kandidat %s dinyatakan TIDAK LULUS. Selesaikan proses.', p_queue_number)
    );
  end if;
end;
$$;

-- THE single write path for status changes
create or replace function public.transition_candidate_status(
  p_candidate_id uuid,
  p_new_status public.candidate_status,
  p_note text default null
)
returns public.candidates
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
  v_candidate public.candidates;
  v_allowed public.candidate_status[];
begin
  select role into v_role from public.users where id = auth.uid();
  if v_role is null then
    raise exception 'unauthorized';
  end if;

  select * into v_candidate
  from public.candidates
  where id = p_candidate_id
  for update;

  if not found then
    raise exception 'candidate_not_found';
  end if;

  v_allowed := public.allowed_transitions(v_role, v_candidate.current_status);
  if not (p_new_status = any(v_allowed)) then
    raise exception 'invalid_transition: % -> % not allowed for role %',
      v_candidate.current_status, p_new_status, v_role;
  end if;

  update public.candidates
  set current_status = p_new_status, updated_at = now()
  where id = p_candidate_id
    and current_status = v_candidate.current_status;

  if not found then
    raise exception 'concurrent_modification: candidate status was changed by another user';
  end if;

  insert into public.activity_logs (candidate_id, user_id, action, old_status, new_status, note)
  values (p_candidate_id, auth.uid(), 'status_change',
    v_candidate.current_status, p_new_status, p_note);

  perform public.insert_notification_for_transition(
    p_candidate_id, v_candidate.queue_number,
    v_candidate.current_status, p_new_status);

  return (select c from public.candidates c where id = p_candidate_id);
end;
$$;

-- Check-in: queue number + candidate + activity + notification
create or replace function public.check_in_candidate(
  p_full_name text,
  p_email text,
  p_phone text,
  p_position text,
  p_photo_url text,
  p_outlet_id uuid,
  p_notes text default null
)
returns public.candidates
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
  v_queuedate date;
  v_seq int;
  v_code text;
  v_candidate public.candidates;
begin
  select role into v_role from public.users where id = auth.uid();
  if v_role not in ('frontliner', 'admin_hr') then
    raise exception 'unauthorized: only frontliner and admin_hr can check in candidates';
  end if;

  v_queuedate := current_date;

  select code into v_code from public.outlets where id = p_outlet_id;
  if not found then
    v_code := '00';
  end if;

  insert into public.queue_counters (outlet_id, counter_date, last_number)
  values (p_outlet_id, v_queuedate, 1)
  on conflict (outlet_id, counter_date)
  do update set last_number = public.queue_counters.last_number + 1
  returning last_number into v_seq;

  insert into public.candidates (
    queue_number, full_name, email, phone, position,
    photo_url, notes, outlet_id, created_by
  ) values (
    format('%s-%s-%s', v_code, to_char(v_queuedate, 'YYMMDD'), lpad(v_seq::text, 3, '0')),
    p_full_name,
    nullif(p_email, ''),
    p_phone,
    p_position,
    p_photo_url,
    p_notes,
    p_outlet_id,
    auth.uid()
  )
  returning * into v_candidate;

  insert into public.activity_logs (candidate_id, user_id, action, note)
  values (v_candidate.id, auth.uid(), 'check_in', p_notes);

  insert into public.notifications (candidate_id, target_role, type, priority, title, message)
  values (
    v_candidate.id, 'interviewer_1', 'check_in', 'low',
    format('Kandidat baru: %s', v_candidate.queue_number),
    format('%s mendaftar untuk posisi %s', v_candidate.full_name, v_candidate.position)
  );

  return v_candidate;
end;
$$;

-- Mark notifications read for current user's role
create or replace function public.mark_notifications_read()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
begin
  select role into v_role from public.users where id = auth.uid();
  update public.notifications
  set read = true
  where target_role = v_role and read = false;
end;
$$;

-- Set user role (admin only)
create or replace function public.admin_set_user_role(
  p_email text,
  p_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
begin
  select role into v_role from public.users where id = auth.uid();
  if v_role != 'admin_hr' then
    raise exception 'unauthorized: only admin_hr can set roles';
  end if;

  update public.users
  set role = p_role, updated_at = now()
  where email = p_email;

  if not found then
    raise exception 'user_not_found: no user with email %', p_email;
  end if;
end;
$$;

-- Analytics summary
create or replace function public.analytics_summary(
  p_days int default 7
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
  v_result jsonb;
begin
  select role into v_role from public.users where id = auth.uid();
  if v_role not in ('owner', 'admin_hr') then
    raise exception 'unauthorized';
  end if;

  with today_stats as (
    select
      count(*) filter (where current_status = 'waiting') as waiting,
      count(*) filter (where current_status in ('call_session_1','session_1')) as in_session_1,
      count(*) filter (where current_status in ('call_session_2','session_2')) as in_session_2,
      count(*) filter (where current_status = 'passed') as passed,
      count(*) filter (where current_status = 'failed') as failed,
      count(*) as total_today,
      coalesce(avg(extract(epoch from (now() - arrival_time)) / 60)
        filter (where current_status not in ('passed','failed','finished')), 0)::numeric(10,1) as avg_wait_minutes
    from public.candidates
    where arrival_time::date = current_date
  ),
  daily as (
    select
      arrival_time::date as date,
      count(*) as count
    from public.candidates
    where arrival_time::date >= current_date - (p_days - 1)
    group by arrival_time::date
    order by arrival_time::date
  )
  select jsonb_build_object(
    'total_today', coalesce(total_today, 0),
    'waiting', coalesce(waiting, 0),
    'in_session_1', coalesce(in_session_1, 0),
    'in_session_2', coalesce(in_session_2, 0),
    'passed', coalesce(passed, 0),
    'failed', coalesce(failed, 0),
    'avg_wait_minutes', coalesce(avg_wait_minutes, 0),
    'daily_counts', coalesce((select jsonb_agg(jsonb_build_object('date', date, 'count', count)) from daily), '[]'::jsonb)
  )
  into v_result
  from today_stats;

  return v_result;
end;
$$;

-- ====================
-- PART 3: RLS
-- ====================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.outlets enable row level security;
alter table public.candidates enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.queue_counters enable row level security;

-- Base grants
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to authenticated;
grant execute on all functions in schema public to authenticated;

-- Revoke direct write access (all writes go through SECURITY DEFINER RPCs)
revoke insert, update, delete on public.candidates from authenticated;
revoke insert, update, delete on public.activity_logs from authenticated;
revoke insert, update, delete on public.notifications from authenticated;
revoke insert, update, delete on public.queue_counters from authenticated;
revoke insert, update, delete on public.users from authenticated;
revoke insert, update, delete on public.roles from authenticated;
revoke insert, update, delete on public.outlets from authenticated;

-- Read policies

create policy "users_select_all" on public.users
  for select to authenticated using (true);

create policy "roles_select_all" on public.roles
  for select to authenticated using (true);

create policy "outlets_select_all" on public.outlets
  for select to authenticated using (true);

create policy "candidates_select_all" on public.candidates
  for select to authenticated using (true);

create policy "activity_select_all" on public.activity_logs
  for select to authenticated using (true);

create policy "notifications_select_by_role" on public.notifications
  for select to authenticated
  using (
    target_role = (select role from public.users where id = auth.uid())
    or (select role from public.users where id = auth.uid()) = 'admin_hr'
  );

create policy "counters_none" on public.queue_counters
  for select to authenticated using (false);

-- ====================
-- PART 4: SEED DATA
-- ====================

-- Roles
insert into public.roles (name, permissions) values
  ('frontliner', jsonb_build_object(
    'check_in', true,
    'direct', true,
    'finish', true,
    'view_dashboard', true
  )),
  ('interviewer_1', jsonb_build_object(
    'call_session_1', true,
    'send_session_2', true,
    'view_dashboard', true
  )),
  ('owner', jsonb_build_object(
    'decide_pass', true,
    'decide_fail', true,
    'view_analytics', true,
    'view_dashboard', true
  )),
  ('admin_hr', jsonb_build_object(
    'manage_users', true,
    'manage_outlets', true,
    'check_in', true,
    'direct', true,
    'view_dashboard', true,
    'view_analytics', true,
    'export_data', true
  ))
on conflict (name) do update
set permissions = excluded.permissions;

-- Default outlet
insert into public.outlets (name, code) values
  ('Outlet Utama', 'P01')
on conflict (code) do nothing;
