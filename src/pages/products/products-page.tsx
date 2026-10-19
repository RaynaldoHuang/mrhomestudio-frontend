import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import { Copy, Image, Loader2, Package, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Link, useSearchParams } from "react-router-dom"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { LoadingState } from "@/components/shared/loading-state"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { specificationLabel } from "@/lib/specification-label"
import { parseVariantValues } from "@/lib/variant-values"
import { formatRupiahInput } from "@/lib/rupiah-input"
import { getAdminCategories, type Category } from "@/lib/category-api"
import { getAdminBrands, type Brand } from "@/lib/brand-api"
import { adminProductFilterOptions, filterAdminProducts } from "@/lib/admin-product-filters"
import {
  createProduct,
  deleteProduct,
  duplicateProduct,
  getAdminProducts,
  updateProduct,
  type Product,
  type ProductFormValues,
} from "@/lib/product-api"

type ProductFormDraft = Omit<ProductFormValues, "variants"> & {
  variants: Array<{ name: string; valuesText: string }>
}

const emptyForm: ProductFormDraft = {
  name: "",
  category: "",
  category_id: null,
  brand_id: null,
  price: 0,
  description: "",
  specifications: [],
  variants: [],
  is_active: true,
  show_on_home: false,
  images: [],
  remove_image_ids: [],
}

const formatPrice = (price: number) => `Rp${price.toLocaleString("id-ID")}`

