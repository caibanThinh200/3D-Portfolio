"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { useControls } from "leva";
import { heroScroll } from "../hero/heroScroll";
import { sceneScroll } from "./sceneScroll";

/* -------------------------------------------------------------------------- */
/*  Constants & Keyframes                                                     */
/* -------------------------------------------------------------------------- */

const TILE_COUNT = 8;
const TILE_SIZE = 0.75;
const TILE_DEPTH = 0.12;
const TILE_RADIUS = 0.14;
const RING_RX = 2.35;
const RING_RZ = 1.2;
const RING_EXPAND = 3.6;
const RING_PUSH_Y = 4.8;

const easeScroll = (p: number) => Math.pow(p, 1.3);
const NEON_A = new THREE.Color("#3062ff");
const NEON_B = new THREE.Color("#00d4ff");

const ICONS = [
  "bars",
  "sparkle",
  "grid",
  "dial",
  "spiral",
  "orb",
  "grid",
  "dial",
] as const;
type IconType = (typeof ICONS)[number];

/**
 * Camera & hand perspective keyframes for the 4 phases:
 * Phase 0 (Hero):     Right perspective, elegant 3/4 palm reveal
 * Phase 1 (Projects): Sweeps to LEFT side, architectural profile view
 * Phase 2 (About):    Moves to MIDDLE / elevated bird's-eye palm view
 * Phase 3 (Contact):  Sweeps back to RIGHT, reaching dynamic angle
 */
type PhaseKeyframe = {
  p: number;
  camPos: [number, number, number];
  lookAt: [number, number, number];
  handRot: [number, number, number];
  handPos: [number, number, number];
  handScale: number;
  ringPos: [number, number, number];
};

const PHASE_KEYFRAMES: PhaseKeyframe[] = [
  // 0.0: Hero Top — Centered, hand submerged at bottom of viewport (-90vh feel)
  {
    p: 0.0,
    camPos: [0.0, 0.4, 8.4],
    lookAt: [0.0, -0.6, 0],
    handRot: [0.15, 0.0, 0.0],
    handPos: [0.0, -5.8, 0.0],
    handScale: 1.55,
    ringPos: [0.0, -4.2, 0.0],
  },
  // 0.25: Hero Scroll — Hand rises quickly into full center view
  {
    p: 0.25,
    camPos: [0.0, 0.1, 8.2],
    lookAt: [0.0, -0.25, 0],
    handRot: [0.06, 0.0, 0.0],
    handPos: [0.0, -1.6, 0.0],
    handScale: 1.55,
    ringPos: [0.0, -0.1, 0.0],
  },
  // 0.65: Section 2 Arrival — Hand smoothly sweeps across to LEFT side
  {
    p: 0.65,
    camPos: [-0.6, -0.2, 8.0],
    lookAt: [0.2, -0.2, 0],
    handRot: [-0.1, -0.75, 0.08],
    handPos: [-2.4, -1.4, 0.1],
    handScale: 1.62,
    ringPos: [-2.4, -0.1, 0.1],
  },
  // 1.0: Section 2 (Projects) — Hand firmly on LEFT, content on RIGHT
  {
    p: 1.0,
    camPos: [-0.6, -0.2, 8.0],
    lookAt: [0.2, -0.2, 0],
    handRot: [-0.1, -0.75, 0.08],
    handPos: [-2.4, -1.4, 0.1],
    handScale: 1.62,
    ringPos: [-2.4, -0.1, 0.1],
  },
  // 1.65: Section 3 Arrival — Hand glides across to RIGHT side
  {
    p: 1.65,
    camPos: [0.6, 2.0, 7.8],
    lookAt: [-0.2, -0.2, 0],
    handRot: [0.45, 0.65, -0.05],
    handPos: [2.4, -1.3, 0.2],
    handScale: 1.68,
    ringPos: [2.4, 0.0, 0.2],
  },
  // 2.0: Section 3 (About) — Hand firmly on RIGHT, content on LEFT
  {
    p: 2.0,
    camPos: [0.6, 2.0, 7.8],
    lookAt: [-0.2, -0.2, 0],
    handRot: [0.45, 0.65, -0.05],
    handPos: [2.4, -1.3, 0.2],
    handScale: 1.68,
    ringPos: [2.4, 0.0, 0.2],
  },
  // 2.65: Section 4 Arrival — Hand glides across to LEFT side
  {
    p: 2.65,
    camPos: [-0.4, -0.6, 7.6],
    lookAt: [0.2, 0.0, 0],
    handRot: [-0.2, -0.8, 0.05],
    handPos: [-2.4, -1.5, 0.2],
    handScale: 1.62,
    ringPos: [-2.4, -0.1, 0.2],
  },
  // 3.0: Section 4 (Contact) — Hand firmly on LEFT, content on RIGHT
  {
    p: 3.0,
    camPos: [-0.4, -0.6, 7.6],
    lookAt: [0.2, 0.0, 0],
    handRot: [-0.2, -0.8, 0.05],
    handPos: [-2.4, -1.5, 0.2],
    handScale: 1.62,
    ringPos: [-2.4, -0.1, 0.2],
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function createSquircleGeometry(size: number, depth: number, radius: number) {
  const h = size / 2;
  const r = Math.min(radius, h);
  const s = new THREE.Shape();
  s.moveTo(-h + r, -h);
  s.lineTo(h - r, -h);
  s.quadraticCurveTo(h, -h, h, -h + r);
  s.lineTo(h, h - r);
  s.quadraticCurveTo(h, h, h - r, h);
  s.lineTo(-h + r, h);
  s.quadraticCurveTo(-h, h, -h, h - r);
  s.lineTo(-h, -h + r);
  s.quadraticCurveTo(-h, -h, -h + r, -h);
  const bevel = Math.min(0.02, depth / 4);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: depth - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 16,
  });
  geo.translate(0, 0, -(depth - bevel * 2) / 2);
  return geo;
}

