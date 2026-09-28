export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

/** Frame-rate independent exponential smoothing. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}

export function formatNum(n: number): string {
  return n.toLocaleString('en-US')
}

/**
 * Readable text colour (near-black or white) for text placed on a team colour.
 * WCAG: black wins when the colour's luminance ≥ ~0.184.
 */
export function onColor(hex: string): string {
  const m = hex.replace('#', '')
  const ch = (i: number) => parseInt(m.slice(i, i + 2), 16) / 255
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const L = 0.2126 * lin(ch(0)) + 0.7152 * lin(ch(2)) + 0.0722 * lin(ch(4))
  return L >= 0.184 ? '#050507' : '#ffffff'
}
