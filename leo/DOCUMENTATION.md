# J.A.R.V.I.S. — Full Documentation

Deep technical and usage reference. For a quickstart, see [README.md](README.md).

---

## Table of Contents

1. [What This Is](#what-this-is)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [File Structure](#file-structure)
5. [Setup](#setup)
6. [Configuration Reference](#configuration-reference)
7. [Launching](#launching)
8. [The Three Panels](#the-three-panels)
9. [Voice Control](#voice-control)
10. [Keyboard Shortcuts](#keyboard-shortcuts)
11. [The Holographic Avatar](#the-holographic-avatar)
12. [Memory System](#memory-system)
13. [Tools Reference](#tools-reference)
14. [Skills (Macros)](#skills-macros)
15. [Browser Automation](#browser-automation)
16. [Computer Automation](#computer-automation)
17. [Phone Access](#phone-access)
18. [Mood & Visual Effects](#mood--visual-effects)
19. [Sound Design](#sound-design)
20. [Self-Awareness Features](#self-awareness-features)
21. [Performance Optimizations](#performance-optimizations)
22. [Voice Commands Cheat Sheet](#voice-commands-cheat-sheet)
23. [Troubleshooting](#troubleshooting)
24. [Privacy & Security](#privacy--security)
25. [Cost](#cost)
26. [Customization](#customization)
27. [Known Limitations](#known-limitations)

---

## What This Is

LEO is a single-page web app combined with a local Node agent that together
produce a movie-style AI assistant: holographic wireframe head, gesture and
face tracking, voice control, browser automation, computer automation,
persistent cross-session memory, learning from the web, and a phone-friendly
mobile layout — all running on your own machine and optionally exposed via a
free Cloudflare tunnel for phone access.

The brain is Claude Sonnet 4.6 (with Haiku 4.5 fallback for cheap commands).
The voice is Google's Gemini TTS with a `Charon` voice prompted into a posh
British accent. The avatar's face is built from the same MediaPipe FaceMesh
landmarks that power the AR camera panel, with amplitude-based lip sync.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Browser (Chrome)                                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  LEO.html  (single-page app)                        │  │
│  │  ─ Three.js scene + holographic face mesh              │  │
│  │  ─ MediaPipe Tasks-Vision (hands + face landmarks)     │  │
│  │  ─ Web Speech API (STT — speech recognition)           │  │
│  │  ─ Gemini TTS  (synthesizes British voice via REST)    │  │
│  │  ─ Web Speech fallback TTS                             │  │
│  │  ─ Claude tool-use agentic loop                        │  │
│  │  ─ Local tool dispatch (memory, learn, display, mood…) │  │
│  └─────────────┬──────────────────────────┬───────────────┘  │
│                │  fetch to API endpoints   │                  │
└────────────────┼──────────────────────────┼──────────────────┘
                 │                          │
        Anthropic API                  Local Agent
        (Claude Sonnet/Haiku)          (Node + Express on :3000)
                                            │
                ┌───────────────────────────┼────────────────────────┐
                │                           │                        │
        Playwright Chromium          PowerShell + Win32      Static file server
        (browser automation —        (open_app, run_command,  (LEO.html +
         YouTube Music, search,      screenshot, type_text,    node_modules so
         click, type, navigate,      set_volume, open_url,     phone access
         evaluate JS)                open_path)                works single-origin)
```

### Data Flow for One Voice Turn

1. User holds Space (or wake word fires, or always-listen captures)
2. Web Speech API streams interim transcripts to the UI
3. On release / final result → `handleUtterance(text)`
4. `askJarvis(text)` builds a request body with cached system prompt
5. POST to `api.anthropic.com/v1/messages`
6. Response contains text + optional `tool_use` blocks + optional `thinking` blocks
7. Thinking text routed to internal-monologue panel
8. Tool calls dispatched (local for memory/display/etc; agent for computer/browser)
9. Tool results fed back; loop continues until `stop_reason: end_turn`
10. Final text → `speak(reply)` → Gemini TTS → playback through Web Audio
11. AnalyserNode on the audio drives mouth shape on the avatar in real time
12. Captions scroll with playback position
13. Transcript saved to localStorage; `convHistory` updated for next turn

---

## Tech Stack

| Layer | Technology |
|---|---|
| 3D rendering | Three.js r128 |
| Hand + face tracking | MediaPipe Tasks Vision (`@mediapipe/tasks-vision`) |
| Speech recognition | Web Speech API (`webkitSpeechRecognition`) |
| Speech synthesis | Gemini 2.5 Flash TTS (REST), Web Speech fallback |
| Audio playback + lip-sync | Web Audio API (AudioContext + AnalyserNode) |
| LLM brain | Anthropic Claude Sonnet 4.6 + Haiku 4.5 |
| Browser automation | Playwright (Chromium with persistent profile) |
| OS automation | PowerShell via Node `child_process` |
| Agent server | Node 20 + Express |
| Tunneling | Cloudflare quick tunnels (`cloudflared`) |
| Storage | `localStorage` (memories, transcripts, skills, patterns, failures) |
| Style | Pure CSS (Orbitron + Share Tech Mono fonts) |

---

## File Structure

```
leo/
├── LEO.html                  # The entire web app — ~2900 lines
├── config.local.js              # Your API keys (gitignored)
├── config.local.example.js      # Template for new clones
├── package.json                 # Top-level (MediaPipe deps for browser)
├── start-leo.bat             # Windows launcher (agent + tunnel + Chrome)
├── start-leo-phone.bat       # Legacy phone-only launcher
├── cloudflared.exe              # Tunnel binary (gitignored, 53MB)
├── README.md                    # Quickstart
├── DOCUMENTATION.md             # This file
├── .gitignore
│
├── node_modules/                # MediaPipe + three.js for the web app (gitignored)
│
└── leo-agent/
    ├── server.js                # Express agent — ~450 lines
    ├── package.json             # Agent deps (express, playwright, screenshot-desktop…)
    ├── .env.example             # Token + port template
    ├── .env                     # Your real token (gitignored)
    └── node_modules/            # (gitignored)
```

---

## Setup

### Prerequisites

- **Node.js 20+** ([nodejs.org](https://nodejs.org))
- **Google Chrome** (Playwright uses your installed Chrome via the `chrome` channel for OAuth-safe Google sign-in)
- **Anthropic API key** ([console.anthropic.com](https://console.anthropic.com))
- **Gemini API key** (optional but recommended) ([aistudio.google.com/apikey](https://aistudio.google.com/apikey))
- **Windows 10/11** (the launcher and PowerShell tools are Windows-specific — Linux/macOS would need adapter work)

### First-Time Install

```bash
# Clone
git clone https://github.com/EMC2709/LEO.git
cd LEO

# Browser deps (MediaPipe + Three.js)
npm install

# Agent deps + Playwright Chromium
cd leo-agent
npm install
npx playwright install chromium
cd ..

# Config
cp config.local.example.js config.local.js
# → edit config.local.js, paste your keys

# Agent env (optional — defaults work)
cp leo-agent/.env.example leo-agent/.env
```

### Cloudflared (for phone access)

The launcher expects `cloudflared.exe` in the project root. Download it from
<https://github.com/cloudflare/cloudflared/releases/latest> and rename to
`cloudflared.exe` if needed.

---

## Configuration Reference

### `config.local.js` (browser-side keys)

```js
window.LEO_CONFIG = {
  anthropicKey: 'sk-ant-api03-...',   // required
  geminiKey:    'AIza...',            // optional; falls back to Web Speech
  geminiVoice:  'Charon',             // Charon | Orus | Fenrir | Puck | Kore | Aoede | Zephyr
  agentToken:   'leo-local-token'  // must match LEO_TOKEN below
};
```

### `leo-agent/.env` (agent-side)

```
LEO_TOKEN=leo-local-token   # bearer token the web app sends; change to something secret
PORT=3000
```

### Runtime sessionStorage overrides

You can override any config value live in DevTools without editing files:

```js
sessionStorage.setItem('leo_gemini_voice', 'Orus');
sessionStorage.setItem('leo_gemini_style', 'Speak with a posh Oxford accent');
sessionStorage.setItem('leo_agent_url', 'https://...trycloudflare.com');
location.reload();
```

### localStorage state (persisted across sessions)

| Key | What it stores |
|---|---|
| `leo_memories` | Array of facts about you |
| `leo_transcripts` | Rolling 500 most recent exchanges |
| `leo_skills` | Named macros (workflows) |
| `leo_patterns` | Request frequency counts |
| `leo_tool_failures` | Last 20 tool failure traces |
| `leo_reminders` | Pending + recently-fired reminders |
| `leo_last_brief_day` | Last day a morning briefing fired (so only once/day) |
| `leo_last_summary_day` | Last day summarized (so only once/day) |
| `leo_friday` | Persona toggle (`1` = Friday, `0` = LEO) |

To wipe everything LEO knows about you:

```js
localStorage.clear();
location.reload();
```

---

## Launching

Double-click **`start-leo.bat`**. It performs in order:

1. Kills any stale Node on port 3000 and any stale `cloudflared.exe`
2. Starts `leo-agent/server.js` (minimized terminal — port 3000)
3. Starts a Cloudflare quick tunnel (visible terminal — prints the phone URL)
4. Opens Chrome in app mode at `http://localhost:3000/LEO.html`

You'll have three windows:

- **Chrome app window** — main interface
- **Minimized "LEO Agent" terminal** — agent logs
- **Visible "LEO Tunnel" terminal** — copy the `https://*.trycloudflare.com` URL from here for phone access

Close any one to begin shutdown; close all three to fully exit.

---

## The Three Panels

The main view is a three-column grid. On mobile (<820px or portrait), it
stacks vertically with the avatar on top.

### Left — `BIOMETRIC FEED // LANDMARK OVERLAY`

Your webcam feed mirrored, with MediaPipe drawing real-time landmark dots and
connections on top. Hand landmarks (21 per hand × up to 2 hands) and face
mesh (478 landmarks). Gesture detection (pinch, fist) shows in the
`GESTURE` pill at the bottom.

### Middle — `3D SCENE // HEAD-TRACKED CAMERA` + `LEO DISPLAY`

A Three.js scene with a cube you can manipulate with gestures. The voice log
overlays the bottom (last 5 exchanges + interim transcripts as you speak).
**The display overlay** appears in front of the cube when LEO pulls
something up — text, images, lists, news headlines, document previews.

### Right — `J.A.R.V.I.S. // HOLOGRAPHIC INSTANCE`

The avatar panel. Contains:

- **The face mesh** — see [The Holographic Avatar](#the-holographic-avatar)
- **HUD overlays** (4 corners) — CORE, UPTIME, SIGNAL, MEMORY
- **AI ASSISTANT label** centered at top
- **Status glyph** below the face — STANDBY / LISTENING / SPEAKING / MONITORING
- **Captions** — LEO's words light up as he speaks them
- **Internal monologue panel** (left side) — streams his actual extended-thinking
  text one sentence at a time when reasoning

### Status Bar

Bottom strip with live data: HANDS, PINCH, FIST, SCALE, HEAD YAW, HEAD PITCH,
FACE, LEO, AGENT, TIME, BATTERY, WEATHER, NET.

---

## Voice Control

Three modes coexist; you can use any combination.

### Push-to-Talk (default)

- **Hold Space** — recognizer starts
- **Speak** — interim transcript shows
- **Release Space** — final transcript submitted to LEO

True hold-to-talk: pauses inside speech don't end the turn. Chrome's
~60-second `continuous: true` session limit is handled by silent restart
while you're still holding.

### Wake Word — `W` toggles

- Say **"LEO"** any time
- LEO responds **"Yes sir?"** with a wake-ack chime
- Then captures your follow-up for up to 15s or 2.5s of silence
- Auto-re-arms after he replies

The wake recognizer also listens for **interrupt phrases** while he's
speaking: "stop", "wait", "cancel", "shut up", "enough", "nevermind".
Saying any of those mid-reply cancels TTS instantly.

### Always-Listen — `Q` toggles

- Every utterance of 2+ words is sent straight to LEO — no wake word
- A tick chime confirms each captured utterance
- 800 ms post-TTS mic-mute prevents him hearing his own voice and looping
- Mode hint in the voice log bar updates accordingly

### Mobile Tap-to-Talk

On mobile screens, a floating circular "HOLD TO TALK" button appears
bottom-right. Same behaviour as Space (hold to capture, release to submit).
Wake word also auto-arms 4 seconds after the boot greeting on mobile.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` (hold) | Push-to-talk |
| `W` | Toggle wake word listening |
| `Q` | Toggle always-listen mode |
| `R` | Re-capture the avatar's resting face pose |

Drag-drop any file (text, code, image, PDF) onto the window — LEO will
load it and let you ask questions about its content.

---

## The Holographic Avatar

The face mesh is the same 478-vertex MediaPipe FaceMesh applied as a
BufferGeometry with the canonical tesselation index. It's rendered as both
glowing LineSegments and a Points cloud (the dotted-wireframe look).

### Rest Pose

The first valid FaceMesh frame from your webcam is snapshotted and frozen as
the avatar's resting expression. From then on, the avatar **does not track
you** — it has its own life. Press `R` to re-capture if the first frame
caught you mid-yawn.

### Animations

- **Idle breathing** — subtle vertex shimmer (<0.5% of head size)
- **Head sway** — ±10° on Y, ±3° on X via avatar group rotation
- **Periodic blinks** — every ~4.2s, upper eyelid landmarks collapse onto
  lower eyelid Y for ~200ms; iris orbs squash vertically
- **Voice-reactive particles** — the dust orbiting the head accelerates and
  brightens with your mic volume
- **Mouth lip-sync** — driven by amplitude analysis of the TTS audio (Gemini
  path) or TTS boundary events (Web Speech fallback)
- **Eye orbs** — glowing cyan spheres parked at iris landmarks 468 and 473;
  intensity ramps when speaking

### Mood Tinting

Calling `set_mood` retints both the CSS `--cyan` variable (affecting all UI
chrome) and the live Three.js face materials:

| Mood | Colour |
|---|---|
| `default` | Cyan `#00f0ff` |
| `alert` | Red `#ff2244` |
| `confirm` | Green `#00ff88` |
| `warn` | Orange `#ff8800` |
| `thinking` | Purple `#9b6cff` |

Persistent by default; pass `seconds` for transient flashes.

---

## Memory System

### Layers

1. **Facts** (`memories`) — explicit facts LEO has saved, one sentence each
2. **Transcripts** (`transcripts`) — rolling 500 most recent user/leo pairs
3. **Daily summaries** — once a day, yesterday's transcripts get distilled by
   Haiku into a 2-3 sentence summary, stored as a memory
4. **Patterns** (`patterns`) — frequency count of normalized 3-word prefixes
   from your requests, used for anticipation
5. **Tool failures** (`toolFailures`) — last 20 tool errors, injected into
   the prompt so LEO learns from mistakes
6. **Skills** (`skills`) — named workflows you've defined

### TF-IDF Retrieval

When memory count exceeds 14, the prompt only includes the top-relevant
facts for the current question (plus the 3 most recent). Cosine similarity
on TF-IDF-weighted bag-of-words vectors. The index is rebuilt only when
memory count changes, so it's fast.

### Sentiment Hint

The user's message is keyword-scanned for emotional state (`frustrated`,
`pleased`, `tired`, `sad`). When detected, a `[system note]` is appended to
the user message asking LEO to soften or warm his tone accordingly.

---

## Tools Reference

Tools are split into **local** (executed in-browser, instant) and **agent**
(executed by the Node agent over HTTP).

### Local — Memory

| Tool | Description |
|---|---|
| `remember(fact)` | Stores a single concise fact |
| `forget(query)` | Removes memories containing the substring |
| `recall_memories()` | Dumps all stored facts |

### Local — Display

| Tool | Description |
|---|---|
| `display_text(title, body)` | Shows formatted text on the middle panel |
| `display_list(title, items)` | Shows a bulleted list |
| `display_image(url, caption)` | Shows an image with optional caption |
| `display_html(html)` | Renders raw HTML in the display |
| `display_clear()` | Hides the display |

### Local — Learn

| Tool | Description |
|---|---|
| `learn_about(topic)` | Pulls Wikipedia summary, falls back to DuckDuckGo. LEO follows up with `remember()` calls + a `display_text()` overview |

### Local — Proactive

| Tool | Description |
|---|---|
| `schedule_reminder(message, at_minutes)` | Spoken + displayed reminder N minutes later |
| `analyze_camera(question)` | Captures current webcam frame, sends to Claude as vision input |
| `news_briefing(limit)` | Top Hacker News stories |
| `run_code(code)` | Sandboxed iframe JS execution |
| `set_mood(mood, seconds?)` | Tint UI; persistent unless `seconds` given |
| `set_persona(persona)` | Switch to `leo` or `friday` (also swaps Gemini voice) |
| `define_skill(name, description, steps)` | Save a multi-step workflow |
| `run_skill(name)` | Execute a saved skill |
| `list_skills()` | List saved skills |
| `read_document()` | Returns the most recently drag-dropped file |
| `recall_conversation(query, limit)` | Search past transcripts |

### Agent — Computer Control

| Tool | Description |
|---|---|
| `open_app(name)` | Launch an app via Start menu match |
| `run_command(command)` | Execute PowerShell (blocked: destructive commands) |
| `take_screenshot()` | Full-screen capture as base64 PNG |
| `get_system_info()` | CPU/RAM/disk/uptime |
| `type_text(text)` | SendKeys keyboard input to focused window |
| `set_volume(level)` | Set system volume 0–100 |
| `search_web(query)` | Open Google search in default browser |
| `open_url(url)` | Open URL in default browser |
| `open_path(path)` | Open file/folder/shell URI with default handler |

### Agent — Browser Automation (Playwright)

| Tool | Description |
|---|---|
| `browser_navigate(url)` | Load a URL in the persistent LEO browser |
| `browser_click(target)` | Click by text, ARIA label, placeholder, or CSS selector |
| `browser_type(target, text, submit)` | Fill an input; optionally press Enter |
| `browser_read(target)` | Get text content of an element or whole page |
| `browser_screenshot()` | Captures the browser tab |
| `browser_evaluate(script)` | Runs arbitrary JS in the page |
| `browser_close()` | Closes the browser |
| `play_youtube_music(query)` | Search + click first result on YouTube Music |

---

## Skills (Macros)

A **skill** is a named sequence of plain-English steps. Define it once,
trigger it by name.

```text
You:    "Save a skill called focus_mode: set my volume to 30, open Spotify,
        and switch to thinking mood."
LEO: "Saved skill 'focus_mode' with 3 steps."

(later)
You:    "Run focus mode"
LEO: → set_volume(30) → open_app('spotify') → set_mood('thinking')
        "Done, sir."
```

Skills are stored in localStorage under `leo_skills`. Steps are read out
to Claude as a `SKILL` block in the tool result, and Claude executes them
using the appropriate tools.

---

## Browser Automation

### How It Works

The agent server lazily launches **your real installed Google Chrome** (not
Playwright's bundled Chrome for Testing, which Google blocks for sign-in) via
`chromium.launchPersistentContext()` with:

- `channel: 'chrome'` — uses your installed Chrome
- `headless: false` — visible window so you can see what LEO is doing
- `--user-data-dir=~/.leo-browser-profile` — separate profile from your
  daily browsing, so it doesn't interfere
- `ignoreDefaultArgs: ['--enable-automation']` — strips the flag Google's
  sign-in flow uses to detect bots
- `navigator.webdriver = undefined` patched at every page load

### Target Resolution

`browser_click` and `browser_type` accept a target in this priority order:

1. CSS selector (`.btn-primary`, `[data-testid=x]`)
2. Exact visible text
3. Partial visible text
4. ARIA role+name (button, link, label)
5. Placeholder text
6. Raw selector fallback

### YouTube Music

`play_youtube_music` does a search-URL navigation, dismisses consent popups,
then tries (in order):

1. Top-result card play button
2. First song row's play button
3. First song row's title link
4. First song row click

It reads the player bar after to report the actual now-playing track.

### First-Time Sign-In

The first browser action triggers the persistent-profile Chrome to open.
Sign in to Google/Spotify/YouTube Music **once** in that window. From then on,
cookies persist and LEO is always signed in.

---

## Computer Automation

All OS-level tools execute via PowerShell scripts written to temp files and
run with `-NoProfile -ExecutionPolicy Bypass`. The agent has a hardcoded
deny-list for destructive commands:

```js
const BLOCKED = /\b(remove-item|del\s+\/[sf]|format\s+[a-z]:|\brd\s+\/s|diskpart)\b/i;
```

`type_text` uses `System.Windows.Forms.SendKeys` after escaping special
chars. `set_volume` uses `winmm.dll`'s `waveOutSetVolume`.

`open_app` first searches the Start menu via `Get-StartApps` for partial
matches (handles "Spotify" finding "Spotify (Microsoft Store)" etc.), then
falls back to plain `Start-Process` for exes.

---

## Phone Access

When the agent + tunnel are running, `start-leo.bat` prints a public
URL like `https://something-random.trycloudflare.com`. Open it on your phone.

### Mobile Layout

CSS media query `@media (max-width: 820px), (orientation: portrait)` triggers:

- Vertical stack (avatar on top, then camera, then 3D scene)
- Smaller HUD overlays and statusbar
- Hidden hints + sys-tags to save space
- Floating circular tap-to-talk button bottom-right
- Wake word auto-arms 4s after greeting

### Single-Origin Trick

To make the phone use one URL (not two — web app + agent), the agent server
itself serves `LEO.html` and `node_modules/` as static files on port 3000.
The web app uses `window.location.origin` as the agent URL by default, so
phone-via-tunnel and PC-via-localhost both work without configuration.

### Security on the Tunnel

The tunnel exposes the agent to anyone with the URL. The Bearer token in
`agentToken` is the only protection. **Change `agentToken` to something
secret** before sharing your phone URL with anyone. The tunnel URL is also
random per-restart, so it dies with the launcher window.

---

## Mood & Visual Effects

### Mood Tinting

`set_mood('alert')` etc. retints:

- CSS `--cyan` variable → all UI chrome
- Three.js face mesh materials → the avatar itself

Persistent by default; auto-reverts only when `seconds > 0` is passed.

### Holographic Glitch

Triggered on `set_mood('alert')` or `set_mood('warn')`. CSS animation that
applies chromatic-shift filter + translate jitter to the avatar canvas for
700ms. Combined with the `alert` sound effect, it feels like a HUD malfunction.

### Live Captions

While LEO speaks, his words appear at the top of the 3D panel one word at
a time, with each word lighting up brighter as it's pronounced. Driven by:

- Gemini TTS path: playback time / total audio duration → word position
- Web Speech path: `onboundary` event → `charIndex` → word position

### Internal Monologue Panel

Slides in on the left side of the avatar showing `[ REASONING… ]` or
`[ PROCESSING… ]` immediately when a query starts. When Sonnet 4.6 returns
extended-thinking content, those sentences stream into the panel one at a
time with a slight randomized delay (180–400ms per sentence) for the
"thinking out loud" feel. Lingers 2.5s after the reply finishes, then fades.

---

## Sound Design

All sounds are synthesized live via Web Audio oscillators — no asset files
needed, works fully offline. Defined in `sfx(name)`:

| Name | When it plays |
|---|---|
| `boot` | First page interaction after boot |
| `wake_ack` | Wake word triggered ("LEO" heard) |
| `confirm` | Successful action / mode change |
| `error` | Tool or API failure |
| `alert` | `set_mood('alert')` fired |
| `scan` | `set_mood('thinking')` fired |
| `tick` | Captured utterance in always-listen mode |
| `welcome` | Face presence detection on return after 30s+ absence |

Each is a short sine/square wave with attack/release envelope. Sweeps and
chord stings used for boot and welcome to feel sci-fi.

---

## Self-Awareness Features

### Internal Monologue

Already covered. Shows Claude's actual chain-of-thought from extended
thinking blocks, not a fabricated narrative.

### Tool-Failure Memory

Every failed tool call is logged with input + error. The last 5 failures are
injected into the next prompt:

```
RECENT TOOL FAILURES (do not repeat these mistakes — adjust selectors,
paths, or strategy):
  • browser_click({"target":"sign in"}) → Timeout 8000ms exceeded
  • play_youtube_music({"query":"..."}) → Could not locate result
```

### Self-Critique

System prompt ends with:

```
SELF-CHECK: before finalizing your spoken reply, mentally verify factual
accuracy, that all promised actions were actually performed via tools, and
that the response addresses what was asked.
```

### Daily Reflection

Once a day on boot, Haiku summarizes yesterday's conversation transcripts
into a 2-3 sentence memory: *"[Sat May 17] User worked on LEO avatar
improvements, mildly frustrated with browser selectors mid-afternoon,
finished by upgrading to Gemini TTS."*

### Pattern Recognition

The top 5 most-frequent request prefixes are injected into the prompt so
LEO can anticipate: *"User often says 'play music' around 8pm — perhaps
offer the usual playlist."*

### Presence Detection

After 30 seconds of no face in the camera, LEO flips to "away" state.
When you return, you get a welcome chime + spoken *"Welcome back, sir."*

### Idle Commentary

Every 25–40 minutes of complete silence during waking hours (8am–10pm),
LEO offers a randomized nudge: *"Standing by, sir."* — randomized so it's
not predictable.

---

## Performance Optimizations

### Prompt Caching

The system prompt is split into two text blocks:

```js
[
  { type: 'text', text: SYSTEM_STABLE, cache_control: { type: 'ephemeral' } },
  { type: 'text', text: buildSystemPromptDynamic(userText) }
]
```

The stable block (persona + tool-usage rules) is cached. After the first
call of a session, subsequent calls read the cached prefix at ~10% of full
cost and ~50% lower latency.

Verify via DevTools: `response.usage.cache_read_input_tokens` should be > 0
from the second call onward.

### Adaptive Thinking

Complex queries (detected by length or keywords like "explain", "analyze",
"plan") get `thinking: {type: "adaptive"}` enabled. Claude self-paces how
much to think instead of burning a fixed token budget.

### Model Routing

| Query type | Model | Max tokens |
|---|---|---|
| Trivial (short commands like "play X") | `claude-haiku-4-5` | 1024 |
| Complex (substantive questions) | `claude-sonnet-4-6` | 4096, thinking adaptive |

### TF-IDF Memory Retrieval

Avoids stuffing all memories into the prompt. Top 14 most relevant + 3 most
recent.

### Safe History Truncation

`safeTruncateHistory` finds a clean cut point (user message without
`tool_result` blocks) so the API doesn't reject the call with orphaned tool
results.

### Gemini Cooldown

When Gemini TTS returns 429 (quota exhausted), it's disabled for 60s and
Web Speech takes over. No flood of failed requests.

---

## Voice Commands Cheat Sheet

### Information
- *"What time is it?"*
- *"What's the weather?"*
- *"Get the latest news"*
- *"Look up [topic]"* / *"Research [topic]"* / *"Learn about [topic]"*
- *"What do you know about me?"*
- *"What did we talk about yesterday?"*

### Computer control
- *"Open Spotify"* / *"Launch Chrome"*
- *"Open my Downloads folder"*
- *"Take a screenshot and tell me what's on screen"*
- *"What's my CPU usage?"*
- *"Set volume to 30"*
- *"Type 'hello world' into this window"*

### Browser
- *"Play Beat It on YouTube Music"*
- *"Play some Daft Punk"*
- *"Open YouTube and search for [...]"*
- *"What's on this page?"* (after browser_navigate)

### Memory + skills
- *"Remember that my favourite colour is blue"*
- *"Forget what I told you about [...]"*
- *"Save a skill called morning_routine: check weather, read news, set focus mood"*
- *"Run morning routine"*
- *"What routines do I have?"*

### Reminders
- *"Remind me to call Mum in 10 minutes"*
- *"Remind me to drink water in 2 hours"*

### Vision
- *"What am I looking at?"*
- *"What am I holding?"*

### Reasoning
- *"Explain quantum entanglement in simple terms"* (triggers thinking)
- *"Compute the 25th Fibonacci number"*
- *"What's 17.5% of 2403?"*

### Mode + persona
- *"Switch to alert mode and stay there"*
- *"Go back to default"*
- *"Switch to Friday"* / *"Back to LEO"*

### Interruption (any time during reply)
- *"Stop"* / *"Wait"* / *"Cancel"* / *"Quiet"*

---

## Troubleshooting

### LEO isn't replying

1. Check **DevTools console** (F12) for `[LEO API]` or `[LEO Gemini TTS FAIL]` errors
2. Check the **AGENT** status in the bottom bar — if OFFLINE, agent server isn't reachable
3. Reload the page — clears in-memory `convHistory` corruption
4. Verify your **Anthropic key** in `config.local.js` is correct

### Agent shows OFFLINE

- Agent server isn't running, **or**
- Tunnel died (if accessing via tunnel URL — relaunch)
- Check `netstat -an | findstr :3000` — should show LISTEN
- Restart with `start-leo.bat`

### Gemini quota errors (429)

You've hit the free tier limit (~10 req/min, small daily cap). Either:

- Wait — the auto-cooldown disables Gemini for 60s and uses Web Speech
- Enable billing on Google Cloud for the project (very cheap, ~fractions of a cent per reply)

### Speech recognition isn't working

- Check the mic icon in the URL bar — permission granted?
- Chrome required (Web Speech API isn't reliable on Firefox/Safari)
- Test in DevTools: `handleUtterance('hello leo')` — if this works, the issue is the mic, not the API

### Browser automation fails to sign in to Google

- The agent uses `channel: 'chrome'`, which requires your installed Chrome
- If signed-in errors persist, wipe the profile: delete `~/.leo-browser-profile`

### Avatar face doesn't appear

- The first FaceMesh detection must succeed — make sure you're visible to the webcam
- Press `R` to re-capture
- Check console for MediaPipe `[INFO]` messages — model load may have failed

### YouTube Music doesn't play

- Sign in to Google + YouTube Music in the LEO-controlled Chrome window (first-run setup)
- If still failing, check `[YTM strategy 2]` errors in agent server logs — YouTube may have changed selectors

---

## Privacy & Security

### What stays local

- Hand + face landmarks (MediaPipe runs in-browser)
- Memory, transcripts, skills, patterns (localStorage)
- The Playwright Chrome profile and its cookies
- Camera frames (never uploaded except when explicitly via `analyze_camera`)

### What leaves your machine

- Voice transcripts → Anthropic (via the Web Speech API → Google for STT,
  then text → Anthropic for Claude)
- TTS text → Gemini for synthesis
- Camera frames → Anthropic when you explicitly call `analyze_camera`
- Screenshots → Anthropic when Claude calls `take_screenshot`
- Browser content → Anthropic when Claude calls `browser_read` or `browser_screenshot`

### Token + tunnel security

- The agent server is protected by a Bearer token. **Change the default
  `leo-local-token`** to something secret before sharing your tunnel URL.
- The tunnel URL is random and dies with the launcher. Don't share it publicly.

### Public repo safety

- `config.local.js` is gitignored — your real keys never reach GitHub
- The default `start-leo.bat` doesn't transmit your config externally

---

## Cost

### Anthropic

- Sonnet 4.6: $3/M input tokens, $15/M output
- Haiku 4.5: $1/M input, $5/M output
- Prompt caching saves ~90% on the cached prefix after first call

Typical Sonnet turn with full system prompt + adaptive thinking + tool use:
roughly $0.01–$0.05. Trivial Haiku commands: under $0.001.

### Gemini TTS

- Free tier: ~10 requests/minute, daily cap
- Paid tier (with billing enabled): fractions of a cent per request

### Cloudflare tunnels

Completely free, no signup, no card.

### Everything else

Free — MediaPipe, Three.js, Playwright, Web Speech, all included.

---

## Customization

### Change the voice's accent

```js
sessionStorage.setItem('leo_gemini_style',
  'Speak in a Scottish accent — warm, friendly, with a slight burr');
location.reload();
```

### Try different Gemini voices

```js
sessionStorage.setItem('leo_gemini_voice', 'Orus');  // firm male
sessionStorage.setItem('leo_gemini_voice', 'Aoede'); // warm female
location.reload();
```

### Change the persona

Edit `SYSTEM_STABLE` in `LEO.html` — that's the cached persona block. Just
remember any byte change here busts the cache for that session.

### Add a custom tool

1. Define it in the `PROACTIVE_TOOLS` array with `name`, `description`,
   `input_schema`
2. Add a `case 'your_tool':` branch in `dispatchProactiveTool`
3. Reload — Claude will see it on the next turn

### Adjust always-listen sensitivity

Edit `MIN_ALWAYS_WORDS` in `LEO.html` — increase from 2 to 3 or 4 to
ignore short stray phrases.

---

## Known Limitations

- **Windows-only launcher** — adapting `start-leo.bat` and the
  PowerShell tools to macOS/Linux is straightforward but not done
- **Web Speech STT** requires Chrome — Firefox and Safari support it
  partially or not at all
- **Wake word is software-side** — runs the full Web Speech recognizer
  continuously when armed. Battery-light it isn't. Real wake-word engines
  (Picovoice Porcupine, Snowboy) would be more efficient
- **No streaming responses** — LEO waits for the full Claude response
  before starting TTS. Adds 2–5s latency on Sonnet replies. Could be fixed
  by parsing SSE response and chunk-feeding to TTS sentence-by-sentence
- **No multi-user voice ID** — if multiple people are talking, LEO
  doesn't distinguish
- **YouTube Music selectors are scraped** — if Google changes their DOM,
  `play_youtube_music` breaks until updated. A proper Spotify integration
  via their API would be more robust
- **Gemini TTS quota is tight on free tier** — frequent users will hit 429
  often. Enable billing or stick with the Web Speech fallback
- **Cloudflare tunnels are ephemeral** — new URL on every launch. Cloudflare
  Tunnel with a named tunnel + DNS would give a stable URL, but requires a
  Cloudflare account

---

Built progressively in Claude Code. See commit history for the timeline.