function drawIcon(type: IconType): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, "#f4f7ff");
  grad.addColorStop(0.5, "#aab4cc");
  grad.addColorStop(1, "#e8ecf8");
  g.fillStyle = grad;
  g.strokeStyle = grad;
  g.lineCap = "round";
  g.lineJoin = "round";

  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    g.beginPath();
    g.roundRect(x, y, w, h, r);
    g.fill();
  };

  switch (type) {
    case "bars":
      rr(44, 130, 36, 80, 18);
      rr(110, 90, 36, 120, 18);
      rr(176, 46, 36, 164, 18);
      break;
    case "sparkle": {
      g.beginPath();
      const cx = S / 2;
      const cy = S / 2;
      const R = 100;
      const r = 22;
      g.moveTo(cx, cy - R);
      g.quadraticCurveTo(cx + r, cy - r, cx + R, cy);
      g.quadraticCurveTo(cx + r, cy + r, cx, cy + R);
      g.quadraticCurveTo(cx - r, cy + r, cx - R, cy);
      g.quadraticCurveTo(cx - r, cy - r, cx, cy - R);
      g.fill();
      break;
    }
    case "grid":
      rr(40, 40, 82, 82, 18);
      rr(134, 40, 82, 82, 18);
      rr(40, 134, 82, 82, 18);
      rr(134, 134, 82, 82, 18);
      break;
    case "dial":
      g.lineWidth = 22;
      g.beginPath();
      g.arc(S / 2, S / 2, 84, 0, Math.PI * 2);
      g.stroke();
      g.lineWidth = 16;
      g.beginPath();
      g.arc(S / 2, S / 2, 40, 0, Math.PI * 2);
      g.stroke();
      break;
    case "spiral":
      g.lineWidth = 18;
      g.beginPath();
      for (let a = 0; a < Math.PI * 6; a += 0.05) {
        const rad = 8 + a * 5.2;
        const x = S / 2 + Math.cos(a) * rad;
        const y = S / 2 + Math.sin(a) * rad;
        if (a === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
      break;
    case "orb":
      g.lineWidth = 14;
      g.beginPath();
      g.arc(S / 2, S / 2, 86, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.ellipse(S / 2, S / 2, 86, 34, 0.5, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.ellipse(S / 2, S / 2, 86, 34, -0.5, 0, Math.PI * 2);
      g.stroke();
      break;
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* -------------------------------------------------------------------------- */
/*  Hand                                                                      */
/* -------------------------------------------------------------------------- */

type FingerProps = {
  position: [number, number, number];
  lengths: [number, number, number];
  radius: number;
  curl: [number, number, number];
  tilt?: number;
  material: THREE.Material;
  baseRotZ?: number;
  capSegments?: number;
  radialSegments?: number;
};

function Finger({
  position,
  lengths,
  radius,
  curl,
  tilt = 0,
  material,
  baseRotZ = 0,
  capSegments = 8,
  radialSegments = 16,
}: FingerProps) {
  const [l1, l2, l3] = lengths;
  return (
    <group position={position} rotation={[tilt, 0, baseRotZ + curl[0]]}>
      <mesh position={[0, l1 / 2, 0]} material={material}>
        <capsuleGeometry
          key={`${radius}-${l1}-${capSegments}-${radialSegments}`}
          args={[radius, l1, capSegments, radialSegments]}
        />
      </mesh>
      <group position={[0, l1, 0]} rotation={[0, 0, curl[1]]}>
        <mesh position={[0, l2 / 2, 0]} material={material}>
          <capsuleGeometry
            key={`${radius}-${l2}-${capSegments}-${radialSegments}`}
            args={[radius * 0.93, l2, capSegments, radialSegments]}
          />
        </mesh>
        <group position={[0, l2, 0]} rotation={[0, 0, curl[2]]}>
          <mesh position={[0, l3 / 2, 0]} material={material}>
            <capsuleGeometry
              key={`${radius}-${l3}-${capSegments}-${radialSegments}`}
              args={[radius * 0.86, l3, capSegments, radialSegments]}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function ControlledFinger({
  name,
  position,
  lengths,
  radius,
  curl,
  tilt = 0,
  baseRotZ = 0,
  capSegments = 8,
  radialSegments = 16,
  material,
}: FingerProps & { name: string }) {
  const c = useControls(name, {
    position: { value: position, step: 0.01 },
    radius: { value: radius, min: 0.03, max: 0.4, step: 0.005 },
    len1: { value: lengths[0], min: 0.05, max: 1, step: 0.01 },
    len2: { value: lengths[1], min: 0.05, max: 1, step: 0.01 },
    len3: { value: lengths[2], min: 0.05, max: 1, step: 0.01 },
    curl1: { value: curl[0], min: -1.5, max: 1.5, step: 0.01 },
    curl2: { value: curl[1], min: -1.5, max: 1.5, step: 0.01 },
    curl3: { value: curl[2], min: -1.5, max: 1.5, step: 0.01 },
    tilt: { value: tilt, min: -1, max: 1, step: 0.01 },
    baseRotZ: { value: baseRotZ, min: -1.5, max: 1.5, step: 0.01 },
    capSegments: { value: capSegments, min: 1, max: 32, step: 1 },
    radialSegments: { value: radialSegments, min: 3, max: 64, step: 1 },
  });
  return (
    <Finger
      position={c.position}
      lengths={[c.len1, c.len2, c.len3]}
      radius={c.radius}
      curl={[c.curl1, c.curl2, c.curl3]}
      tilt={c.tilt}
      baseRotZ={c.baseRotZ}
      capSegments={c.capSegments}
      radialSegments={c.radialSegments}
      material={material}
    />
  );
}

function Hand() {
  const skin = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f5d5cb",
        roughness: 0.38,
        metalness: 0.04,
        emissive: new THREE.Color("#7a3b3b"),
        emissiveIntensity: 0.18,
        sheen: 1,
        sheenRoughness: 0.5,
        sheenColor: new THREE.Color("#ffb4a8"),
        clearcoat: 0.25,
        clearcoatRoughness: 0.6,
        ior: 1.4,
      }),
    [],
  );

  const fa = useControls("Forearm", {
    radiusTop: { value: 0.36, min: 0.05, max: 1.5, step: 0.01 },
    radiusBottom: { value: 0.44, min: 0.05, max: 1.5, step: 0.01 },
    height: { value: 2.6, min: 0.2, max: 6, step: 0.05 },
    segments: { value: 32, min: 3, max: 96, step: 1 },
    position: { value: [0, -1.9, -0.02], step: 0.01 },
  });
  const wr = useControls("Wrist", {
    radius: { value: 0.42, min: 0.05, max: 1.5, step: 0.01 },
    widthSeg: { value: 32, min: 3, max: 96, step: 1 },
    heightSeg: { value: 24, min: 2, max: 96, step: 1 },
    position: { value: [0, -0.62, 0], step: 0.01 },
    scale: { value: [1, 0.8, 0.72], step: 0.01 },
  });
  const pa = useControls("Palm", {
    radius: { value: 0.58, min: 0.05, max: 1.5, step: 0.01 },
    widthSeg: { value: 40, min: 3, max: 96, step: 1 },
    heightSeg: { value: 90, min: 2, max: 96, step: 1 },
    position: { value: [0, 0, 0], step: 0.01 },
    scale: { value: [1.02, 1.2, 0.55], step: 0.01 },
  });
  const pt = useControls("Palm Top", {
    radius: { value: 0.52, min: 0.05, max: 1.5, step: 0.01 },
    widthSeg: { value: 40, min: 3, max: 96, step: 1 },
    heightSeg: { value: 32, min: 2, max: 96, step: 1 },
    position: { value: [0.02, 0.4, 0], step: 0.01 },
    scale: { value: [1.05, 0.6, 0.5], step: 0.01 },
  });

  return (
    <group>
      <mesh position={fa.position} material={skin}>
        <cylinderGeometry
          key={`${fa.radiusTop}-${fa.radiusBottom}-${fa.height}-${fa.segments}`}
          args={[fa.radiusTop, fa.radiusBottom, fa.height, fa.segments]}
        />
      </mesh>
      <mesh position={wr.position} material={skin} scale={wr.scale}>
        <sphereGeometry
          key={`${wr.radius}-${wr.widthSeg}-${wr.heightSeg}`}
          args={[wr.radius, wr.widthSeg, wr.heightSeg]}
        />
      </mesh>
      <mesh position={pa.position} material={skin} scale={pa.scale}>
        <sphereGeometry
          key={`${pa.radius}-${pa.widthSeg}-${pa.heightSeg}`}
          args={[pa.radius, pa.widthSeg, pa.heightSeg]}
        />
      </mesh>
      <mesh position={pt.position} material={skin} scale={pt.scale}>
        <sphereGeometry
          key={`${pt.radius}-${pt.widthSeg}-${pt.heightSeg}`}
          args={[pt.radius, pt.widthSeg, pt.heightSeg]}
        />
      </mesh>

      <ControlledFinger
        name="Index"
        position={[-0.33, 0.62, 0.02]}
        lengths={[0.4, 0.3, 0.24]}
        radius={0.125}
        curl={[0.16, 0.08, -0.12]}
        tilt={-0.08}
        material={skin}
      />
      <ControlledFinger
        name="Middle"
        position={[-0.09, 0.68, 0]}
        lengths={[0.46, 0.34, 0.26]}
        radius={0.13}
        curl={[-0.06, -0.12, -0.07]}
        tilt={0.05}
        material={skin}
      />
      <ControlledFinger
        name="Ring"
        position={[0.15, 0.64, 0]}
        lengths={[0.4, 0.28, 0.22]}
        radius={0.12}
        curl={[-0.27, 0.16, -0.12]}
        tilt={0.12}
        capSegments={10}
        material={skin}
      />
      <ControlledFinger
        name="Pinky"
        position={[0.36, 0.52, 0]}
        lengths={[0.3, 0.39, 0.21]}
        radius={0.105}
        curl={[-0.42, 0.2, -0.12]}
        tilt={0.14}
        material={skin}
      />
      <ControlledFinger
        name="Thumb"
        position={[-0.46, -0.1, 0.1]}
        lengths={[0.22, 0.26, 0.2]}
        radius={0.14}
        curl={[0.1, 0.1, 0.12]}
        baseRotZ={0.62}
        tilt={0.1}
        material={skin}
      />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ring tiles                                                                */
/* -------------------------------------------------------------------------- */

type TileProps = {
  index: number;
  angle: number;
  bodyGeo: THREE.BufferGeometry;
  rimGeo: THREE.BufferGeometry;
  texture: THREE.Texture;
  onHover: (hovered: boolean) => void;
};

function Tile({ index, angle, bodyGeo, rimGeo, texture, onHover }: TileProps) {
  const group = useRef<THREE.Group>(null);
  const slot = useRef<THREE.Group>(null);
  const rimMat = useRef<THREE.MeshStandardMaterial>(null);
  const hovered = useRef(false);
  const expand = useRef(0);

  const neon = useMemo(
    () => NEON_A.clone().lerp(NEON_B, (index % 4) / 3),
    [index],
  );

  useFrame((_, dt) => {
    if (!group.current || !rimMat.current || !slot.current) return;

    expand.current = THREE.MathUtils.lerp(
      expand.current,
      easeScroll(heroScroll.progress),
      1 - Math.exp(-dt * 5),
    );
    const e = expand.current;
    const r = 1 + e * RING_EXPAND;
    slot.current.position.set(
      Math.sin(angle) * RING_RX * r,
      -Math.cos(angle) * e * RING_PUSH_Y,
      Math.cos(angle) * RING_RZ * r,
    );

    const k = 1 - Math.exp(-dt * 10);
    const target = hovered.current ? 1.12 : 1;
    const s = THREE.MathUtils.lerp(group.current.scale.x, target, k);
    group.current.scale.setScalar(s);
    rimMat.current.emissiveIntensity = THREE.MathUtils.lerp(
      rimMat.current.emissiveIntensity,
      hovered.current ? 6.5 : 2.4,
      k,
    );
  });

  const x = Math.sin(angle) * RING_RX;
  const z = Math.cos(angle) * RING_RZ;

  return (
    <group ref={slot} position={[x, 0, z]} rotation={[0, angle, 0]}>
      <group
        ref={group}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          onHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          hovered.current = false;
          onHover(false);
          document.body.style.cursor = "";
        }}
      >
        <mesh geometry={bodyGeo}>
          <meshPhysicalMaterial
            color="#161c2a"
            metalness={0.88}
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={3}
          />
        </mesh>
        <mesh geometry={rimGeo}>
          <meshStandardMaterial
            ref={rimMat}
            color="#05070f"
            emissive={neon}
            emissiveIntensity={2.4}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0, TILE_DEPTH / 2 + 0.004]}>
          <planeGeometry args={[TILE_SIZE * 0.62, TILE_SIZE * 0.62]} />
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={0.05}
            metalness={1}
            roughness={0.22}
            envMapIntensity={1.6}
          />
        </mesh>
      </group>
    </group>
  );
}

function OrbitRing({ ringRef }: { ringRef: React.RefObject<THREE.Group | null> }) {
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const hoverCount = useRef(0);
  const speed = useRef(0.18);

  const bodyGeo = useMemo(
    () => createSquircleGeometry(TILE_SIZE * 0.96, TILE_DEPTH, TILE_RADIUS),
    [],
  );
  const rimGeo = useMemo(
    () => createSquircleGeometry(TILE_SIZE * 0.99, TILE_DEPTH * 0.5, TILE_RADIUS),
    [],
  );
  const textures = useMemo(() => ICONS.map((i) => drawIcon(i)), []);

  useFrame((_, dt) => {
    if (!spin.current) return;
    const target = hoverCount.current > 0 ? 0.02 : 0.18;
    speed.current = THREE.MathUtils.lerp(
      speed.current,
      target,
      1 - Math.exp(-dt * 4),
    );
    spin.current.rotation.y += dt * speed.current;
  });

  return (
    <group ref={ringRef} position={[0, -4.2, 0]}>
      <group
        ref={tilt}
        rotation={[THREE.MathUtils.degToRad(20), 0, THREE.MathUtils.degToRad(-10)]}
      >
        <group ref={spin}>
          {Array.from({ length: TILE_COUNT }, (_, i) => (
            <Tile
              key={i}
              index={i}
              angle={(i / TILE_COUNT) * Math.PI * 2}
              bodyGeo={bodyGeo}
              rimGeo={rimGeo}
              texture={textures[i]}
              onHover={(h) => {
                hoverCount.current = Math.max(0, hoverCount.current + (h ? 1 : -1));
              }}
            />
          ))}
        </group>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scene with Multi-Phase Camera Orbit & Perspectives                        */
/* -------------------------------------------------------------------------- */

export default function HeroScene() {
  const handRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const currentLookAt = useRef(new THREE.Vector3(0.0, -0.6, 0));

  useFrame((state, dt) => {
    const p = Math.min(3, Math.max(0, sceneScroll.progress));

    // Find bounding keyframes
    let kfA = PHASE_KEYFRAMES[0];
    let kfB = PHASE_KEYFRAMES[PHASE_KEYFRAMES.length - 1];

    for (let i = 0; i < PHASE_KEYFRAMES.length - 1; i++) {
      if (p >= PHASE_KEYFRAMES[i].p && p <= PHASE_KEYFRAMES[i + 1].p) {
        kfA = PHASE_KEYFRAMES[i];
        kfB = PHASE_KEYFRAMES[i + 1];
        break;
      }
    }

    const range = Math.max(0.0001, kfB.p - kfA.p);
    const u = Math.min(1, Math.max(0, (p - kfA.p) / range));
    // Smooth Hermite easing for transitions between keyframes
    const t = u * u * (3 - 2 * u);

    // Target Camera Position (interpolated between phases)
    const targetCamX = THREE.MathUtils.lerp(kfA.camPos[0], kfB.camPos[0], t);
    const targetCamY = THREE.MathUtils.lerp(kfA.camPos[1], kfB.camPos[1], t);
    const targetCamZ = THREE.MathUtils.lerp(kfA.camPos[2], kfB.camPos[2], t);

    // Target LookAt
    const targetLookX = THREE.MathUtils.lerp(kfA.lookAt[0], kfB.lookAt[0], t);
    const targetLookY = THREE.MathUtils.lerp(kfA.lookAt[1], kfB.lookAt[1], t);
    const targetLookZ = THREE.MathUtils.lerp(kfA.lookAt[2], kfB.lookAt[2], t);

    // Target Hand Transform
    const targetHandRotX = THREE.MathUtils.lerp(kfA.handRot[0], kfB.handRot[0], t);
    const targetHandRotY = THREE.MathUtils.lerp(kfA.handRot[1], kfB.handRot[1], t);
    const targetHandRotZ = THREE.MathUtils.lerp(kfA.handRot[2], kfB.handRot[2], t);

    const targetHandPosX = THREE.MathUtils.lerp(kfA.handPos[0], kfB.handPos[0], t);
    const targetHandPosY = THREE.MathUtils.lerp(kfA.handPos[1], kfB.handPos[1], t);
    const targetHandPosZ = THREE.MathUtils.lerp(kfA.handPos[2], kfB.handPos[2], t);

    const targetHandScale = THREE.MathUtils.lerp(kfA.handScale, kfB.handScale, t);

    // Target Ring Transform
    const targetRingPosX = THREE.MathUtils.lerp(kfA.ringPos[0], kfB.ringPos[0], t);
    const targetRingPosY = THREE.MathUtils.lerp(kfA.ringPos[1], kfB.ringPos[1], t);
    const targetRingPosZ = THREE.MathUtils.lerp(kfA.ringPos[2], kfB.ringPos[2], t);

    // Mouse parallax
    const mouseX = state.pointer.x * 0.25;
    const mouseY = state.pointer.y * 0.18;

    // Smooth lerp damping
    const k = 1 - Math.exp(-dt * 4);

    // Update Camera
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      targetCamX + mouseX,
      k,
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      targetCamY + mouseY,
      k,
    );
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      targetCamZ,
      k,
    );

    currentLookAt.current.x = THREE.MathUtils.lerp(
      currentLookAt.current.x,
      targetLookX,
      k,
    );
    currentLookAt.current.y = THREE.MathUtils.lerp(
      currentLookAt.current.y,
      targetLookY,
      k,
    );
    currentLookAt.current.z = THREE.MathUtils.lerp(
      currentLookAt.current.z,
      targetLookZ,
      k,
    );
    state.camera.lookAt(currentLookAt.current);

    // Update Hand Group
    if (handRef.current) {
      handRef.current.rotation.x = THREE.MathUtils.lerp(
        handRef.current.rotation.x,
        targetHandRotX - mouseY * 0.15,
        k,
      );
      handRef.current.rotation.y = THREE.MathUtils.lerp(
        handRef.current.rotation.y,
        targetHandRotY + mouseX * 0.2,
        k,
      );
      handRef.current.rotation.z = THREE.MathUtils.lerp(
        handRef.current.rotation.z,
        targetHandRotZ,
        k,
      );

      handRef.current.position.x = THREE.MathUtils.lerp(
        handRef.current.position.x,
        targetHandPosX,
        k,
      );
      handRef.current.position.y = THREE.MathUtils.lerp(
        handRef.current.position.y,
        targetHandPosY,
        k,
      );
      handRef.current.position.z = THREE.MathUtils.lerp(
        handRef.current.position.z,
        targetHandPosZ,
        k,
      );

      const s = THREE.MathUtils.lerp(
        handRef.current.scale.x,
        targetHandScale,
        k,
      );
      handRef.current.scale.setScalar(s);
    }

    // Update Ring Group
    if (ringRef.current) {
      ringRef.current.position.x = THREE.MathUtils.lerp(
        ringRef.current.position.x,
        targetRingPosX,
        k,
      );
      ringRef.current.position.y = THREE.MathUtils.lerp(
        ringRef.current.position.y,
        targetRingPosY,
        k,
      );
      ringRef.current.position.z = THREE.MathUtils.lerp(
        ringRef.current.position.z,
        targetRingPosZ,
        k,
      );
    }
  });

  return (
    <>
      <color attach="background" args={["#000000"]} />

      {/* Global ambient & directional fills */}
      <ambientLight intensity={0.08} color="#2a3566" />
      <directionalLight position={[-6, 4, 3]} color="#7c3aed" intensity={1.2} />
      <directionalLight position={[6, 4, 3]} color="#00d4ff" intensity={1.2} />

      {/* Local environment for chrome reflections */}
      <Environment resolution={256} environmentIntensity={0.95}>
        <Lightformer form="rect" intensity={2.8} color="#3062ff" position={[-5, 1, 2]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#00d4ff" position={[5, 0, 1]} scale={[5, 4, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#ffffff" position={[0, 4, 3]} scale={[6, 1.5, 1]} />
        <Lightformer form="ring" intensity={1.6} color="#7c3aed" position={[0, -3, 2]} scale={4} />
      </Environment>

      {/* Hand group — starts submerged at the bottom in Phase 0 */}
      <group ref={handRef} position={[0, -5.8, 0]} rotation={[0.15, 0, 0]} scale={1.55}>
        <Hand />
        {/* Core lights follow the hand group across the viewport */}
        <pointLight position={[0.2, 1.6, 1.2]} color="#fff4e6" intensity={3.0} decay={1.5} />
        <pointLight position={[0, 1.2, -0.7]} color="#1d5eff" intensity={7.5} decay={1.4} />
        <pointLight position={[0, 0.4, 2.0]} color="#3a6bff" intensity={3.0} decay={1.5} />
      </group>

      {/* Orbit Ring */}
      <OrbitRing ringRef={ringRef} />
    </>
  );
}
