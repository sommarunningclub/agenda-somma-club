-- ============================================================================
-- Agenda Somma Club — Row Level Security (RLS)
-- ============================================================================
-- Regras:
--  * Eventos PUBLICADOS e públicos são legíveis por qualquer um (anon).
--  * Rascunho / pausado / cancelado / arquivado / deletado NÃO aparecem para anon.
--  * Calendários públicos e categorias são legíveis por anon.
--  * Leads e cliques podem ser INSERIDOS por anon (com validação básica), mas não lidos.
--  * Escrita em eventos/calendários/categorias: somente service role (bypassa RLS).
--
-- O endpoint .ics roda no servidor com a service role, então enxerga também
-- eventos 'cancelled' (para propagar a remoção via STATUS:CANCELLED).

alter table public.calendars       enable row level security;
alter table public.event_categories enable row level security;
alter table public.calendar_events enable row level security;
alter table public.calendar_leads  enable row level security;
alter table public.calendar_clicks enable row level security;

-- ----------------------------------------------------------------------------
-- calendars: leitura pública dos calendários públicos
-- ----------------------------------------------------------------------------
drop policy if exists "calendars_public_read" on public.calendars;
create policy "calendars_public_read"
  on public.calendars for select
  to anon, authenticated
  using (is_public = true);

-- ----------------------------------------------------------------------------
-- event_categories: leitura pública
-- ----------------------------------------------------------------------------
drop policy if exists "categories_public_read" on public.event_categories;
create policy "categories_public_read"
  on public.event_categories for select
  to anon, authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- calendar_events: leitura pública somente de publicados/públicos/não deletados
-- ----------------------------------------------------------------------------
drop policy if exists "events_public_read" on public.calendar_events;
create policy "events_public_read"
  on public.calendar_events for select
  to anon, authenticated
  using (
    status = 'published'
    and visibility = 'public'
    and deleted_at is null
  );

-- ----------------------------------------------------------------------------
-- calendar_leads: anon pode inserir (com validação mínima), ninguém anon lê
-- ----------------------------------------------------------------------------
drop policy if exists "leads_public_insert" on public.calendar_leads;
create policy "leads_public_insert"
  on public.calendar_leads for insert
  to anon, authenticated
  with check (
    char_length(name) between 2 and 120
    and email like '%_@_%.__%'
    and lgpd_accepted = true
  );

-- ----------------------------------------------------------------------------
-- calendar_clicks: anon pode inserir
-- ----------------------------------------------------------------------------
drop policy if exists "clicks_public_insert" on public.calendar_clicks;
create policy "clicks_public_insert"
  on public.calendar_clicks for insert
  to anon, authenticated
  with check (char_length(coalesce(platform, '')) <= 40);
