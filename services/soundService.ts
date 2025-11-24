// Simple synth beeps to avoid loading external assets and dealing with 404s.
class SoundService {
  private audioContext: AudioContext | null = null;

  private init() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }
  }

  public async playLevelChange() {
    this.init();
    if (!this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const now = this.audioContext.currentTime;

    // High pitch beep sequence
    this.playTone(880, now, 0.1, 'sine');
    this.playTone(880, now + 0.15, 0.1, 'sine');
    this.playTone(1760, now + 0.3, 0.4, 'square');
  }

  public async playWarning() {
    this.init();
    if (!this.audioContext) return;
    if (this.audioContext.state === 'suspended') await this.audioContext.resume();
    
    const now = this.audioContext.currentTime;
    this.playTone(440, now, 0.1, 'triangle');
  }

  private playTone(freq: number, startTime: number, duration: number, type: OscillatorType) {
    if (!this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const soundService = new SoundService();