import type { Faction } from '@/types';

interface AmbientProfile {
  droneFreq: number;
  droneDetune: number;
  droneType: OscillatorType;
  textureFilterFreq: number;
  textureQ: number;
  pulseBaseFreq: number;
  pulseInterval: [number, number];
}

const AMBIENT_PROFILES: Record<Faction, AmbientProfile> = {
  TECHNOCRATS: {
    droneFreq: 55, droneDetune: -5, droneType: 'sawtooth',
    textureFilterFreq: 2000, textureQ: 8,
    pulseBaseFreq: 880, pulseInterval: [6, 12],
  },
  KEEPERS_OF_THE_VEIL: {
    droneFreq: 42, droneDetune: 0, droneType: 'sine',
    textureFilterFreq: 800, textureQ: 4,
    pulseBaseFreq: 440, pulseInterval: [10, 18],
  },
  IRONBORN_COLLECTIVE: {
    droneFreq: 38, droneDetune: -10, droneType: 'square',
    textureFilterFreq: 1200, textureQ: 6,
    pulseBaseFreq: 220, pulseInterval: [5, 10],
  },
};

class SoundManagerClass {
  private context: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  // Ambient state
  private ambientPlaying: boolean = false;
  private ambientVolume: number = 0.15;
  private ambientMaster: GainNode | null = null;
  private ambientDroneOsc: OscillatorNode | null = null;
  private ambientDroneLfo: OscillatorNode | null = null;
  private ambientNoiseSource: AudioBufferSourceNode | null = null;
  private ambientPulseTimer: number | null = null;
  private ambientFaction: Faction = 'TECHNOCRATS';

