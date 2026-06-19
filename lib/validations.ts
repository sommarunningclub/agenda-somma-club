import { z } from 'zod'
import { EVENT_STATUSES, PLATFORMS } from './constants'

/** Schema do lead capturado na landing antes da assinatura. */
export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(120),
  email: z.string().trim().toLowerCase().email('E-mail inválido.').max(160),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  platform: z.enum(PLATFORMS).optional(),
  calendar_slug: z.string().trim().max(40).default('somma'),
  lgpd_accepted: z
    .boolean()
    .refine((v) => v === true, 'É necessário aceitar a política de privacidade.'),
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(120).optional(),
  utm_content: z.string().trim().max(120).optional(),
  utm_term: z.string().trim().max(120).optional(),
  // Honeypot anti-spam: deve vir vazio.
  company: z.string().max(0).optional().or(z.literal('')),
})

export type LeadInput = z.infer<typeof leadSchema>

/** Schema do registro de clique nos botões de assinatura. */
export const clickSchema = z.object({
  calendar_slug: z.string().trim().max(40).default('somma'),
  platform: z.enum(PLATFORMS),
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(120).optional(),
  utm_content: z.string().trim().max(200).optional(),
  utm_term: z.string().trim().max(200).optional(),
  referrer: z.string().trim().max(400).optional(),
})

export type ClickInput = z.infer<typeof clickSchema>

const optionalUrl = z
  .string()
  .trim()
  .url('URL inválida.')
  .max(500)
  .optional()
  .or(z.literal(''))
  .transform((v) => (v ? v : null))

const optionalText = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null))

/** Schema do formulário de evento no admin. */
export const eventSchema = z
  .object({
    calendar_id: z.string().uuid('Selecione um calendário.'),
    title: z.string().trim().min(3, 'Título muito curto.').max(200),
    slug: optionalText(200),
    summary: optionalText(300),
    description: optionalText(5000),
    location_name: optionalText(200),
    location_address: optionalText(300),
    location_url: optionalUrl,
    start_datetime: z.string().min(1, 'Informe o início.'),
    end_datetime: z.string().min(1, 'Informe o término.'),
    timezone: z.string().default('America/Sao_Paulo'),
    is_all_day: z.boolean().default(false),
    is_recurring: z.boolean().default(false),
    recurrence_rule: optionalText(300),
    category_id: z
      .string()
      .uuid()
      .optional()
      .or(z.literal(''))
      .transform((v) => (v ? v : null)),
    partner_name: optionalText(160),
    partner_logo_url: optionalUrl,
    checkin_url: optionalUrl,
    cta_label: optionalText(80),
    cta_url: optionalUrl,
    image_url: optionalUrl,
    status: z.enum(EVENT_STATUSES).default('draft'),
    visibility: z.enum(['public', 'unlisted', 'private']).default('public'),
    show_in_main: z.boolean().default(false),
    reminder_24h: z.boolean().default(true),
    reminder_2h: z.boolean().default(false),
    reminder_30m: z.boolean().default(true),
    custom_reminders: z.array(z.number().int().min(0).max(43200)).default([]),
  })
  .refine(
    (data) => new Date(data.end_datetime) >= new Date(data.start_datetime),
    { message: 'O término deve ser depois do início.', path: ['end_datetime'] },
  )

export type EventInput = z.infer<typeof eventSchema>
