// Setu – LoRa mesh emergency network simulation (single file)
// Install:  npm i react@18 react-dom@18 three @react-three/fiber@8 @react-three/drei@9 @react-spring/three@9
// Use:      import App from './App' in main.jsx and render <App />
import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Trail } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

/* ---------- Layout constants ---------- */
const ORANGE = '#ff7a1a'
const NEON = '#00f0ff'
const POLE_H = 4
const TOWER_H = 9
const WATER_Y = 4.7 // flood level: above the tops of the poles
const BASE_H = 5.2 // NDRF post sits on a raised platform so it stays dry
const HOP_TIME = 1.0 // seconds per hop

const STREET = [
  { id: 'S1', x: -9, z: -3 },
  { id: 'S2', x: -5, z: 3 },
  { id: 'S3', x: -1, z: -4 },
  { id: 'S4', x: 3, z: 4 },
  { id: 'S5', x: 7, z: -3 },
]
const TOWER = { x: 0, z: 0 }
const BASE = { x: 12, z: 0 }
const NAMES = { S1: 'Street node 1', S2: 'Street node 2', S3: 'Street node 3', S4: 'Street node 4', S5: 'Street node 5', T: 'Relay tower', B: 'NDRF basecamp' }

/* ---------- Mesh routing tables ----------
   Normal : street node -> tower -> basecamp (two long arcs).
   Cyclone: tower is down, so the packet hops peer-to-peer along the street nodes.
   Flood  : same peer-to-peer chain, but the "nodes" are now floating buoys. */
const ROUTES = {
  normal: ['S1', 'T', 'B'],
  cyclone: ['S1', 'S2', 'S3', 'S4', 'S5', 'B'],
  flood: ['S1', 'S2', 'S3', 'S4', 'S5', 'B'],
}

// Shared mutable sim state (0 = dry, 1 = fully flooded); damped every frame.
const sim = { flood: 0 }

/* World position of any node at time t. Street nodes blend from "clamped on the pole"
   to "bobbing buoy on the water" using sim.flood, so the packet always tracks them. */
function nodePos(id, t, out) {
  if (id === 'T') return out.set(TOWER.x, TOWER_H + 0.7, TOWER.z)
  if (id === 'B') return out.set(BASE.x, BASE_H + 1.0, BASE.z)
  const i = STREET.findIndex((s) => s.id === id)
  const s = STREET[i]
  const f = sim.flood
  const poleY = POLE_H - 0.5
  const floatY = WATER_Y + 0.2 + Math.sin(t * 1.6 + i * 1.7) * 0.12
  return out.set(
    s.x + 0.3 + Math.sin(t * 0.6 + i) * 0.5 * f,
    THREE.MathUtils.lerp(poleY, floatY, f),
    s.z + Math.cos(t * 0.5 + i) * 0.5 * f
  )
}

/* ---------- 3D assets ---------- */
function Streetlight({ s, lit }) {
  const node = useRef()
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ clock }) => {
    nodePos(s.id, clock.elapsedTime, v)
    node.current.position.copy(v) // node follows pole OR floats free in flood mode
  })
  return (
    <>
      <group position={[s.x, 0, s.z]}>
        <mesh position={[0, POLE_H / 2, 0]}>
          <cylinderGeometry args={[0.08, 0.12, POLE_H, 6]} />
          <meshStandardMaterial color="#8a919c" flatShading />
        </mesh>
        <mesh position={[0.15, POLE_H, 0]}>
          <boxGeometry args={[0.5, 0.1, 0.15]} />
          <meshStandardMaterial color="#8a919c" flatShading />
        </mesh>
      </group>
      {/* Tier 1 "Setu Core Node" – detaches from the pole when flooded */}
      <group ref={node}>
        <mesh>
          <cylinderGeometry args={[0.16, 0.16, 0.5, 8]} />
          <meshStandardMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={lit ? 3 : 0.8} flatShading />
        </mesh>
      </group>
    </>
  )
}

