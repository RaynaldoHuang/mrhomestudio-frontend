import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"

import philosophyImage from "@/assets/img/img3.png"
import { Container } from "@/components/client/container"

export function AboutSection() {
  return (
    <section
      id="our-philosophy"
      aria-labelledby="our-philosophy-title"
      className="bg-black py-20 text-white sm:py-24 lg:py-28"
    >
      <Container className="font-neue-haas max-w-none px-5 sm:px-12 lg:px-16">
        <div className="grid gap-y-7 lg:grid-cols-[3fr_2fr] lg:gap-x-12 lg:gap-y-6 xl:gap-x-20">
          <div className="lg:col-start-2 lg:row-start-1 lg:self-end">
            <p className="mb-5 text-xs tracking-[0.2em] text-yellow-400 uppercase">
              Our philosophy
            </p>
            <h2
              id="our-philosophy-title"
              className="font-degular max-w-lg text-4xl leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl"
            >
              Great sound begins with your space.
            </h2>
          </div>

          <figure className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <div className="aspect-video overflow-hidden bg-neutral-900">
              <img
                src={philosophyImage}
                alt="Audio studio with integrated speakers, warm wood finishes and a comfortable listening area"
                loading="lazy"
                width={925}
                height={521}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <figcaption className="mt-4 flex items-center gap-3 text-xs tracking-wide text-white/55">
              <span className="h-px w-7 bg-yellow-400/70" aria-hidden="true" />
              Sound. Space. In harmony.
            </figcaption>
          </figure>

          <div className="lg:col-start-2 lg:row-start-2 lg:self-start">
            <p className="max-w-md text-base leading-7 text-white/65">
              Every room has its own character. Every listener, their own rhythm.
              We believe a sound system should bring both together—making music
              feel natural, personal, and at home.
            </p>
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
          </div>
        </div>
      </Container>
    </section>
  )
}
