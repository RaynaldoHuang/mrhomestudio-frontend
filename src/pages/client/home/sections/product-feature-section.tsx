import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

import featureImage from "@/assets/img/img4.png"

export function ProductFeatureSection() {
  return (
    <section className="bg-black pt-20 text-white sm:pt-24 lg:pt-28">
      <div className="relative min-h-120 w-full overflow-hidden sm:min-h-136 lg:min-h-152">
        <img
          src={featureImage}
          alt="Premium speakers integrated into a modern living space"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/5" />
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/20 to-transparent" />

        <div className="relative z-10 flex min-h-120 items-center px-8 py-10 sm:min-h-136 sm:px-12 sm:py-12 lg:min-h-152 lg:px-16 lg:py-14">
          <div className="max-w-2xl">
            <p className="font-neue-haas mb-4 text-xs text-yellow-400 sm:text-sm">
              High-fidelity speakers
            </p>
            <h1 className="text-title sm:text-6xl lg:text-6xl sm:leading-[0.92] max-sm:font-degular max-sm:text-2xl max-sm:font-normal max-sm:leading-tight max-sm:tracking-normal">
              Sound, beautifully at home.
            </h1>
            <p className="font-degular mt-5 max-w-xl text-sm leading-6 text-white/80 sm:text-base sm:leading-6 font-ligth">
              Experience detailed, room-filling sound from speakers designed to complement your
              interior and make every listening moment feel effortless.
            </p>

            <Link
              to="/about"
              className="font-neue-haas mt-7 inline-flex h-11 items-center gap-2 rounded-full border border-white/80 px-6 text-xs transition-colors hover:border-yellow-500 hover:bg-yellow-500 hover:text-black sm:h-12 sm:text-sm"
            >
              About Us
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
