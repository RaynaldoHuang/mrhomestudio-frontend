import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Loader2, PackageOpen, Search, X } from "lucide-react"
import { Link } from "react-router-dom"
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react"

import { getProducts, type Product } from "@/lib/product-api"

type SearchOverlayProps = {
  open: boolean
  onClose: () => void
  animateExit?: boolean
}

function formatPrice(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`
}

export function SearchOverlay({ open, onClose, animateExit = true }: SearchOverlayProps) {
  useLayoutEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose, open])

  if (!animateExit && !open) return null

  return createPortal(
    <AnimatePresence>
      {open && <SearchContent key="search" onClose={onClose} />}
    </AnimatePresence>,
    document.body,
  )
}

function SearchContent({ onClose }: Pick<SearchOverlayProps, "onClose">) {
  const isPresent = useIsPresent()
  const reduceMotion = useReducedMotion()
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    getProducts()
      .then((items) => { if (active) setProducts(items) })
      .catch(() => { if (active) setLoadError(true) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [attempt])

  const retry = () => {
    setIsLoading(true)
    setLoadError(false)
    setAttempt((current) => current + 1)
  }

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return products.slice(0, 4)

    return products.filter((product) =>
      `${product.name} ${product.category ?? ""}`.toLowerCase().includes(normalizedQuery),
    )
  }, [products, query])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.18 } }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
      inert={!isPresent}
      className={`fixed inset-x-0 top-20 bottom-0 z-60 lg:top-18 ${isPresent ? "" : "pointer-events-none"}`}
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60"
      />

      <motion.section
        initial={{ y: reduceMotion ? 0 : -24 }}
        animate={{ y: 0 }}
        exit={{ y: reduceMotion ? 0 : -12, transition: { duration: reduceMotion ? 0 : 0.18 } }}
        transition={{ duration: reduceMotion ? 0 : 0.36, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-h-full overflow-y-auto border-t border-white/10 bg-neutral-950 text-white shadow-2xl"
      >
        <div className="mx-auto max-w-none px-5 py-7 sm:px-8 sm:py-9 lg:px-16 lg:py-10">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, delay: reduceMotion ? 0 : 0.06, ease: "easeOut" }}
            className="mx-auto flex max-w-4xl items-center gap-3 sm:gap-4"
          >
            <div className="flex min-w-0 flex-1 items-center border border-white/20 bg-black">
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products"
                aria-label="Search products"
                className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/35 sm:h-14 sm:px-5"
              />
              <Search className="mr-4 size-4 shrink-0 text-white/55" strokeWidth={1.5} />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center text-white/70 hover:text-white"
            >
              <X className="size-5" strokeWidth={1.25} />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : 0.12, ease: "easeOut" }}
            className="mt-10 sm:mt-12"
          >
            <div className="mb-7 flex items-center justify-between gap-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                {query.trim() ? (isLoading || loadError ? "Search results" : `Search results (${results.length})`) : "Latest products"}
              </p>
              {query && (
                <button type="button" onClick={() => setQuery("")} className="cursor-pointer text-xs text-white/45 hover:text-yellow-400">
                  Clear
                </button>
              )}
            </div>

            {isLoading ? (
              <div role="status" className="flex items-center justify-center gap-3 py-16 text-sm text-white/50 sm:py-20">
                <Loader2 className="size-5 animate-spin text-yellow-400" aria-hidden="true" />
                Loading products…
              </div>
            ) : loadError ? (
              <div role="alert" className="border-y border-white/15 py-16 text-center sm:py-20">
                <p className="text-base">Unable to load products</p>
                <p className="mt-2 text-sm text-white/45">Please try again in a moment.</p>
                <button type="button" onClick={retry} className="mt-6 cursor-pointer rounded-full border border-yellow-400 px-5 py-2 text-sm text-yellow-400 transition-colors hover:bg-yellow-400 hover:text-black">
                  Try again
                </button>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-2 gap-y-8 md:grid-cols-4 lg:gap-x-4">
                {results.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} onClick={onClose} className="group min-w-0">
                    <div className="aspect-square overflow-hidden bg-white">
                      {product.thumbnail_url ? (
                        <img src={product.thumbnail_url} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-neutral-200"><PackageOpen className="size-10 text-neutral-400" aria-hidden="true" /></div>
                      )}
                    </div>
                    <div className="pt-3">
                      <h2 className="truncate text-sm font-medium transition-colors group-hover:text-yellow-400 sm:text-base">{product.name}</h2>
                      <p className="mt-1 truncate text-xs text-white/45">{product.category}</p>
                      <p className="mt-3 text-sm">{formatPrice(product.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div role="status" className="flex min-h-72 flex-col items-center justify-center gap-6 border-y border-dashed border-white/20 px-6 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-white/10">
                  {products.length === 0 ? <PackageOpen className="size-6 text-yellow-400" aria-hidden="true" /> : <Search className="size-6 text-yellow-400" aria-hidden="true" />}
                </div>
                <div>
                  <h2 className="font-degular text-title sm:text-3xl sm:leading-none">{products.length === 0 ? "No products yet" : "No products found"}</h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/50">
                    {products.length === 0 ? "Our latest audio collection is being prepared. Please check back soon." : <>No results for “{query.trim()}”. Try another product name or category.</>}
                  </p>
                </div>
                {products.length > 0 && (
                  <button type="button" onClick={() => setQuery("")} className="cursor-pointer rounded-full border border-yellow-400 px-5 py-2 text-sm text-yellow-400 transition-colors hover:bg-yellow-400 hover:text-black">
                    Clear search
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  )
}
