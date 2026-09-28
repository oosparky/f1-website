/**
 * The 3D stage: garage lighting, grid floor, camera rig (pointer parallax +
 * scroll dolly + explore-mode zoom), drag-to-rotate and part tooltips.
 * Lazily loaded from App so three.js never blocks first paint.
 */
import {
  ContactShadows,
  Environment,
  Grid,
  Lightformer,
  MeshReflectorMaterial,
} from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import type { CarPartId } from '@/data/carParts'
import type { Livery } from '@/data/teams'
import { useHighEndDevice, usePrefersReducedMotion } from '@/lib/hooks'
import { pointer } from '@/lib/pointer'
import { clamp, damp } from '@/lib/utils'
import { F1Car, GlbCar, type Detail } from './F1Car'

const MODEL_URL = import.meta.env.VITE_CAR_MODEL_URL

export type StageRefs = {
  scroll: { current: number }
  zoom: { current: number }
  rot: { current: { y: number; x: number; dragging: boolean } }
  drag: { current: boolean }
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

/** Keeps R3F's canvas measured even when the tab was hidden at mount. */
function SizeGuard() {
  const gl = useThree((s) => s.gl)
  const setSize = useThree((s) => s.setSize)
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)

  useEffect(() => {
    const sync = () => {
      const parent = gl.domElement.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)
      if (w < 2 || h < 2) return
      const canvas = gl.domElement
      const rendererSynced = canvas.style.width === `${w}px` && canvas.clientWidth === w
      const storeSynced = Math.round(width) === w && Math.round(height) === h
      if (!storeSynced) setSize(w, h, rect.top, rect.left)
      else if (!rendererSynced) gl.setSize(w, h)
    }
    sync()
    const t1 = window.setTimeout(sync, 350)
    const t2 = window.setTimeout(sync, 1200)
    window.addEventListener('resize', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('resize', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [gl, setSize, width, height])

  return null
}

/** One rendered frame per interaction while reduced motion is on. */
function DemandLoop() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    const kick = () => invalidate()
    const id = window.setInterval(kick, 600)
    const events: Array<[EventTarget, string]> = [
      [window, 'pointermove'],
      [window, 'pointerdown'],
      [window, 'wheel'],
      [window, 'scroll'],
      [window, 'resize'],
    ]
    events.forEach(([t, ev]) => t.addEventListener(ev, kick, { passive: true }))
    return () => {
      window.clearInterval(id)
      events.forEach(([t, ev]) => t.removeEventListener(ev, kick))
    }
  }, [invalidate])
  return null
}

/* ------------------------------------------------------------------ */
/* lights + environment                                                */
/* ------------------------------------------------------------------ */

function Lights({ shadows }: { shadows: boolean }) {
  return (
    <>
      <ambientLight intensity={0.46} />
      <directionalLight
        castShadow={shadows}
        position={[5, 8, 4]}
        intensity={3.4}
        color="#fff4ec"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-far={30}
        shadow-bias={-0.0008}
      />
      <directionalLight position={[-7, 4, -4]} intensity={0.7} color="#7fa8ff" />
      <pointLight position={[4, 2, -6]} intensity={60} distance={26} color="#ff4a3d" />
      <pointLight position={[-5, 1.4, 4]} intensity={30} distance={22} color="#4f8cff" />
      <spotLight position={[0, 9, 1]} angle={0.6} penumbra={1} intensity={110} distance={30} color="#ffffff" />
    </>
  )
}

function StudioEnvironment() {
  return (
    <Environment resolution={64} frames={1}>
      {/* garage light bars */}
      <Lightformer form="rect" intensity={3} rotation-x={Math.PI / 2} position={[0, 6, 0]} scale={[9, 2.2, 1]} color="#ffffff" />
      <Lightformer form="rect" intensity={1.4} rotation-y={-Math.PI / 2} position={[-6, 3, 0]} scale={[7, 2, 1]} color="#9db9ff" />
      <Lightformer form="rect" intensity={1.2} rotation-y={Math.PI / 2} position={[6, 2.5, -2]} scale={[7, 1.6, 1]} color="#ff8d82" />
      <Lightformer form="circle" intensity={1.6} position={[0, 3, 7]} scale={4} color="#ffffff" />
      <mesh scale={45}>
        <sphereGeometry args={[1, 24, 12]} />
        <meshBasicMaterial color="#06070a" side={THREE.BackSide} />
      </mesh>
    </Environment>
  )
}

/* ------------------------------------------------------------------ */
/* garage floor + track hints                                          */
/* ------------------------------------------------------------------ */

