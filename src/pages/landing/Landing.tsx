import { LandingNavbar } from './LandingNavbar'
import { HeroSection } from './HeroSection'
import { LibrarySection } from './LibrarySection'
import { FeaturesSection } from './FeaturesSection'
import { CtaSection } from './CtaSection'

function Landing() {
  return (
    <div className="h-screen w-full overflow-hidden bg-zinc-50 text-zinc-950 selection:bg-zinc-700 selection:text-white dark:bg-zinc-950 dark:text-zinc-50">
      <LandingNavbar />

      <main className="no-scrollbar h-screen w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth">
        <HeroSection />
        <LibrarySection />
        <FeaturesSection />
        <CtaSection />
      </main>
    </div>
  )
}

export { Landing }
