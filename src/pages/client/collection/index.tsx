import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Check, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react"
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
import { collectionIdFromHref, collectionTitle } from "@/lib/collection-links"

const productsPerPage = 16
type AvailabilityFilter = "in-stock" | "out-of-stock"
type FilterSource = "menu" | "category" | "specification" | "variant"

type DynamicFilterGroup = {
  key: string
  label: string
  source: FilterSource
  sourceName?: string
  options: Array<{ label: string; value: string; count: number }>
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function productMatchesOption(product: Product, group: Pick<DynamicFilterGroup, "source" | "sourceName">, value: string) {
  const normalizedValue = toSlug(value)

  if (group.source === "category") {
    return toSlug(product.category ?? "") === normalizedValue
  }

  if (group.source === "specification") {
    return product.specifications.some((specification) => (
      toSlug(specification.name) === toSlug(group.sourceName ?? "")
      && toSlug(specification.value) === normalizedValue
    ))
  }

  if (group.source === "variant") {
    return product.variants.some((variant) => (
      toSlug(variant.name) === toSlug(group.sourceName ?? "")
      && variant.values.some((variantValue) => toSlug(variantValue) === normalizedValue)
    ))
  }

  return product.category_id === Number(value)
}

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
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [megaMenus, setMegaMenus] = useState<MegaMenu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [sortBy, setSortBy] = useState("latest")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [availability, setAvailability] = useState<AvailabilityFilter[]>([])
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sorting: true,
    availability: true,
    price: false,
  })
  const [minimumPrice, setMinimumPrice] = useState("")
  const [maximumPrice, setMaximumPrice] = useState("")

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

  const activeMegaMenu = useMemo(() => megaMenus.find((menu) => (
    collectionIdFromHref(menu.href) === id
    || menu.groups.some((group) => group.links.some((link) => collectionIdFromHref(link.href) === id))
  )), [id, megaMenus])

  const activeCategory = categories.find((category) => category.slug === id)

  const collectionProducts = products

  const dynamicFilterGroups = useMemo<DynamicFilterGroup[]>(() => {
    const groups: DynamicFilterGroup[] = []
    const usedLabels = new Set<string>()

    activeMegaMenu?.groups.forEach((menuGroup, groupIndex) => {
      const group: DynamicFilterGroup = {
        key: `menu:${activeMegaMenu.id}:${groupIndex}`,
        label: menuGroup.title.replace(/^by\s+/i, ""),
        source: "menu",
        options: menuGroup.links.filter((link) => link.category_id != null).map((link) => ({
          label: link.label,
          value: String(link.category_id),
          count: collectionProducts.filter((product) => product.category_id === link.category_id).length,
        })).filter((option) => option.count > 0),
      }

      if (group.options.length > 0) {
        groups.push(group)
        usedLabels.add(toSlug(group.label))
      }
    })

    const categories = [...new Set(collectionProducts.map((product) => product.category).filter((value): value is string => Boolean(value)))]
    if (categories.length > 1 && !usedLabels.has("category")) {
      groups.push({
        key: "category",
        label: "Category",
        source: "category",
        options: categories.sort().map((category) => ({
          label: category,
          value: category,
          count: collectionProducts.filter((product) => toSlug(product.category ?? "") === toSlug(category)).length,
        })),
      })
      usedLabels.add("category")
    }

    const specificationValues = new Map<string, { label: string; values: Set<string> }>()
    const variantValues = new Map<string, { label: string; values: Set<string> }>()

    collectionProducts.forEach((product) => {
      product.specifications.forEach((specification) => {
        const key = toSlug(specification.name)
        if (!key || !specification.value.trim()) return
        const current = specificationValues.get(key) ?? { label: specification.name, values: new Set<string>() }
        current.values.add(specification.value.trim())
        specificationValues.set(key, current)
      })

      product.variants.forEach((variant) => {
        const key = toSlug(variant.name)
        if (!key) return
        const current = variantValues.get(key) ?? { label: variant.name, values: new Set<string>() }
        variant.values.filter(Boolean).forEach((value) => current.values.add(value.trim()))
        variantValues.set(key, current)
      })
    })

    const appendDataGroups = (source: "specification" | "variant", entries: typeof specificationValues) => {
      entries.forEach(({ label, values }, normalizedName) => {
        if (usedLabels.has(normalizedName) || values.size === 0) return
        const groupBase = { source, sourceName: label } as const
        groups.push({
          key: `${source}:${normalizedName}`,
          label,
          ...groupBase,
          options: [...values].sort().map((value) => ({
            label: value,
            value,
            count: collectionProducts.filter((product) => productMatchesOption(product, groupBase, value)).length,
          })),
        })
        usedLabels.add(normalizedName)
      })
    }

    appendDataGroups("specification", specificationValues)
    appendDataGroups("variant", variantValues)
    return groups
  }, [activeMegaMenu, collectionProducts])

  const filteredProducts = useMemo(() => {
    let result = collectionProducts

    const selectedCategoryIds = dynamicFilterGroups.filter((group) => group.source === "menu")
      .flatMap((group) => selectedFilters[group.key] ?? []).map(Number)
    if (selectedCategoryIds.length > 0) {
      result = result.filter((product) => product.category_id !== null && selectedCategoryIds.includes(product.category_id))
    }

    Object.entries(selectedFilters).forEach(([groupKey, selectedValues]) => {
      if (selectedValues.length === 0) return
      const group = dynamicFilterGroups.find((item) => item.key === groupKey)
      if (!group || group.source === "menu") return
      result = result.filter((product) => selectedValues.some((value) => productMatchesOption(product, group, value)))
    })

    if (availability.length === 1 && availability.includes("in-stock")) {
      result = result.filter((product) => product.stock > 0)
    }

    if (availability.length === 1 && availability.includes("out-of-stock")) {
      result = result.filter((product) => product.stock < 1)
    }

    const parsedMinimumPrice = Number(minimumPrice)
    const parsedMaximumPrice = Number(maximumPrice)

    if (minimumPrice !== "" && Number.isFinite(parsedMinimumPrice)) {
      result = result.filter((product) => product.price >= parsedMinimumPrice)
    }

    if (maximumPrice !== "" && Number.isFinite(parsedMaximumPrice)) {
      result = result.filter((product) => product.price <= parsedMaximumPrice)
    }

    return [...result].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price
      if (sortBy === "price-high") return b.price - a.price
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [availability, collectionProducts, dynamicFilterGroups, maximumPrice, minimumPrice, selectedFilters, sortBy])

  const activeFilterCount = Number(sortBy !== "latest")
    + Number(availability.length > 0)
    + Number(minimumPrice !== "" || maximumPrice !== "")
    + Object.values(selectedFilters).filter((values) => values.length > 0).length

  function resetFilters() {
    setSortBy("latest")
    setAvailability([])
    setSelectedFilters({})
    setMinimumPrice("")
    setMaximumPrice("")
  }

  function toggleSection(key: string) {
    setOpenSections((current) => ({ ...current, [key]: !(current[key] ?? true) }))
  }

  function toggleAvailability(value: AvailabilityFilter) {
    setAvailability((current) => current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value])
  }

  function toggleDynamicFilter(groupKey: string, value: string) {
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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage))
  const requestedPage = Number(searchParams.get("page")) || 1
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages)
  const visibleProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }) }, [currentPage, id])

  return (
    <section className="min-h-screen bg-black py-16 text-white sm:py-20 lg:py-24">
      <Container className="max-w-none px-8 sm:px-12 lg:px-16">
        <Reveal as="header" onLoad className="mb-10 flex flex-col gap-8 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-degular text-title sm:text-4xl">{collectionTitle(id, megaMenus, activeCategory?.name)}</h1>
            <p className="mt-2 text-sm text-white/60">{filteredProducts.length} items</p>
          </div>

          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="group inline-flex w-fit items-center gap-2 py-2 text-sm text-white/75 transition-colors hover:text-yellow-400"
            aria-label="Show product filters"
          >
            <SlidersHorizontal className="size-4 stroke-[1.6]" aria-hidden="true" />
            <span>Show Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-medium text-black">
                {activeFilterCount}
              </span>
            )}
          </button>
        </Reveal>

        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetContent
            side="left"
            className="overflow-x-hidden border-white/10 bg-neutral-950 text-white sm:max-w-[26rem]"
            overlayClassName="bg-black/65"
          >
            <SheetHeader className="border-b border-white/12 px-6 py-5 pr-14">
              <SheetTitle className="text-lg font-medium text-white">Filter by</SheetTitle>
              <SheetDescription className="sr-only">
                Sort and filter the available products.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6">
              <FilterSection
                title="Sort by"
                open={openSections.sorting ?? true}
                onToggle={() => toggleSection("sorting")}
              >
                <Select value={sortBy} onValueChange={(value) => setSortBy(value ?? "latest")}>
                  <SelectTrigger className="h-11 rounded-none border-white/20 bg-neutral-950 px-3 text-white hover:bg-white/5 focus-visible:border-yellow-400 focus-visible:ring-0 [&_svg]:text-white/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    className="rounded-none bg-neutral-900 p-1 text-white shadow-xl ring-1 ring-white/15"
                  >
                    <SelectItem value="latest" className="rounded-none text-white hover:bg-white/10 focus:bg-white/10 focus:!text-white data-[highlighted]:bg-white/10 data-[highlighted]:!text-white [&_*]:!text-white">Latest</SelectItem>
                    <SelectItem value="price-low" className="rounded-none text-white hover:bg-white/10 focus:bg-white/10 focus:!text-white data-[highlighted]:bg-white/10 data-[highlighted]:!text-white [&_*]:!text-white">Price: low to high</SelectItem>
                    <SelectItem value="price-high" className="rounded-none text-white hover:bg-white/10 focus:bg-white/10 focus:!text-white data-[highlighted]:bg-white/10 data-[highlighted]:!text-white [&_*]:!text-white">Price: high to low</SelectItem>
                    <SelectItem value="name" className="rounded-none text-white hover:bg-white/10 focus:bg-white/10 focus:!text-white data-[highlighted]:bg-white/10 data-[highlighted]:!text-white [&_*]:!text-white">Name: A–Z</SelectItem>
                  </SelectContent>
                </Select>
              </FilterSection>

              {dynamicFilterGroups.map((group) => (
                <FilterSection
                  key={group.key}
                  title={group.label}
                  open={openSections[group.key] ?? true}
                  onToggle={() => toggleSection(group.key)}
                >
                  {group.options.map((option) => {
                    const checked = (selectedFilters[group.key] ?? []).includes(option.value)
                    return <FilterCheckbox key={option.value} label={option.label} count={option.count} checked={checked} onChange={() => toggleDynamicFilter(group.key, option.value)} />
                  })}
                </FilterSection>
              ))}

              <FilterSection
                title="Availability"
                open={openSections.availability ?? true}
                onToggle={() => toggleSection("availability")}
              >
                {([
                  ["in-stock", "In stock", collectionProducts.filter((product) => product.stock > 0).length],
                  ["out-of-stock", "Out of stock", collectionProducts.filter((product) => product.stock < 1).length],
                ] as const).map(([value, label, count]) => (
                  <FilterCheckbox key={value} label={label} count={count} checked={availability.includes(value)} onChange={() => toggleAvailability(value)} />
                ))}
              </FilterSection>

              <FilterSection
                title="Price"
                open={openSections.price ?? false}
                onToggle={() => toggleSection("price")}
              >
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                  <label className="grid min-w-0 gap-2 text-xs text-white/45">
                    Minimum
                    <div className="flex h-11 min-w-0 items-center overflow-hidden border border-white/20 bg-neutral-950 px-3 focus-within:border-yellow-400">
                      <span className="mr-2 text-white/35">Rp</span>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={minimumPrice}
                        onChange={(event) => setMinimumPrice(event.target.value)}
                        placeholder="0"
                        className="w-full min-w-0 flex-1 appearance-none bg-transparent text-sm text-white outline-none placeholder:text-white/25 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                  </label>
                  <label className="grid min-w-0 gap-2 text-xs text-white/45">
                    Maximum
                    <div className="flex h-11 min-w-0 items-center overflow-hidden border border-white/20 bg-neutral-950 px-3 focus-within:border-yellow-400">
                      <span className="mr-2 text-white/35">Rp</span>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={maximumPrice}
                        onChange={(event) => setMaximumPrice(event.target.value)}
                        placeholder="Any"
                        className="w-full min-w-0 flex-1 appearance-none bg-transparent text-sm text-white outline-none placeholder:text-white/25 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                  </label>
                </div>
              </FilterSection>
            </div>

            <SheetFooter className="grid grid-cols-2 border-t border-white/12 bg-neutral-950 px-6 py-4">
              <button
                type="button"
                onClick={resetFilters}
                disabled={activeFilterCount === 0}
                className="h-11 border border-white/25 px-3 text-sm text-white transition-colors hover:border-white/60 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Reset filters
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="h-11 bg-yellow-400 px-3 text-sm font-medium text-black transition-colors hover:bg-yellow-300"
              >
                Show {filteredProducts.length} products
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
                  {product.stock < 1 && <span className="absolute top-3 left-3 bg-black px-2.5 py-1 text-[10px] uppercase tracking-widest text-white">Out of stock</span>}
                </div>
                <div className="pt-2"><div className="flex items-start justify-between gap-3"><div><p className="text-sm leading-snug transition-colors group-hover:text-yellow-400">{product.name}</p>{product.category && <p className="mt-1 text-xs text-white/40">{product.category}</p>}</div><p className="shrink-0 text-sm">Rp{product.price.toLocaleString("id-ID")}</p></div></div>
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

        {totalPages > 1 && <nav aria-label="Product pagination" className="mt-16 flex items-center justify-center gap-2 border-t border-white/15 pt-10">
          <Link to={`/collection/${id}?page=${Math.max(currentPage - 1, 1)}`} aria-disabled={currentPage === 1} className={`flex size-10 items-center justify-center rounded-full border ${currentPage === 1 ? "pointer-events-none border-white/15 text-white/25" : "border-white/50 hover:bg-yellow-500 hover:text-black"}`}><ChevronLeft className="size-4" /></Link>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <Link key={page} to={`/collection/${id}?page=${page}`} className={`flex size-10 items-center justify-center rounded-full border text-sm ${page === currentPage ? "border-yellow-500 bg-yellow-500 text-black" : "border-white/30"}`}>{page}</Link>)}
          <Link to={`/collection/${id}?page=${Math.min(currentPage + 1, totalPages)}`} aria-disabled={currentPage === totalPages} className={`flex size-10 items-center justify-center rounded-full border ${currentPage === totalPages ? "pointer-events-none border-white/15 text-white/25" : "border-white/50 hover:bg-yellow-500 hover:text-black"}`}><ChevronRight className="size-4" /></Link>
        </nav>}
      </Container>
    </section>
  )
}
