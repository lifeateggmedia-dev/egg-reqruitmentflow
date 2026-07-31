-- =============================================
-- 0005_outlets.sql
-- Seed: Easy Going Group outlets
-- =============================================

-- Clear existing seed outlet and re-insert all
delete from public.outlets;

insert into public.outlets (name, code) values
  ('Easy Going Group', 'EGG'),
  ('Back To Mie Kitchen', 'BMK'),
  ('Back To Mie Forest', 'BMF'),
  ('Taman Sari Forest', 'TSF'),
  ('Brotherhood Garage', 'BHG'),
  ('Healthopia Clinic & Pharmacy', 'HCP'),
  ('Easee and Co', 'EAC'),
  ('D''Kriuk', 'DKR');
