export const VM_TOTAL_DAYS = 39

export interface MatchResultLite {
  player1: string
  player2: string
  sets1: number
  sets2: number
}

export interface LeagueStanding {
  name: string
  code: string
  rank: number
  total: number
}

export interface EmailParams {
  name: string
  userId: string
  points: number
  pointsDelta: number
  vmDay: number
  unsubscribeToken: string
  baseUrl: string
  recentResults?: MatchResultLite[]
  overallRank?: number
  overallTotal?: number
  leagues?: LeagueStanding[]
}

export interface PlainTextParams {
  name: string
  points: number
  pointsDelta: number
  vmDay: number
  ctaUrl: string
  unsubscribeUrl: string
  recentResults?: MatchResultLite[]
  overallRank?: number
  overallTotal?: number
  leagues?: LeagueStanding[]
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const PREHEADER_PADDING = ('&nbsp;&#847;&zwnj;').repeat(200)

export function buildDailyPlainText(p: PlainTextParams): string {
  const delta = p.pointsDelta > 0 ? `+${p.pointsDelta}p siden i går\n` : ''
  const results = p.recentResults?.length
    ? '\nGårsdagens resultater:\n' + p.recentResults.map((r) => `  ${r.player1} ${r.sets1}–${r.sets2} ${r.player2}`).join('\n') + '\n'
    : ''
  const leagueLines = [
    ...(p.leagues ?? []).map((l) => `  ${l.name}: ${l.rank}. av ${l.total}`),
    p.overallRank != null ? `  Overall leaderboard: ${p.overallRank}. av ${p.overallTotal}` : '',
  ].filter(Boolean)
  const leagues = leagueLines.length ? '\nDine ligaer:\n' + leagueLines.join('\n') + '\n' : ''
  return [
    'VM-SPILLET 2026',
    '',
    `Hei ${p.name},`,
    `Din status etter dag ${p.vmDay} av ${VM_TOTAL_DAYS} i VM`,
    '',
    `Totalpoeng: ${p.points}`,
    delta,
    leagues,
    results,
    `Se din side: ${p.ctaUrl}`,
    '',
    '---',
    `Meld deg av: ${p.unsubscribeUrl}`,
  ].join('\n').replace(/\n\n\n+/g, '\n\n')
}

export function buildDailyEmail(p: EmailParams): string {
  const preheader = p.pointsDelta > 0 ? `+${p.pointsDelta} poeng siden i går` : `${p.points} poeng totalt`

  const deltaHtml = p.pointsDelta > 0
    ? `<div style="font-size:12px;font-weight:700;color:#f59e0b;letter-spacing:0.04em;margin-top:4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">+${p.pointsDelta}p siden i går</div>`
    : ''

  const ctaUrl = `${p.baseUrl}/deltaker/${p.userId}`
  const unsubscribeUrl = `${p.baseUrl}/api/unsubscribe?id=${p.userId}&token=${p.unsubscribeToken}`

  const results = p.recentResults ?? []
  const resultsHtml = results.length === 0 ? '' : `
            <!-- Gårsdagens resultater -->
            <tr>
              <td style="padding-bottom:32px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Gårsdagens resultater</div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;background:#12161f;">
                  ${results.map((r, i) => {
                    const p1Win = r.sets1 > r.sets2
                    const p2Win = r.sets2 > r.sets1
                    return `<tr>
                    <td style="padding:10px 14px;${i > 0 ? 'border-top:1px solid rgba(255,255,255,0.06);' : ''}">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="table-layout:fixed;"><tr>
                        <td width="44%" align="right" style="font-size:13px;color:${p1Win ? '#ffffff' : 'rgba(255,255,255,0.5)'};font-weight:${p1Win ? 700 : 400};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.player1}</td>
                        <td width="12%" align="center" style="font-family:'Barlow Condensed','Arial Narrow',Impact,Arial,sans-serif;font-size:17px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;white-space:nowrap;">${r.sets1}&#8211;${r.sets2}</td>
                        <td width="44%" align="left" style="font-size:13px;color:${p2Win ? '#ffffff' : 'rgba(255,255,255,0.5)'};font-weight:${p2Win ? 700 : 400};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.player2}</td>
                      </tr></table>
                    </td>
                  </tr>`
                  }).join('')}
                </table>
              </td>
            </tr>`

  const leagueCard = (href: string, label: string, rank: number, total: number, isOverall: boolean) => {
    const bg = isOverall ? 'linear-gradient(180deg,#1c2030 0%,#14181f 100%)' : 'linear-gradient(180deg,#161b27 0%,#12161f 100%)'
    const border = isOverall ? '1px solid rgba(251,191,36,0.28)' : '1px solid rgba(255,255,255,0.12)'
    const rankColor = '#fbbf24'
    const emoji = isOverall ? ' 🌍' : ''
    return `<tr>
                    <td style="padding-bottom:6px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                        <tr>
                          <td style="background:${bg};border:${border};border-radius:12px;padding:12px 16px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.07);">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
                              <td align="left"><a href="${href}" style="font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${label}${emoji}</a></td>
                              <td align="right" style="white-space:nowrap;padding-left:8px;">
                                <span style="font-family:'Barlow Condensed','Arial Narrow',Impact,Arial,sans-serif;font-size:20px;font-weight:900;color:${rankColor};line-height:1;letter-spacing:-0.5px;">${rank}</span><span style="font-size:11px;color:rgba(255,255,255,0.3);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">/${total}</span>
                              </td>
                            </tr></table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>`
  }

  const leagueRowsInner = [
    ...(p.leagues ?? []).map((l) => leagueCard(`${p.baseUrl}/liga/${l.code}`, escHtml(l.name), l.rank, l.total, false)),
    leagueCard(`${p.baseUrl}/leaderboard`, 'Overall leaderboard', p.overallRank!, p.overallTotal!, true),
  ].join('')

  const leaguesHtml = p.overallRank == null ? '' : `
            <!-- Dine ligaer -->
            <tr>
              <td style="padding-bottom:26px;">
                <div style="font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Dine ligaer</div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${leagueRowsInner}
                </table>
              </td>
            </tr>`

  return `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Dart-VM-spillet</title>
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

            <!-- Navn -->
            <tr>
              <td style="padding-top:28px;padding-bottom:6px;">
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-weight:700;font-size:22px;letter-spacing:-0.2px;line-height:1.2;color:rgba(255,255,255,0.92);">${p.name}</div>
              </td>
            </tr>

            <!-- Dag-status -->
            <tr>
              <td style="padding-bottom:32px;padding-top:6px;">
                <div style="font-size:12px;font-weight:700;letter-spacing:0.04em;color:rgba(255,255,255,0.55);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Dag ${p.vmDay} av ${VM_TOTAL_DAYS} i VM</div>
              </td>
            </tr>

            <!-- Stats-kort -->
            <tr>
              <td style="padding-bottom:32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-radius:16px;overflow:hidden;">
                  <tr>
                    <td bgcolor="#161b27" style="background:linear-gradient(180deg,#161b27 0%,#12161f 100%);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:20px 24px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.07),0 8px 20px rgba(0,0,0,0.4);">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.5);vertical-align:middle;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Totalpoeng</td>
                          <td align="right" style="vertical-align:middle;">
                            <div style="font-family:'Barlow Condensed','Arial Narrow',Impact,Arial,sans-serif;font-size:52px;font-weight:900;color:#4ade80;line-height:1;letter-spacing:-1px;text-shadow:0 0 40px rgba(34,197,94,0.5),0 0 16px rgba(34,197,94,0.25);">${p.points}<span style="font-size:22px;color:rgba(74,222,128,0.5);letter-spacing:0;">p</span></div>
                            ${deltaHtml}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
${leaguesHtml}${resultsHtml}
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
                    <td style="border-radius:12px;overflow:hidden;">
                      <a href="${ctaUrl}" style="display:block;background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);color:#fff;font-size:15px;font-weight:800;padding:17px;border-radius:12px;text-decoration:none;letter-spacing:0.05em;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                        Min side &#8594;
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
                  Du mottar dette fordi du er påmeldt Dart-VM-spillet.<br>
                  <a href="${unsubscribeUrl}" style="color:rgba(255,255,255,0.28);text-decoration:underline;">Meld deg av daglige oppdateringer</a>
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
