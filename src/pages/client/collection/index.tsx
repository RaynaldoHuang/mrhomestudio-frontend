import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react"
import { Check, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react"
import { Link, useParams, useSearchParams } from "react-router-dom"

import { Container } from "@/components/client/container"
import { Reveal } from "@/components/client/reveal"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getPublicMegaMenus, type MegaMenu } from "@/lib/mega-menu-api"
import { getProducts, type Product } from "@/lib/product-api"
import { getCategories, type Category } from "@/lib/category-api"
import { catalogFilterGroups, emptyCatalogFilters, filterCatalogProducts, type CatalogFilterKey, type CatalogFilters } from "@/lib/catalog-filters"
import { formatRupiahInput } from "@/lib/rupiah-input"
import { collectionIdFromHref, collectionTitle } from "@/lib/collection-links"

import { CATALOG_PAGE_SIZE as productsPerPage, paginate, paginationPages } from "@/lib/pagination"

function FilterSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <section className="border-b border-white/12">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-white transition-colors hover:text-yellow-400"
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown className={`size-3.5 stroke-[1.75] transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && <div className="space-y-3 pb-5">{children}</div>}
    </section>
  )
}

function FilterCheckbox({
  label,
  count,
  checked,
  onChange,
}: {
  label: string
  count: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-white/70 transition-colors hover:text-white">
      <span className="relative flex size-4 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer absolute inset-0 cursor-pointer appearance-none border border-white/35 bg-transparent transition-colors checked:border-yellow-400 checked:bg-yellow-400"
        />
        <Check className="pointer-events-none relative size-3 stroke-[2.5] text-black opacity-0 peer-checked:opacity-100" aria-hidden="true" />
      </span>
      <span>{label}</span>
      <span className="ml-auto text-xs tabular-nums text-white/35">{count}</span>
    </label>
  )
}

export function CollectionPage() {
  const { id = "all-products" } = useParams()
  const collectionId = collectionIdFromHref(`/collection/${id}`) || id
  return <CollectionContent key={collectionId} id={collectionId} />
}

function CollectionContent({ id }: { id: string }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [megaMenus, setMegaMenus] = useState<MegaMenu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [sortBy, setSortBy] = useState("latest")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<CatalogFilters>(emptyCatalogFilters)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
  })
  const [minimumPrice, setMinimumPrice] = useState("")
  const [maximumPrice, setMaximumPrice] = useState("")
  const [brandSearch, setBrandSearch] = useState("")

  useEffect(() => {
    let active = true
    Promise.all([getCategories(), getPublicMegaMenus(), getProducts(undefined, undefined, id)])
      .then(([items, menus, collectionProducts]) => {
        if (!active) return
        setCategories(items)
        setMegaMenus(menus)
        setProducts(collectionProducts)
      })
      .catch(() => active && setLoadError(true))
      .finally(() => active && setIsLoading(false))
    return () => { active = false }
  }, [id])

  const activeCategory = categories.find((category) => category.slug === id)
  const dynamicFilterGroups = useMemo(() => catalogFilterGroups(products), [products])
  const priceRangeInvalid = minimumPrice !== "" && maximumPrice !== "" && Number(minimumPrice) > Number(maximumPrice)

  const filteredProducts = useMemo(() => {
    const result = filterCatalogProducts(products, selectedFilters, minimumPrice, maximumPrice)

    return [...result].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price
      if (sortBy === "price-high") return b.price - a.price
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [products, maximumPrice, minimumPrice, selectedFilters, sortBy])

  const activeFilterCount = Number(minimumPrice !== "" || maximumPrice !== "")
    + Object.values(selectedFilters).reduce((count, values) => count + values.length, 0)

  function resetFilters() {
    resetPage()
    setSelectedFilters(emptyCatalogFilters())
    setBrandSearch("")
    setMinimumPrice("")
    setMaximumPrice("")
  }

  function toggleSection(key: string) {
    setOpenSections((current) => ({ ...current, [key]: !(current[key] ?? true) }))
  }

  function resetPage() {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete("page")
      return next
    }, { replace: true, preventScrollReset: true })
  }

  function handlePriceChange(event: ChangeEvent<HTMLInputElement>, bound: "minimum" | "maximum") {
    const input = event.currentTarget
    const { text, amount, caret } = formatRupiahInput(input.value, input.selectionStart ?? input.value.length)
    if (!Number.isSafeInteger(amount)) return
    resetPage()
    const setPrice = bound === "minimum" ? setMinimumPrice : setMaximumPrice
    setPrice(text === "" ? "" : String(amount))
    requestAnimationFrame(() => {
      if (document.activeElement === input) input.setSelectionRange(caret, caret)
    })
  }

  function toggleDynamicFilter(groupKey: CatalogFilterKey, value: string) {
    resetPage()
    setSelectedFilters((current) => {
      const selected = current[groupKey] ?? []
      return {
        ...current,
        [groupKey]: selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value],
      }
    })
  }

  const { page: currentPage, totalPages, items: visibleProducts, start, end } = paginate(filteredProducts, searchParams.get("page"), productsPerPage)

  function pageHref(page: number) {
    const next = new URLSearchParams(searchParams)
    if (page === 1) next.delete("page")
    else next.set("page", String(page))
    return { pathname: `/collection/${id}`, search: next.toString() ? `?${next}` : "" }
  }

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }) }, [currentPage, id])

  return (
    <section className="min-h-screen bg-black py-16 text-white sm:py-20 lg:py-24">
      <Container className="max-w-none px-4 sm:px-12 lg:px-16">
        <Reveal as="header" onLoad className="mb-10 flex flex-col gap-8 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-degular text-title sm:text-4xl">{collectionTitle(id, megaMenus, activeCategory?.name)}</h1>
            <p className="mt-2 text-sm text-white/60">Showing {start}–{end} of {filteredProducts.length} products · {productsPerPage} per page</p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Select value={sortBy} onValueChange={(value) => { resetPage(); setSortBy(value ?? "latest") }}>
              <SelectTrigger aria-label="Urutkan produk" className="h-11 w-48 rounded-none border-white/20 bg-neutral-950 px-3 text-white hover:bg-white/5 focus-visible:border-yellow-400 focus-visible:ring-0 [&_svg]:text-white/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                align="start"
                sideOffset={6}
                className="rounded-none bg-neutral-900 p-1 text-white shadow-xl ring-1 ring-white/15"
              >
                <SelectItem value="latest" className="rounded-none text-white hover:bg-white/10 focus:bg-white/10 focus:!text-white data-[highlighted]:bg-white/10 data-[highlighted]:!text-white [&_*]:!text-white">Terbaru</SelectItem>
                <SelectItem value="price-low" className="rounded-none text-white hover:bg-white/10 focus:bg-white/10 focus:!text-white data-[highlighted]:bg-white/10 data-[highlighted]:!text-white [&_*]:!text-white">Harga Terendah</SelectItem>
                <SelectItem value="price-high" className="rounded-none text-white hover:bg-white/10 focus:bg-white/10 focus:!text-white data-[highlighted]:bg-white/10 data-[highlighted]:!text-white [&_*]:!text-white">Harga Tertinggi</SelectItem>
                <SelectItem value="name" className="rounded-none text-white hover:bg-white/10 focus:bg-white/10 focus:!text-white data-[highlighted]:bg-white/10 data-[highlighted]:!text-white [&_*]:!text-white">Nama A–Z</SelectItem>
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="group inline-flex w-fit items-center gap-2 py-2 text-sm text-white/75 transition-colors hover:text-yellow-400"
              aria-label="Tampilkan filter produk"
            >
              <SlidersHorizontal className="size-4 stroke-[1.6]" aria-hidden="true" />
              <span>Filter Produk</span>
              {activeFilterCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-medium text-black">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </Reveal>

        {activeFilterCount > 0 && <div className="mb-8 flex flex-wrap items-center gap-2" aria-label="Filter aktif">
          {dynamicFilterGroups.flatMap((group) => group.options.filter((option) => selectedFilters[group.key].includes(option.value)).map((option) => <button key={`${group.key}:${option.value}`} type="button" onClick={() => toggleDynamicFilter(group.key, option.value)} aria-label={`Hapus filter ${group.label}: ${option.label}`} className="inline-flex items-center gap-2 border border-white/25 px-3 py-1.5 text-xs text-white/80 hover:border-yellow-400">{group.label}: {option.label}<X className="size-3" /></button>))}
          {(minimumPrice !== "" || maximumPrice !== "") && <button type="button" onClick={() => { resetPage(); setMinimumPrice(""); setMaximumPrice("") }} aria-label="Hapus filter harga" className="inline-flex items-center gap-2 border border-white/25 px-3 py-1.5 text-xs text-white/80 hover:border-yellow-400">Rp{Number(minimumPrice || 0).toLocaleString("id-ID")} – {maximumPrice === "" ? "Tanpa batas" : `Rp${Number(maximumPrice).toLocaleString("id-ID")}`}<X className="size-3" /></button>}
          <button type="button" onClick={resetFilters} className="px-2 py-1.5 text-xs text-yellow-400">Hapus semua</button>
        </div>}

        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetContent
            side="left"
            className="overflow-x-hidden border-white/10 bg-neutral-950 text-white sm:max-w-[26rem]"
            overlayClassName="bg-black/65"
          >
            <SheetHeader className="border-b border-white/12 px-6 py-5 pr-14">
              <SheetTitle className="text-lg font-medium text-white">Filter Produk</SheetTitle>
              <SheetDescription className="sr-only">
                Pilih kategori, merek, dan harga produk.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6">
              {dynamicFilterGroups.map((group) => (
                <FilterSection
                  key={group.key}
                  title={group.label}
                  open={openSections[group.key] ?? true}
                  onToggle={() => toggleSection(group.key)}
                >
                  {group.key === "brand" && group.options.length > 0 && <input type="search" aria-label="Cari merek" placeholder="Cari merek…" value={brandSearch} onChange={(event) => setBrandSearch(event.target.value)} className="h-10 w-full border border-white/20 bg-transparent px-3 text-sm text-white outline-none focus:border-yellow-400" />}
                  {group.options.length === 0 && <p className="text-sm text-white/45">{group.key === "brand" ? "Belum ada merek pada produk di koleksi ini." : "Belum ada kategori pada produk di koleksi ini."}</p>}
                  {group.key === "brand" && group.options.length > 0 && !group.options.some((option) => option.label.toLowerCase().includes(brandSearch.trim().toLowerCase())) && <p className="text-sm text-white/45">Merek tidak ditemukan.</p>}
                  {group.options.filter((option) => group.key !== "brand" || option.label.toLowerCase().includes(brandSearch.trim().toLowerCase())).map((option) => {
                    const checked = (selectedFilters[group.key] ?? []).includes(option.value)
                    return <FilterCheckbox key={option.value} label={option.label} count={option.count} checked={checked} onChange={() => toggleDynamicFilter(group.key, option.value)} />
                  })}
                </FilterSection>
              ))}

              <FilterSection
                title="Harga"
                open={openSections.price ?? true}
                onToggle={() => toggleSection("price")}
              >
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                  <label className="grid min-w-0 gap-2 text-xs text-white/45">
                    Harga minimum
                    <div className="flex h-11 min-w-0 items-center overflow-hidden border border-white/20 bg-neutral-950 px-3 focus-within:border-yellow-400">
                      <span className="mr-2 text-white/35">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={minimumPrice === "" ? "" : Number(minimumPrice).toLocaleString("id-ID")}
                        onChange={(event) => handlePriceChange(event, "minimum")}
                        placeholder="0"
                        className="w-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                      />
                    </div>
                  </label>
                  <label className="grid min-w-0 gap-2 text-xs text-white/45">
                    Harga maksimum
                    <div className="flex h-11 min-w-0 items-center overflow-hidden border border-white/20 bg-neutral-950 px-3 focus-within:border-yellow-400">
                      <span className="mr-2 text-white/35">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={maximumPrice === "" ? "" : Number(maximumPrice).toLocaleString("id-ID")}
                        onChange={(event) => handlePriceChange(event, "maximum")}
                        placeholder="Tanpa batas"
                        className="w-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                      />
                    </div>
                  </label>
                </div>
                {priceRangeInvalid && <p role="alert" className="text-xs text-red-300">Harga maksimum harus sama dengan atau lebih besar dari harga minimum.</p>}
              </FilterSection>
            </div>

            <SheetFooter className="grid grid-cols-2 border-t border-white/12 bg-neutral-950 px-6 py-4">
              <button
                type="button"
                onClick={resetFilters}
                disabled={activeFilterCount === 0}
                className="h-11 border border-white/25 px-3 text-sm text-white transition-colors hover:border-white/60 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                disabled={priceRangeInvalid}
                className="h-11 bg-yellow-400 px-3 text-sm font-medium text-black transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Tampilkan {filteredProducts.length} Produk
              </button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {isLoading && <div className="py-24 text-center text-white/50">Loading products…</div>}
        {loadError && <div className="py-24 text-center text-red-300">Unable to load products. Please try again later.</div>}

        {!isLoading && !loadError && <div className="grid grid-cols-2 gap-x-1 gap-y-10 md:grid-cols-3 md:gap-x-1.5 lg:grid-cols-4 lg:gap-x-2 lg:gap-y-12">
          {visibleProducts.map((product) => (
            <Reveal as="article" key={product.id} className="group min-w-0">
              <Link to={`/product/${product.id}`} className="block" aria-label={`View ${product.name}`}>
                <div className="relative aspect-square overflow-hidden bg-neutral-100">
                  {product.thumbnail_url ? <img src={product.thumbnail_url} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" /> : <div className="h-full w-full bg-neutral-200" />}
                </div>
                <div className="pt-2"><div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3"><div className="min-w-0"><p title={product.name} className="text-sm leading-snug transition-colors group-hover:text-yellow-400 max-sm:truncate">{product.name}</p>{product.brand && <p className="mb-1 text-xs text-white/50">{product.brand}</p>}{product.category && <p className="mt-1 text-xs text-white/40">{product.category}</p>}</div><p className="shrink-0 text-sm">Rp{product.price.toLocaleString("id-ID")}</p></div></div>
              </Link>
            </Reveal>
          ))}
        </div>}

        {!isLoading && !loadError && visibleProducts.length === 0 && (
          <div className="border-y border-white/15 py-24 text-center">
            <p className="text-lg">No products found</p>
            <p className="mt-2 text-sm text-white/50">
              {activeFilterCount > 0
                ? "Try adjusting or clearing your filters."
                : "Products added from the admin panel will appear here."}
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 border border-white/30 px-5 py-2.5 text-sm transition-colors hover:border-yellow-400 hover:text-yellow-400"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {totalPages > 1 && <nav aria-label="Product pagination" className="mt-16 flex flex-wrap items-center justify-center gap-2 border-t border-white/15 pt-10">
          <Link to={pageHref(Math.max(currentPage - 1, 1))} aria-label="Previous page" tabIndex={currentPage === 1 ? -1 : undefined} aria-disabled={currentPage === 1} className={`flex size-10 items-center justify-center rounded-full border ${currentPage === 1 ? "pointer-events-none border-white/15 text-white/25" : "border-white/50 hover:bg-yellow-500 hover:text-black"}`}><ChevronLeft className="size-4" /></Link>
          {paginationPages(currentPage, totalPages).map((page, index) => page === "ellipsis" ? <span key={`ellipsis-${index}`} aria-hidden="true">…</span> : <Link key={page} to={pageHref(page)} aria-label={`Page ${page}`} aria-current={page === currentPage ? "page" : undefined} className={`flex size-10 items-center justify-center rounded-full border text-sm ${page === currentPage ? "border-yellow-500 bg-yellow-500 text-black" : "border-white/30"}`}>{page}</Link>)}
          <Link to={pageHref(Math.min(currentPage + 1, totalPages))} aria-label="Next page" tabIndex={currentPage === totalPages ? -1 : undefined} aria-disabled={currentPage === totalPages} className={`flex size-10 items-center justify-center rounded-full border ${currentPage === totalPages ? "pointer-events-none border-white/15 text-white/25" : "border-white/50 hover:bg-yellow-500 hover:text-black"}`}><ChevronRight className="size-4" /></Link>
        </nav>}
      </Container>
    </section>
  )
}
