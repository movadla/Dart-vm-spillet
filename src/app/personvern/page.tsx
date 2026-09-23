import Link from 'next/link'
import SmartBackButton from '@/components/SmartBackButton'

const SPORT = 'var(--font-condensed), "Barlow Condensed", "Arial Narrow", Impact, sans-serif'

const CARD: React.CSSProperties = {
  background: 'linear-gradient(180deg, #161b27 0%, #12161f 100%)',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25)',
  padding: '16px 18px',
  marginBottom: 12,
}

const H: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.38)', marginBottom: 10,
}

const P: React.CSSProperties = { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }

export default function PersonvernPage() {
  return (
    <div className="page-bg" style={{ minHeight: '100vh', color: '#fff', padding: '32px 16px 56px', position: 'relative' }}>
      <div style={{ marginBottom: 20 }}>
        <SmartBackButton />
      </div>

      <div style={{ fontFamily: SPORT, fontSize: 32, fontWeight: 900, textTransform: 'uppercase', marginBottom: 20 }}>
        Personvern
      </div>

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

      <Link
        href="/"
        className="back-btn"
        style={{ display: 'inline-block', marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
      >
        ← Tilbake til forsiden
      </Link>
    </div>
  )
}
