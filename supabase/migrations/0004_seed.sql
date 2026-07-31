-- =============================================
-- 0004_seed.sql
-- Seed data: roles + default outlet
-- =============================================

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
