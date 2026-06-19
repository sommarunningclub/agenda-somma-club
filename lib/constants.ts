/**
 * Constantes globais da Agenda Somma Club.
 * Mantém marca, calendários, categorias e helpers de URL em um só lugar.
 */

export const BRAND = {
  name: 'Agenda Somma Club',
  org: 'Somma Club',
  orange: '#ff2c03',
  orangeLight: '#ff4d35',
  orangeDark: '#cc2402',
  black: '#0a0a0a',
} as const

/** Resolve a URL pública do site, priorizando a env de produção. */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (explicit) return explicit
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`
  return 'http://localhost:3000'
}

/** Host sem protocolo (usado para montar webcal://). */
export function getSiteHost(): string {
  return getSiteUrl().replace(/^https?:\/\//, '')
}

export type CalendarSlug = 'somma' | 'assessoria' | 'parceiros' | 'corridas-df'

export interface CalendarMeta {
  slug: CalendarSlug
  name: string
  description: string
  /** Nome exibido no app de calendário (X-WR-CALNAME). */
  calName: string
  calDesc: string
  color: string
  isPublic: boolean
}

export const CALENDARS: Record<CalendarSlug, CalendarMeta> = {
  somma: {
    slug: 'somma',
    name: 'Agenda Somma Club',
    description: 'Agenda pública da comunidade Somma Club.',
    calName: 'Agenda Somma Club',
    calDesc: 'Encontros, treinos, corridas e ativações oficiais do Somma Club',
    color: '#ff2c03',
    isPublic: true,
  },
  assessoria: {
    slug: 'assessoria',
    name: 'Agenda Assessoria Somma',
    description: 'Agenda da assessoria esportiva Somma (alunos).',
    calName: 'Agenda Assessoria Somma',
    calDesc: 'Treinos e eventos da assessoria esportiva Somma',
    color: '#111111',
    isPublic: true,
  },
  parceiros: {
    slug: 'parceiros',
    name: 'Agenda Parceiros Somma',
    description: 'Ativações comerciais e eventos com parceiros Somma.',
    calName: 'Agenda Parceiros Somma',
    calDesc: 'Ativações e experiências com parceiros do Somma Club',
    color: '#ff4d35',
    isPublic: true,
  },
  'corridas-df': {
    slug: 'corridas-df',
    name: 'Agenda Corridas DF',
    description: 'Principais corridas de rua do Distrito Federal (eventos externos).',
    calName: 'Corridas em Brasília · DF',
    calDesc: 'Principais corridas de rua do Distrito Federal',
    color: '#16a34a',
    isPublic: true,
  },
}

export const CALENDAR_SLUGS = Object.keys(CALENDARS) as CalendarSlug[]

/** Categorias iniciais (espelham o seed do Supabase). */
export const CATEGORY_SEED = [
  { name: 'Encontro oficial', slug: 'encontro-oficial', color: '#ff2c03' },
  { name: 'Treino', slug: 'treino', color: '#2563eb' },
  { name: 'Corrida em Brasília', slug: 'corrida-em-brasilia', color: '#16a34a' },
  { name: 'Evento especial', slug: 'evento-especial', color: '#9333ea' },
  { name: 'Ativação de parceiro', slug: 'ativacao-de-parceiro', color: '#ea580c' },
  { name: 'Assessoria', slug: 'assessoria', color: '#0891b2' },
  { name: 'Loja Somma', slug: 'loja-somma', color: '#db2777' },
  { name: 'Lista VIP', slug: 'lista-vip', color: '#ca8a04' },
  { name: 'Prova', slug: 'prova', color: '#dc2626' },
  { name: 'Comunidade', slug: 'comunidade', color: '#0d9488' },
] as const

export const EVENT_STATUSES = [
  'draft',
  'published',
  'paused',
  'cancelled',
  'archived',
] as const
export type EventStatus = (typeof EVENT_STATUSES)[number]

export const STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  paused: 'Pausado',
  cancelled: 'Cancelado',
  archived: 'Arquivado',
}

export const PLATFORMS = ['apple', 'google', 'outlook', 'other'] as const
export type Platform = (typeof PLATFORMS)[number]

export const PLATFORM_LABELS: Record<Platform, string> = {
  apple: 'iPhone / Mac',
  google: 'Google Calendar',
  outlook: 'Outlook',
  other: 'Outro',
}

export const DEFAULT_TIMEZONE = 'America/Sao_Paulo'