function RelayTower({ mode, lit }) {
  // Cyclone: spring topples the whole tower about its base.
  const { rx } = useSpring({ rx: mode === 'cyclone' ? 1.45 : 0, config: { tension: 40, friction: 9 } })
  return (
    <animated.group position={[TOWER.x, 0, TOWER.z]} rotation-x={rx}>
      <mesh position={[0, TOWER_H / 2, 0]}>
        <cylinderGeometry args={[0.25, 0.8, TOWER_H, 4]} />
        <meshStandardMaterial color="#5b6472" flatShading />
      </mesh>
      <mesh position={[0, TOWER_H * 0.65, 0]}>
        <boxGeometry args={[1.4, 0.15, 1.4]} />
        <meshStandardMaterial color="#8a919c" flatShading />
      </mesh>
      <mesh position={[0, TOWER_H + 0.7, 0]}>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={lit ? 3 : 0.9} flatShading />
      </mesh>
    </animated.group>
  )
}

function Basecamp({ lit }) {
  return (
    <group position={[BASE.x, 0, BASE.z]}>
      <mesh position={[0, BASE_H / 2, 0]}>
        <cylinderGeometry args={[1.6, 2, BASE_H, 6]} />
        <meshStandardMaterial color="#2a3140" flatShading />
      </mesh>
      <mesh position={[0, BASE_H + 0.5, 0]}>
        <boxGeometry args={[1.6, 1, 1.2]} />
        <meshStandardMaterial color="#39ff88" emissive="#39ff88" emissiveIntensity={lit ? 2.5 : 0.5} flatShading />
      </mesh>
    </group>
  )
}

const BUILDINGS = [[-7, 0, 1.4, 2.5], [-3, 6, 1.6, 3], [2, -7, 1.5, 2], [5, 1, 1.2, 1.6], [-11, 6, 1.8, 3.4], [9, 6, 1.5, 2.2], [-6, -7, 1.3, 1.8], [10, -7, 1.6, 2.6]]

function City() {
  return (
    <>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[34, 34]} />
        <meshStandardMaterial color="#0b111c" />
      </mesh>
      <gridHelper args={[34, 34, '#134e5c', '#132436']} position={[0, 0.01, 0]} />
      {BUILDINGS.map(([x, z, w, h], i) => (
        <mesh key={i} position={[x, h / 2, z]}>
          <boxGeometry args={[w, h, w]} />
          <meshStandardMaterial color="#141c2b" flatShading />
        </mesh>
      ))}
    </>
  )
}

function Water({ mode }) {
  const ref = useRef()
  useFrame((_, dt) => {
    // Rise/fall smoothly; everything else reads sim.flood so buoys stay in sync.
    sim.flood = THREE.MathUtils.damp(sim.flood, mode === 'flood' ? 1 : 0, 1.6, dt)
    ref.current.position.y = THREE.MathUtils.lerp(-0.6, WATER_Y, sim.flood)
  })
  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[34, 34]} />
      <meshStandardMaterial color="#1f6bff" emissive="#0a2a7a" transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  )
}

/* ---------- The glowing SOS packet ----------
   Each hop lerps between two node positions and adds a sine "lift" so it arcs through the air.
   Endpoints are re-read every frame, so it still lands correctly on bobbing buoys. */
function Packet({ trigger, mode, onHop, onDone }) {
  const ref = useRef()
  const st = useRef({ active: false })
  const [a, b, p] = useMemo(() => [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], [])

  useEffect(() => {
    if (trigger > 0) st.current = { active: true, t0: null, seg: -1, route: ROUTES[mode] }
  }, [trigger]) // eslint-disable-line

  useFrame(({ clock }) => {
    const s = st.current
    ref.current.visible = !!s.active
    if (!s.active) return
    const now = clock.elapsedTime
    if (s.t0 === null) s.t0 = now
    const u = (now - s.t0) / HOP_TIME
    const last = s.route.length - 1
    const seg = Math.min(Math.floor(u), last - 1)
    if (seg !== s.seg) { s.seg = seg; onHop(s.route[seg], seg) } // light up the node we just left/entered
    const k = Math.min(u - seg, 1)
    nodePos(s.route[seg], now, a)
    nodePos(s.route[seg + 1], now, b)
    p.lerpVectors(a, b, k)
    p.y += Math.sin(Math.PI * k) * (1 + a.distanceTo(b) * 0.3) // arc height scales with hop length
    ref.current.position.copy(p)
    if (u >= last) { s.active = false; onDone(s.route[last]) }
  })

  return (
    <Trail width={1.2} length={7} color={NEON} attenuation={(t) => t * t}>
      <mesh ref={ref} visible={false}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial color={NEON} />
        <pointLight color={NEON} intensity={8} distance={7} />
      </mesh>
    </Trail>
  )
}

