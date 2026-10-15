import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"
import Autoplay from "embla-carousel-autoplay"

import heroImage1 from "@/assets/img/img1.png"
import heroImage2 from "@/assets/img/img2.png"
import heroImage3 from "@/assets/img/img3.png"
import { Container } from "@/components/client/container"
import { getPublicCarousels } from "@/lib/carousel-api"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const fallbackSlides = [
  {
    eyebrow: "#homecinema",
    title: "Sound that feels like home",
    cta: "Explore products",
    href: "/services",
    image: heroImage1,
    imageAlt: "Luxury home cinema room",
    imagePosition: "object-center",
  },
  {
    eyebrow: "#privatetheater",
    title: "Every room deserves better sound",
    cta: "View our collection",
    href: "/services",
    image: heroImage2,
    imageAlt: "Premium private cinema with tiered seating",
    imagePosition: "object-center",
  },
  {
    eyebrow: "#audioexperience",
    title: "Hear every detail come alive",
    cta: "Talk to our team",
    href: "/contact",
    image: heroImage3,
    imageAlt: "Professional home audio studio",
    imagePosition: "object-center",
  },
]

type HeroSlide = (typeof fallbackSlides)[number]

const autoplayPlugins = [
  Autoplay({
    delay: 5000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  }),
]

export function HeroSection() {
  const [slides, setSlides] = useState<HeroSlide[]>(fallbackSlides)

  useEffect(() => {
    let isMounted = true

    getPublicCarousels()
      .then((carousels) => {
        if (!isMounted) return

        setSlides(
          carousels.map((carousel, index) => ({
            eyebrow: carousel.eyebrow ?? "",
            title: carousel.title,
            cta: carousel.cta_label,
            href: carousel.cta_url,
            image: carousel.image_url ?? fallbackSlides[index % fallbackSlides.length].image,
            imageAlt: carousel.image_alt,
            imagePosition: carousel.image_position,
          })),
        )
      })
      .catch(() => {
        // Keep bundled slides visible while the API is unavailable.
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (slides.length === 0) return null

  return (
    <section
      aria-label="Featured products"
      className="h-[calc(100svh-5rem)] min-h-128 w-full overflow-hidden bg-black lg:h-[calc(100svh-4.5rem)]"
    >
      <Carousel
        opts={{ loop: true }}
        plugins={autoplayPlugins}
        className="h-full w-full **:data-[slot=carousel-content]:h-full [&_[data-slot=carousel-content]>div]:h-full"
      >
        <CarouselContent className="ml-0 h-full">
          {slides.map((slide) => (
            <CarouselItem key={slide.title} className="h-full pl-0">
              <div className="relative h-full overflow-hidden bg-black">
                <img
                  src={slide.image}
                  alt={slide.imageAlt}
                  className={`absolute inset-0 h-full w-full object-cover ${slide.imagePosition}`}
                />
                <div className="absolute inset-0 bg-black/5" />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent sm:from-black/60 sm:via-black/5" />

                <Container className="relative z-10 flex h-full max-w-none items-end px-8 pb-20 sm:px-12 sm:pb-14 lg:px-16">
                  <div className="max-w-4xl">
                    <p className="font-neue-haas mb-2 text-base font-light text-white/90 sm:mb-3 sm:text-lg">
                      {slide.eyebrow}
                    </p>
                    <h1 className="font-degular w-5/6 text-title text-white sm:text-6xl lg:text-6xl sm:leading-16">
                      {slide.title}
                    </h1>

                    <Link
                      to={slide.href}
                      className="font-neue-haas mt-7 inline-flex h-10 w-fit items-center justify-center gap-2.5 rounded-full border border-white px-5 text-xs font-normal text-white transition-colors hover:border-yellow-500 hover:bg-yellow-500 hover:text-black sm:h-12 sm:px-6 sm:text-sm"
                    >
                      {slide.cta}
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                </Container>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <Container className="pointer-events-none absolute inset-x-0 bottom-20 z-20 h-13 max-w-none px-8 sm:bottom-14 sm:px-12 lg:px-16">
          <CarouselPrevious className="pointer-events-auto top-0 right-20 bottom-auto left-auto my-0 size-10 border-0 bg-white text-black shadow-lg hover:bg-yellow-500 sm:right-25 sm:size-11 lg:right-29" />
          <CarouselNext className="pointer-events-auto top-0 right-8 bottom-auto my-0 size-10 border-0 bg-white text-black shadow-lg hover:bg-yellow-500 sm:right-12 sm:size-11 lg:right-16" />
        </Container>
      </Carousel>
    </section>
  )
}
