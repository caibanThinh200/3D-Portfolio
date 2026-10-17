import SceneCanvas from "./components/canvas/SceneCanvas";
import HeroOverlay from "./components/hero/HeroOverlay";
import ScrollIndicator from "./components/hero/ScrollIndicator";
import HeroPin from "./components/hero/HeroPin";
import ProjectsSection from "./components/sections/ProjectsSection";
import AboutSection from "./components/sections/AboutSection";
import ContactSection from "./components/sections/ContactSection";

export default function Home() {
  return (
    <main className="bg-black">
      {/* Phase 1 — full-viewport 3D hero */}
      <HeroPin>
        <SceneCanvas />
        <HeroOverlay />
        <ScrollIndicator />
        {/* Soft fade into the next section */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-40 bg-gradient-to-b from-transparent to-black" />
      </HeroPin>

      {/* Scroll continuation for upcoming phases */}
      <ProjectsSection />
      <AboutSection />
      <ContactSection />
    </main>
  );
}
