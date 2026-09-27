/**
 * Zero-Literacy Vernacular Text-to-Speech (TTS) & Audio Cues Service
 * Supports Hindi (hi-IN) and Marathi (mr-IN)
 * Includes Web Audio chime synthesizers for low-literacy immediate confirmation
 */

class AudioVoiceService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.audioCtx = null;
    this.isSpeakingNow = false;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Synthesize audio chimes (Success, Warning, Click)
   */
  playChime(type = 'click') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'success') {
        // High harmonic ascending chime for payments
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'hazard') {
        // Pulsing two-tone urgent emergency siren
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.15);
        osc.frequency.linearRampToValueAtTime(880, now + 0.3);
        osc.frequency.linearRampToValueAtTime(440, now + 0.45);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'weight') {
        // Tactile scale click
        osc.frequency.setValueAtTime(320, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else {
        // Subtle interface tap
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      console.warn('Audio chime warning:', e);
    }
  }

  /**
   * Speak out loud in Hindi or Marathi
   * @param {string} text 
   * @param {'hi' | 'mr'} languageCode 
   */
  speak(text, languageCode = 'hi') {
    if (!text) return;

    // Trigger haptic feedback if supported on mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }

    if (!this.synth) {
      this.playChime('click');
      return;
    }

    try {
      this.synth.cancel(); // Stop any pending speech
    } catch {
      // ignore
    }

    const langTarget = languageCode === 'mr' ? 'mr-IN' : 'hi-IN';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langTarget;
    utterance.rate = 0.95; // Slightly slower for low-literacy clarity
    utterance.pitch = 1.05;

    // Find best matching voice
    if (this.voices.length > 0) {
      const match = this.voices.find(v => 
        v.lang === langTarget || 
        v.lang.startsWith(languageCode) || 
        v.name.toLowerCase().includes(languageCode === 'mr' ? 'marathi' : 'hindi')
      );
      if (match) {
        utterance.voice = match;
      }
    }

    this.isSpeakingNow = true;
    utterance.onend = () => {
      this.isSpeakingNow = false;
    };
    utterance.onerror = () => {
      this.isSpeakingNow = false;
    };

    try {
      this.synth.speak(utterance);
    } catch (e) {
      console.error('SpeechSynthesis error:', e);
      this.isSpeakingNow = false;
      this.playChime('click');
    }
  }

  stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
    this.isSpeakingNow = false;
  }
}

export const ttsService = new AudioVoiceService();
