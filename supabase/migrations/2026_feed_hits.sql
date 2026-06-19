-- ============================================================================
-- Agenda Somma Club — Rastreamento de ASSINATURAS (buscas do feed .ics)
-- Rode no SQL Editor do Supabase. Idempotente.
-- Cada vez que um app de calendário busca o feed, registramos um "hit".
--  - Apple (iPhone/Mac): busca por dispositivo  -> contável por dispositivo.
--  - Google/Outlook: busca centralizada (servidor) -> só indica que está ativo.
-- Não guardamos IP aberto (apenas hash).
-- ============================================================================

create table if not exists public.calendar_feed_hits (
  id            uuid primary key default gen_random_uuid(),
  calendar_slug text,
  client        text,        -- apple | google | microsoft | other
  ip_hash       text,
  user_agent    text,
  country       text,
  region        text,
  city          text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_feed_hits_created   on public.calendar_feed_hits (created_at);
create index if not exists idx_feed_hits_calendar  on public.calendar_feed_hits (calendar_slug);
create index if not exists idx_feed_hits_client    on public.calendar_feed_hits (client);
create index if not exists idx_feed_hits_iphash    on public.calendar_feed_hits (ip_hash);

-- Só a service role (servidor) escreve/lê. Sem políticas anon.
alter table public.calendar_feed_hits enable row level security;
