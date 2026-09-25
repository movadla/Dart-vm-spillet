import type { Metadata } from 'next'
import { getLocale } from '@/lib/i18n/getLocale'
import { getDictionary } from '@/i18n/dictionaries'

// Siden er en klientkomponent og kan ikke eksportere metadata selv — tittelen
// («VM-guide – Dart-VM-spillet» / «World Championship Guide – Dart-VM-spillet») settes her.
export async function generateMetadata(): Promise<Metadata> {
  const { vmInfo } = getDictionary(await getLocale())
  return { title: vmInfo.title }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
