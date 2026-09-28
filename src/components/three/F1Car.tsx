/**
 * Procedural 2026-spec F1 car — built from primitives so the whole model is a
 * few KB of code, livery-swappable in one prop, and split into named groups
 * that are individually hoverable/clickable.
 *
 * If you'd rather ship a GLB, set VITE_CAR_MODEL_URL in .env and <GlbCar/>
 * takes over (meshes are matched to parts/liveries by name heuristics).
 */
import { type ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import type { CarPartId } from '@/data/carParts'
import type { Livery } from '@/data/teams'

export type Detail = 'high' | 'low'

/* ------------------------------------------------------------------ */
/* geometry helpers                                                    */
/* ------------------------------------------------------------------ */

/** Box tapered between its rear (-z) and front (+z) faces. */
function taperedBox(len: number, wBack: number, hBack: number, wFront: number, hFront: number) {
  const geo = new THREE.BoxGeometry(1, 1, 1)
  const pos = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i) // -0.5 … 0.5
    const t = z + 0.5 // 0 = rear, 1 = front
    const w = wBack + (wFront - wBack) * t
    const h = hBack + (hFront - hBack) * t
    pos.setX(i, pos.getX(i) * w)
    pos.setY(i, pos.getY(i) * h)
    pos.setZ(i, z * len)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

/* ------------------------------------------------------------------ */
/* materials (one instance per mesh → cheap per-part highlighting)     */
/* ------------------------------------------------------------------ */

function BodyMat({ color, hot }: { color: string; hot: boolean }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.3}
      metalness={0.42}
      clearcoat={1}
      clearcoatRoughness={0.22}
      emissive={color}
      emissiveIntensity={hot ? 0.4 : 0}
    />
  )
}

function CarbonMat({ hot }: { hot: boolean }) {
  return (
    <meshStandardMaterial
      color="#0e0f13"
      roughness={0.52}
      metalness={0.6}
      emissive="#9fb4ff"
      emissiveIntensity={hot ? 0.14 : 0}
    />
  )
}

function RubberMat({ hot }: { hot: boolean }) {
  return (
    <meshStandardMaterial
      color="#0b0c10"
      roughness={0.92}
      metalness={0.05}
      emissive="#ff6b6b"
      emissiveIntensity={hot ? 0.18 : 0}
    />
  )
}

function MetalMat() {
  return <meshStandardMaterial color="#9aa0ab" roughness={0.3} metalness={0.95} />
}

/* ------------------------------------------------------------------ */
/* small parts                                                         */
/* ------------------------------------------------------------------ */

function Strut({
  a,
  b,
  r = 0.02,
}: {
  a: [number, number, number]
  b: [number, number, number]
  r?: number
}) {
  const { position, quaternion, length } = useMemo(() => {
    const va = new THREE.Vector3(...a)
    const vb = new THREE.Vector3(...b)
    const dir = vb.clone().sub(va)
    const len = dir.length()
    const mid = va.clone().add(vb).multiplyScalar(0.5)
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    )
    return { position: mid, quaternion: quat, length: len }
  }, [a, b])

  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[r, r, length, 6]} />
      <CarbonMat hot={false} />
    </mesh>
  )
}

