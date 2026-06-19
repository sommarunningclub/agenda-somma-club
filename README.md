# Agenda Somma Club

Landing page de **calendário assinável** + **painel admin** para a comunidade de corrida Somma Club (Brasília/DF).

Qualquer pessoa assina a agenda **uma única vez** (iPhone/Mac, Google Calendar, Android ou Outlook) e passa a receber automaticamente encontros, treinos, corridas, eventos especiais e ativações — com lembretes. O admin cria/edita/publica eventos **sem mexer em código** e o feed `.ics` é gerado dinamicamente a partir do Supabase.

---

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v3** + **shadcn/ui** (estilo `new-york`) — espelha o site oficial do Somma
- **Supabase** (Postgres + RLS) para eventos, leads e cliques
- **Gerador de ICS próprio** (RFC 5545), sem dependências, com testes (**Vitest**)
- **Zod** (validação), **react-hook-form** (admin), **sonner** (toasts), **lucide-react** (ícones)
- Pronto para **Vercel** + **GTM/Meta Pixel** (opcionais)

---

## Estrutura

```
app/
  agenda/                     # Landing pública (/agenda)
  admin/
    login/                    # Login do admin (cookie HMAC)
    agenda/                   # Painel (guarded) + eventos (lista/novo/editar) + server actions
  api/
    calendar/[feed]/          # /api/calendar/somma.ics | assessoria.ics | parceiros.ics
    calendar/track/           # Registra cliques de assinatura
    leads/calendar/           # Captura de leads
components/
  agenda/                     # Seções da landing
  admin/                      # UI do painel
  ui/                         # Primitivos shadcn
lib/
  ics.ts (+ ics.test.ts)      # Gerador de iCalendar (núcleo testado)
  calendar-data.ts            # Acesso a dados (Supabase)
  supabase.ts, auth.ts, validations.ts, constants.ts, format.ts, subscribe-links.ts, tracking.ts
supabase/
  migrations/create_calendar_tables.sql
  migrations/create_calendar_rls.sql
  seed.sql
```

---

## Rotas

| Rota | Descrição |
|---|---|
| `/agenda` | Landing pública |
| `/admin/login` | Login do admin |
| `/admin/agenda` | Painel (dashboard) |
| `/admin/agenda/events` | Lista de eventos (filtros) |
| `/admin/agenda/events/new` | Criar evento |
| `/admin/agenda/events/[id]` | Editar evento |
| `/api/calendar/somma.ics` | Feed ICS da Agenda Somma Club (pública) |
| `/api/calendar/assessoria.ics` | Feed ICS da Assessoria |
| `/api/calendar/parceiros.ics` | Feed ICS de Parceiros |
| `/api/calendar/track` | POST de clique de assinatura |
| `/api/leads/calendar` | POST de lead |

---

## 1) Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

Abra http://localhost:3000 (redireciona para `/agenda`).

> Sem Supabase configurado a landing usa **eventos de exemplo** e o `.ics` retorna um calendário **válido e vazio** — ótimo para ver o layout, mas para teste real configure o Supabase abaixo.

---

## 2) Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → API** copie `URL`, `anon key` e `service_role key` para o `.env.local`.
3. No **SQL Editor**, rode os arquivos **nesta ordem**:
   1. `supabase/migrations/create_calendar_tables.sql`
   2. `supabase/migrations/create_calendar_rls.sql`
   3. `supabase/seed.sql` *(cria os 3 calendários, as categorias e 4 eventos de teste com datas relativas a hoje)*

Ou via CLI:

```bash
supabase db execute --file supabase/migrations/create_calendar_tables.sql
supabase db execute --file supabase/migrations/create_calendar_rls.sql
supabase db execute --file supabase/seed.sql
```

---

## 3) Criar o primeiro usuário admin

Não há cadastro de usuários — o admin é protegido por **senha + cookie assinado (HMAC)**. Para liberar o acesso, defina no `.env.local` (e na Vercel):

```bash
AGENDA_ADMIN_PASSWORD=uma-senha-forte
AGENDA_SESSION_SECRET=$(openssl rand -base64 32)
```

Acesse `/admin/login`, informe a senha e pronto. A sessão dura 12h.

---

## Variáveis de ambiente

| Variável | Onde | Obrigatória | Função |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | client/server | recomendada | Monta links webcal/Google/Outlook e canonical |
| `NEXT_PUBLIC_SUPABASE_URL` | client/server | sim* | URL do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client/server | sim* | Chave pública |
| `SUPABASE_URL` | server | sim* | URL (server) |
| `SUPABASE_SERVICE_ROLE_KEY` | server | sim* | Escrita do admin + geração do ICS (nunca no client) |
| `AGENDA_ADMIN_PASSWORD` | server | sim (admin) | Senha do painel |
| `AGENDA_SESSION_SECRET` | server | recomendada | Assina o cookie de sessão |
| `NEXT_PUBLIC_GTM_ID` | client | não | GTM |
| `NEXT_PUBLIC_META_PIXEL_ID` | client | não | Meta Pixel |

