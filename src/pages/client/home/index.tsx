import { Reveal } from "@/components/client/reveal"

import { AboutSection } from "./sections/about-section"
import { BestSellersSection } from "./sections/best-sellers-section"
import { CategoriesSection } from "./sections/categories-section"
import { CtaSection } from "./sections/cta-section"
import { GallerySection } from "./sections/gallery-section"
import { HeroSection } from "./sections/hero-section"
import { ProductCatalogSection } from "./sections/product-catalog-section"
import { ProductFeatureSection } from "./sections/product-feature-section"
import { ServicesSection } from "./sections/services-section"

export function HomePage() {
  return (
    <>
      <HeroSection />
      <Reveal><BestSellersSection /></Reveal>
      <Reveal><ProductFeatureSection /></Reveal>
      <Reveal><ProductCatalogSection /></Reveal>
      <Reveal><CategoriesSection /></Reveal>
      <Reveal><AboutSection /></Reveal>
      <Reveal><ServicesSection /></Reveal>
      <Reveal><GallerySection /></Reveal>
      <Reveal><CtaSection /></Reveal>
    </>
  )
}
