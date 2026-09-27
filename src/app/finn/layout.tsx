import type { Metadata } from 'next'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'

// Siden er en klientkomponent og kan ikke eksportere metadata selv — tittelen
// («Finn min side – World Grand Prix-Spillet» / «Find my page – World Grand Prix-Spillet») settes her.
export async function generateMetadata(): Promise<Metadata> {
  const { finn } = getDictionary(await getLocale())
  return { title: `${finn.title.prefix} ${finn.title.highlight}` }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
