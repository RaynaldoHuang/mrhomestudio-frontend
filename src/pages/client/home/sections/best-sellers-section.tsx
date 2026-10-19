import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"

import { Container } from "@/components/client/container"
import { getHomeProducts, type Product } from "@/lib/product-api"

export function BestSellersSection() {
  const [bestSellers, setBestSellers] = useState<Product[]>([])

  useEffect(() => {
    let active = true
    getHomeProducts()
      .then((products) => { if (active) setBestSellers(products) })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  if (bestSellers.length === 0) return null

  return (
    <section className="bg-black pt-20 text-white sm:pt-24 lg:pt-28">
      <Container className="max-w-none px-4 sm:px-12 lg:px-16">
        <div className="mb-8 flex items-center justify-between gap-6 sm:mb-10">
          <div>
            <h1 className="font-degular text-title sm:text-5xl lg:text-4xl sm:leading-none max-sm:font-degular max-sm:text-2xl max-sm:font-normal max-sm:leading-tight max-sm:tracking-normal">
              Best Sellers
            </h1>
          </div>

          <Link
            to="/collection/all-products"
            className="font-neue-haas inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/70 px-5 text-xs transition-colors hover:border-yellow-500 hover:bg-yellow-500 hover:text-black sm:h-12 sm:px-6 sm:text-sm"
          >
            See All
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-1 gap-y-10 md:grid-cols-2 md:gap-x-1.5 lg:grid-cols-3 lg:gap-x-2 lg:gap-y-12">
          {bestSellers.map((item, index) => (
            <article key={item.id} className={`group flex min-w-0 flex-col ${index >= 2 ? "max-md:hidden" : ""}`}>
              <Link
                to={`/product/${item.id}`}
                aria-label={`View ${item.name}`}
                className="relative block aspect-square overflow-hidden bg-neutral-100"
              >
                {item.thumbnail_url && <img
                  src={item.thumbnail_url}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col items-start pt-5 sm:pt-6">
                <h2 title={item.name} className="w-full font-degular text-lg font-normal leading-tight tracking-normal max-sm:truncate sm:text-2xl">
                  {item.name}
                </h2>
                <p className="font-neue-haas mt-3 mb-6 line-clamp-2 min-h-12 w-full pr-4 text-sm leading-6 text-white/60 sm:pr-6 sm:text-base">
                  {item.description}
                </p>
                <Link
                  to={`/product/${item.id}`}
                  aria-label={`Shop ${item.name}`}
                  className="font-neue-haas mt-auto inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/80 px-5 text-xs transition-colors hover:border-yellow-500 hover:bg-yellow-500 hover:text-black sm:h-11 sm:px-6 sm:text-sm"
                >
                  Shop Now
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
