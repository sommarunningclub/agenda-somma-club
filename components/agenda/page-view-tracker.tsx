'use client'

import { useEffect } from 'react'
import { track } from '@/lib/tracking'

/** Dispara calendar_page_view uma vez ao montar a landing. */
export function PageViewTracker() {
  useEffect(() => {
    track('calendar_page_view', { page: 'agenda' })
  }, [])
  return null
}
