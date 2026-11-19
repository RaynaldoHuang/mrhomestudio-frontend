import { ArrowUpRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { Link } from "react-router-dom"

import philosophyImage from "@/assets/img/studio1-1600.webp"
import philosophyImageSmall from "@/assets/img/studio1-800.webp"
import { Container } from "@/components/client/container"

export function AboutSection() {
  const reduceMotion = useReducedMotion()
  const ease = [0.22, 1, 0.36, 1] as const
  const reveal = (delay = 0) => ({
    initial: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : delay, ease },
  })

  return (
    <section
      id="our-philosophy"
      aria-labelledby="our-philosophy-title"
      className="bg-black pt-8 pb-20 text-white sm:pt-10 sm:pb-24 lg:pt-12 lg:pb-28"
    >
      <Container className="font-neue-haas max-w-none px-5 sm:px-12 lg:px-16">
        <div className="grid gap-y-7 lg:grid-cols-[3fr_2fr] lg:gap-x-12 lg:gap-y-6 xl:gap-x-20">
          <div className="lg:col-start-2 lg:row-start-1 lg:self-end">
            <motion.p {...reveal(0.1)} className="mb-5 text-xs tracking-[0.2em] text-yellow-400 uppercase">
              Our philosophy
            </motion.p>
            <motion.h2
              {...reveal(0.2)}
              id="our-philosophy-title"
              className="font-degular max-w-lg text-4xl leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl"
            >
              Great sound begins with your space.
            </motion.h2>
          </div>

          <figure className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <div className="aspect-video overflow-hidden bg-neutral-900">
              <motion.img
                initial={{ scale: reduceMotion ? 1 : 1.035 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: reduceMotion ? 0 : 0.65, ease }}
                src={philosophyImage}
                srcSet={`${philosophyImageSmall} 800w, ${philosophyImage} 1600w`}
                sizes="(min-width: 1024px) 60vw, 100vw"
                alt="Audio studio with integrated speakers, warm wood finishes and a comfortable listening area"
                loading="eager"
                decoding="async"
                width={1600}
                height={1067}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <motion.figcaption {...reveal(0.25)} className="mt-4 flex items-center gap-3 text-xs tracking-wide text-white/55">
              <span className="h-px w-7 bg-yellow-400/70" aria-hidden="true" />
              Sound. Space. In harmony.
            </motion.figcaption>
          </figure>

          <div className="lg:col-start-2 lg:row-start-2 lg:self-start">
            <motion.p {...reveal(0.3)} className="max-w-md text-base leading-7 text-white/65">
              Every room has its own character. Every listener, their own rhythm.
              We believe a sound system should bring both together—making music
              feel natural, personal, and at home.
            </motion.p>
            <motion.div {...reveal(0.4)}>
              <Link
                to="/about"
                className="group mt-7 inline-flex min-h-11 items-center gap-5 border-b border-white/35 py-2 text-sm transition-colors hover:border-yellow-400 hover:text-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400 sm:mt-8"
              >
                Discover our approach
                <ArrowUpRight
                  className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  )
}
