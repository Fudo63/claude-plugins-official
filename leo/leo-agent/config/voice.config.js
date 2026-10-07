/**
 * LEO Voice Configuration
 * Configure German speech recognition & text-to-speech
 */

module.exports = {
  // Speech Recognition Settings
  recognition: {
    language: 'de-DE',           // German
    continuous: false,           // Stop after one phrase
    interimResults: true,        // Show results while speaking
    maxAlternatives: 1
  },

  // Text-to-Speech Settings
  synthesis: {
    language: 'de-DE',           // German

    // Test voice (Web Speech API)
    testVoice: {
      lang: 'de-DE',
      pitch: 0.8,                // Lower = deeper voice
      rate: 0.95,                // Slightly slower (more dramatic)
      volume: 1.0
    },

    // Future: Leonardo DiCaprio voice (when voice clone ready)
    leoVoice: {
      provider: 'rvc',           // Real-Time Voice Conversion
      model: 'leonardo-diCaprio-de', // Custom trained model
      pitch: 0.75,               // Very deep male voice
      rate: 0.9,
      volume: 1.0
    },

    // Fallback voice settings
    fallback: {
      lang: 'de-DE',
      pitch: 0.8,
      rate: 1.0,
      volume: 1.0
    }
  },

  // Voice commands
  commands: {
    enabled: true,
    language: 'de-DE',

    // Keywords to trigger actions
    triggers: {
      'hey leo': 'wake',           // Activate
      'leonardo': 'wake',          // Alternative
      'stop': 'stop_speaking',     // Stop output
      'höre auf': 'stop_speaking', // German: Stop
      'leise': 'mute',             // German: Mute
      'lauter': 'louder',          // German: Louder
      'speichern': 'save',         // German: Save
      'vergessen': 'forget'        // German: Forget
    }
  },

  // Audio visualization
  visualization: {
    enabled: true,
    type: 'waveform',        // 'waveform', 'spectrum', 'bars'
    color: '#00ff88',        // Green
    frequency: 60            // Update Hz
  },

  // Voice activity detection
  vad: {
    enabled: true,
    silenceThreshold: 0.02,  // Noise floor
    silenceTimeout: 2000     // ms to stop recording
  }
};
