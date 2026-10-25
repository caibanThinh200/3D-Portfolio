import SceneCanvas from "./components/canvas/SceneCanvas";
import HeroOverlay from "./components/hero/HeroOverlay";
import ScrollTracker from "./components/canvas/ScrollTracker";
import ProjectsSection from "./components/sections/ProjectsSection";
import AboutSection from "./components/sections/AboutSection";
import ContactSection from "./components/sections/ContactSection";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black">
      {/* Scroll synchronization between DOM sections and R3F scene */}
      <ScrollTracker />

      {/* Persistent 3D Scene extended across FULL VIEWPORT */}
      <div className="fixed inset-0 z-0 h-screen w-full pointer-events-auto">
        <SceneCanvas />
      </div>

      {/* Scrollable Content Layer across sections with alternating left/right layout */}
      <div className="relative z-10 w-full pointer-events-none">
        <section id="hero" className="w-full">
          <div className="w-full pointer-events-auto">
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
