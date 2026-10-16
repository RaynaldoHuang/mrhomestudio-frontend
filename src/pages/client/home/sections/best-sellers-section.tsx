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
      <Container className="max-w-none px-8 sm:px-12 lg:px-16">
        <div className="mb-8 flex items-center justify-between gap-6 sm:mb-10">
          <div>
            <h1 className="font-degular text-title sm:text-5xl lg:text-4xl sm:leading-none max-sm:font-degular max-sm:text-2xl max-sm:font-normal max-sm:leading-tight max-sm:tracking-normal">
              Best Sellers
            </h1>
          </div>

          <Link
            to="/services"
            className="font-neue-haas inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/70 px-5 text-xs transition-colors hover:border-yellow-500 hover:bg-yellow-500 hover:text-black sm:h-12 sm:px-6 sm:text-sm"
          >
            See All
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
          {bestSellers.map((item) => (
            <article
              key={item.id}
              className="group relative aspect-4/5 overflow-hidden bg-neutral-900 sm:aspect-5/4 lg:aspect-[1.05/1]"
            >
              {item.thumbnail_url && <img
                src={item.thumbnail_url}
                alt={item.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />}
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/10 to-black/5" />

              <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8 lg:p-10">
                <div className="min-w-0 w-full sm:w-auto sm:flex-1">
                  <p className="font-neue-haas mb-2 text-base text-yellow-400">
                    Premium selection
                  </p>
                  <h1 title={item.name} className="max-sm:truncate font-degular text-title sm:text-4xl sm:leading-none max-sm:font-degular max-sm:text-2xl max-sm:font-normal max-sm:leading-tight max-sm:tracking-normal">
                    {item.name}
                  </h1>
                </div>

                <Link
                  to={`/product/${item.id}`}
                  aria-label={`Shop ${item.name}`}
                  className="font-neue-haas inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/80 px-5 text-xs transition-colors hover:border-yellow-500 hover:bg-yellow-500 hover:text-black sm:h-11 sm:px-6 sm:text-sm"
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
