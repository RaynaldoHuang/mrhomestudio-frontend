import { Reveal } from "@/components/client/reveal"

import { AboutSection } from "./sections/about-section"
import { CategoriesSection } from "./sections/categories-section"
import { CtaSection } from "./sections/cta-section"
import { GallerySection } from "./sections/gallery-section"
import { HeroSection } from "./sections/hero-section"
import { LogoSection } from "./sections/logo-section"
import { ListeningRoomSection } from "./sections/listening-room-section"
import { ProductFeatureSection } from "./sections/product-feature-section"
import { ServicesSection } from "./sections/services-section"

export function HomePage() {
  return (
    <>
      <HeroSection />
      <LogoSection />
      <Reveal><ProductFeatureSection /></Reveal>
      <ListeningRoomSection />
      <Reveal><CategoriesSection /></Reveal>
      <Reveal><AboutSection /></Reveal>
      <Reveal><ServicesSection /></Reveal>
      <Reveal><GallerySection /></Reveal>
      <Reveal><CtaSection /></Reveal>
    </>
  )
}
