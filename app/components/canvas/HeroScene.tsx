"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { useControls } from "leva";
import { heroScroll } from "../hero/heroScroll";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const TILE_COUNT = 8;
const TILE_SIZE = 0.75;
const TILE_DEPTH = 0.12;
const TILE_RADIUS = 0.14;
const RING_RX = 2.35;
const RING_RZ = 1.2;
/** Scroll: ring radius multiplier at full progress, and vertical push (world units) */
const RING_EXPAND = 4.5;
const RING_PUSH_Y = 7;

const easeScroll = (p: number) => Math.pow(p, 1.4);
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

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** Rounded-rect (squircle-like) extruded geometry — keeps a 0.14 corner radius
 *  on a 0.12-deep tile, which a plain RoundedBoxGeometry cannot do. */
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
  /** Curl (rotation Z, radians) per joint */
  curl: [number, number, number];
  /** Tilt toward/away from camera (rotation X) at the knuckle */
  tilt?: number;
  material: THREE.Material;
  baseRotZ?: number;
  /** Capsule cap / radial segment counts */
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

/** Finger with a Leva folder to live-tweak its params. */
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
        // Fake subsurface scattering: warm emissive lift + sheen + soft clearcoat
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

  // Live-tweak panel (Leva). Copy values back into the JSX when happy.
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
      {/* Forearm + wrist */}
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

      {/* Palm */}
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

      {/* Index — long, reaching up and slightly back */}
      <ControlledFinger
        name="Index"
        position={[-0.33, 0.62, 0.02]}
        lengths={[0.4, 0.3, 0.24]}
        radius={0.125}
        curl={[0.16, 0.08, -0.12]}
        tilt={-0.08}
        material={skin}
      />
      {/* Middle — tallest, reaching toward the key light */}
      <ControlledFinger
        name="Middle"
        position={[-0.09, 0.68, 0]}
        lengths={[0.46, 0.34, 0.26]}
        radius={0.13}
        curl={[-0.06, -0.12, -0.07]}
        tilt={0.05}
        material={skin}
      />
      {/* Ring — gently relaxed */}
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
      {/* Pinky */}
      <ControlledFinger
        name="Pinky"
        position={[0.36, 0.52, 0]}
        lengths={[0.3, 0.39, 0.21]}
        radius={0.105}
        curl={[-0.42, 0.2, -0.12]}
        tilt={0.14}
        material={skin}
      />
      {/* Thumb — opens out to the left */}
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
    // Scroll-driven spread: ring widens (gap grows) then tiles exit the viewport
    expand.current = THREE.MathUtils.lerp(
      expand.current,
      easeScroll(heroScroll.progress),
      1 - Math.exp(-dt * 6),
    );
    const e = expand.current;
    const r = 1 + e * RING_EXPAND;
    slot.current.position.set(
      Math.sin(angle) * RING_RX * r,
      -Math.cos(angle) * e * RING_PUSH_Y,
      Math.cos(angle) * RING_RZ * r,
    );

    const k = 1 - Math.exp(-dt * 10);
    const target = hovered.current ? 1.1 : 1;
    const s = THREE.MathUtils.lerp(group.current.scale.x, target, k);
    group.current.scale.setScalar(s);
    rimMat.current.emissiveIntensity = THREE.MathUtils.lerp(
      rimMat.current.emissiveIntensity,
      hovered.current ? 6 : 2.4,
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
        {/* Smoked obsidian chrome body */}
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
        {/* Neon chamfer / rim */}
        <mesh geometry={rimGeo}>
          <meshStandardMaterial
            ref={rimMat}
            color="#05070f"
            emissive={neon}
            emissiveIntensity={2.4}
            toneMapped={false}
          />
        </mesh>
        {/* Inset metallic icon */}
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

function OrbitRing() {
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

  useFrame(({ pointer }, dt) => {
    if (!tilt.current || !spin.current) return;
    const target = hoverCount.current > 0 ? 0.015 : 0.18;
    speed.current = THREE.MathUtils.lerp(
      speed.current,
      target,
      1 - Math.exp(-dt * 4),
    );
    spin.current.rotation.y += dt * speed.current;

    const k = 1 - Math.exp(-dt * 3);
    tilt.current.rotation.y = THREE.MathUtils.lerp(
      tilt.current.rotation.y,
      pointer.x * 0.15,
      k,
    );
    tilt.current.rotation.x = THREE.MathUtils.lerp(
      tilt.current.rotation.x,
      THREE.MathUtils.degToRad(20) - pointer.y * 0.1,
      k,
    );
  });

  return (
    <group position={[0, -0.2, 0]}>
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
/*  Scene                                                                     */
/* -------------------------------------------------------------------------- */

export default function HeroScene() {
  const handRef = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    if (!handRef.current) return;
    const k = 1 - Math.exp(-dt * 3);
    handRef.current.rotation.y = THREE.MathUtils.lerp(
      handRef.current.rotation.y,
      state.pointer.x * 0.15,
      k,
    );
    handRef.current.rotation.x = THREE.MathUtils.lerp(
      handRef.current.rotation.x,
      -state.pointer.y * 0.1,
      k,
    );
  });

  return (
    <>
      <color attach="background" args={["#000000"]} />

      {/* Lighting rig */}
      <ambientLight intensity={0.06} color="#2a3566" />
      {/* Top key — warm, above fingertips */}
      <pointLight position={[0.1, 1.0, 1.1]} color="#fff4e6" intensity={3.0} decay={1.6} />
      {/* Core neon glow — inside the ring orbit, behind the hand */}
      <pointLight position={[0, -0.4, -0.7]} color="#1d5eff" intensity={7.5} decay={1.4} />
      {/* Front-low blue wash so the palm picks up the neon spill */}
      <pointLight position={[0, -1.4, 2.0]} color="#3a6bff" intensity={3.2} decay={1.6} />
      {/* Rim fill — purple/magenta, bottom-left */}
      <directionalLight position={[-4, -3, 2]} color="#7c3aed" intensity={1.2} />

      {/* Local environment for chrome reflections (no network HDR) */}
      <Environment resolution={256} environmentIntensity={0.9}>
        <Lightformer form="rect" intensity={2.5} color="#3062ff" position={[-5, 1, 2]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={2} color="#00d4ff" position={[5, 0, 1]} scale={[5, 4, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[0, 4, 3]} scale={[6, 1.5, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#7c3aed" position={[0, -3, 2]} scale={4} />
      </Environment>

      {/* Hand rises from the bottom edge */}
      <group ref={handRef} position={[0, -2.0, 0]} rotation={[0, 0, 0.04]} scale={1.6}>
        <Hand />
      </group>

      <OrbitRing />
    </>
  );
}
