-- =============================================
-- 0006_pending_status.sql
-- Add 'pending' status for Session 2 consideration
-- =============================================

-- Add pending to candidate_status enum
alter type public.candidate_status add value if not exists 'pending';

-- Update allowed_transitions to support pending
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
      array['waiting','call_session_1','session_1','call_session_2','session_2','pending','passed','failed','finished']::public.candidate_status[]

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
        when 'session_2' then array['pending','passed','failed']::public.candidate_status[]
        when 'pending' then array['passed','failed']::public.candidate_status[]
        else '{}'::public.candidate_status[]
      end
  end;
$$;

-- Update notification helper for pending transitions
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
  elsif p_old_status = 'session_2' and p_new_status = 'pending' then
    insert into public.notifications (candidate_id, target_role, type, priority, title, message)
    values (
      p_candidate_id, 'frontliner', 'decision', 'medium',
      format('Kandidat %s DIPERTIMBANGKAN', p_queue_number),
      format('Kandidat %s masuk daftar pertimbangan.', p_queue_number)
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
  elsif p_old_status = 'pending' and p_new_status = 'passed' then
    insert into public.notifications (candidate_id, target_role, type, priority, title, message)
    values (
      p_candidate_id, 'frontliner', 'decision', 'high',
      format('Kandidat %s LULUS (dari pertimbangan)', p_queue_number),
      format('Kandidat %s yang dipertimbangkan dinyatakan LULUS.', p_queue_number)
    );
  elsif p_old_status = 'pending' and p_new_status = 'failed' then
    insert into public.notifications (candidate_id, target_role, type, priority, title, message)
    values (
      p_candidate_id, 'frontliner', 'decision', 'high',
      format('Kandidat %s GAGAL (dari pertimbangan)', p_queue_number),
      format('Kandidat %s yang dipertimbangkan dinyatakan TIDAK LULUS.', p_queue_number)
    );
  end if;
end;
$$;