\* Necessárias para o feed real, leads e admin.

---

## Como funciona o calendário (.ics)

- O feed é gerado **dinamicamente** a partir dos eventos do Supabase, com `Content-Type: text/calendar; charset=utf-8`.
- Cada evento tem **UID estável** (nunca muda na edição → sem duplicação), `DTSTAMP`, `DTSTART/DTEND` com `TZID=America/Sao_Paulo`, `SUMMARY`, `DESCRIPTION` (com links de check-in/CTA/local), `LOCATION`, `URL`, `LAST-MODIFIED`, `SEQUENCE`, `STATUS` e `VALARM` (lembretes).
- **Editou um evento publicado?** O trigger `bump_event_on_change` atualiza `updated_at` e **incrementa `SEQUENCE`** → os apps de calendário entendem que é uma atualização.
- **Remover de quem já assinou:** mude o status para **`cancelled`**. O evento sai com `STATUS:CANCELLED` e os apps removem.
- **Recorrência:** use o campo RRULE no admin (ex.: `FREQ=WEEKLY;BYDAY=SA`).
- **Lembretes:** 24h, 2h e 30min por evento (+ minutos extras customizados).
- Só entram no feed eventos `published` (ou `cancelled`), `visibility = public` e não deletados.

### Links de assinatura
- **iPhone/Mac:** `webcal://SEU_DOMINIO/api/calendar/somma.ics`
- **Google:** `https://calendar.google.com/calendar/render?cid=https%3A%2F%2FSEU_DOMINIO%2Fapi%2Fcalendar%2Fsomma.ics`
- **Outlook:** `https://outlook.office.com/calendar/0/addfromweb?url=https%3A%2F%2FSEU_DOMINIO%2Fapi%2Fcalendar%2Fsomma.ics`

Os botões da landing montam isso automaticamente a partir de `NEXT_PUBLIC_SITE_URL`.

---

## 4) Deploy na Vercel

1. Suba o repositório e importe na Vercel (framework Next.js detectado).
2. Em **Settings → Environment Variables**, adicione todas as variáveis do `.env.example`.
3. **Importante:** defina `NEXT_PUBLIC_SITE_URL` com a URL do deploy (Preview ou Produção).
4. Deploy.

---

## 5) Testar no telefone (passo a passo)

> ⚠️ Calendários externos (Apple/Google/Outlook) **não conseguem assinar `localhost`**. Para o teste real, use uma URL pública (Vercel Preview).

1. Rode local (`npm run dev`) só para conferir o layout.
2. Faça um **deploy de Preview** na Vercel.
3. Configure `NEXT_PUBLIC_SITE_URL` com a URL da Vercel e refaça o deploy.
4. Abra `/agenda` **no celular**.
5. Toque em **iPhone/Mac** ou **Google Calendar**.
6. Confirme a assinatura na tela do sistema/app.
7. Verifique se os eventos de seed aparecem no seu calendário.
8. No `/admin/agenda`, **edite um evento** (mude horário/título) e salve.
9. Aguarde o app de calendário **sincronizar**.
10. Veja a atualização aparecer **sem reassinar**.

> A sincronização **não é instantânea**: Apple, Google e Outlook têm intervalos próprios de atualização (de minutos a algumas horas). Isso é comportamento do app de calendário, não do feed.

---

## Eventos de growth (GTM / Meta Pixel)

Disparados via `dataLayer` e `fbq` (se os IDs existirem):
`calendar_page_view`, `calendar_lead_submit`, `calendar_add_click`, `calendar_platform_select`, `calendar_admin_event_create`, `calendar_admin_event_publish`.

---

## Testes

```bash
npm test          # roda os testes do gerador ICS (Vitest)
npm run test:watch
```

Cobrem escape, dobra de linha (75 octetos / UTF-8), fuso de São Paulo, `VALARM`, `RRULE`, UID estável, `SEQUENCE`, `STATUS` e o calendário completo (cabeçalhos + CRLF + VTIMEZONE).

---

## Segurança

- **RLS** no Supabase: leitura pública só de eventos `published`/`public`/não deletados; leads e cliques só permitem `INSERT` (com validação); escrita de eventos só pela `service_role` (server).
- `service_role` **nunca** vai ao client.
- Admin protegido por middleware + verificação HMAC no layout e em todas as server actions.
- Formulário de lead com **honeypot** + validação Zod; IP armazenado apenas como **hash**.

---

## Próximos passos sugeridos

- Página pública dedicada por evento (`/agenda/[slug]`) com OG dinâmico.
- Agendas de **Assessoria** e **Parceiros** com regras próprias (hoje compartilham a infra e já têm endpoint).
- E-mail de confirmação ao lead (Resend já é usado no ecossistema Somma).
- Editor visual de RRULE (em vez de texto).
- Migrar admin para Supabase Auth multiusuário, se necessário.