function Scene({ mode, lit, trigger, onHop, onDone }) {
  return (
    <>
      <color attach="background" args={['#05070d']} />
      <fog attach="fog" args={['#05070d', 30, 70]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 18, 8]} intensity={0.8} />
      <City />
      {STREET.map((s) => <Streetlight key={s.id} s={s} lit={lit.includes(s.id)} />)}
      <RelayTower mode={mode} lit={lit.includes('T')} />
      <Basecamp lit={lit.includes('B')} />
      <Water mode={mode} />
      <Packet trigger={trigger} mode={mode} onHop={onHop} onDone={onDone} />
      <OrbitControls target={[2, 2, 0]} maxPolarAngle={Math.PI / 2.1} />
    </>
  )
}

/* ---------- HUD ---------- */
const MODES = [
  ['normal', 'Scenario 1: Normal (grid active)'],
  ['cyclone', 'Scenario 2: Cyclone (tower destroyed)'],
  ['flood', 'Scenario 3: Flood (nodes underwater)'],
]
const HINT = {
  normal: 'Street node → relay tower → basecamp',
  cyclone: 'Tower is down. Packet hops street node to street node.',
  flood: 'Nodes float as buoys. Packet hops buoy to buoy.',
}

export default function App() {
  const [mode, setMode] = useState('normal')
  const [trigger, setTrigger] = useState(0)
  const [running, setRunning] = useState(false)
  const [lit, setLit] = useState([])
  const [log, setLog] = useState([])

  const pick = (m) => { if (running) return; setMode(m); setLit([]); setLog([]) }
  const sos = () => { setLit([]); setLog(['SOS raised at Street node 1']); setRunning(true); setTrigger((n) => n + 1) }
  const onHop = (id, seg) => {
    setLit((l) => [...l, id])
    if (seg > 0) setLog((l) => [...l, `Relayed via ${NAMES[id]}`])
  }
  const onDone = (id) => {
    setLit((l) => [...l, id]); setRunning(false)
    setLog((l) => [...l, 'Delivered to NDRF basecamp'])
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#05070d', position: 'relative', fontFamily: 'system-ui, sans-serif', color: '#dbe7f5' }}>
      <style>{`
        .hud-btn{background:rgba(10,18,30,.85);color:#dbe7f5;border:1px solid #1d3b52;padding:10px 14px;border-radius:6px;cursor:pointer;font-size:13px}
        .hud-btn.on{border-color:${NEON};box-shadow:0 0 12px ${NEON}66;color:#fff}
        .hud-btn:disabled{opacity:.5;cursor:not-allowed}
        .sos{background:#e5142b;color:#fff;border:0;padding:16px 44px;font-size:18px;font-weight:700;letter-spacing:.06em;border-radius:8px;cursor:pointer;box-shadow:0 0 28px #e5142b99}
        .sos:disabled{opacity:.5;cursor:not-allowed;box-shadow:none}
      `}</style>

      <Canvas camera={{ position: [19, 14, 19], fov: 42 }}>
        <Scene mode={mode} lit={lit} trigger={trigger} onHop={onHop} onDone={onDone} />
      </Canvas>

      <div style={{ position: 'absolute', top: 16, left: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Setu</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>LoRa mesh emergency network</div>
      </div>

      <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '90vw' }}>
        {MODES.map(([k, label]) => (
          <button key={k} className={`hud-btn ${mode === k ? 'on' : ''}`} disabled={running} onClick={() => pick(k)}>{label}</button>
        ))}
      </div>

      <div style={{ position: 'absolute', top: 72, right: 20, width: 240, fontSize: 12, background: 'rgba(10,18,30,.8)', border: '1px solid #1d3b52', borderRadius: 6, padding: 12 }}>
        <div style={{ marginBottom: 8, opacity: 0.8 }}>{HINT[mode]}</div>
        {log.map((l, i) => <div key={i} style={{ color: i === log.length - 1 ? NEON : '#9fb3c8' }}>{l}</div>)}
      </div>

      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)' }}>
        <button className="sos" disabled={running} onClick={sos}>TRIGGER SOS</button>
      </div>
    </div>
  )
}
