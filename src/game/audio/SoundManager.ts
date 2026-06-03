// Procedural audio — no external files required
export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private enabled = true;

  init() {
    try {
      this.ctx = new (window.AudioContext || (window as never)["webkitAudioContext"])();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.28;
      this.masterGain.connect(this.ctx.destination);
      this.startAmbient();
    } catch {
      this.enabled = false;
    }
  }

  resume() {
    this.ctx?.resume();
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = this.enabled ? 0.28 : 0;
    }
    return this.enabled;
  }

  // ── Ambient dark drone ────────────────────────────────────────────────────
  private startAmbient() {
    if (!this.ctx || !this.masterGain) return;
    const drones = [55, 82.5, 110];
    drones.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();

      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;

      lfo.type = "sine";
      lfo.frequency.value = 0.08 + i * 0.05;
      lfoGain.gain.value = 0.015;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      gain.gain.value = 0.04 - i * 0.008;
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start();
      lfo.start();
      this.ambientOscs.push(osc);
    });
  }

  // ── SFX helpers ───────────────────────────────────────────────────────────
  private note(freq: number, duration: number, type: OscillatorType = "sine", vol = 0.15) {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private noise(duration: number, vol = 0.08) {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const bufSize = this.ctx.sampleRate * duration;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    src.connect(gain);
    gain.connect(this.masterGain);
    src.start();
  }

  // ── Public sound effects ──────────────────────────────────────────────────
  playAttack() {
    this.noise(0.12, 0.1);
    this.note(180, 0.1, "sawtooth", 0.08);
  }

  playHit() {
    this.noise(0.08, 0.12);
    this.note(120, 0.15, "square", 0.06);
  }

  playMagic() {
    if (!this.ctx || !this.enabled) return;
    const freqs = [440, 660, 880, 1100];
    freqs.forEach((f, i) => {
      setTimeout(() => this.note(f, 0.25, "sine", 0.1), i * 60);
    });
  }

  playHeal() {
    const freqs = [523, 659, 784];
    freqs.forEach((f, i) => setTimeout(() => this.note(f, 0.3, "sine", 0.08), i * 80));
  }

  playLevelUp() {
    const melody = [261, 329, 392, 523, 659];
    melody.forEach((f, i) => setTimeout(() => this.note(f, 0.3, "triangle", 0.12), i * 100));
  }

  playVictory() {
    const melody = [392, 523, 659, 784, 1047];
    melody.forEach((f, i) => setTimeout(() => this.note(f, 0.35, "sine", 0.1), i * 120));
  }

  playDefeat() {
    const melody = [440, 370, 311, 220];
    melody.forEach((f, i) => setTimeout(() => this.note(f, 0.4, "sawtooth", 0.08), i * 150));
  }

  playDemonSpecial() {
    if (!this.ctx || !this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  playClick() {
    this.note(800, 0.05, "square", 0.06);
  }

  playPurchase() {
    const notes = [523, 659, 784];
    notes.forEach((f, i) => setTimeout(() => this.note(f, 0.15, "sine", 0.08), i * 50));
  }

  playItemUse() {
    this.note(660, 0.2, "sine", 0.1);
    setTimeout(() => this.note(880, 0.2, "sine", 0.08), 80);
  }
}

// Singleton
export const soundManager = new SoundManager();
