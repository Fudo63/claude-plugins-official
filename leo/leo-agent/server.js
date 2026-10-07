'use strict';
require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const { WebSocketServer } = require('ws');
const http         = require('http');
const { exec }     = require('child_process');
const { promisify }= require('util');
const os           = require('os');
const fs           = require('fs');
const path         = require('path');
const screenshot   = require('screenshot-desktop');
const open         = require('open');
const { chromium } = require('playwright');

const execAsync = promisify(exec);

const PORT  = parseInt(process.env.PORT  || '3000', 10);
const TOKEN = process.env.LEO_TOKEN   || 'leo-local-token';

// ══════════════════════════════════════════════
//  EXPRESS
// ══════════════════════════════════════════════

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Serve the LEO web app + node_modules from the parent directory so the
// whole experience runs on a single origin (one URL — works for tunnels + phones).
const WEB_ROOT = path.resolve(__dirname, '..');
app.use(express.static(WEB_ROOT, { dotfiles: 'ignore' }));
app.get('/', (_req, res) => res.redirect('/LEO.html'));

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : header;
  if (token !== TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Health check — no auth so the UI can ping without the token
app.get('/health', (_req, res) =>
  res.json({ ok: true, hostname: os.hostname(), platform: process.platform })
);

// Single tool endpoint
app.post('/tool/:name', requireAuth, async (req, res) => {
  const { name } = req.params;
  const input = req.body ?? {};
  console.log(`[TOOL] ${name}`, input);
  try {
    const result = await dispatch(name, input);
    res.json({ ok: true, result });
  } catch (err) {
    console.error(`[TOOL ERR] ${name}:`, err.message);
    res.json({ ok: false, error: err.message });
  }
});

// ══════════════════════════════════════════════
//  POWERSHELL HELPER
//  Writes script to a temp file — avoids shell-escaping nightmares
// ══════════════════════════════════════════════

async function ps(script, timeoutMs = 10_000) {
  const tmp = path.join(os.tmpdir(), `leo_${Date.now()}.ps1`);
  fs.writeFileSync(tmp, script, 'utf8');
  try {
    const { stdout, stderr } = await execAsync(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${tmp}"`,
      { timeout: timeoutMs }
    );
    return (stdout || stderr || '').trim();
  } finally {
    fs.unlink(tmp, () => {});
  }
}

// ══════════════════════════════════════════════
//  TOOL DISPATCH
// ══════════════════════════════════════════════

async function dispatch(name, input) {
  switch (name) {
    case 'open_app':        return toolOpenApp(input.name);
    case 'run_command':     return toolRunCommand(input.command);
    case 'take_screenshot': return toolScreenshot();
    case 'get_system_info': return toolSystemInfo();
    case 'type_text':       return toolTypeText(input.text);
    case 'search_web':      return toolSearchWeb(input.query);
    case 'set_volume':      return toolSetVolume(input.level);
    case 'open_url':        return toolOpenUrl(input.url);
    case 'open_path':       return toolOpenPath(input.path);
    case 'browser_navigate':    return toolBrowserNavigate(input.url);
    case 'browser_click':       return toolBrowserClick(input.target);
    case 'browser_type':        return toolBrowserType(input.target, input.text, !!input.submit);
    case 'browser_read':        return toolBrowserRead(input.target);
    case 'browser_evaluate':    return toolBrowserEvaluate(input.script);
    case 'browser_screenshot':  return toolBrowserScreenshot();
    case 'browser_close':       return toolBrowserClose();
    case 'play_youtube_music':  return toolPlayYouTubeMusic(input.query);
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

// ── open_app ──
async function toolOpenApp(name) {
  const safeName = name.replace(/'/g, '');
  const script = `
$app = Get-StartApps | Where-Object { $_.Name -like '*${safeName}*' } | Select-Object -First 1
if ($app) {
  Start-Process "shell:AppsFolder\\$($app.AppID)"
  Write-Output "Launched $($app.Name) from Start menu"
} else {
  Start-Process '${safeName}' -ErrorAction Stop
  Write-Output "Started ${safeName}"
}`;
  return await ps(script);
}

// ── run_command ──
const BLOCKED = /\b(remove-item|del\s+\/[sf]|format\s+[a-z]:|\brd\s+\/s|diskpart)\b/i;
async function toolRunCommand(command) {
  if (BLOCKED.test(command)) throw new Error('Command blocked — too destructive');
  const out = await ps(command, 15_000);
  return out.slice(0, 3000) || '(no output)';
}

// ── take_screenshot ──
// Returns base64 PNG so Claude can see the screen
async function toolScreenshot() {
  const buf = await screenshot({ format: 'png' });
  return { type: 'image', mediaType: 'image/png', data: buf.toString('base64') };
}

// ── get_system_info ──
async function toolSystemInfo() {
  const cpus  = os.cpus();
  const total = os.totalmem(), free = os.freemem();
  let disk = 'unavailable';
  try {
    disk = await ps(
      `Get-PSDrive -PSProvider FileSystem | ` +
      `ForEach-Object { "$($_.Name): $([math]::Round($_.Used/1GB,1))GB used / $([math]::Round(($_.Used+$_.Free)/1GB,1))GB total" }`,
      5_000
    );
  } catch (_) {}
  return {
    hostname:    os.hostname(),
    platform:    process.platform,
    cpu:         { model: cpus[0]?.model, cores: cpus.length },
    ram:         { totalGB: (total/1e9).toFixed(1), usedGB: ((total-free)/1e9).toFixed(1), usedPct: Math.round((total-free)/total*100) },
    uptimeHours: (os.uptime()/3600).toFixed(1),
    disk
  };
}

// ── type_text ──
async function toolTypeText(text) {
  // Escape SendKeys special chars: +, ^, %, ~, parens, braces
  const escaped = text
    .replace(/\{/g, '{{}')
    .replace(/\}/g, '{}}')
    .replace(/([+^%~()])/g, '{$1}')
    .replace(/'/g, "''");
  await ps(`Add-Type -AssemblyName System.Windows.Forms\n[System.Windows.Forms.SendKeys]::SendWait('${escaped}')`);
  return `Typed ${text.length} characters`;
}

// ── search_web ──
async function toolSearchWeb(query) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  await open(url);
  return `Opened browser: ${query}`;
}

// ── open_url ── (opens URL in default browser as a new tab)
async function toolOpenUrl(url) {
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  await open(url);
  return `Opened ${url}`;
}

// ── open_path ── (opens a file, folder, or shell URI with the default handler)
async function toolOpenPath(target) {
  const safe = String(target).replace(/'/g, "''");
  const out = await ps(`Start-Process -FilePath '${safe}'`);
  return out || `Opened ${target}`;
}

// ══════════════════════════════════════════════
//  BROWSER AUTOMATION  (Playwright)
//  Single persistent headed Chromium with a LEO-owned profile
//  so user logins (Google, YouTube Music, Spotify…) persist between calls.
// ══════════════════════════════════════════════

let browserContext = null;
let browserPage    = null;
const LEO_PROFILE = path.join(os.homedir(), '.leo-browser-profile');

async function getPage() {
  if (browserPage && !browserPage.isClosed()) return browserPage;

  if (!browserContext) {
    // Use the real installed Google Chrome (channel: 'chrome') instead of
    // Playwright's "Chrome for Testing" build, otherwise Google blocks sign-in
    // with "This browser or app may not be secure". Also strip the
    // --enable-automation flag that Google's sign-in flow sniffs for.
    browserContext = await chromium.launchPersistentContext(LEO_PROFILE, {
      headless: false,
      viewport: null,
      channel: 'chrome',
      ignoreDefaultArgs: ['--enable-automation'],
      args: [
        '--start-maximized',
        '--autoplay-policy=no-user-gesture-required',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    // Belt-and-braces: hide the navigator.webdriver flag in every page.
    await browserContext.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });
    browserContext.on('close', () => { browserContext = null; browserPage = null; });
  }

  const pages = browserContext.pages();
  browserPage = pages[0] || await browserContext.newPage();
  return browserPage;
}

async function resolveTarget(page, target) {
  // Try CSS selector first, then text match, then ARIA role/label match.
  if (!target) throw new Error('No target provided');
  // Heuristic: looks like a selector?
  const looksLikeSelector = /^[.#\[]|>|\s>\s/.test(target) || /^[a-z][a-z0-9-]*\b.*[.#\[:>]/i.test(target);
  if (looksLikeSelector) {
    const loc = page.locator(target).first();
    if (await loc.count()) return loc;
  }
  // Try exact text, then partial
  let loc = page.getByText(target, { exact: true }).first();
  if (await loc.count()) return loc;
  loc = page.getByText(target).first();
  if (await loc.count()) return loc;
  loc = page.getByRole('button', { name: target }).first();
  if (await loc.count()) return loc;
  loc = page.getByRole('link', { name: target }).first();
  if (await loc.count()) return loc;
  loc = page.getByLabel(target).first();
  if (await loc.count()) return loc;
  loc = page.getByPlaceholder(target).first();
  if (await loc.count()) return loc;
  // Last resort — treat as raw selector
  return page.locator(target).first();
}

async function toolBrowserNavigate(url) {
  if (!url) throw new Error('url required');
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  const page = await getPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
  return `Navigated to ${url} — title: "${await page.title()}"`;
}

async function toolBrowserClick(target) {
  const page = await getPage();
  const loc  = await resolveTarget(page, target);
  await loc.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
  await loc.click({ timeout: 10000 });
  return `Clicked "${target}"`;
}

async function toolBrowserType(target, text, submit) {
  const page = await getPage();
  const loc  = await resolveTarget(page, target);
  await loc.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
  await loc.click({ timeout: 5000 }).catch(() => {});
  await loc.fill('', { timeout: 5000 }).catch(() => {});
  await loc.type(text, { delay: 25, timeout: 10000 });
  if (submit) await page.keyboard.press('Enter');
  return `Typed "${text}" into "${target}"${submit ? ' and pressed Enter' : ''}`;
}

async function toolBrowserRead(target) {
  const page = await getPage();
  if (!target || target === 'page' || target === 'body') {
    const text = (await page.locator('body').innerText({ timeout: 5000 })).slice(0, 4000);
    return text;
  }
  const loc = await resolveTarget(page, target);
  const text = (await loc.innerText({ timeout: 5000 })).slice(0, 4000);
  return text;
}

async function toolBrowserEvaluate(script) {
  if (!script) throw new Error('script required');
  const page = await getPage();
  const result = await page.evaluate(`(async () => { ${script} })()`);
  const s = (typeof result === 'string') ? result : JSON.stringify(result);
  return (s || '').slice(0, 4000);
}

async function toolBrowserScreenshot() {
  const page = await getPage();
  const buf  = await page.screenshot({ type: 'png', fullPage: false });
  return { type: 'image', mediaType: 'image/png', data: buf.toString('base64') };
}

async function toolBrowserClose() {
  if (browserContext) {
    await browserContext.close().catch(() => {});
    browserContext = null;
    browserPage    = null;
  }
  return 'Browser closed';
}

// Convenience: search YouTube Music and play the first song result
async function toolPlayYouTubeMusic(query) {
  if (!query) throw new Error('query required');
  const page = await getPage();
  await page.goto('https://music.youtube.com/search?q=' + encodeURIComponent(query),
    { waitUntil: 'domcontentloaded', timeout: 25000 });

  // Dismiss any consent / signin prompts non-fatally
  for (const txt of ['Reject all', 'I agree', 'Got it', 'No thanks', 'Accept all']) {
    const b = page.getByRole('button', { name: txt }).first();
    if (await b.count().catch(() => 0)) await b.click({ timeout: 1500 }).catch(() => {});
  }

  // The real search results live under <ytmusic-section-list-renderer>.
  // Search-box suggestions match the same item tag but live inside
  // <ytmusic-search-suggestions-section> and never become visible — so
  // we explicitly scope to the results section.
  const RESULT_ROW   = 'ytmusic-section-list-renderer ytmusic-responsive-list-item-renderer';
  const TOP_CARD     = 'ytmusic-section-list-renderer ytmusic-card-shelf-renderer';

  await page.waitForSelector(RESULT_ROW + ', ' + TOP_CARD, {
    state: 'visible',
    timeout: 20000
  });

  // Small settle so the play buttons mount
  await page.waitForTimeout(400);

  let played = false;

  // Strategy 1 — "Top result" card with a circular play button
  try {
    const card = page.locator(TOP_CARD).first();
    if (await card.count()) {
      await card.scrollIntoViewIfNeeded().catch(() => {});
      await card.hover({ timeout: 2000 }).catch(() => {});
      const playBtn = card.locator('button[aria-label*="Play" i], yt-button-shape button').first();
      if (await playBtn.count()) {
        await playBtn.click({ timeout: 4000 });
        played = true;
      }
    }
  } catch (_) {}

  // Strategy 2 — first song row in the Songs shelf
  if (!played) {
    try {
      const firstRow = page.locator(RESULT_ROW).first();
      await firstRow.waitFor({ state: 'visible', timeout: 5000 });
      await firstRow.scrollIntoViewIfNeeded().catch(() => {});
      await firstRow.hover({ timeout: 2000 }).catch(() => {});

      // Prefer the explicit Play button on the row
      const rowPlay = firstRow.locator('button[aria-label*="Play" i]').first();
      if (await rowPlay.count()) {
        await rowPlay.click({ timeout: 4000 });
      } else {
        // YT Music plays a row when you click its thumbnail / title link
        const titleLink = firstRow.locator('a.yt-simple-endpoint, yt-formatted-string a').first();
        if (await titleLink.count()) {
          await titleLink.click({ timeout: 4000 });
        } else {
          await firstRow.click({ timeout: 4000 });
        }
      }
      played = true;
    } catch (e) {
      console.error('[YTM strategy 2]', e.message);
    }
  }

  if (!played) throw new Error('Could not locate a playable result on the search page.');

  // Wait for the player bar to show the now-playing song
  let nowPlaying = '';
  try {
    await page.waitForSelector('.content-info-wrapper .title.ytmusic-player-bar', { timeout: 6000 });
    nowPlaying = (await page.locator('.content-info-wrapper .title.ytmusic-player-bar').first().innerText()).trim();
  } catch (_) {}

  return nowPlaying
    ? `Now playing: ${nowPlaying}`
    : `Playing "${query}" on YouTube Music`;
}

// ── set_volume ──
async function toolSetVolume(level) {
  const v = Math.max(0, Math.min(100, Math.round(Number(level))));
  await ps(`
$code = '[DllImport("winmm.dll")] public static extern int waveOutSetVolume(IntPtr h, uint v);'
Add-Type -MemberDefinition $code -Name WinMM -Namespace Audio
$l = [uint32]([uint16]::MaxValue * ${v} / 100)
[Audio.WinMM]::waveOutSetVolume([IntPtr]::Zero, ($l -bor ($l -shl 16)))
`);
  return `Volume set to ${v}%`;
}

// ══════════════════════════════════════════════
//  WEBSOCKET  (ready for real-time push later)
// ══════════════════════════════════════════════

const server = http.createServer(app);
const wss    = new WebSocketServer({ server });

wss.on('connection', ws => {
  console.log('[WS] client connected');
  ws.on('close', () => console.log('[WS] client disconnected'));
});

// Broadcast helper for future use
function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg);
  }
}

// ══════════════════════════════════════════════
//  START
// ══════════════════════════════════════════════

server.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   J.A.R.V.I.S.  AGENT  SERVER       ║');
  console.log(`  ║   http://localhost:${PORT}               ║`);
  console.log(`  ║   Token: ${TOKEN.slice(0, 16).padEnd(16)}…         ║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});
