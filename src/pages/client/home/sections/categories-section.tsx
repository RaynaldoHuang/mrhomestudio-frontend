import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"

import { getCategories, type Category } from "@/lib/category-api"
import { Container } from "@/components/client/container"
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const wheelGesturesPlugins = [WheelGesturesPlugin()]

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    let active = true
    getCategories(true)
      .then((items) => { if (active) setCategories(items) })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  const [api, setApi] = useState<CarouselApi>()
  const progressBarRef = useRef<HTMLDivElement>(null)
  const progressFrameRef = useRef(0)

  const updateProgress = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return

    window.cancelAnimationFrame(progressFrameRef.current)
    progressFrameRef.current = window.requestAnimationFrame(() => {
      const scrollProgress = Math.max(0, Math.min(1, carouselApi.scrollProgress()))

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `translate3d(${scrollProgress * 300}%, 0, 0)`
      }
    })
  }, [])

  useEffect(() => {
    if (!api) return

    const frame = window.requestAnimationFrame(() => updateProgress(api))
    api.on("scroll", updateProgress)
    api.on("reInit", updateProgress)

    return () => {
      window.cancelAnimationFrame(frame)
      window.cancelAnimationFrame(progressFrameRef.current)
      api.off("scroll", updateProgress)
      api.off("reInit", updateProgress)
    }
  }, [api, updateProgress])

  if (categories.length === 0) return null

  return (
    <section className="overflow-hidden bg-black pb-20 text-white sm:pb-24 lg:pb-28">
      <Container className="max-w-none px-8 sm:px-12 lg:px-16">
        <div className="mb-8 sm:mb-10">
          <h1 className="font-degular text-title sm:text-5xl lg:text-4xl sm:leading-none max-sm:font-degular max-sm:text-2xl max-sm:font-normal max-sm:leading-tight max-sm:tracking-normal">
            Play Anything. Hear Everything.
          </h1>
        </div>

        <Carousel
          setApi={setApi}
          opts={{ align: "start", dragFree: true, skipSnaps: true }}
          plugins={wheelGesturesPlugins}
        >
          <CarouselContent className="-ml-1 sm:-ml-1.5 lg:-ml-2">
            {categories.map((category) => (
              <CarouselItem
                key={category.id}
                className="basis-[86%] pl-1 sm:basis-[48%] sm:pl-1.5 lg:basis-[32%] lg:pl-2 xl:basis-[24%]"
              >
                <article className="group h-full">
                  <Link to={`/collection/${category.slug}`} className="block h-full">
                    <div className="aspect-4/5 overflow-hidden bg-neutral-900">
                      {category.image_url && <img
                        src={category.image_url}
                        alt={category.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />}
                    </div>

                    <div className="pt-5">
                      <h3 className="font-neue-haas text-lg font-semibold text-white transition-colors group-hover:text-yellow-400 sm:text-xl">
                        {category.name}
                      </h3>
                      <p className="font-neue-haas mt-2 max-w-md text-sm leading-6 text-white/55">
                        {category.description}
                      </p>
                    </div>
                  </Link>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-10 flex items-center gap-6 sm:mt-12">
            <div className="relative h-px flex-1 overflow-hidden bg-white/20">
              <div
                ref={progressBarRef}
                className="absolute top-0 left-0 h-full w-1/4 bg-yellow-500 will-change-transform"
              />
            </div>

            <div className="flex shrink-0 gap-2">
              <CarouselPrevious className="static my-0 size-10 border-white/40 bg-transparent text-white hover:border-yellow-500 hover:bg-yellow-500 hover:text-black disabled:opacity-30" />
              <CarouselNext className="static my-0 size-10 border-white/40 bg-transparent text-white hover:border-yellow-500 hover:bg-yellow-500 hover:text-black disabled:opacity-30" />
            </div>
          </div>
        </Carousel>
      </Container>
    </section>
  )
}
