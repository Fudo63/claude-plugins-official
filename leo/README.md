# J.A.R.V.I.S.

A holographic AR assistant — gesture + face tracking, voice control, computer
automation, browser automation, persistent memory, and a live wireframe avatar
that lip-syncs to TTS. Claude Sonnet 4.6 + Haiku 4.5 as the brain, Gemini for
voice, MediaPipe for tracking, Playwright for browser control.

## Features

- **Voice** — push-to-talk (Space), wake word (`W` toggles "Hey LEO"),
  always-listen mode (`Q` toggles), interruptible (say "stop")
- **British-accented voice** via Gemini TTS (`Charon`) with Web Speech fallback
- **Real-time face mesh avatar** built from MediaPipe's 478 landmarks, with
  amplitude-driven lip sync and an internal-monologue panel that streams
  Claude's actual chain-of-thought
- **Memory** — persistent facts, conversation transcripts, daily summaries,
  TF-IDF retrieval, sentiment + pattern tracking
- **Tools** — open apps, run shell commands, browser automation (Playwright),
  YouTube Music, file/URL opening, screenshots, Wikipedia learning, news
  briefings, reminders, code execution, document drag-and-drop, named skills
  (macros), camera vision, mood tinting
- **Phone access** via Cloudflare quick tunnel (free, no signup) with
  mobile-optimized layout + tap-to-talk button
- **Self-correction** — tool-failure logging fed back into the prompt;
  prompt caching on the stable system block; adaptive thinking on hard
  questions

## Setup

### 1. Install dependencies

```bash
cd leo-agent
npm install
npx playwright install chromium
cd ..
```

### 2. Configure your keys

```bash
cp config.local.example.js config.local.js
```

Edit `config.local.js` and fill in:

- `anthropicKey` — get from <https://console.anthropic.com/settings/keys>
- `geminiKey` — optional, free key from <https://aistudio.google.com/apikey>
- `agentToken` — any random string; must match `LEO_TOKEN` in
  `leo-agent/.env`

`config.local.js` is gitignored — your keys never leave your machine.

### 3. (Optional) Agent server `.env`

```bash
cp leo-agent/.env.example leo-agent/.env
```

Edit `LEO_TOKEN` to match `agentToken` in `config.local.js`.

### 4. Launch

Double-click **`start-leo.bat`** (Windows). It will:

1. Start the agent server (port 3000)
2. Start a Cloudflare tunnel (shows a public URL for phone access)
3. Open Chrome in app mode at `http://localhost:3000/LEO.html`

To use LEO on your phone, open the `https://*.trycloudflare.com` URL the
tunnel printed.

## Controls

| Key      | Action |
|----------|--------|
| Space    | Hold to talk (push-to-talk) |
| W        | Toggle wake-word listening ("Hey LEO") |
| Q        | Toggle always-listen mode (every utterance is a request) |
| R        | Re-capture the avatar's resting face pose |
| (drop)   | Drop a text/image/PDF on the window — LEO can read it |

## Voice commands to try

- "Play Beat It by Michael Jackson"
- "Look up quantum entanglement and remember the key facts"
- "Remind me in five minutes to drink water"
- "Open my Downloads folder"
- "What am I holding?"
- "Switch to thinking mode and stay there"
- "Switch to Friday"

## Architecture

- **`LEO.html`** — single-page web app (Three.js + MediaPipe Tasks Vision +
  Web Speech + Gemini TTS + Claude tool use)
- **`leo-agent/server.js`** — Node/Express agent that exposes computer +
  browser tools to the web app via a Bearer-authed REST surface. Also serves
  the static web app so phone access works on a single origin

## Cost

- Anthropic — pay-per-call. Sonnet 4.6 for complex queries, Haiku 4.5 for
  simple commands. Prompt caching means the persona + tool definitions cost
  ~10% after the first call of a session.
- Gemini TTS — free tier is tight (~10 calls/min); auto-falls back to Web
  Speech when quota hits.

## License

Personal use, no warranty. Anthropic API key + Gemini key are yours to manage.

---

Built progressively with Claude Code — see commit history for the timeline.
