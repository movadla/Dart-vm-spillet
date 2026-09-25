// Kjører en verifiseringsflyt i headless Chrome via rå CDP (ingen puppeteer):
//   node cdp-check.js <url> <script-file> [screenshot-path]
// Skriptet (en async-funksjon-body) evalueres i siden; returverdien skrives ut.
const { spawn, execSync } = require('child_process')
const fs = require('fs')
const http = require('http')

const CHROME = [
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((p) => fs.existsSync(p))
const [,, url, scriptFile, shot] = process.argv
const PORT = 9333
const PROFILE = require('os').tmpdir() + '/cl-spillet-cdp-profile'

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: PORT, path }, (res) => {
      let d = ''
      res.on('data', (c) => (d += c))
      res.on('end', () => { try { resolve(JSON.parse(d)) } catch (e) { reject(e) } })
    }).on('error', reject)
  })
}
function putJson(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: PORT, path, method: 'PUT' }, (res) => {
      let d = ''
      res.on('data', (c) => (d += c))
      res.on('end', () => { try { resolve(JSON.parse(d)) } catch (e) { reject(e) } })
    })
    req.on('error', reject)
    req.end()
  })
}

async function main() {
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`,
    '--window-size=430,900', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', 'about:blank',
  ], { stdio: 'ignore' })
  const cleanup = () => { try { chrome.kill() } catch {} try { execSync(`taskkill /PID ${chrome.pid} /T /F`, { stdio: 'ignore' }) } catch {} }
  process.on('exit', cleanup)

  let target = null
  for (let i = 0; i < 40 && !target; i++) {
    await new Promise((r) => setTimeout(r, 250))
    try { target = await putJson('/json/new?about:blank') } catch {}
  }
  if (!target) throw new Error('Chrome svarte ikke på CDP')

  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
  let id = 0
  const pending = new Map()
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id) }
  }
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 430, height: 900, deviceScaleFactor: 2, mobile: true })
  // VERIFY_LOCALE=en npm run verify -- ... — setter vm_locale-cookien FØR
  // navigasjon, så i18n-sidene rendres på engelsk fra første respons (uten
  // dette ville proxy.ts sin Accept-Language-deteksjon uansett gitt norsk,
  // siden headless Chrome ikke sender en engelsk-foretrukket header by default).
  if (process.env.VERIFY_LOCALE) {
    await send('Network.enable')
    await send('Network.setCookie', { name: 'vm_locale', value: process.env.VERIFY_LOCALE, url, path: '/' })
  }
  await send('Page.navigate', { url })
  await new Promise((r) => setTimeout(r, 1500))

  const body = fs.readFileSync(scriptFile, 'utf8')
  const evalRes = await send('Runtime.evaluate', { expression: `(async () => { ${body} })()`, awaitPromise: true, returnByValue: true, timeout: 120000 })
  if (evalRes.result?.exceptionDetails) {
    console.log('EXCEPTION', JSON.stringify(evalRes.result.exceptionDetails.exception?.description ?? evalRes.result.exceptionDetails, null, 1))
  } else {
    console.log(JSON.stringify(evalRes.result?.result?.value, null, 1))
  }

  if (shot) {
    const s = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80 })
    fs.writeFileSync(shot, Buffer.from(s.result.data, 'base64'))
    console.log('screenshot ->', shot)
  }
  ws.close()
  cleanup()
  process.exit(0)
}

main().catch((e) => { console.error('FAIL', e.message); process.exit(1) })
