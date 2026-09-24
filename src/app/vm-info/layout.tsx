import type { Metadata } from 'next'

// Siden er en klientkomponent og kan ikke eksportere metadata selv — tittelen
// («VM-guide – Dart-VM-spillet») settes her.
export const metadata: Metadata = { title: 'VM-guide' }

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