  private getContext(): AudioContext {
    if (!this.context) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.context = new AudioCtx();
      }
    }
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
    return this.context!;
  }

  setEnabled(value: boolean) {
    this.enabled = value;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
  }

  getVolume(): number {
    return this.volume;
  }

  playKeystroke() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('[SoundManager] playKeystroke error:', e);
    }
  }

  playGlitch() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      source.start(ctx.currentTime);
    } catch (e) {
      console.warn('[SoundManager] playGlitch error:', e);
    }
  }

  playNotification() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
      gain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('[SoundManager] playNotification error:', e);
    }
  }

  playBoot() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 1.5);
      gain.gain.setValueAtTime(this.volume * 0.1, ctx.currentTime);
      gain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.warn('[SoundManager] playBoot error:', e);
    }
  }

  playError() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(100, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('[SoundManager] playError error:', e);
    }
  }

  playCombatHit() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();

      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
      }
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      source.start(ctx.currentTime);

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
      oscGain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('[SoundManager] playCombatHit error:', e);
    }
  }

  playLevelUp() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
        gain.gain.linearRampToValueAtTime(this.volume * 0.2, ctx.currentTime + i * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.3);
      });
    } catch (e) {
      console.warn('[SoundManager] playLevelUp error:', e);
    }
  }

  playQuestComplete() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain1.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.3);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.45);

      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
      gain3.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc3.start(ctx.currentTime + 0.3);
      osc3.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('[SoundManager] playQuestComplete error:', e);
    }
  }

  playFactionSelect() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(550, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(this.volume * 0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('[SoundManager] playFactionSelect error:', e);
    }
  }

  resumeContext() {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  // ─── Ambient Track ───

  startAmbient(faction?: Faction) {
    if (this.ambientPlaying) return;
    try {
      const ctx = this.getContext();
      const profile = AMBIENT_PROFILES[faction ?? this.ambientFaction];
      if (faction) this.ambientFaction = faction;

      // Master gain for ambient
      this.ambientMaster = ctx.createGain();
      this.ambientMaster.gain.setValueAtTime(0, ctx.currentTime);
      this.ambientMaster.gain.linearRampToValueAtTime(this.ambientVolume, ctx.currentTime + 2);
      this.ambientMaster.connect(ctx.destination);

      // Layer 1: Drone oscillator with LFO tremolo
      this.ambientDroneOsc = ctx.createOscillator();
      this.ambientDroneOsc.type = profile.droneType;
      this.ambientDroneOsc.frequency.setValueAtTime(profile.droneFreq, ctx.currentTime);
      this.ambientDroneOsc.detune.setValueAtTime(profile.droneDetune, ctx.currentTime);

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.6, ctx.currentTime);

      // LFO for slow volume modulation on the drone
      this.ambientDroneLfo = ctx.createOscillator();
      this.ambientDroneLfo.type = 'sine';
      this.ambientDroneLfo.frequency.setValueAtTime(0.08, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.15, ctx.currentTime);
      this.ambientDroneLfo.connect(lfoGain);
      lfoGain.connect(droneGain.gain);

      this.ambientDroneOsc.connect(droneGain);
      droneGain.connect(this.ambientMaster);
      this.ambientDroneOsc.start(ctx.currentTime);
      this.ambientDroneLfo.start(ctx.currentTime);

      // Layer 2: Filtered noise texture
      const noiseDuration = 60;
      const bufferSize = ctx.sampleRate * noiseDuration;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        noiseData[i] = Math.random() * 2 - 1;
      }

      this.ambientNoiseSource = ctx.createBufferSource();
      this.ambientNoiseSource.buffer = noiseBuffer;
      this.ambientNoiseSource.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(profile.textureFilterFreq, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(profile.textureQ, ctx.currentTime);

      // Slow filter sweep
      const sweepDuration = 30;
      noiseFilter.frequency.linearRampToValueAtTime(
        profile.textureFilterFreq * 0.5, ctx.currentTime + sweepDuration
      );

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, ctx.currentTime);

      this.ambientNoiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ambientMaster);
      this.ambientNoiseSource.start(ctx.currentTime);

      // Layer 3: Periodic data pulses
      this.schedulePulse(profile);

      this.ambientPlaying = true;

      // Pause when tab hidden
      document.addEventListener('visibilitychange', this.handleVisibility);
    } catch (e) {
      console.warn('[SoundManager] startAmbient error:', e);
    }
  }

  private schedulePulse(profile: AmbientProfile) {
    const [minInterval, maxInterval] = profile.pulseInterval;
    const delay = (minInterval + Math.random() * (maxInterval - minInterval)) * 1000;

    this.ambientPulseTimer = window.setTimeout(() => {
      if (!this.ambientPlaying || !this.ambientMaster) return;
      try {
        const ctx = this.getContext();
        const freq = profile.pulseBaseFreq * (0.8 + Math.random() * 0.4);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(gain);
        gain.connect(this.ambientMaster);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.5);
      } catch { /* ignore pulse errors */ }
      this.schedulePulse(profile);
    }, delay);
  }

  stopAmbient() {
    if (!this.ambientPlaying) return;
    try {
      const ctx = this.context;
      if (ctx && this.ambientMaster) {
        // Fade out over 1.5s
        this.ambientMaster.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
        const cleanup = () => {
          this.ambientDroneOsc?.stop();
          this.ambientDroneLfo?.stop();
          this.ambientNoiseSource?.stop();
          this.ambientDroneOsc?.disconnect();
          this.ambientDroneLfo?.disconnect();
          this.ambientNoiseSource?.disconnect();
          this.ambientMaster?.disconnect();
          this.ambientDroneOsc = null;
          this.ambientDroneLfo = null;
          this.ambientNoiseSource = null;
          this.ambientMaster = null;
        };
        setTimeout(cleanup, 1600);
      }
    } catch { /* ignore stop errors */ }

    if (this.ambientPulseTimer !== null) {
      clearTimeout(this.ambientPulseTimer);
      this.ambientPulseTimer = null;
    }

    document.removeEventListener('visibilitychange', this.handleVisibility);
    this.ambientPlaying = false;
  }

  setAmbientVolume(value: number) {
    this.ambientVolume = Math.max(0, Math.min(1, value));
    if (this.ambientMaster && this.context) {
      this.ambientMaster.gain.linearRampToValueAtTime(
        this.ambientVolume, this.context.currentTime + 0.1
      );
    }
  }

  getAmbientVolume(): number {
    return this.ambientVolume;
  }

  isAmbientPlaying(): boolean {
    return this.ambientPlaying;
  }

  private handleVisibility = () => {
    if (!this.ambientPlaying || !this.ambientMaster || !this.context) return;
    if (document.hidden) {
      this.ambientMaster.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.5);
    } else {
      this.context.resume();
      this.ambientMaster.gain.linearRampToValueAtTime(
        this.ambientVolume, this.context.currentTime + 1
      );
    }
  };
}

export const SoundManager = new SoundManagerClass();
