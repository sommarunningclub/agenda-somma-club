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
