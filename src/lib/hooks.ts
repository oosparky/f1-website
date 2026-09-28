import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** Big screen + fine pointer + plenty of cores → full 3D treatment. */
export function useHighEndDevice(): boolean {
  const wide = useMediaQuery('(min-width: 1024px)')
  const fine = useMediaQuery('(pointer: fine)')
  const [strong, setStrong] = useState(true)
  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 4
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
    setStrong(cores >= 6 && memory >= 4)
  }, [])
  return wide && fine && strong
}

/** Runs after first paint (or immediately if the browser has idle callbacks). */
export function runWhenIdle(fn: () => void, timeout = 900) {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(fn, { timeout })
  } else {
    setTimeout(fn, 250)
  }
}
