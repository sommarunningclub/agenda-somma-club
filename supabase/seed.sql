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
