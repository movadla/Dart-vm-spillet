import type { ReactNode } from 'react'
import { SPORT } from '@/config/theme'

/**
 * Tydelig seksjonsoverskrift for Min side: en fargekodet ikon-plakett + tittel,
 * så det aldri er tvil om hvilken del av siden man ser på («Mitt lag» / «Neste
 * kamper» / «Ligaer» har hver sin farge og sitt ikon, ikke bare en tekstlinje).
 */
export default function SectionHeader({ icon, color, title, action }: {
  icon: ReactNode
  color: string
  title: string
  action?: ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '28px 0 10px' }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}26`, border: `1px solid ${color}66`,
        boxShadow: `0 0 14px ${color}40`,
      }}>
        {icon}
      </div>
      <span style={{ fontFamily: SPORT, fontSize: 16, fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff' }}>{title}</span>
      <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
      {action}
    </div>
  )
}
