/**
 * Minimal hash-based router — no dependency, works on any static host.
 *
 *   #/                  → home
 *   #/drivers           → driver grid
 *   #/drivers/max-verstappen → detail page
 *   #/teams, #/about
 */
import { useCallback, useEffect, useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()

/** Normalised current path, e.g. "/drivers/max-verstappen" (never contains "#"). */
export function getPath(): string {
  const raw = window.location.hash.replace(/^#/, '')
  if (!raw || raw === '/') return '/'
  return raw.startsWith('/') ? raw.replace(/\/+$/, '') || '/' : `/${raw}`
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  window.addEventListener('hashchange', cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('hashchange', cb)
  }
}

export function useRoute(): string {
  return useSyncExternalStore(subscribe, getPath, () => '/')
}

export function navigate(to: string) {
  const target = `#${to}`
  if (window.location.hash === target) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  window.location.hash = target
}

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

/** Anchor that navigates without a full page load. */
export function Link({ to, onClick, ...rest }: LinkProps) {
  const handle = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e)
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        rest.target === '_blank'
      ) {
        return
      }
      e.preventDefault()
      navigate(to)
    },
    [onClick, rest.target, to],
  )
  return <a href={`#${to}`} onClick={handle} {...rest} />
}

/** Resets scroll on navigation and keeps document.title in sync. */
export function useRouteEffects(path: string, titles: Record<string, string>) {
  useEffect(() => {
    window.scrollTo(0, 0)
    const exact = titles[path]
    const section = Object.keys(titles)
      .filter((k) => k !== '/' && path.startsWith(k))
      .sort((a, b) => b.length - a.length)[0]
    document.title = exact ?? (section ? `${titles[section]} — APEX 26` : 'APEX 26 — Interactive 3D Formula 1 Grid')
  }, [path, titles])
}
