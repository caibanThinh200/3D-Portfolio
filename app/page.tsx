import SceneCanvas from "./components/canvas/SceneCanvas";
import HeroOverlay from "./components/hero/HeroOverlay";
import ScrollTracker from "./components/canvas/ScrollTracker";
import ProjectsSection from "./components/sections/ProjectsSection";
import AboutSection from "./components/sections/AboutSection";
import ContactSection from "./components/sections/ContactSection";
import clsx from "clsx";

export default function Home() {
  return (
    <main className={clsx('relative', 'min-h-screen', 'bg-[#050510]')}>
      {/* Scroll synchronization between DOM sections and R3F scene */}
      <ScrollTracker />

      {/* Persistent 3D Scene extended across FULL VIEWPORT */}
      <div className={clsx('fixed', 'inset-0', 'z-0', 'h-screen', 'w-full', 'pointer-events-auto')}>
        <SceneCanvas />
      </div>

      {/* Viewport Corner Gradient Overlay — frames the 4 corners, center remains clear for 3D & text */}
      <div className="viewport-corner-glow" aria-hidden="true" />

      {/* Scrollable Content Layer across sections with alternating left/right layout */}
      <div className={clsx('relative', 'z-10', 'w-full', 'pointer-events-none')}>
        <section id="hero" className="w-full">
          <div className={clsx('w-full', 'pointer-events-auto')}>
            <HeroOverlay />
          </div>
        </section>

        {/* Phase 2: Section 2 content on the RIGHT, Hand glides to the LEFT */}
        <ProjectsSection />

        {/* Phase 3: Section 3 content on the LEFT, Hand glides to the RIGHT */}
        <AboutSection />

        {/* Phase 4: Section 4 content on the RIGHT, Hand glides to the LEFT */}
        <ContactSection />
      </div>
    </main>
  );
}
