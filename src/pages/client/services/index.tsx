import { ServicesCtaSection } from "./sections/services-cta-section"
import { ServicesHeroSection } from "./sections/services-hero-section"
import { ServicesListSection } from "./sections/services-list-section"

export function ServicesPage() {
  return (
    <>
      <ServicesHeroSection />
      <ServicesListSection />
      <ServicesCtaSection />
    </>
  )
}
