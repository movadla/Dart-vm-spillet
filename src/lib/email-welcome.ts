import { POTS } from '@/data/pots'

const allPlayers = POTS.flatMap(p => p.players)
export const iso2For = (name: string) => allPlayers.find(pl => pl.name === name)?.iso2 ?? ''

const POT_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#06b6d4', '#ef4444', '#ec4899']

const PREHEADER_PADDING = '&nbsp;'.repeat(100)

export function buildWelcomeText(name: string, ctaUrl: string, picks: { team: string; iso2: string }[]): string {
  const pickLines = picks.map((p, i) => `  ${i + 1}. ${p.team}`).join('\n')
  return [
    'DART-VM-SPILLET 2026',
    '',
    `Hei ${name},`,
    'Du er nå påmeldt Dart-VM-spillet!',
    '',
    `Dine ${picks.length} spillere:`,
    pickLines,
    '',
    `Se din side: ${ctaUrl}`,
    '',
    'Du kan endre valgene dine når som helst frem til dart-VM starter 11. desember kl. 19:00.',
    '',
    '---',
    'Du mottar daglige oppdateringer under dart-VM.',
  ].join('\n')
}

export function buildWelcomeHtml(name: string, ctaUrl: string, picks: { team: string; iso2: string }[]): string {
  const preheader = `Velkommen til Dart-VM-spillet`

  const pickRows = picks.map((pick, i) => {
    const isLast = i === picks.length - 1
    const potColor = POT_COLORS[i] ?? '#ffffff'
    const borderColor = `${potColor}99`
    return `<tr>
      <td style="background:linear-gradient(180deg,#161b27 0%,#12161f 100%);padding:0;${isLast ? '' : 'border-bottom:1px solid rgba(255,255,255,0.05);'}">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="width:4px;background:${borderColor};">&nbsp;</td>
            <td style="padding:12px 14px 12px 10px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width:22px;vertical-align:middle;">
                    <div style="width:22px;height:22px;border-radius:50%;background:${potColor}18;border:1.5px solid ${potColor}55;text-align:center;line-height:19px;font-family:'Barlow Condensed','Arial Narrow',Impact,Arial,sans-serif;font-size:11px;font-weight:900;color:${potColor};">${i + 1}</div>
                  </td>
                  <td style="width:26px;padding-left:10px;vertical-align:middle;line-height:1;">
                    <img src="https://flagcdn.com/24x18/${pick.iso2}.png" width="24" height="18" alt="" style="display:block;border-radius:2px;">
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;font-size:15px;font-weight:700;line-height:1.2;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${pick.team}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Du er påmeldt — Dart-VM-spillet</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;-webkit-font-smoothing:antialiased;background:#0d1117;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#0d1117;">${preheader}${PREHEADER_PADDING}</div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0d1117" style="background:#0d1117;">
    <tr>
      <td align="center" style="padding:48px 20px 64px;">

        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width:480px;">
          <tr>
            <td style="background:#0d1117;">

          <!-- Content -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="position:relative;z-index:1;">

            <!-- Logo -->
            <tr>
              <td align="left" style="padding-bottom:8px;">
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;line-height:1.3;color:#4ade80;margin-bottom:8px;text-shadow:0 0 16px rgba(34,197,94,0.5);">— PDC World Championship —</div>
                <div style="font-family:'Barlow Condensed','Arial Narrow',Impact,Arial,sans-serif;font-weight:900;text-transform:uppercase;font-size:64px;letter-spacing:-2px;line-height:1;white-space:nowrap;text-shadow:0 0 48px rgba(220,38,38,0.45),0 0 96px rgba(59,130,246,0.25);">
                  <span style="color:rgba(255,255,255,0.35);">DART-VM-</span><span style="color:#ffffff;">SPILLET</span><span style="font-size:28px;letter-spacing:0.04em;color:rgba(255,255,255,0.22);padding-left:10px;vertical-align:middle;">2026</span>
                </div>
              </td>
            </tr>

            <!-- Heading -->
            <tr>
              <td style="padding-top:24px;padding-bottom:6px;">
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-weight:700;font-size:28px;letter-spacing:-0.3px;line-height:1.1;white-space:nowrap;">
                  <span style="color:rgba(255,255,255,0.4);">Du er </span><span style="color:#ffffff;">påmeldt!</span>
                </div>
              </td>
            </tr>

            <!-- Name -->
            <tr>
              <td style="padding-bottom:32px;padding-top:10px;">
                <div style="font-size:15px;color:rgba(255,255,255,0.6);font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${name}</div>
              </td>
            </tr>

            <!-- Picks label — matches "Mine lag" heading style on Min Side -->
            <tr>
              <td style="padding-bottom:10px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="width:50%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1));"></td>
                    <td style="white-space:nowrap;padding:0 10px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.82);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Dine spillere</td>
                    <td style="width:50%;height:1px;background:linear-gradient(270deg,transparent,rgba(255,255,255,0.1));"></td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Picks -->
            <tr>
              <td style="padding-bottom:32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);">
                  ${pickRows}
                </table>
              </td>
            </tr>

            <!-- Change picks note -->
            <tr>
              <td style="padding-bottom:24px;">
                <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);line-height:1.7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                  Du kan endre valgene dine når som helst frem til dart-VM starter <strong style="color:rgba(255,255,255,0.65);">11. desember kl. 19:00</strong>.
                </p>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td style="padding-bottom:44px;">
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${ctaUrl}" style="height:54px;v-text-anchor:middle;width:480px;" arcsize="4%" stroke="f" fillcolor="#dc2626">
                  <w:anchorlock/>
                  <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:800;">Min side &#8594;</center>
                </v:roundrect>
                <![endif]-->
                <!--[if !mso]><!-->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="border-radius:12px;overflow:hidden;padding-bottom:10px;">
                      <a href="${ctaUrl}" style="display:block;background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);color:#fff;font-size:15px;font-weight:800;padding:17px;border-radius:12px;text-decoration:none;letter-spacing:0.05em;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                        Min side &#8594;
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-radius:12px;overflow:hidden;">
                      <a href="${ctaUrl}" style="display:block;background:transparent;color:rgba(255,255,255,0.55);font-size:14px;font-weight:700;padding:14px 17px;border-radius:12px;text-decoration:none;letter-spacing:0.05em;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;border:1px solid rgba(255,255,255,0.12);">
                        Endre valg
                      </a>
                    </td>
                  </tr>
                </table>
                <!--<![endif]-->
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td>
                <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15);line-height:2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                  Du mottar daglige oppdateringer under dart-VM.<br>
                  Valg kan endres frem til turneringsstart 11. desember.
                </p>
              </td>
            </tr>

          </table>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`
}
