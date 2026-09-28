/**
 * Shared pointer state — R3F's `state.pointer` stays neutral because the canvas
 * layer has `pointer-events: none`, so we track the cursor ourselves once.
 */
export const pointer = { x: 0, y: 0 }

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    },
    { passive: true },
  )
}
