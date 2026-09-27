const PREHEADER_PADDING = '&nbsp;'.repeat(100)

export function buildBroadcastText(name: string, subject: string, body: string, ctaUrl?: string): string {
  return [
    'VM-SPILLET 2026',
    '',
    `Hei ${name},`,
    '',
    body.trim(),
    ...(ctaUrl ? ['', `Min side: ${ctaUrl}`] : []),
    '',
    '---',
    'Du mottar denne e-posten fordi du er registrert i Dart-VM-spillet.',
  ].join('\n').replace(/\n\n\n+/g, '\n\n')
}

export function buildBroadcastHtml(name: string, subject: string, body: string, ctaUrl?: string): string {
  const preheader = subject

  const bodyHtml = body
    .split('\n')
    .map(line => line.trim()
      ? `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.75);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${line}</p>`
      : '<br>')
    .join('')


  return `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${subject}</title>
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
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;line-height:1.3;color:#4ade80;margin-bottom:8px;text-shadow:0 0 16px rgba(34,197,94,0.5);">— PDC World Grand Prix —</div>
                <div style="font-family:'Barlow Condensed','Arial Narrow',Impact,Arial,sans-serif;font-weight:900;text-transform:uppercase;font-size:64px;letter-spacing:-2px;line-height:1;white-space:nowrap;text-shadow:0 0 48px rgba(220,38,38,0.45),0 0 96px rgba(59,130,246,0.25);">
                  <span style="color:rgba(255,255,255,0.35);">DART-VM-</span><span style="color:#ffffff;">SPILLET</span><span style="font-size:28px;letter-spacing:0.04em;color:rgba(255,255,255,0.22);padding-left:10px;vertical-align:middle;">2026</span>
                </div>
              </td>
            </tr>

            <!-- Hilsen -->
            <tr>
              <td style="padding-top:28px;padding-bottom:20px;">
                <div style="font-size:15px;font-weight:600;color:rgba(255,255,255,0.6);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Hei ${name},</div>
              </td>
            </tr>

            <!-- Innhold -->
            <tr>
              <td style="padding-bottom:36px;">
                ${bodyHtml}
              </td>
            </tr>

            <!-- CTA -->
            ${ctaUrl ? `<tr>
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
            </tr>` : ''}

            <!-- Footer -->
            <tr>
              <td>
                <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15);line-height:2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
                  Du mottar denne e-posten fordi du er registrert i Dart-VM-spillet.
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
