import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight, PackageOpen } from "lucide-react"

import { Container } from "@/components/client/container"
import { getProducts, type Product } from "@/lib/product-api"

export function ProductCatalogSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let active = true
    getProducts(8)
      .then((items) => {
        if (!active) return
        setProducts(items)
        setLoadError(false)
      })
      .catch(() => {
        if (active) setLoadError(true)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [])

  return (
    <section className="bg-black py-20 text-white sm:py-24 lg:py-28">
      <Container className="max-w-none px-8 sm:px-12 lg:px-16">
        <div className="mb-8 flex items-end justify-between gap-6 sm:mb-10">
          <div>
            <h1 className="font-degular text-title tracking-wide sm:text-5xl lg:text-4xl sm:leading-none">
              Hear the Difference
            </h1>
          </div>

          <Link
            to="/collection/all-products"
            className="font-neue-haas hidden h-10 shrink-0 items-center gap-2 rounded-full border border-white/70 px-5 text-xs transition-colors hover:border-yellow-500 hover:bg-yellow-500 hover:text-black sm:inline-flex sm:h-12 sm:px-6 sm:text-sm"
          >
            Explore Collection
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 gap-x-1 gap-y-10 md:grid-cols-3 md:gap-x-1.5 lg:grid-cols-4 lg:gap-x-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="animate-pulse" aria-hidden="true">
                <div className="aspect-square bg-white/10" />
                <div className="mt-3 h-4 w-3/4 bg-white/10" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && loadError && (
          <div role="alert" className="border-y border-white/15 py-20 text-center">
            <p className="text-lg">Unable to load products</p>
            <p className="mt-2 text-sm text-white/50">Please refresh the page or try again later.</p>
          </div>
        )}

        {!isLoading && !loadError && products.length === 0 && (
          <div className="flex min-h-72 flex-col items-center justify-center gap-6 border-y border-dashed border-white/20 px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/10">
              <PackageOpen className="size-6 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <h2 className="font-degular text-title sm:text-3xl sm:leading-none">No products yet</h2>
              <p className="max-w-md text-sm leading-6 text-white/50">
                Our latest audio collection is being prepared. Please check back soon.
              </p>
            </div>
          </div>
        )}

        {!isLoading && !loadError && products.length > 0 && (
          <div className="grid grid-cols-2 gap-x-1 gap-y-10 md:grid-cols-3 md:gap-x-1.5 lg:grid-cols-4 lg:gap-x-2 lg:gap-y-12">
            {products.map((product) => (
              <article key={product.id} className="group min-w-0 cursor-pointer">
                <Link to={`/product/${product.id}`} className="block" aria-label={`View ${product.name}`}>
                  <div
                    className="relative aspect-square overflow-hidden bg-neutral-100"
                  >
                    {product.thumbnail_url ? <img src={product.thumbnail_url} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" /> : <div className="h-full w-full bg-neutral-200" />}

                    <span className="font-neue-haas absolute top-3 left-3 bg-black px-2.5 py-1 text-[10px] uppercase tracking-widest text-white sm:top-4 sm:left-4">
                      Best seller
                    </span>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-neue-haas text-sm font-normal leading-snug text-white transition-colors group-hover:text-yellow-400 sm:text-sm">
                        {product.name}
                      </p>
                      <p className="font-neue-haas shrink-0 text-sm font-nornaml text-white sm:text-sm">
                        Rp{product.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        <Link
          to="/collection/all-products"
          className="font-neue-haas mt-10 inline-flex h-11 items-center gap-2 rounded-full border border-white/70 px-6 text-xs transition-colors hover:border-yellow-500 hover:bg-yellow-500 hover:text-black sm:hidden"
        >
          Explore Collection
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </Container>
    </section>
  )
}
