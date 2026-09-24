import type { Metadata } from 'next'

// Siden er en klientkomponent og kan ikke eksportere metadata selv — tittelen
// («Finn min side – Dart-VM-spillet») settes her.
export const metadata: Metadata = { title: 'Finn min side' }

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
