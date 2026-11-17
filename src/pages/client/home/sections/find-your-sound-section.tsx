import { ArrowUpRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { Link } from "react-router-dom"

import { Container } from "@/components/client/container"

const listeningFocuses = [
  {
    title: "Hi-Fi Listening",
    description: "Rediscover your favourite music, one detail at a time.",
  },
  {
    title: "Home Cinema",
    description: "Bring the atmosphere of the cinema into your home.",
  },
  {
    title: "Personal Guidance",
    description: "Find the right combination for your space and the way you listen.",
  },
]

export function FindYourSoundSection() {
  const reduceMotion = useReducedMotion()
  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false as const : { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: {
      duration: reduceMotion ? 0 : 0.8,
      delay: reduceMotion ? 0 : delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  })

  return (
    <section
      aria-labelledby="find-your-sound-title"
      className="bg-black pt-6 pb-12 text-white sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-20"
    >
      <Container className="font-neue-haas max-w-none px-5 sm:px-12 lg:px-16">
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:items-end lg:gap-12 xl:gap-20">
          <div>
            <motion.p {...reveal()} className="mb-5 text-xs tracking-[0.2em] text-yellow-400 uppercase">
              Find your sound
            </motion.p>
            <motion.h2
              id="find-your-sound-title"
              className="font-degular text-4xl leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl"
              initial={reduceMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ staggerChildren: reduceMotion ? 0 : 0.12 }}
            >
              {["A sound system.", "A world of difference."].map((line) => (
                <span key={line} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
                  <motion.span
                    className="block"
                    variants={{ hidden: { opacity: 0, y: "105%" }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </motion.h2>
          </div>
          <motion.div {...reveal(0.18)}>
            <p className="max-w-lg text-base leading-7 text-white/65">
              From the intimacy of two-channel listening to the immersion of a
              private cinema, discover audio that brings you closer to the music
              and films you love.
            </p>
            <Link
              to="/collection/all-products"
              className="group mt-6 inline-flex min-h-11 items-center gap-5 border-b border-white/35 py-2 text-sm transition-colors hover:border-yellow-400 hover:text-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
            >
              Explore our collection
              <ArrowUpRight
                className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </Link>
          </motion.div>
        </div>

        <ul className="mt-9 grid gap-6 border-t border-white/15 pt-6 sm:mt-12 sm:grid-cols-3 sm:gap-8 sm:pt-8">
          {listeningFocuses.map((focus, index) => (
            <motion.li key={focus.title} {...reveal(index * 0.1)}>
              <p className="mb-3 text-xs text-yellow-400/80" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="font-degular text-2xl leading-tight">{focus.title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/60">
                {focus.description}
              </p>
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
