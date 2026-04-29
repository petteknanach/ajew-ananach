// WhisperService.js — Voice input: speech-to-text for search & hisbodedus notes
// Uses expo-speech-recognition (or falls back gracefully)

const WHISPER_SERVICE = {
  _SpeechRecognition: null,
  _isListening: false,
  _listeners: [],
  _supported: null,

  // ── Init ──
  async isSupported() {
    if (this._supported !== null) return this._supported;
    try {
      // Try expo-speech-recognition
      const SpeechRecognition = require('expo-speech-recognition');
      const { granted } = await SpeechRecognition.requestPermissionsAsync();
      this._SpeechRecognition = SpeechRecognition;
      this._supported = granted;
      return granted;
    } catch (e) {
      // Fallback: try @react-native-voice/voice
      try {
        const Voice = require('@react-native-voice/voice').default;
        this._SpeechRecognition = Voice;
        this._supported = true;
        return true;
      } catch (e2) {
        console.warn('Speech recognition not available:', e2.message);
        this._supported = false;
        return false;
      }
    }
  }

  // ── Listen ──
  async startListening(options = {}) {
    const {
      language = 'he-IL', // Default Hebrew for the app
      onResult,
      onPartialResult,
      onError,
      onEnd,
    } = options;

    if (!await this.isSupported()) {
      onError?.('Speech recognition not available on this device');
      return { error: 'Speech recognition not available' };
    }

    if (this._isListening) {
      await this.stopListening();
    }

    this._isListening = true;

    try {
      if (this._SpeechRecognition.startAsync) {
        // expo-speech-recognition API
        const result = await this._SpeechRecognition.startAsync({
          lang: language,
          interimResults: true,
        });
        return result;
      } else if (this._SpeechRecognition.start) {
        // @react-native-voice/voice API
        this._SpeechRecognition.onSpeechResults = (e) => {
          const text = e.value?.[0] || '';
          onResult?.(text);
          onEnd?.();
          this._isListening = false;
        };
        this._SpeechRecognition.onSpeechPartialResults = (e) => {
          onPartialResult?.(e.value?.[0] || '');
        };
        this._SpeechRecognition.onSpeechError = (e) => {
          onError?.(e.error?.message || 'Speech recognition error');
          this._isListening = false;
        };
        await this._SpeechRecognition.start(language);
        return { success: true };
      }
    } catch (e) {
      this._isListening = false;
      onError?.(e.message);
      return { error: e.message };
    }
  }

  async stopListening() {
    this._isListening = false;
    try {
      if (this._SpeechRecognition?.stopAsync) {
        await this._SpeechRecognition.stopAsync();
      } else if (this._SpeechRecognition?.stop) {
        await this._SpeechRecognition.stop();
      }
    } catch (e) {
      console.warn('Stop listening error:', e);
    }
  }

  // ── Convenience: Voice Search ──
  async voiceSearch({ language = 'he-IL', onResult, onPartial, onError }) {
    let finalText = '';
    return new Promise((resolve, reject) => {
      this.startListening({
        language,
        onPartialResult: (text) => {
          onPartial?.(text);
        },
        onResult: (text) => {
          finalText = text;
          onResult?.(text);
          resolve(finalText);
        },
        onError: (err) => {
          onError?.(err);
          reject(err);
        },
        onEnd: () => {
          if (finalText) resolve(finalText);
        },
      });
    });
  }

  // ── Convenience: Dictate Note ──
  async dictateNote({ language = 'he-IL', onPartial, onError }) {
    return this.voiceSearch({ language, onPartial, onError });
  }

  // ── Status ──
  isListening() {
    return this._isListening;
  }
};

export default WHISPER_SERVICE;