function Wheel({
  x,
  z,
  r,
  w,
  accent,
  hot,
  detail,
}: {
  x: number
  z: number
  r: number
  w: number
  accent: string
  hot: boolean
  detail: Detail
}) {
  const outward = x > 0 ? 1 : -1
  const segs = detail === 'high' ? 44 : 14
  return (
    <group position={[x, r, z]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[r, r, w, segs]} />
        <RubberMat hot={hot} />
      </mesh>
      {/* rim */}
      <mesh position={[outward * (w / 2 + 0.015), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.56, r * 0.56, 0.05, detail === 'high' ? 26 : 10]} />
        <meshStandardMaterial color="#262a33" metalness={0.9} roughness={0.4} />
      </mesh>
      {/* compound stripe */}
      <mesh position={[outward * (w / 2 + 0.042), 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[r * 0.78, 0.016, 6, detail === 'high' ? 44 : 14]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={hot ? 0.9 : 0.25}
          roughness={0.4}
        />
      </mesh>
      {/* hub */}
      <mesh position={[outward * (w / 2 + 0.045), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.2, r * 0.2, 0.03, 12]} />
        <MetalMat />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* the car                                                             */
/* ------------------------------------------------------------------ */

export type F1CarProps = {
  livery: Livery
  number: number
  detail: Detail
  hotPart: CarPartId | null
  onHover: (id: CarPartId | null) => void
  onSelect: (id: CarPartId) => void
  dragRef: RefObject<boolean>
}

export function F1Car({ livery, number, detail, hotPart, onHover, onSelect, dragRef }: F1CarProps) {
  const hot = (id: CarPartId) => hotPart === id

  const partProps = (id: CarPartId) => ({
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      onHover(id)
    },
    onPointerOut: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      onHover(null)
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (!dragRef.current) onSelect(id)
    },
  })

  // geometries are livery-independent → build once
  const geo = useMemo(
    () => ({
      floor: taperedBox(4.5, 1.5, 0.06, 1.32, 0.06),
      chassis: taperedBox(2.4, 0.56, 0.34, 0.36, 0.3),
      nose: taperedBox(1.22, 0.36, 0.3, 0.15, 0.11),
      cover: taperedBox(1.62, 0.28, 0.26, 0.54, 0.42),
      airbox: taperedBox(0.66, 0.26, 0.22, 0.34, 0.36),
      sidepod: taperedBox(1.75, 0.3, 0.24, 0.48, 0.36),
      diffuser: taperedBox(0.55, 1.1, 0.3, 1.0, 0.08),
    }),
    [],
  )

  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo])

  const numberTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const ctx = c.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, 128, 128)
      ctx.fillStyle = '#ffffff'
      ctx.font = '800 96px "Saira Condensed", "Arial Narrow", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(number), 64, 70)
    }
    const tex = new THREE.CanvasTexture(c)
    tex.anisotropy = 4
    return tex
  }, [number])
  useEffect(() => () => numberTexture.dispose(), [numberTexture])

  const wheel = (spec: { x: number; z: number; r: number; w: number }) => (
    <Wheel
      key={`${spec.x}-${spec.z}`}
      {...spec}
      accent={livery.accent}
      hot={hot('tires')}
      detail={detail}
    />
  )

  return (
    <group dispose={null}>
      {/* ---------------- floor + diffuser ---------------- */}
      <group {...partProps('floor')}>
        <mesh geometry={geo.floor} position={[0, 0.105, -0.1]} castShadow receiveShadow>
          <CarbonMat hot={hot('floor')} />
        </mesh>
        <mesh
          geometry={geo.diffuser}
          position={[0, 0.16, -2.06]}
          rotation={[0.35, 0, 0]}
          castShadow
        >
          <CarbonMat hot={hot('floor')} />
        </mesh>
        {detail === 'high' && (
          <>
            {[1, -1].map((s) => (
              <mesh key={s} position={[s * 0.64, 0.24, 1.02]} rotation={[0, s * 0.22, 0]} castShadow>
                <boxGeometry args={[0.03, 0.26, 0.42]} />
                <CarbonMat hot={hot('floor')} />
              </mesh>
            ))}
          </>
        )}
      </group>

      {/* ---------------- chassis / cockpit ---------------- */}
      <group {...partProps('cockpit')}>
        <mesh geometry={geo.chassis} position={[0, 0.34, 0.2]} castShadow>
          <BodyMat color={livery.primary} hot={hot('cockpit')} />
        </mesh>
        {/* cockpit opening */}
        <mesh position={[0, 0.5, 0.22]}>
          <boxGeometry args={[0.44, 0.1, 0.82]} />
          <meshStandardMaterial color="#07080a" roughness={0.9} />
        </mesh>
        {/* driver helmet */}
        <mesh position={[0, 0.55, 0.3]} castShadow>
          <sphereGeometry args={[0.145, detail === 'high' ? 24 : 12, detail === 'high' ? 18 : 8]} />
          <meshStandardMaterial
            color={livery.accent}
            roughness={0.25}
            metalness={0.1}
            emissive={livery.accent}
            emissiveIntensity={0.12}
          />
        </mesh>
        {/* harness */}
        <mesh position={[0, 0.6, 0.2]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.16, 0.02, 0.22]} />
          <meshStandardMaterial color={livery.secondary} roughness={0.7} />
        </mesh>
      </group>

      {/* ---------------- nose + front wing ---------------- */}
      <group {...partProps('front-wing')}>
        <mesh geometry={geo.nose} position={[0, 0.3, 2.01]} rotation={[0.05, 0, 0]} castShadow>
          <BodyMat color={livery.primary} hot={hot('front-wing')} />
        </mesh>
        <mesh position={[0, 0.24, 2.34]}>
          <boxGeometry args={[0.2, 0.1, 0.3]} />
          <BodyMat color={livery.secondary} hot={hot('front-wing')} />
        </mesh>
        {/* wing elements */}
        <mesh position={[0, 0.085, 2.52]} rotation={[0.1, 0, 0]} castShadow>
          <boxGeometry args={[1.72, 0.035, 0.5]} />
          <BodyMat color={livery.secondary} hot={hot('front-wing')} />
        </mesh>
        <mesh position={[0, 0.15, 2.6]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[1.6, 0.03, 0.32]} />
          <BodyMat color={livery.secondary} hot={hot('front-wing')} />
        </mesh>
        <mesh position={[0, 0.22, 2.66]} rotation={[0.52, 0, 0]} castShadow>
          <boxGeometry args={[1.5, 0.03, 0.24]} />
          <BodyMat color={livery.accent} hot={hot('front-wing')} />
        </mesh>
        {/* endplates */}
        {[1, -1].map((s) => (
          <mesh key={s} position={[s * 0.87, 0.16, 2.5]} castShadow>
            <boxGeometry args={[0.045, 0.3, 0.64]} />
            <BodyMat color={livery.accent} hot={hot('front-wing')} />
          </mesh>
        ))}
      </group>

      {/* ---------------- engine cover + airbox ---------------- */}
      <group {...partProps('engine-cover')}>
        <mesh geometry={geo.cover} position={[0, 0.4, -1.13]} castShadow>
          <BodyMat color={livery.primary} hot={hot('engine-cover')} />
        </mesh>
        <mesh geometry={geo.airbox} position={[0, 0.66, -0.18]} castShadow>
          <BodyMat color={livery.primary} hot={hot('engine-cover')} />
        </mesh>
        {/* shark-fin */}
        <mesh position={[0, 0.6, -1.5]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.03, 0.22, 0.9]} />
          <BodyMat color={livery.accent} hot={hot('engine-cover')} />
        </mesh>
        {/* car number, both sides */}
        {[1, -1].map((s) => (
          <mesh key={s} position={[s * 0.225, 0.42, -1.1]} rotation={[0, (s * Math.PI) / 2, 0]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshBasicMaterial map={numberTexture} transparent color={livery.accent} />
          </mesh>
        ))}
      </group>

      {/* ---------------- sidepods ---------------- */}
      <group {...partProps('sidepods')}>
        {[1, -1].map((s) => (
          <group key={s}>
            <mesh
              geometry={geo.sidepod}
              position={[s * 0.46, 0.3, -0.42]}
              castShadow
              receiveShadow
            >
              <BodyMat color={livery.primary} hot={hot('sidepods')} />
            </mesh>
            {/* radiator inlet */}
            <mesh position={[s * 0.46, 0.35, 0.44]}>
              <boxGeometry args={[0.4, 0.24, 0.08]} />
              <meshStandardMaterial color="#07080a" roughness={0.9} />
            </mesh>
            {/* floor edge accent */}
            <mesh position={[s * 0.7, 0.14, -0.3]}>
              <boxGeometry args={[0.03, 0.05, 2.4]} />
              <BodyMat color={livery.accent} hot={hot('sidepods')} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ---------------- halo ---------------- */}
      <group {...partProps('halo')}>
        <mesh position={[0, 0.7, 0.18]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.42, 0.033, detail === 'high' ? 10 : 6, detail === 'high' ? 48 : 20]} />
          <CarbonMat hot={hot('halo')} />
        </mesh>
        <Strut a={[0, 0.5, 0.64]} b={[0, 0.7, 0.58]} r={0.03} />
        <Strut a={[0.3, 0.7, -0.14]} b={[0.24, 0.5, -0.4]} r={0.026} />
        <Strut a={[-0.3, 0.7, -0.14]} b={[-0.24, 0.5, -0.4]} r={0.026} />
      </group>

      {/* ---------------- rear wing ---------------- */}
      <group {...partProps('rear-wing')}>
        <mesh position={[0, 0.9, -1.98]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[1.02, 0.04, 0.36]} />
          <BodyMat color={livery.primary} hot={hot('rear-wing')} />
        </mesh>
        <mesh position={[0, 1.0, -2.05]} rotation={[-0.45, 0, 0]} castShadow>
          <boxGeometry args={[1.02, 0.03, 0.2]} />
          <BodyMat color={livery.accent} hot={hot('rear-wing')} />
        </mesh>
        <mesh position={[0, 0.7, -1.92]}>
          <boxGeometry args={[0.07, 0.46, 0.08]} />
          <CarbonMat hot={hot('rear-wing')} />
        </mesh>
        <mesh position={[0, 0.5, -1.96]} rotation={[-0.15, 0, 0]} castShadow>
          <boxGeometry args={[0.86, 0.03, 0.18]} />
          <BodyMat color={livery.primary} hot={hot('rear-wing')} />
        </mesh>
        {[1, -1].map((s) => (
          <mesh key={s} position={[s * 0.52, 0.87, -1.98]} castShadow>
            <boxGeometry args={[0.05, 0.5, 0.56]} />
            <BodyMat color={livery.accent} hot={hot('rear-wing')} />
          </mesh>
        ))}
      </group>

      {/* ---------------- tyres + suspension ---------------- */}
      <group {...partProps('tires')}>
        {wheel({ x: 0.78, z: 1.75, r: 0.35, w: 0.36 })}
        {wheel({ x: -0.78, z: 1.75, r: 0.35, w: 0.36 })}
        {wheel({ x: 0.8, z: -1.65, r: 0.37, w: 0.42 })}
        {wheel({ x: -0.8, z: -1.65, r: 0.37, w: 0.42 })}

        {[1, -1].map((s) => (
          <group key={s}>
            {/* front wishbones */}
            <Strut a={[s * 0.3, 0.44, 1.42]} b={[s * 0.76, 0.4, 1.72]} r={0.018} />
            <Strut a={[s * 0.3, 0.22, 1.42]} b={[s * 0.76, 0.3, 1.72]} r={0.018} />
            <Strut a={[s * 0.34, 0.34, 1.55]} b={[s * 0.76, 0.35, 1.75]} r={0.014} />
            {/* rear wishbones */}
            <Strut a={[s * 0.3, 0.46, -1.3]} b={[s * 0.78, 0.44, -1.62]} r={0.02} />
            <Strut a={[s * 0.3, 0.22, -1.3]} b={[s * 0.78, 0.3, -1.62]} r={0.02} />
            <Strut a={[s * 0.14, 0.38, -1.98]} b={[s * 0.76, 0.37, -1.66]} r={0.016} />
          </group>
        ))}
      </group>

      {/* ---------------- detail bits (desktop only) ---------------- */}
      {detail === 'high' && (
        <group>
          {[1, -1].map((s) => (
            <group key={s}>
              <Strut a={[s * 0.3, 0.55, 0.66]} b={[s * 0.38, 0.58, 0.72]} r={0.012} />
              <mesh position={[s * 0.4, 0.58, 0.74]} castShadow>
                <boxGeometry args={[0.13, 0.06, 0.05]} />
                <BodyMat color={livery.accent} hot={false} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.86, -0.55]}>
            <boxGeometry args={[0.02, 0.1, 0.34]} />
            <CarbonMat hot={false} />
          </mesh>
        </group>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* optional GLB path                                                   */
/* ------------------------------------------------------------------ */

const PART_MATCH: Array<[RegExp, CarPartId]> = [
  [/front.?wing|frontwing|flap/, 'front-wing'],
  [/rear.?wing|rearwing|drs/, 'rear-wing'],
  [/halo/, 'halo'],
  [/engine|cover|airbox|powerunit/, 'engine-cover'],
  [/sidepod|pod/, 'sidepods'],
  [/tyre|tire|wheel/, 'tires'],
  [/floor|diffuser|underfloor/, 'floor'],
  [/cockpit|chassis|monocoque|nose|helmet/, 'cockpit'],
]

export function GlbCar({
  url,
  livery,
  hotPart,
  onHover,
  onSelect,
  dragRef,
}: Omit<F1CarProps, 'number' | 'detail'> & { url: string }) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => scene.clone(true), [scene])
  const byPart = useRef<Map<CarPartId, THREE.Mesh[]>>(new Map())

  useEffect(() => {
    byPart.current = new Map()
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      const n = mesh.name.toLowerCase()
      if (/tyre|tire|wheel|rubber/.test(n)) {
        mesh.material = new THREE.MeshStandardMaterial({ color: '#0b0c10', roughness: 0.9 })
      } else if (/wing|flap|endplate|nose/.test(n)) {
        mesh.material = new THREE.MeshPhysicalMaterial({ color: livery.secondary, roughness: 0.3, clearcoat: 1 })
      } else if (/floor|halo|suspen|diffuser|chassis/.test(n)) {
        mesh.material = new THREE.MeshStandardMaterial({ color: '#0e0f13', roughness: 0.5, metalness: 0.6 })
      } else {
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: livery.primary,
          roughness: 0.3,
          metalness: 0.42,
          clearcoat: 1,
        })
      }
      mesh.castShadow = true
      const hit = PART_MATCH.find(([re]) => re.test(n))
      const id = hit?.[1]
      mesh.userData.partId = id
      if (id) {
        const list = byPart.current.get(id) ?? []
        list.push(mesh)
        byPart.current.set(id, list)
      }
    })
  }, [cloned, livery])

  // hover highlight
  useEffect(() => {
    byPart.current.forEach((meshes, id) => {
      for (const m of meshes) {
        const mat = m.material as THREE.MeshStandardMaterial
        if (!mat || !('emissive' in mat)) continue
        mat.emissive.set(id === hotPart ? '#7c8cff' : '#000000')
        mat.emissiveIntensity = id === hotPart ? 0.35 : 0
      }
    })
  }, [hotPart])

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    const id = (e.object.userData as { partId?: CarPartId }).partId
    if (!id) return
    e.stopPropagation()
    onHover(id)
  }
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    const id = (e.object.userData as { partId?: CarPartId }).partId
    if (!id || dragRef.current) return
    e.stopPropagation()
    onSelect(id)
  }

  return (
    <group onPointerOver={handleOver} onPointerOut={() => onHover(null)} onClick={handleClick}>
      <primitive object={cloned} />
    </group>
  )
}
