-- =============================================
-- 0003_rls.sql
-- Row Level Security: grants + policies
-- All writes go through SECURITY DEFINER RPCs
-- =============================================

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

-- =============================================
-- Read policies
-- =============================================

-- Users: everyone authenticated can read
create policy "users_select_all" on public.users
  for select to authenticated using (true);

-- Roles: everyone authenticated can read
create policy "roles_select_all" on public.roles
  for select to authenticated using (true);

-- Outlets: everyone authenticated can read
create policy "outlets_select_all" on public.outlets
  for select to authenticated using (true);

-- Candidates: everyone authenticated can read
create policy "candidates_select_all" on public.candidates
  for select to authenticated using (true);

-- Activity logs: everyone authenticated can read
create policy "activity_select_all" on public.activity_logs
  for select to authenticated using (true);

-- Notifications: filtered by current user's role (admin sees all)
create policy "notifications_select_by_role" on public.notifications
  for select to authenticated
  using (
    target_role = (select role from public.users where id = auth.uid())
    or (select role from public.users where id = auth.uid()) = 'admin_hr'
  );

-- Queue counters: nobody reads directly (internal to RPCs)
create policy "counters_none" on public.queue_counters
  for select to authenticated using (false);
