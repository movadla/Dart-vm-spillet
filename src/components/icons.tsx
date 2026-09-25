// Små, delte strek-ikoner (22×22, hvit strek) — brukt i fargede ikon-plaketter
// på forsiden («Slik fungerer det») og i seksjonsoverskriftene på Min side.

export function IconTarget() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="1.5" strokeOpacity="0.85" />
      <circle cx="11" cy="11" r="5.5" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />
      <circle cx="11" cy="11" r="2" fill="white" fillOpacity="0.8" />
    </svg>
  )
}

export function IconChart() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <polyline points="2,17 7,11 12,13.5 20,4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      <polyline points="16,4 20,4 20,8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      <line x1="2" y1="20" x2="20" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.3" />
    </svg>
  )
}

export function IconTrophy() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M7 2 H15 V12 C15 14.2 13.2 16 11 16 C8.8 16 7 14.2 7 12 Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" strokeOpacity="0.9" />
      <path d="M7 5 H3.5 C3.5 5 3.5 10.5 7 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      <path d="M15 5 H18.5 C18.5 5 18.5 10.5 15 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      <line x1="11" y1="16" x2="11" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.9" />
      <line x1="7" y1="20" x2="15" y2="20" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.9" />
    </svg>
  )
}

/** Kamp-/kalenderikon — brukt for «Neste kamper». */
export function IconNextMatch() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="4.5" width="16" height="14.5" rx="2.5" stroke="white" strokeWidth="1.5" strokeOpacity="0.9" />
      <line x1="3" y1="9" x2="19" y2="9" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="7.5" y1="2" x2="7.5" y2="6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.9" />
      <line x1="14.5" y1="2" x2="14.5" y2="6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.9" />
      <path d="M8 14.5 L10 12.5 L12 14.5 L14 12" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
    </svg>
  )
}