function Garage({ reflect, accent }: { reflect: boolean; accent: string }) {
  const dashes = useMemo(() => Array.from({ length: 10 }, (_, i) => -16 + i * 3.6), [])
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[70, 70]} />
        {reflect ? (
          <MeshReflectorMaterial
            blur={[280, 90]}
            resolution={1024}
            mixBlur={1}
            mixStrength={9}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.35}
            roughness={0.85}
            metalness={0.55}
            color="#0a0b0f"
          />
        ) : (
          <meshStandardMaterial color="#0a0b0f" roughness={0.9} metalness={0.25} />
        )}
      </mesh>

      <Grid
        args={[70, 70]}
        position={[0, 0.002, 0]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#191c23"
        sectionSize={4}
        sectionThickness={1}
        sectionColor="#262b36"
        fadeDistance={34}
        fadeStrength={1.6}
        infiniteGrid
      />

      {/* start/finish dashes */}
      {dashes.map((z) => (
        <mesh key={z} position={[5.4, 0.004, z]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.16, 1.6]} />
          <meshBasicMaterial color="#3d434f" />
        </mesh>
      ))}

      {/* pit-lane red line */}
      <mesh position={[-5.2, 0.005, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.1, 44]} />
        <meshBasicMaterial color={accent} transparent opacity={0.55} />
      </mesh>

      {/* overhead light bars */}
      {[-4, 0, 4].map((z) => (
        <mesh key={z} position={[0, 5.2, z]}>
          <boxGeometry args={[9, 0.06, 0.3]} />
          <meshBasicMaterial color="#dfe6ff" />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* camera rig + turntable                                              */
/* ------------------------------------------------------------------ */

function Rig({ refs, reduced }: { refs: StageRefs; reduced: boolean }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const smooth = useRef({ a: -0.55, e: 0.2, r: 7, ty: 0.55 })

  useFrame((_, dt) => {
    const aspect = size.width / Math.max(1, size.height)
    const baseR = aspect < 0.8 ? 9.8 : aspect < 1.25 ? 8.2 : 7
    const p = refs.scroll.current

    const target = {
      a: reduced ? -0.55 : -0.55 + pointer.x * 0.3,
      e: reduced ? 0.2 : 0.2 - pointer.y * 0.07 + p * 0.14,
      r: (baseR + p * 2.8) / refs.zoom.current,
      ty: 0.52 + p * 0.5,
    }

    const s = smooth.current
    const l = 4.5
    s.a = damp(s.a, target.a, l, dt)
    s.e = damp(s.e, target.e, l, dt)
    s.r = damp(s.r, target.r, l, dt)
    s.ty = damp(s.ty, target.ty, l, dt)

    const ce = Math.cos(s.e)
    camera.position.set(
      s.r * ce * Math.sin(s.a),
      s.ty + s.r * Math.sin(s.e),
      s.r * ce * Math.cos(s.a),
    )
    camera.lookAt(0, s.ty, 0)
  })

  return null
}

function Turntable({
  refs,
  reduced,
  children,
}: {
  refs: StageRefs
  reduced: boolean
  children: ReactNode
}) {
  const ref = useRef<THREE.Group>(null)

  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const r = refs.rot.current
    if (!reduced && !r.dragging) r.y += dt * 0.16
    g.rotation.y = r.y
    g.rotation.x = damp(g.rotation.x, r.x, 7, Math.min(dt, 0.1))
  })

  return <group ref={ref}>{children}</group>
}

/* ------------------------------------------------------------------ */
/* stage                                                               */
/* ------------------------------------------------------------------ */

export type CarStageProps = {
  livery: Livery
  number: number
  accent: string
  explore: boolean
  onHotChange: (id: CarPartId | null, x: number, y: number) => void
  onSelect: (id: CarPartId) => void
}

export default function CarStage(props: CarStageProps) {
  const { livery, number, accent, explore, onHotChange, onSelect } = props
  const high = useHighEndDevice()
  const reduced = usePrefersReducedMotion()
  const [webgl] = useState(() => {
    try {
      const c = document.createElement('canvas')
      return !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
      return false
    }
  })

  const wrapRef = useRef<HTMLDivElement>(null)
  const refs: StageRefs = useMemo(
    () => ({
      scroll: { current: 0 },
      zoom: { current: 1 },
      rot: { current: { y: -0.5, x: 0.03, dragging: false } },
      drag: { current: false },
    }),
    [],
  )
  const [hot, setHot] = useState<CarPartId | null>(null)
  const hotRef = useRef<CarPartId | null>(null)

  /* scroll → camera dolly */
  useEffect(() => {
    const onScroll = () => {
      const p = clamp(window.scrollY / Math.max(1, window.innerHeight * 1.6), 0, 1)
      refs.scroll.current = p
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [refs])

  /* drag to rotate + pinch zoom (pointer events reach us from the canvas) */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const pointers = new Map<number, { x: number; y: number }>()
    let last: { x: number; y: number } | null = null
    let pinchStart = 0
    let pinchZoom = 1
    let moved = 0

    const down = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      refs.drag.current = false
      moved = 0
      if (pointers.size === 1) {
        last = { x: e.clientX, y: e.clientY }
        refs.rot.current.dragging = true
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinchStart = Math.hypot(a.x - b.x, a.y - b.y)
        pinchZoom = refs.zoom.current
        last = null
      }
    }

    const move = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pointers.size === 2 && pinchStart > 0) {
        const [a, b] = [...pointers.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        refs.zoom.current = clamp(pinchZoom * (dist / pinchStart), 0.55, 1.7)
        return
      }

      if (!last) return
      const dx = e.clientX - last.x
      const dy = e.clientY - last.y
      last = { x: e.clientX, y: e.clientY }
      moved += Math.abs(dx) + Math.abs(dy)
      if (moved > 6) refs.drag.current = true
      const r = refs.rot.current
      r.y += dx * 0.0075
      r.x = clamp(r.x + dy * 0.004, -0.16, 0.34)
    }

    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId)
      if (pointers.size === 0) {
        last = null
        refs.rot.current.dragging = false
        // keep drag flag true through the click that ends the drag,
        // then clear it on the next frame so part-clicks still work
        requestAnimationFrame(() => {
          refs.drag.current = false
        })
      } else if (pointers.size === 1) {
        const [a] = [...pointers.values()]
        last = { x: a.x, y: a.y }
      }
    }

    /* wheel zoom only in explore mode — otherwise the page scrolls */
    const wheel = (e: WheelEvent) => {
      if (!explore) return
      e.preventDefault()
      refs.zoom.current = clamp(refs.zoom.current - e.deltaY * 0.0013, 0.55, 1.7)
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
    }
  }, [refs, explore])

  /* hover reporting for the DOM tooltip + cursor */
  const handleHot = (id: CarPartId | null, x: number, y: number) => {
    hotRef.current = id
    setHot(id)
    onHotChange(id, x, y)
  }

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const move = (e: PointerEvent) => {
      if (hotRef.current) onHotChange(hotRef.current, e.clientX, e.clientY)
    }
    el.addEventListener('pointermove', move)
    return () => el.removeEventListener('pointermove', move)
  }, [onHotChange])

  if (!webgl) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(80%_60%_at_50%_40%,#14151a,#050507)] p-6 text-center">
        <div>
          <p className="font-display text-4xl">3D unavailable</p>
          <p className="mt-2 max-w-sm text-sm text-fog">
            Your browser has WebGL disabled — the car can’t be rendered here. All stats and
            profiles still work below.
          </p>
        </div>
      </div>
    )
  }

  const detail: Detail = high ? 'high' : 'low'

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 [touch-action:pan-y]"
      style={{ cursor: hot ? 'pointer' : explore ? 'zoom-in' : 'grab' }}
    >
      <Canvas
        shadows={high}
        dpr={[1, high ? 1.75 : 1.4]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [-3.6, 1.7, 5.9], fov: 42, near: 0.1, far: 90 }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <color attach="background" args={['#050507']} />
        <fog attach="fog" args={['#050507', 12, 42]} />

        <Lights shadows={high} />
        <Suspense fallback={null}>
          <StudioEnvironment />
          <Garage reflect={high} accent={accent} />
          <Turntable refs={refs} reduced={reduced}>
            {MODEL_URL ? (
              <GlbCar
                url={MODEL_URL}
                livery={livery}
                hotPart={hot}
                onHover={(id) => handleHot(id, window.innerWidth / 2, 160)}
                onSelect={onSelect}
                dragRef={refs.drag}
              />
            ) : (
              <F1Car
                livery={livery}
                number={number}
                detail={detail}
                hotPart={hot}
                onHover={(id) => handleHot(id, window.innerWidth / 2, 160)}
                onSelect={onSelect}
                dragRef={refs.drag}
              />
            )}
          </Turntable>
          <ContactShadows
            position={[0, 0.006, 0]}
            opacity={0.66}
            scale={16}
            blur={2.4}
            far={4.5}
            resolution={high ? 512 : 256}
            color="#000000"
          />
        </Suspense>

        <Rig refs={refs} reduced={reduced} />
        <SizeGuard />
        {reduced && <DemandLoop />}
      </Canvas>
    </div>
  )
}
