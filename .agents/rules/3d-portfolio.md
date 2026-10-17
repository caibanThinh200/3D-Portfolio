# 3D Portfolio — Agent Instructions

## Project Context & Architecture

You are acting as a **Creative Technologist and Senior Frontend Engineer** building an immersive, luxury-tier 3D portfolio website.

The full project has multiple sections (Hero, Selected Works, About / Capabilities, Interactive Playground, Contact). Execution is structured into sequential milestones.

## Active Milestone: Phase 1 — The 3D Hero Section

Deliver the Interactive 3D Hero Section, matching the exact visual aesthetics, typography, lighting balance, and motion fidelity of the reference design. Later sections are scaffolded below the fold, but Phase 1 must reach complete production polish first.

## Tech Stack & System Architecture

| Concern | Choice |
| --- | --- |
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS + Google Fonts via `next/font/google` (Playfair Display or Cormorant Garamond for serif titles; Inter or Geist for utility text) |
| Animation | Motion (`framer-motion`) |
| 3D Engine | Three.js via `@react-three/fiber` and `@react-three/drei` |
| Post-Processing | `@react-three/postprocessing` |

## Phase 1 Deliverable Breakdown

### 1. Folder Structure & Layout Preparation

Phase 1 commands the full viewport (`100vh`), with clean scroll continuation for later phases.

```
app/
├── layout.tsx
├── page.tsx
└── components/
    ├── canvas/
    │   ├── SceneCanvas.tsx          // Dynamic SSR-free R3F canvas wrapper
    │   ├── HeroScene.tsx            // 3D hand, floating squircle ring, & lighting
    │   └── PostProcessing.tsx       // Bloom, tone mapping & vignette
    ├── hero/
    │   ├── HeroOverlay.tsx          // Framer Motion typography & brand mark
    │   └── ScrollIndicator.tsx      // Subtle scroll indicator to Phase 2
    └── sections/                    // Stubs for upcoming phases
        ├── ProjectsSection.tsx      // [Phase 2 placeholder]
        ├── AboutSection.tsx         // [Phase 3 placeholder]
        └── ContactSection.tsx       // [Phase 4 placeholder]
```

### 2. Hero UI & Typography Spec

**Heading**
- Text: `"Make magic happen"`
- Position: `fixed` or `absolute`, `top: 7.5vh`, centered (`left: 50%`, `transform: translateX(-50%)`).
- Typography: serif (Playfair Display or Cormorant Garamond), `font-weight: 400`, `tracking-tight`, crisp white `#FFFFFF`.
- Entrance animation (framer-motion): initial `opacity: 0, y: -24` → `opacity: 1, y: 0` over `1.2s`, ease `[0.16, 1, 0.3, 1]`.

**Bottom Brand Mark / Glyphs**
- Positioned at `bottom: 5vh`, centered horizontally.
- Minimalist abstract white geometric faceted mark with subtle idle floating/pulse animation.
- Subtle interactive scroll cue indicating downward continuation.

### 3. 3D Hero Scene (`HeroScene.tsx`)

**Central Hand Model**
- Realistic/stylized human hand rising from the bottom edge (`y: -2.0` to `-2.4`).
- Graceful open posture: index and middle fingertips reach toward the top key light.
- Material: `MeshPhysicalMaterial`, warm porcelain/peach tint `#f5d5cb`, roughness `0.38`, metalness `0.04`, subtle translucency to simulate SSS.

**Orbiting Skill / Project Ring**
- 8 squircle tiles (`RoundedBoxGeometry`, ~`0.75 x 0.75 x 0.12`, corner radius `0.14`) in an inclined ellipse orbiting the hand.
- Ring orientation: ~`20°` on the X-axis, `-10°` on the Z-axis.
- Tile styling: smoked obsidian chrome (`#0e121a`, metalness `0.88`, roughness `0.12`, clearcoat `1.0`).
- Front faces have inset metallic icons (analytics bars, 4-point sparkle star, 4-tile grid, media dials).
- Emissive neon cobalt-blue rim/chamfer edges (`#3062ff` → `#00d4ff`).

**Dynamic Lighting & Atmosphere**
| Light | Type | Color | Intensity | Placement |
| --- | --- | --- | --- | --- |
| Top Key | Point | `#fff4e6` | 3.0 | Just above the top fingertips |
| Core Neon Glow | Point | `#1d5eff` | 7.5 | Inside ring orbit, behind the hand |
| Rim Fill | Directional | `#7c3aed` | 1.2 | From bottom-left edge |

**Post-Processing Rig**
- Bloom: `luminanceThreshold: 0.7`, `intensity: 1.1`, `mipmapBlur` enabled.
- Vignette: soft edge falloff blending into pitch black `#000000`.
- Include tone mapping.

### 4. Interaction & Micro-Motion

- **Parallax mouse follow:** lerp-based tilt for hand and ring (`pointer.x * 0.15`, `pointer.y * 0.1`).
- **Continuous orbit:** smooth Y-axis rotation inside `useFrame`.
- **Tile interactivity:** hovering a tile pauses/slows rotation, scales it to `1.1x`, and brightens its emissive neon edge.

## Execution Instructions

1. Set up the Next.js Client Component entry point with dynamic loading (`ssr: false`) to avoid Three.js hydration mismatches.
2. Build the visual hierarchy and typography overlay using Tailwind CSS and framer-motion.
3. Construct the R3F Canvas, including lighting, the hand mesh, the squircle ring orbit, and post-processing effects.
4. Leave a clean scroll transition wrapper beneath the Hero so later sections can be plugged in during Phase 2.
