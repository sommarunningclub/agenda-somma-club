-- ============================================================================
-- Agenda Somma Club — Enriquecimento de tracking (cliques)
-- Rode no SQL Editor do Supabase. Idempotente.
-- Habilita: região (país/cidade), referrer, UTM content/term, dispositivo e OS.
-- (Antes de rodar, o tracking básico — plataforma, origem, dispositivo via UA —
--  já funciona; estas colunas adicionam a camada geográfica e de origem completa.)
-- ============================================================================

alter table public.calendar_clicks add column if not exists utm_content text;
alter table public.calendar_clicks add column if not exists utm_term   text;
alter table public.calendar_clicks add column if not exists referrer   text;
alter table public.calendar_clicks add column if not exists country    text;
alter table public.calendar_clicks add column if not exists region     text;
alter table public.calendar_clicks add column if not exists city       text;
alter table public.calendar_clicks add column if not exists device     text;
alter table public.calendar_clicks add column if not exists os         text;

create index if not exists idx_clicks_country  on public.calendar_clicks (country);
create index if not exists idx_clicks_platform on public.calendar_clicks (platform);
