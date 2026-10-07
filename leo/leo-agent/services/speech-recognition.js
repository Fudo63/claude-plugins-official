/**
 * LEO Speech Recognition Service
 * Handles German speech-to-text and text-to-speech
 */

class LeoSpeechRecognition {
  constructor() {
    this.isListening = false;
    this.transcript = '';
    this.isFinal = false;
  }

  /**
   * Initialize Web Speech API for German
   */
  initializeRecognition(onResult, onError) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('❌ Speech Recognition not supported in this browser');
      return null;
    }

    const recognition = new SpeechRecognition();

    // German language
    recognition.lang = 'de-DE';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Listening for German speech...');
      this.isListening = true;
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          this.transcript += transcript + ' ';
          this.isFinal = true;
        } else {
          interimTranscript += transcript;
        }
      }

      if (onResult) {
        onResult({
          final: this.isFinal,
          transcript: this.transcript,
          interim: interimTranscript
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('🎤 Speech error:', event.error);
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      this.isListening = false;
    };

    return recognition;
  }

  /**
   * Text-to-Speech using Web Speech API
   * Supports German with deep male voice
   */
  async speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);

      // German language
      utterance.lang = 'de-DE';

      // Voice settings for deep male voice
      utterance.rate = options.rate || 1.0;        // Speed
      utterance.pitch = options.pitch || 0.8;      // Lower pitch = deeper voice
      utterance.volume = options.volume || 1.0;

      // Try to find a German male voice
      const voices = window.speechSynthesis.getVoices();
      const germanMaleVoice = voices.find(voice =>
        voice.lang.includes('de') && voice.name.includes('male')
      ) || voices.find(voice => voice.lang.includes('de'));

      if (germanMaleVoice) {
        utterance.voice = germanMaleVoice;
      }

      utterance.onend = () => {
        console.log('✅ Speech finished');
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('❌ Speech error:', event.error);
        reject(event.error);
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Cancel ongoing speech
   */
  stopSpeaking() {
    window.speechSynthesis.cancel();
  }

  /**
   * Get available voices
   */
  getAvailableVoices() {
    return window.speechSynthesis.getVoices().filter(voice =>
      voice.lang.includes('de')
    );
  }
}

// Export for use in Leo.html
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LeoSpeechRecognition;
}
