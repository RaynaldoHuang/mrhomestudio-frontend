import { motion, useReducedMotion } from "motion/react"

import { AboutHeroSection } from "./sections/about-hero-section"
import { StorySection } from "./sections/story-section"
import { ValuesSection } from "./sections/values-section"

export function AboutPage() {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <AboutHeroSection />
      <StorySection />
      <ValuesSection />
    </motion.div>
  )
}
