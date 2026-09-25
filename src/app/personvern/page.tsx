import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Personvern' }
import SmartBackButton from '@/components/SmartBackButton'
import BrandBanner from '@/components/BrandBanner'
import { SPORT, CARD_GRADIENT, CARD_SHADOW } from '@/config/theme'

const CARD: React.CSSProperties = {
  background: CARD_GRADIENT,
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: CARD_SHADOW,
  padding: '16px 18px',
  marginBottom: 12,
}

const H: React.CSSProperties = {
  fontSize: 12, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.6)', marginBottom: 10,
}

const P: React.CSSProperties = { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }

export default function PersonvernPage() {
  return (
    <div className="page-bg app-frame" style={{ minHeight: '100vh', color: '#fff', padding: '16px 20px 40px', position: 'relative' }}>
      <BrandBanner compact />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '6px 0 14px' }}>
        <SmartBackButton />
      </div>

      <h1 style={{ fontFamily: SPORT, fontSize: 28, fontWeight: 900, textTransform: 'uppercase', margin: '0 0 16px', lineHeight: 1 }}>
        Personvern
      </h1>

      <div style={CARD}>
        <div style={H}>Hva vi lagrer</div>
        <p style={P}>
          Når du melder deg på Dart-VM-spillet lagrer vi navnet ditt, e-postadressen din, eventuelt
          telefonnummer om du oppgir det, og hvilke dartspillere du har valgt.
        </p>
      </div>

      <div style={CARD}>
        <div style={H}>Hva vi bruker det til</div>
        <p style={P}>
          E-postadressen brukes til å sende deg en velkomstmelding, daglige statusoppdateringer
          under turneringen, og en innloggingslenke (gyldig i 1 time) når du ber om å endre
          valgene dine. Navnet ditt vises på leaderboardet og i eventuelle private ligaer du er
          med i. Vi selger eller deler aldri opplysningene dine med noen andre.
        </p>
      </div>

      <div style={CARD}>
        <div style={H}>Informasjonskapsler (cookies)</div>
        <p style={P}>
          Vi bruker kun strengt nødvendige informasjonskapsler — ingen sporing, annonser eller
          analyse-cookies, og du trenger derfor ikke samtykke til dem:
        </p>
        <ul style={{ ...P, margin: '10px 0 0', paddingLeft: 18 }}>
          <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>vm_auth</strong> — bekrefter hvem du er når du endrer valgene dine eller oppretter/blir med i en liga. Varer i 2 timer.</li>
          <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>admin_session</strong> — kun for spillets administrator, gir tilgang til å legge inn kampresultater.</li>
          <li><strong style={{ color: '#fff' }}>vm_demo</strong> — husker hvilken fase du ser demo-deltakeren i (kun relevant om du utforsker demoversjonen av «Min side»).</li>
        </ul>
        <p style={{ ...P, marginTop: 10 }}>
          I tillegg lagrer nettleseren din id-en til din egen «Min side» lokalt (localStorage,
          ikke en cookie) slik at du slipper å logge inn på nytt hver gang — dette sendes aldri
          til oss og ligger kun i din egen nettleser.
        </p>
      </div>

      <div style={CARD}>
        <div style={H}>Hvor lenge</div>
        <p style={P}>
          Opplysningene lagres så lenge spillet pågår og en rimelig periode etterpå, med mindre
          du ber om at de slettes tidligere.
        </p>
      </div>

      <div style={CARD}>
        <div style={H}>Behandlingsansvarlig</div>
        <p style={P}>
          {/* TODO (se TODO.md): fyll inn navn/foretaksnavn og adresse her før spillet
              åpnes for ekte deltakere — påkrevd etter GDPR art. 13, og spesielt viktig
              for et internasjonalt publikum utenfor Norge. */}
          [Navn/foretak og adresse — fylles inn før lansering]
        </p>
        <p style={{ ...P, marginTop: 10 }}>
          Du har rett til å klage til en personvern-tilsynsmyndighet hvis du mener
          behandlingen av opplysningene dine er i strid med regelverket — i Norge til{' '}
          <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}>Datatilsynet</a>,
          eller til tilsynsmyndigheten i landet du bor i om du er bosatt et annet sted i EU/EØS.
        </p>
      </div>

      <div style={CARD}>
        <div style={H}>Dine rettigheter</div>
        <p style={P}>
          Du kan når som helst be om å få se hvilke opplysninger vi har lagret om deg, be om at
          de rettes, eller be om at du slettes helt fra spillet (påmelding, picks og all
          historikk). Du kan også melde deg av de daglige e-postene når som helst via
          avmeldingslenken nederst i hver e-post.
        </p>
        <p style={{ ...P, marginTop: 10 }}>
          Send en e-post til{' '}
          <a href="mailto:kontakt@dart-vm-spillet.no" style={{ color: '#fff' }}>kontakt@dart-vm-spillet.no</a>{' '}
          for å be om innsyn, retting eller sletting.
        </p>
      </div>

      <Link href="/" className="back-btn" style={{ marginTop: 8 }}>
        ← Til forsiden
      </Link>
    </div>
  )
}
