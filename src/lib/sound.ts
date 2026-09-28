/**
 * Tiny synthesized "engine blip" — no audio files, WebAudio only.
 * Off by default; only ever starts after a user gesture (the toggle).
 */
class EngineSound {
  private ctx: AudioContext | null = null
  enabled = false

  toggle(): boolean {
    this.enabled = !this.enabled
    if (this.enabled) {
      this.ensure()
      this.ctx?.resume()
      this.rev(0.5)
    }
    return this.enabled
  }

  private ensure() {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (Ctx) this.ctx = new Ctx()
    }
    return this.ctx
  }

  /** Short rising rev — intensity 0..1 */
  rev(intensity = 0.6) {
    if (!this.enabled) return
    const ctx = this.ensure()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(70, now)
    osc.frequency.exponentialRampToValueAtTime(140 + 420 * intensity, now + 0.16)
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.42)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(600, now)
    filter.frequency.exponentialRampToValueAtTime(2600, now + 0.16)

    const peak = 0.05 + 0.06 * intensity
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)

    osc.connect(filter).connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.5)
  }
}

export const engineSound = new EngineSound()
