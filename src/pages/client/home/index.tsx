import { Reveal } from "@/components/client/reveal"

import { AboutSection } from "./sections/about-section"
import { CtaSection } from "./sections/cta-section"
import { FindYourSoundSection } from "./sections/find-your-sound-section"
import { GallerySection } from "./sections/gallery-section"
import { HeroSection } from "./sections/hero-section"
import { LogoSection } from "./sections/logo-section"
import { ListeningRoomSection } from "./sections/listening-room-section"
import { ServicesSection } from "./sections/services-section"

export function HomePage() {
  return (
    <>
      <HeroSection />
      <FindYourSoundSection />
      <LogoSection />
      <ListeningRoomSection />
      <Reveal><AboutSection /></Reveal>
      <Reveal><ServicesSection /></Reveal>
      <Reveal><GallerySection /></Reveal>
      <Reveal><CtaSection /></Reveal>
    </>
  )
}
