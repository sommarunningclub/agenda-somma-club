-- ============================================================================
-- Agenda Somma Club — SETUP COMPLETO (cole tudo no Supabase SQL Editor)
-- Ordem: tabelas -> RLS -> seed. Idempotente (pode rodar de novo).
-- ============================================================================

-- ============================================================================
-- Agenda Somma Club — Tabelas, índices e triggers
-- ============================================================================
-- Execute no SQL Editor do Supabase (ou via CLI). Idempotente onde possível.

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- calendars
-- ----------------------------------------------------------------------------
create table if not exists public.calendars (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  ics_path    text,
  is_public   boolean not null default true,
  color       text default '#ff2c03',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- event_categories
-- ----------------------------------------------------------------------------
create table if not exists public.event_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  color      text default '#ff2c03',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- calendar_events
-- ----------------------------------------------------------------------------
create table if not exists public.calendar_events (
  id               uuid primary key default gen_random_uuid(),
  calendar_id      uuid not null references public.calendars(id) on delete cascade,
  title            text not null,
  slug             text,
  summary          text,
  description      text,
  location_name    text,
  location_address text,
  location_url     text,
  start_datetime   timestamptz not null,
  end_datetime     timestamptz not null,
  timezone         text not null default 'America/Sao_Paulo',
  is_all_day       boolean not null default false,
  is_recurring     boolean not null default false,
  recurrence_rule  text,
  category_id      uuid references public.event_categories(id) on delete set null,
  partner_name     text,
  partner_logo_url text,
  checkin_url      text,
  cta_label        text,
  cta_url          text,
  image_url        text,
  status           text not null default 'draft'
                   check (status in ('draft','published','paused','cancelled','archived')),
  visibility       text not null default 'public'
                   check (visibility in ('public','unlisted','private')),
  reminder_24h     boolean not null default true,
  reminder_2h      boolean not null default false,
  reminder_30m     boolean not null default true,
  custom_reminders jsonb not null default '[]'::jsonb,
  uid              text unique,
  sequence         integer not null default 0,
  published_at     timestamptz,
  created_by       text,
  updated_by       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

-- ----------------------------------------------------------------------------
-- calendar_leads
-- ----------------------------------------------------------------------------
create table if not exists public.calendar_leads (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  email             text not null,
  phone             text,
  platform          text,
  calendar_slug     text default 'somma',
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_content       text,
  utm_term          text,
  lgpd_accepted     boolean not null default false,
  lgpd_accepted_at  timestamptz,
  created_at        timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- calendar_clicks
-- ----------------------------------------------------------------------------
create table if not exists public.calendar_clicks (
  id            uuid primary key default gen_random_uuid(),
  calendar_slug text default 'somma',
  platform      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  user_agent    text,
  ip_hash       text,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Índices
-- ----------------------------------------------------------------------------
create index if not exists idx_events_calendar_id   on public.calendar_events (calendar_id);
create index if not exists idx_events_status        on public.calendar_events (status);
create index if not exists idx_events_start         on public.calendar_events (start_datetime);
create index if not exists idx_events_slug          on public.calendar_events (slug);
create index if not exists idx_events_uid           on public.calendar_events (uid);
create index if not exists idx_events_category      on public.calendar_events (category_id);
create index if not exists idx_events_feed          on public.calendar_events (calendar_id, status, visibility) where deleted_at is null;
create index if not exists idx_leads_created_at     on public.calendar_leads (created_at);
create index if not exists idx_clicks_created_at    on public.calendar_clicks (created_at);

-- ----------------------------------------------------------------------------
-- Triggers
-- ----------------------------------------------------------------------------

-- updated_at automático (calendars, categories)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_calendars_updated_at on public.calendars;
create trigger trg_calendars_updated_at
  before update on public.calendars
  for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.event_categories;
create trigger trg_categories_updated_at
  before update on public.event_categories
  for each row execute function public.set_updated_at();

-- UID estável: gerado uma única vez no insert e nunca alterado depois.
create or replace function public.set_event_uid()
returns trigger language plpgsql as $$
begin
  if new.uid is null or new.uid = '' then
    new.uid := 'evt-' || new.id::text || '@sommaclub.com.br';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_events_uid on public.calendar_events;
create trigger trg_events_uid
  before insert on public.calendar_events
  for each row execute function public.set_event_uid();

-- updated_at + incremento de SEQUENCE quando um evento PUBLICADO muda + published_at.
create or replace function public.bump_event_on_change()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  -- nunca permitir alteração do uid após criado
  new.uid = old.uid;

  -- marca published_at na primeira publicação
  if new.status = 'published' and old.status is distinct from 'published' then
    new.published_at = coalesce(new.published_at, now());
  end if;

  -- incrementa SEQUENCE se o evento já estava publicado e algo relevante mudou
  if old.status = 'published' and (
       new.start_datetime   is distinct from old.start_datetime
    or new.end_datetime     is distinct from old.end_datetime
    or new.title            is distinct from old.title
    or new.summary          is distinct from old.summary
    or new.description      is distinct from old.description
    or new.location_name    is distinct from old.location_name
    or new.location_address is distinct from old.location_address
    or new.location_url     is distinct from old.location_url
    or new.recurrence_rule  is distinct from old.recurrence_rule
    or new.is_recurring     is distinct from old.is_recurring
    or new.is_all_day       is distinct from old.is_all_day
    or new.timezone         is distinct from old.timezone
    or new.status           is distinct from old.status
  ) then
    new.sequence = old.sequence + 1;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_events_bump on public.calendar_events;
create trigger trg_events_bump
  before update on public.calendar_events
  for each row execute function public.bump_event_on_change();


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


-- ============================================================================
-- Agenda Somma Club — Seeds (calendários, categorias e eventos de teste)
-- ============================================================================
-- Idempotente: pode rodar mais de uma vez sem duplicar.
-- As datas dos eventos são RELATIVAS ao momento em que você roda o seed.

-- ----------------------------------------------------------------------------
-- Calendários
-- ----------------------------------------------------------------------------
insert into public.calendars (name, slug, description, ics_path, is_public, color) values
  ('Agenda Somma Club',        'somma',      'Agenda pública da comunidade Somma Club.',           '/api/calendar/somma.ics',      true, '#ff2c03'),
  ('Agenda Assessoria Somma',  'assessoria', 'Agenda da assessoria esportiva Somma (alunos).',     '/api/calendar/assessoria.ics', true, '#111111'),
  ('Agenda Parceiros Somma',   'parceiros',  'Ativações comerciais e eventos com parceiros Somma.', '/api/calendar/parceiros.ics',  true, '#ff4d35')
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description,
      ics_path = excluded.ics_path,
      color = excluded.color;

-- ----------------------------------------------------------------------------
-- Categorias
-- ----------------------------------------------------------------------------
insert into public.event_categories (name, slug, color) values
  ('Encontro oficial',      'encontro-oficial',     '#ff2c03'),
  ('Treino',                'treino',               '#2563eb'),
  ('Corrida em Brasília',   'corrida-em-brasilia',  '#16a34a'),
  ('Evento especial',       'evento-especial',      '#9333ea'),
  ('Ativação de parceiro',  'ativacao-de-parceiro', '#ea580c'),
  ('Assessoria',            'assessoria',           '#0891b2'),
  ('Loja Somma',            'loja-somma',           '#db2777'),
  ('Lista VIP',             'lista-vip',            '#ca8a04'),
  ('Prova',                 'prova',                '#dc2626'),
  ('Comunidade',            'comunidade',           '#0d9488')
on conflict (slug) do update set name = excluded.name, color = excluded.color;

-- ----------------------------------------------------------------------------
-- Evento 1 — Encontro oficial de sábado (próximo sábado, 07:00–09:00)
-- ----------------------------------------------------------------------------
insert into public.calendar_events (
  calendar_id, category_id, title, summary, description,
  location_name, location_address,
  start_datetime, end_datetime, timezone,
  status, visibility, reminder_24h, reminder_2h, reminder_30m,
  checkin_url, cta_label, cta_url, published_at
)
select
  (select id from public.calendars where slug = 'somma'),
  (select id from public.event_categories where slug = 'encontro-oficial'),
  'Somma Club | Encontro oficial de sábado',
  'Encontro oficial do Somma Club no Parque da Cidade.',
  E'Encontro oficial do Somma Club. Chegue com antecedência, faça seu check-in e participe da maior comunidade de corrida do DF.\n\nCheck-in: https://sommaclub.com.br\nAssessoria: https://sommaclub.com.br/assessoria\nLoja: https://loja.sommaclub.com.br',
  'Parque da Cidade Sarah Kubitschek',
  'Estacionamento 10, Brasília - DF',
  ((current_date + (((6 - extract(dow from current_date)::int) + 7) % 7)) + time '07:00') at time zone 'America/Sao_Paulo',
  ((current_date + (((6 - extract(dow from current_date)::int) + 7) % 7)) + time '09:00') at time zone 'America/Sao_Paulo',
  'America/Sao_Paulo',
  'published', 'public', true, true, true,
  'https://sommaclub.com.br', 'Acessar o Somma Club', 'https://sommaclub.com.br', now()
where not exists (
  select 1 from public.calendar_events where title = 'Somma Club | Encontro oficial de sábado'
);

-- ----------------------------------------------------------------------------
-- Evento 2 — Treino especial da comunidade (+3 dias, 19:00–20:00)
-- ----------------------------------------------------------------------------
insert into public.calendar_events (
  calendar_id, category_id, title, summary, description,
  location_name, start_datetime, end_datetime, timezone,
  status, visibility, reminder_24h, reminder_2h, reminder_30m, published_at
)
select
  (select id from public.calendars where slug = 'somma'),
  (select id from public.event_categories where slug = 'treino'),
  'Somma Club | Treino especial da comunidade',
  'Treino especial aberto à comunidade.',
  'Treino especial da comunidade Somma. Vem treinar com a gente!',
  'Brasília - DF',
  ((current_date + 3) + time '19:00') at time zone 'America/Sao_Paulo',
  ((current_date + 3) + time '20:00') at time zone 'America/Sao_Paulo',
  'America/Sao_Paulo',
  'published', 'public', true, false, true, now()
where not exists (
  select 1 from public.calendar_events where title = 'Somma Club | Treino especial da comunidade'
);

-- ----------------------------------------------------------------------------
-- Evento 3 — Corrida em Brasília (+10 dias, 06:30–09:30)
-- ----------------------------------------------------------------------------
insert into public.calendar_events (
  calendar_id, category_id, title, summary, description,
  location_name, start_datetime, end_datetime, timezone,
  status, visibility, reminder_24h, reminder_2h, reminder_30m, published_at
)
select
  (select id from public.calendars where slug = 'somma'),
  (select id from public.event_categories where slug = 'corrida-em-brasilia'),
  'Somma Club | Corrida em Brasília',
  'Corrida coletiva pelas ruas de Brasília.',
  'Corrida em Brasília com a comunidade Somma. Distâncias para todos os níveis.',
  'Brasília - DF',
  ((current_date + 10) + time '06:30') at time zone 'America/Sao_Paulo',
  ((current_date + 10) + time '09:30') at time zone 'America/Sao_Paulo',
  'America/Sao_Paulo',
  'published', 'public', true, true, true, now()
where not exists (
  select 1 from public.calendar_events where title = 'Somma Club | Corrida em Brasília'
);

-- ----------------------------------------------------------------------------
-- Evento 4 — Ativação com parceiro Evolve (+14 dias, 07:00–10:00)
-- ----------------------------------------------------------------------------
insert into public.calendar_events (
  calendar_id, category_id, title, summary, description,
  location_name, location_address, start_datetime, end_datetime, timezone,
  status, visibility, reminder_24h, reminder_2h, reminder_30m,
  partner_name, published_at
)
select
  (select id from public.calendars where slug = 'somma'),
  (select id from public.event_categories where slug = 'ativacao-de-parceiro'),
  'Somma Club | Ativação com parceiro',
  'Ativação especial com o parceiro Evolve.',
  'Ativação com o parceiro Evolve no Parque da Cidade. Experiências, brindes e muito mais para a comunidade Somma.',
  'Parque da Cidade Sarah Kubitschek',
  'Brasília - DF',
  ((current_date + 14) + time '07:00') at time zone 'America/Sao_Paulo',
  ((current_date + 14) + time '10:00') at time zone 'America/Sao_Paulo',
  'America/Sao_Paulo',
  'published', 'public', true, true, true,
  'Evolve', now()
where not exists (
  select 1 from public.calendar_events where title = 'Somma Club | Ativação com parceiro'
);
