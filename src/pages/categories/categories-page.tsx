import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Image, Loader2, Pencil, Plus, Tags, Trash2 } from "lucide-react"
import { toast } from "sonner"

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
import { createCategory, deleteCategory, getAdminCategories, updateCategory, type Category, type CategoryFormValues } from "@/lib/category-api"

const emptyForm: CategoryFormValues = {
  name: "", description: "", image: null, sort_order: 0, show_on_home: false, is_active: true,
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryFormValues>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null)

  const loadCategories = useCallback(async () => {
    setIsLoading(true)
    setLoadError(false)
    try { setCategories(await getAdminCategories()) } catch { setLoadError(true) } finally { setIsLoading(false) }
  }, [])

  useEffect(() => {
    let active = true
    getAdminCategories()
      .then((items) => { if (active) setCategories(items) })
      .catch(() => { if (active) setLoadError(true) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const file = form.image
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview({ file, url: String(reader.result) })
    reader.readAsDataURL(file)
    return () => { reader.onload = null; reader.abort() }
  }, [form.image])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, sort_order: Math.max(0, ...categories.map((category) => category.sort_order)) + 1 })
    setDialogOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    setForm({ name: category.name, description: category.description, image: null, sort_order: category.sort_order, show_on_home: category.show_on_home, is_active: category.is_active })
    setDialogOpen(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      if (editing) await updateCategory(editing.id, form)
      else await createCategory(form)
      toast.success("Category saved successfully.")
      setDialogOpen(false)
      await loadCategories()
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save category.") }
    finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteCategory(deleteTarget.id)
      toast.success("Category deleted successfully.")
      setDeleteTarget(null)
      await loadCategories()
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to delete category.") }
    finally { setIsDeleting(false) }
  }

  if (isLoading) return <LoadingState rows={5} />
  if (loadError) return <ErrorState title="Unable to load categories" description="Please try again." onRetry={() => void loadCategories()} />

  const cover = preview?.file === form.image ? preview?.url : editing?.image_url

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Collection links in Mega Menu create categories automatically. Manage their covers, products, and homepage visibility here." action={<Button size="sm" onClick={openCreate}><Plus className="size-4" /> Add Category</Button>} />
      {categories.length === 0 ? <EmptyState icon={Tags} title="No categories" description="Add collection links in Mega Menu to create categories automatically, or create a category here." action={<Button onClick={openCreate}>Add Category</Button>} /> : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Menu / Group</TableHead><TableHead>Products</TableHead><TableHead>Order</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell><div className="flex items-center gap-3">{category.image_url ? <img src={category.image_url} alt="" className="size-14 rounded-lg object-cover" /> : <div className="flex size-14 items-center justify-center rounded-lg bg-muted"><Image className="size-5" /></div>}<div><p className="font-medium">{category.name}</p><p className="text-xs text-muted-foreground">/collection/{category.slug}</p></div></div></TableCell>
                <TableCell><div className="space-y-1">{category.menu_groups.length ? category.menu_groups.map((group) => <p key={group} className="text-sm">{group}</p>) : <span className="text-sm text-muted-foreground">Not linked to a menu</span>}</div></TableCell>
                <TableCell>{category.products_count ?? 0}</TableCell>
                <TableCell>{category.sort_order}</TableCell>
                <TableCell><div className="flex flex-wrap gap-1"><Badge variant={category.is_active ? "default" : "secondary"}>{category.is_active ? "Active" : "Inactive"}</Badge>{category.show_on_home && <Badge variant="outline">Homepage</Badge>}</div></TableCell>
                <TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${category.name}`} onClick={() => openEdit(category)}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${category.name}`} disabled={(category.products_count ?? 0) > 0 || category.menu_groups.length > 0} title={(category.products_count ?? 0) > 0 ? "Move products to another category before deleting." : category.menu_groups.length > 0 ? "Remove this category from Mega Menu links before deleting." : "Delete category"} onClick={() => setDeleteTarget(category)}><Trash2 className="size-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <form onSubmit={handleSubmit} className="contents">
            <DialogHeader><DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle><DialogDescription>Covers are optional until you display a category on the homepage. Renaming a category keeps its URL and product assignments.</DialogDescription></DialogHeader>
            <div className="grid gap-5 py-2">
              <div className="space-y-2"><Label htmlFor="category-name">Category name</Label><Input id="category-name" required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="category-description">Short description</Label><Textarea id="category-description" rows={3} maxLength={2000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="category-image">Cover image</Label>{cover && <img src={cover} alt="Category cover preview" className="h-48 w-full rounded-lg border object-cover" />}<Input id="category-image" type="file" accept="image/jpeg,image/png,image/webp" required={form.show_on_home && !editing?.image_url && !form.image} onChange={(event) => setForm({ ...form, image: event.target.files?.[0] ?? null })} /><p className="text-xs text-muted-foreground">JPG, PNG, or WebP. Maximum 8 MB. Automatically optimized to WebP.</p></div>
              <div className="space-y-2"><Label htmlFor="category-order">Display order</Label><Input id="category-order" required type="number" min={0} value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} /></div>
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3"><div><Label htmlFor="category-active">Active category</Label><p className="text-xs text-muted-foreground">Available on the website.</p></div><Switch id="category-active" checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} /></div>
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3"><div><Label htmlFor="category-home">Tampilkan di homepage</Label><p className="text-xs text-muted-foreground">Tampil di section “Play Anything. Hear Everything.” saat kategori aktif.</p></div><Switch id="category-home" checked={form.show_on_home} onCheckedChange={(checked) => setForm({ ...form, show_on_home: checked })} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" disabled={isSaving} onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="size-4 animate-spin" />}{isSaving ? "Saving..." : "Save Category"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)} title="Delete category?" description={`Delete “${deleteTarget?.name ?? "this category"}” and its cover image?`} confirmLabel={isDeleting ? "Deleting..." : "Delete"} destructive onConfirm={() => void handleDelete()} />
    </div>
  )
}
