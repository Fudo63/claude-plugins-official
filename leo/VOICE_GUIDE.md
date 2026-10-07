# LEO Voice Commands Guide 🎤

Your Leonardo personal assistant can now **listen and speak German**!

## Quick Start

### 1. **Speak to LEO**
- Press & hold **SPACE** to record
- Speak in German (any accent works!)
- Release to send

### 2. **LEO Responds**
- Text-to-speech in German
- Deep male voice (Leonardo style 🎬)
- Audio plays automatically

### 3. **Voice Commands**

| Command | German | Action |
|---------|--------|--------|
| "Hey Leo" | "Hey Leo" | Wake up / Activate |
| "Stop" | "Stop" or "Höre auf" | Stop speaking |
| "Louder" | "Lauter" | Increase volume |
| "Mute" | "Leise" | Decrease volume |
| "Save" | "Speichern" | Save conversation |
| "Forget" | "Vergessen" | Forget last exchange |

## How It Works

### 🎤 **Speech Recognition**
- **Browser Native:** Web Speech API (Chrome, Edge, Safari)
- **Language:** German (de-DE)
- **Input:** Microphone
- **Accuracy:** ~95% with clear speech

### 🔊 **Text-to-Speech**
- **Browser Native:** Web Speech Synthesis API
- **Voice:** System German voice (male, deep)
- **Fallback:** Web Speech API default
- **Future:** Leonardo DiCaprio custom voice (when trained)

### 👤 **Avatar**
- **Name:** LEO (Leonardo)
- **Style:** Cartoon sketch (modern tech aesthetic)
- **Reactions:**
  - 🎤 Listening indicator (orange glow)
  - 💬 Speaking indicator (green glow)
  - 👁️ Eye movement (tracking)
  - 👄 Lip sync (during speech)

## Tips for Best Results

### 📢 Speaking to LEO
- ✅ Speak clearly and naturally
- ✅ Use German or English (if set)
- ✅ Short pauses between sentences
- ✅ No need to shout - normal volume fine

### ❌ Avoid
- ❌ Extreme accents (may reduce accuracy)
- ❌ Background noise (music, traffic)
- ❌ Very fast speech (give it time)
- ❌ Overlapping sounds

### 🎧 Audio Quality
- Use a good microphone
- Reduce background noise
- Close other audio apps
- Stable internet for cloud TTS (if used)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **SPACE** | Hold to speak |
| **W** | Toggle wake word listening |
| **Q** | Toggle always-listen mode |
| **R** | Reset avatar pose |
| **M** | Mute/unmute |
| **ESC** | Stop everything |

## Avatar Indicators

### 👁️ **Eyes**
- **Open:** Listening or thinking
- **Blink:** Natural behavior
- **Blinking fast:** Processing

### 🟠 **Orange Glow (Listening)**
- Microphone is active
- Waiting for your input
- Ready to record

### 🟢 **Green Glow (Speaking)**
- LEO is talking
- Audio output active
- Wait for response to finish

### 💭 **Internal Monologue**
- LEO's thinking process (if enabled)
- Shows chain-of-thought
- Real-time reasoning visible

## Troubleshooting

### 🎤 Microphone Not Working?
1. Check browser permissions (allow microphone)
2. Test system microphone in Settings
3. Try different browser (Chrome works best)
4. Restart browser and try again

### 🔊 No Sound Output?
1. Check system volume
2. Enable speakers/headphones
3. Check browser volume isn't muted
4. Try different audio device

### 🤖 LEO Not Responding?
1. Check internet connection (for cloud TTS)
2. Verify Anthropic API key in config
3. Check browser console for errors
4. Try simpler sentences first

### 🗣️ Speech Not Recognized?
1. Speak more clearly
2. Reduce background noise
3. Try shorter sentences
4. Ensure de-DE language selected

## German Speech Tips

### Pronunciation Help
- **ü** = ü sound (like French "u")
- **ö** = ö sound (like French "eu")
- **ä** = ä sound (like short "e")
- **ch** = guttural sound (like Spanish "j")

### Common Phrases
- "Hallo Leo" = "Hello Leo"
- "Wie geht's?" = "How are you?"
- "Das ist cool" = "That's cool"
- "Vergiss das" = "Forget that"
- "Speichere das" = "Save that"

## Voice Customization

### Adjust Pitch (Deep/High)
In config: `pitch: 0.8` (0.5-2.0)
- Lower = deeper voice
- Higher = higher voice

### Adjust Speed
In config: `rate: 0.95` (0.5-2.0)
- Lower = slower
- Higher = faster

### Adjust Volume
In config: `volume: 1.0` (0-1.0)
- 0 = mute
- 1 = full volume

## Upcoming Features 🚀

### 🎬 Leonardo DiCaprio Voice
- Custom voice trained from German "Wolf of Wall Street"
- Deep, dramatic male voice
- Exact tone and style
- Coming soon!

### 🎵 Voice Effects
- Background music/ambience
- Multiple voice personalities
- Emotional expression in speech

### 🧠 Enhanced Context
- Remembers your voice preferences
- Adapts to your speech patterns
- Learns your accent
- Personalizes responses

## Privacy & Security

✅ **Speech Recognition:**
- Processed locally (browser)
- Not sent to cloud
- No recording stored

⚠️ **Text-to-Speech:**
- Current setup: Web Speech API (local)
- Optional cloud: Google Gemini (if configured)
- Leonardo voice: Local RVC (after training)

## Advanced Setup

### Using Google Cloud TTS (Optional)
For higher quality German voices:

1. Get Google Cloud API key
2. Add to config:
```javascript
{
  provider: 'google-cloud',
  apiKey: process.env.GOOGLE_CLOUD_TTS_KEY,
  voice: 'de-DE-Wavenet-B'  // Male voice
}
```

### Voice Cloning (When Videos Ready)
When you provide Leonardo DiCaprio audio:

1. Extract audio from videos
2. Train RVC model (~8 hours)
3. Deploy voice to LEO
4. All speech uses new voice

## Contact & Support

- 🐛 Report issues: Check console (F12)
- 💡 Feature requests: Document in memory
- 📝 Transcripts: Saved in Obsidian vault

---

**Your personal assistant is ready to listen!** 🎙️

Start speaking and LEO will respond! 🎬
