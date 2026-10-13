import { ArrowDown, AudioLines } from "lucide-react"
import { useEffect, useRef, type MouseEvent } from "react"
import { animate, motion, useReducedMotion } from "motion/react"

import { Container } from "@/components/client/container"
import { AboutReveal } from "../about-reveal"

export function AboutHeroSection() {
  const reduceMotion = useReducedMotion()
  const scrollAnimation = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    const stopScroll = () => scrollAnimation.current?.stop()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Escape"].includes(event.key)) stopScroll()
    }
    window.addEventListener("wheel", stopScroll, { passive: true })
    window.addEventListener("touchstart", stopScroll, { passive: true })
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      stopScroll()
      window.removeEventListener("wheel", stopScroll)
      window.removeEventListener("touchstart", stopScroll)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const discoverStory = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const target = document.getElementById("our-story")
    if (!target) return

    event.preventDefault()
    scrollAnimation.current?.stop()
    const offset = Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0
    const destination = Math.max(0, Math.min(
      window.scrollY + target.getBoundingClientRect().top - offset,
      document.documentElement.scrollHeight - window.innerHeight,
    ))
    const finishScroll = () => {
      window.history.replaceState(window.history.state, "", "#our-story")
      target.focus({ preventScroll: true })
    }

    if (reduceMotion) {
      window.scrollTo({ top: destination, behavior: "instant" })
      finishScroll()
      return
    }

    scrollAnimation.current = animate(window.scrollY, destination, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (top) => window.scrollTo({ top, behavior: "instant" }),
      onComplete: finishScroll,
    })
  }

  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_78%_20%,rgba(234,179,8,.28),transparent_27%),linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] bg-size-[auto,72px_72px,72px_72px]" />
      <Container className="relative max-w-none px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.65fr)] lg:items-end">
          <div className="flex max-w-5xl flex-col gap-8">
            <AboutReveal onLoad className="flex items-center gap-3 text-xs uppercase tracking-[.15em] text-yellow-400">
              <AudioLines className="size-5" aria-hidden="true" />
              About us
            </AboutReveal>
            <AboutReveal as="h1" onLoad delay={0.12} className="font-degular text-title tracking-normal sm:text-7xl lg:text-[7.5rem] xl:text-[9rem] sm:leading-none">
              Music That Belongs to Your Story
            </AboutReveal>
          </div>

          <AboutReveal onLoad delay={0.24} className="flex flex-col gap-10 border-l border-white/20 pl-6 sm:pl-8">
            <p className="text-lg leading-8 text-white/65 lg:text-xl lg:leading-9">
              At the heart of every great piece of content is a story. Sometimes, the right music is what makes that story truly come alive.
            </p>
            <motion.a
              href="#our-story"
              onClick={discoverStory}
              whileHover={reduceMotion ? undefined : "hover"}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              className="inline-flex w-fit items-center gap-3 text-sm text-white transition-colors hover:text-yellow-400"
            >
              Discover our story
              <motion.span
                variants={{ hover: { y: 3 } }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex size-10 items-center justify-center rounded-full border border-white/30"
              ><ArrowDown className="size-4" /></motion.span>
            </motion.a>
          </AboutReveal>
        </div>
      </Container>
    </section>
  )
}
