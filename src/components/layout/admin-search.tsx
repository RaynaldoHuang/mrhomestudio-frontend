import { useCallback, useEffect, useState } from "react"
import { Loader2, Package, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { navigation } from "@/config/navigation"
import { matchesProductSearch, normalizedSearch } from "@/lib/admin-product-filters"
import { getAdminProducts, type Product } from "@/lib/product-api"

const pages = [...navigation.flatMap((group) => group.items), { title: "Profile", href: "/admin/profile", icon: Search }]

export function AdminSearch() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const openSearch = useCallback(() => {
    setQuery("")
    setIsLoading(true)
    setLoadError(false)
    setOpen(true)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && !event.isComposing) {
        event.preventDefault()
        if (open) setOpen(false)
        else openSearch()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, openSearch])

  useEffect(() => {
    if (!open) return
    let active = true
    getAdminProducts()
      .then((items) => { if (active) setProducts(items) })
      .catch(() => { if (active) setLoadError(true) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [open, attempt])

  function goTo(href: string) {
    setOpen(false)
    navigate(href)
  }

  const search = normalizedSearch(query)
  const matchingPages = pages.filter((page) => normalizedSearch(page.title).includes(search))
  const matchingProducts = search && !isLoading && !loadError ? products.filter((product) => matchesProductSearch(product, query)) : []

  return <>
    <Button variant="outline" onClick={openSearch} aria-label="Cari di admin" aria-keyshortcuts="Meta+K Control+K" className="h-9 w-9 justify-start text-muted-foreground md:w-52 lg:w-60">
      <Search className="size-4 md:mr-2" /><span className="hidden md:inline">Search...</span><kbd className="ml-auto hidden rounded border border-border/50 bg-muted px-1.5 text-[10px] md:inline">⌘ K</kbd>
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl" showCloseButton={false}>
        <DialogHeader className="sr-only"><DialogTitle>Pencarian Admin</DialogTitle><DialogDescription>Cari produk berdasarkan nama, merek, atau kategori, dan buka halaman admin.</DialogDescription></DialogHeader>
        <Command shouldFilter={false}>
          <CommandInput autoFocus placeholder="Cari produk, merek, kategori, atau halaman…" value={query} onValueChange={setQuery} />
          <CommandList>
            {matchingPages.length === 0 && matchingProducts.length === 0 && !isLoading && !loadError && <p role="status" className="px-3 py-6 text-center text-sm text-muted-foreground">Tidak ada hasil yang cocok.</p>}
            {matchingPages.length > 0 && <CommandGroup heading="Halaman Admin">{matchingPages.map((page) => <CommandItem key={page.href} value={page.href} onSelect={() => goTo(page.href)}><page.icon className="size-4" />{page.title}</CommandItem>)}</CommandGroup>}
            {isLoading && <div role="status" className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Memuat produk…</div>}
            {loadError && <div role="alert" className="px-3 py-4 text-sm">Tidak dapat memuat produk. <button type="button" className="underline" onClick={() => { setIsLoading(true); setLoadError(false); setAttempt((value) => value + 1) }}>Coba lagi</button></div>}
            {matchingProducts.length > 0 && <CommandGroup heading={`Produk (${matchingProducts.length})`}>{matchingProducts.slice(0, 8).map((product) => <CommandItem key={product.id} value={`product:${product.id}`} onSelect={() => goTo(`/admin/products?${new URLSearchParams({ q: product.name })}`)}>
              {product.thumbnail_url ? <img src={product.thumbnail_url} alt="" className="size-10 rounded object-cover" /> : <Package className="size-5" />}<div className="min-w-0 flex-1"><p className="truncate">{product.name}</p><p className="truncate text-xs text-muted-foreground">{[product.brand, product.category, product.is_active ? "Active" : "Inactive"].filter(Boolean).join(" · ")}</p></div>
            </CommandItem>)}</CommandGroup>}
            {search && <CommandGroup><CommandItem value="all-results" onSelect={() => goTo(`/admin/products?${new URLSearchParams({ q: query.trim() })}`)}><Search className="size-4" /><span className="truncate">Cari “{query.trim()}” di daftar produk</span></CommandItem></CommandGroup>}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  </>
}