function valuesFromProduct(product: Product): ProductFormDraft {
  return {
    name: product.name,
    category: product.category ?? "",
    category_id: product.category_id,
    brand_id: product.brand_id ?? null,
    price: product.price,
    description: product.description,
    specifications: product.specifications.map((specification) => ({ ...specification, name: specificationLabel(specification.name) })),
    variants: product.variants.map((variant) => ({ name: variant.name, valuesText: variant.values.join(", ") })),
    is_active: product.is_active,
    show_on_home: product.show_on_home,
    images: [],
    remove_image_ids: [],
  }
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get("q") ?? ""
  const brandFilter = searchParams.get("brand") || "all"
  const categoryFilter = searchParams.get("category") || "all"

  function setFilter(key: string, value: string) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (value === "all" || value === "") next.delete(key)
      else next.set(key, value)
      return next
    }, { replace: true })
  }

  function resetFilters() {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      for (const key of ["q", "brand", "category"]) next.delete(key)
      return next
    }, { replace: true })
  }

  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormDraft>(emptyForm)
  const [priceInput, setPriceInput] = useState("0")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null)

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setLoadError(false)
    try {
      const [items, categoryItems, brandItems] = await Promise.all([getAdminProducts(), getAdminCategories(), getAdminBrands()])
      setProducts(items)
      setCategories(categoryItems)
      setBrands(brandItems)
    } catch {
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    Promise.all([getAdminProducts(), getAdminCategories(), getAdminBrands()])
      .then(([items, categoryItems, brandItems]) => { if (active) { setProducts(items); setCategories(categoryItems); setBrands(brandItems) } })
      .catch(() => { if (active) setLoadError(true) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  const existingImages = useMemo(
    () => editingProduct?.images.filter((image) => !form.remove_image_ids.includes(image.id)) ?? [],
    [editingProduct, form.remove_image_ids],
  )
  const totalImages = existingImages.length + form.images.length

  const openCreateDialog = () => {
    setPriceInput("0")
    setEditingProduct(null)
    setForm({ ...emptyForm, specifications: [], variants: [], images: [], remove_image_ids: [] })
    setDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setPriceInput(product.price.toLocaleString("id-ID"))
    setEditingProduct(product)
    setForm(valuesFromProduct(product))
    setDialogOpen(true)
  }

  const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const { text, amount, caret } = formatRupiahInput(input.value, input.selectionStart ?? input.value.length)
    if (!Number.isSafeInteger(amount)) return
    setPriceInput(text)
    setForm((current) => ({ ...current, price: amount }))
    requestAnimationFrame(() => {
      if (document.activeElement === input) input.setSelectionRange(caret, caret)
    })
  }

  const handleImages = (files: FileList | null) => {
    if (!files) return
    const available = Math.max(0, 5 - existingImages.length)
    const nextImages = Array.from(files).slice(0, available)
    setForm((current) => ({ ...current, images: nextImages }))
    if (files.length > available) toast.error("Maximum 5 images per product.")
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (totalImages < 1) {
      toast.error("Add at least one product image.")
      return
    }

    const values: ProductFormValues = {
      ...form,
      specifications: form.specifications.map((specification) => ({ ...specification, name: specificationLabel(specification.name) })),
      variants: form.variants.map((variant) => ({ name: variant.name, values: parseVariantValues(variant.valuesText) })),
    }
    if (values.variants.some((variant) => variant.values.length === 0)) {
      toast.error("Enter at least one value for each variant, separated by commas.")
      return
    }

    setIsSaving(true)
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, values)
        toast.success("Product updated successfully.")
      } else {
        await createProduct(values)
        toast.success("Product created successfully.")
      }
      setDialogOpen(false)
      await loadProducts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save product.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDuplicate = async (product: Product) => {
    if (duplicatingId !== null) return
    setDuplicatingId(product.id)
    try {
      const duplicate = await duplicateProduct(product.id)
      setProducts((current) => [duplicate, ...current])
      openEditDialog(duplicate)
      toast.success("Produk berhasil diduplikat. Edit salinan lalu aktifkan jika sudah siap.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Tidak dapat menduplikat produk.")
    } finally {
      setDuplicatingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteProduct(deleteTarget.id)
      toast.success("Product deleted successfully.")
      setDeleteTarget(null)
      await loadProducts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete product.")
    } finally {
      setIsDeleting(false)
    }
  }

  const visibleProducts = filterAdminProducts(products, search, brandFilter, categoryFilter)
  const brandOptions = adminProductFilterOptions(products, "brand", brands)
  const categoryOptions = adminProductFilterOptions(products, "category", categories)
  const hasFilters = search !== "" || brandFilter !== "all" || categoryFilter !== "all"

  if (isLoading) return <LoadingState rows={5} />
  if (loadError) return <ErrorState title="Unable to load products" description="Make sure the Laravel backend is running, then try again." onRetry={() => void loadProducts()} />

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Manage product information, variants, specifications, and gallery images." action={<Button size="sm" onClick={openCreateDialog}><Plus className="size-4" /> Add Product</Button>} />

      {products.length > 0 && <div className="space-y-3">
        <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <div className="grid min-w-0 grid-rows-[1rem_2.25rem] gap-2 sm:col-span-2 lg:col-span-1"><Label htmlFor="admin-product-search">Cari produk</Label><div className="relative"><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="admin-product-search" type="search" className="h-9 pl-9" placeholder="Nama produk, merek, atau kategori…" value={search} onChange={(event) => setFilter("q", event.target.value)} /></div></div>
          <div className="grid min-w-0 grid-rows-[1rem_2.25rem] gap-2"><Label htmlFor="admin-product-brand-filter">Merek</Label><div className="relative h-9 min-w-0"><Select value={brandFilter} onValueChange={(value) => setFilter("brand", value ?? "all")}><SelectTrigger id="admin-product-brand-filter" className="min-w-0 data-[size=default]:h-9"><SelectValue>{brandFilter === "all" ? "Semua merek" : brandFilter === "none" ? "Tanpa merek" : brandOptions.find((option) => option.value === brandFilter)?.label ?? "Merek tidak tersedia"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">Semua merek</SelectItem><SelectItem value="none">Tanpa merek</SelectItem>{brandOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div></div>
          <div className="grid min-w-0 grid-rows-[1rem_2.25rem] gap-2"><Label htmlFor="admin-product-category-filter">Kategori</Label><div className="relative h-9 min-w-0"><Select value={categoryFilter} onValueChange={(value) => setFilter("category", value ?? "all")}><SelectTrigger id="admin-product-category-filter" className="min-w-0 data-[size=default]:h-9"><SelectValue>{categoryFilter === "all" ? "Semua kategori" : categoryFilter === "none" ? "Tanpa kategori" : categoryOptions.find((option) => option.value === categoryFilter)?.label ?? "Kategori tidak tersedia"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="all">Semua kategori</SelectItem><SelectItem value="none">Tanpa kategori</SelectItem>{categoryOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div></div>
          <Button variant="outline" className="h-9 sm:col-span-2 sm:justify-self-end lg:col-span-1" disabled={!hasFilters} onClick={resetFilters}><X className="size-4" /> Reset</Button>
        </div>
        <p role="status" className="text-sm text-muted-foreground">Menampilkan {visibleProducts.length} dari {products.length} produk</p>
      </div>}

      {products.length === 0 ? (
        <EmptyState icon={Package} title="No products" description="Create your first product for the website catalog." action={<Button onClick={openCreateDialog}>Add Product</Button>} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Brand</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {visibleProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell><div className="flex min-w-56 items-center gap-3">{product.thumbnail_url ? <img src={product.thumbnail_url} alt="" className="size-14 rounded-lg object-cover" /> : <div className="flex size-14 items-center justify-center rounded-lg bg-muted"><Image className="size-5 text-muted-foreground" /></div>}<div><p className="font-medium">{product.name}</p><p className="text-xs text-muted-foreground">{product.images.length} image(s)</p></div></div></TableCell>
                  <TableCell>{product.category || "—"}</TableCell>
                  <TableCell>{product.brand || "—"}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell><div className="flex flex-wrap gap-1"><Badge variant={product.is_active ? "default" : "secondary"}>{product.is_active ? "Active" : "Inactive"}</Badge>{product.show_on_home && <Badge variant="outline">Homepage</Badge>}</div></TableCell>
                  <TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${product.name}`} onClick={() => openEditDialog(product)}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" title="Duplikat produk" aria-label={`Duplikat ${product.name}`} disabled={duplicatingId !== null} onClick={() => void handleDuplicate(product)}>{duplicatingId === product.id ? <Loader2 className="size-4 animate-spin" /> : <Copy className="size-4" />}</Button><Button variant="ghost" size="icon" aria-label={`Delete ${product.name}`} disabled={duplicatingId === product.id} onClick={() => setDeleteTarget(product)}><Trash2 className="size-4 text-destructive" /></Button></div></TableCell>
                </TableRow>
              ))}
              {visibleProducts.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center"><p className="font-medium">Tidak ada produk yang cocok.</p><p className="mt-1 text-sm text-muted-foreground">Ubah kata pencarian atau filter merek dan kategori.</p><Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>Reset filter</Button></TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <form onSubmit={handleSubmit} className="contents">
            <DialogHeader><DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle><DialogDescription>The first image is used as the product thumbnail. Add up to 5 images.</DialogDescription></DialogHeader>
            <div className="grid gap-5 py-2 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="product-name">Product name</Label><Input id="product-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="product-category">Category</Label><Select value={form.category_id === null ? "none" : String(form.category_id)} onValueChange={(value) => setForm({ ...form, category_id: value === "none" || value === null ? null : Number(value), category: categories.find((category) => String(category.id) === value)?.name ?? "" })}><SelectTrigger id="product-category"><SelectValue>{categories.find((category) => category.id === form.category_id)?.name ?? (form.category_id === null ? "No category" : "Category removed from Mega Menu")}</SelectValue></SelectTrigger><SelectContent><SelectItem value="none">No category</SelectItem>{categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.menu_groups.length > 0 ? `${category.menu_groups.join(", ")} → ${category.name}` : category.name}{!category.is_active && " (Inactive)"}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">Categories follow Mega Menu collection links. Manage covers and visibility in Admin → Categories.</p></div>
              <div className="space-y-2"><Label htmlFor="product-price">Price (Rp)</Label><Input id="product-price" type="text" inputMode="numeric" pattern="[0-9.]*" required value={priceInput} onChange={handlePriceChange} /></div>
              <div className="space-y-2"><Label htmlFor="product-brand">Merek produk</Label><Select value={form.brand_id === null ? "none" : String(form.brand_id)} onValueChange={(value) => setForm({ ...form, brand_id: value === null || value === "none" ? null : Number(value) })}><SelectTrigger id="product-brand"><SelectValue>{brands.find((brand) => brand.id === form.brand_id)?.name ?? "Tanpa merek"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="none">Tanpa merek</SelectItem>{brands.map((brand) => <SelectItem key={brand.id} value={String(brand.id)}>{brand.name}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">Kelola pilihan di <Link to="/admin/brands" className="underline">Master Data → Merek</Link>.</p></div>
              <div className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-2"><Label htmlFor="product-active">Active product</Label><p className="text-xs text-muted-foreground">Visible on the website.</p></div><Switch id="product-active" checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} /></div>
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3 sm:col-span-2"><div><Label htmlFor="product-home">Tampilkan di homepage (Best Sellers)</Label><p className="mt-1 text-xs text-muted-foreground">Produk aktif yang dipilih akan tampil di section Best Sellers menggunakan gambar pertama produk.</p></div><Switch id="product-home" checked={form.show_on_home} onCheckedChange={(checked) => setForm({ ...form, show_on_home: checked })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="product-description">Description</Label><Textarea id="product-description" required rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>

              <div className="space-y-3 sm:col-span-2">
                <div className="flex items-center justify-between"><div className="space-y-2"><Label>Product images ({totalImages}/5)</Label><p className="text-xs text-muted-foreground">JPG, PNG, or WebP, maximum 8 MB each. Automatically optimized to WebP. The first image is the thumbnail.</p></div></div>
                {existingImages.length > 0 && <div className="flex flex-wrap gap-3">{existingImages.map((image, index) => <div key={image.id} className="relative"><img src={image.url} alt="" className="size-24 rounded-lg border object-cover" />{index === 0 && <Badge className="absolute bottom-1 left-1 text-[10px]">Thumbnail</Badge>}<button type="button" aria-label="Remove image" onClick={() => setForm((current) => ({ ...current, remove_image_ids: [...current.remove_image_ids, image.id] }))} className="absolute -top-2 -right-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-destructive text-white"><X className="size-3" /></button></div>)}</div>}
                <Input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={existingImages.length >= 5} onChange={(event) => handleImages(event.target.files)} />
                {form.images.length > 0 && <p className="text-xs text-muted-foreground">New: {form.images.map((file) => file.name).join(", ")}</p>}
              </div>

              <div className="space-y-3 sm:col-span-2">
                <div className="flex items-center justify-between"><div className="space-y-2"><Label>Variants</Label><p className="text-xs text-muted-foreground">Examples: Color, Size, Finish, or Package. Separate values with commas, e.g. Black, White, Walnut.</p></div><Button type="button" size="sm" variant="outline" onClick={() => setForm({ ...form, variants: [...form.variants, { name: "", valuesText: "" }] })}><Plus className="size-4" /> Add Variant</Button></div>
                {form.variants.map((variant, index) => <div key={index} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_2fr_auto]"><Input required placeholder="Variant name" value={variant.name} onChange={(event) => setForm({ ...form, variants: form.variants.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) })} /><Input required placeholder="Black, White, Walnut" value={variant.valuesText} onChange={(event) => setForm({ ...form, variants: form.variants.map((item, itemIndex) => itemIndex === index ? { ...item, valuesText: event.target.value } : item) })} /><Button type="button" variant="ghost" size="icon" onClick={() => setForm({ ...form, variants: form.variants.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 className="size-4" /></Button></div>)}
              </div>

              <div className="space-y-3 sm:col-span-2">
                <div className="flex items-center justify-between"><Label>Specifications</Label><Button type="button" size="sm" variant="outline" onClick={() => setForm({ ...form, specifications: [...form.specifications, { name: "", value: "" }] })}><Plus className="size-4" /> Add Specification</Button></div>
                {form.specifications.map((specification, index) => <div key={index} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_2fr_auto]"><Input required placeholder="Specification" value={specification.name} onChange={(event) => setForm({ ...form, specifications: form.specifications.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) })} /><Input required placeholder="Value" value={specification.value} onChange={(event) => setForm({ ...form, specifications: form.specifications.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item) })} /><Button type="button" variant="ghost" size="icon" onClick={() => setForm({ ...form, specifications: form.specifications.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 className="size-4" /></Button></div>)}
              </div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>Cancel</Button><Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="size-4 animate-spin" />}{isSaving ? "Saving..." : "Save Product"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)} title="Delete product?" description={`Delete “${deleteTarget?.name ?? "this product"}” and all of its images? This action cannot be undone.`} confirmLabel={isDeleting ? "Deleting..." : "Delete"} destructive onConfirm={() => void handleDelete()} />
    </div>
  )
}
