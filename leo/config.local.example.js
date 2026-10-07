// Copy this file to `config.local.js` and fill in your real keys.
// `config.local.js` is gitignored so secrets never reach the repo.
window.LEO_CONFIG = {
  // Anthropic API key — https://console.anthropic.com/settings/keys
  anthropicKey: '',

  // Gemini API key (optional, enables higher-quality TTS)
  // Free key from https://aistudio.google.com/apikey
  geminiKey: '',

  // Default Gemini voice. Options: Charon (deep male, LEO-like),
  // Orus, Fenrir, Puck, Kore, Aoede, Zephyr.
  geminiVoice: 'Charon',

  // Token the web app sends to the agent server. Must match
  // LEO_TOKEN in leo-agent/.env (defaults to "leo-local-token").
  agentToken: 'leo-local-token'
};
