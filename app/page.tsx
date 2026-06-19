import { permanentRedirect } from 'next/navigation'

export default function Home() {
  // 308 permanente: concentra a autoridade de SEO na URL canônica /agenda.
  permanentRedirect('/agenda')
}
