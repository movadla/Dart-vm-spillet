import type { Metadata } from 'next'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'

// Siden er en klientkomponent og kan ikke eksportere metadata selv — tittelen
// («Velg spillere – World Grand Prix-Spillet» / «Pick players – World Grand Prix-Spillet») settes her.
export async function generateMetadata(): Promise<Metadata> {
  const { tipp } = getDictionary(await getLocale())
  return { title: tipp.metaTitle }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
