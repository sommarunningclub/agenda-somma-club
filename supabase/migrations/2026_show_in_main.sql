-- ============================================================================
-- Agenda Somma Club — "Aparecer na agenda interna (Somma)"
-- Rode no SQL Editor do Supabase. Idempotente.
-- Permite ligar eventos externos (ex.: Corridas DF) também no feed/landing do Somma.
-- (O código é resiliente: antes de rodar isto, nada quebra — o toggle só passa a
--  funcionar depois desta migration.)
-- ============================================================================

alter table public.calendar_events
  add column if not exists show_in_main boolean not null default false;

create index if not exists idx_events_show_in_main
  on public.calendar_events (show_in_main)
  where show_in_main = true;
