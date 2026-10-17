import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Image, Loader2, Menu, Pencil, Plus, Trash2 } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createMegaMenu, deleteMegaMenu, getAdminMegaMenus, updateMegaMenu, type MegaMenu, type MegaMenuFormValues } from "@/lib/mega-menu-api"
import { collectionHref } from "@/lib/collection-links"

const emptyGroup = () => ({ title: "", links: [{ label: "", href: "" }] })
const emptyForm: MegaMenuFormValues = {
  label: "",
  href: "/collection/",
  groups: [emptyGroup()],
  display_mode: "grouped",
  featured_title: "",
  featured_url: "",
  featured_image_alt: "",
  featured_image: null,
  sort_order: 0,
  is_active: true,
}

function valuesFromMenu(menu: MegaMenu): MegaMenuFormValues {
  return {
    label: menu.label,
    href: menu.href,
    groups: menu.groups,
    display_mode: menu.display_mode ?? "grouped",
    featured_title: menu.featured_title ?? "",
    featured_url: menu.featured_url ?? "",
    featured_image_alt: menu.featured_image_alt ?? "",
    featured_image: null,
    sort_order: menu.sort_order,
    is_active: menu.is_active,
  }
}

export function MegaMenusPage() {
  const [menus, setMenus] = useState<MegaMenu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MegaMenu | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MegaMenu | null>(null)
  const [form, setForm] = useState<MegaMenuFormValues>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadMenus = useCallback(async () => {
    setIsLoading(true)
    setLoadError(false)
    try {
      setMenus(await getAdminMegaMenus())
    } catch { setLoadError(true) } finally { setIsLoading(false) }
  }, [])

  useEffect(() => {
    let active = true
    getAdminMegaMenus()
      .then((items) => { if (active) setMenus(items) })
      .catch(() => { if (active) setLoadError(true) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  const openCreate = () => {
    setEditingMenu(null)
    setForm({ ...emptyForm, groups: [emptyGroup()], sort_order: menus.length + 1 })
    setDialogOpen(true)
  }

  const openEdit = (menu: MegaMenu) => {
    setEditingMenu(menu)
    setForm(valuesFromMenu(menu))
    setDialogOpen(true)
  }

  const updateGroup = (groupIndex: number, title: string) => setForm((current) => ({
    ...current,
    groups: current.groups.map((group, index) => index === groupIndex ? { ...group, title } : group),
  }))

  const updateLink = (groupIndex: number, linkIndex: number, field: "label" | "href", value: string) => setForm((current) => ({
    ...current,
    groups: current.groups.map((group, index) => index === groupIndex ? {
      ...group,
      links: group.links.map((link, index) => index === linkIndex
        ? { ...link, [field]: value, ...(field === "label" && !link.category_id && (!link.href || link.href === collectionHref(link.label)) ? { href: collectionHref(value) } : {}), ...(field === "href" ? { category_id: null } : {}) }
        : link),
    } : group),
  }))

  const renderLink = (groupIndex: number, linkIndex: number) => {
    const link = form.groups[groupIndex].links[linkIndex]
    const totalLinks = form.groups.reduce((total, group) => total + group.links.length, 0)
    return (
      <div key={`${groupIndex}:${linkIndex}`} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1.4fr_auto]">
        <Input aria-label="Link label" required value={link.label} placeholder="Category label, e.g. Pre-amplifiers" onChange={(event) => updateLink(groupIndex, linkIndex, "label", event.target.value)} />
        <Input aria-label="Link URL" required value={link.href} placeholder="/collection/pre-amplifiers" onChange={(event) => updateLink(groupIndex, linkIndex, "href", event.target.value)} />
        <Button type="button" variant="ghost" size="icon" aria-label="Remove link" disabled={form.display_mode === "direct" ? totalLinks <= 1 : form.groups[groupIndex].links.length <= 1} onClick={() => setForm((current) => ({
          ...current,
          groups: current.groups.map((group, index) => index === groupIndex ? { ...group, links: group.links.filter((_, index) => index !== linkIndex) } : group).filter((group) => group.links.length > 0),
        }))}><Trash2 className="size-4" /></Button>
      </div>
    )
  }

  const addDirectLink = () => setForm((current) => {
    const groupIndex = current.groups.findIndex((group) => group.links.length < 12)
    if (groupIndex < 0) {
      return current.groups.length < 3 ? { ...current, groups: [...current.groups, emptyGroup()] } : current
    }
    return { ...current, groups: current.groups.map((group, index) => index === groupIndex ? { ...group, links: [...group.links, { label: "", href: "" }] } : group) }
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      if (editingMenu) await updateMegaMenu(editingMenu.id, form)
      else await createMegaMenu(form)
      toast.success(editingMenu ? "Mega menu updated successfully." : "Mega menu created successfully.")
      setDialogOpen(false)
      await loadMenus()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save mega menu.")
    } finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteMegaMenu(deleteTarget.id)
      toast.success("Mega menu deleted successfully.")
      setDeleteTarget(null)
      await loadMenus()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete mega menu.")
    } finally { setIsDeleting(false) }
  }

  if (isLoading) return <LoadingState rows={4} />
  if (loadError) return <ErrorState title="Unable to load mega menus" description="Make sure the Laravel backend is running, then try again." onRetry={() => void loadMenus()} />

  return (
    <div className="space-y-6">
      <PageHeader title="Mega Menu" description="Manage catalog tabs, grouped links, ordering, and promotional banners in the website navigation." action={<Button size="sm" onClick={openCreate}><Plus className="size-4" />Add Menu</Button>} />

      {menus.length === 0 ? <EmptyState icon={Menu} title="No mega menus" description="Create the first catalog navigation menu." action={<Button onClick={openCreate}>Add Menu</Button>} /> : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Menu</TableHead><TableHead>Structure</TableHead><TableHead>Featured</TableHead><TableHead>Order</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{menus.map((menu) => (
              <TableRow key={menu.id}>
                <TableCell><p className="font-medium">{menu.label}</p><p className="text-xs text-muted-foreground">{menu.href}</p></TableCell>
                <TableCell>{menu.display_mode === "direct" ? "Direct list" : `${menu.groups.length} groups`} · {menu.groups.reduce((total, group) => total + group.links.length, 0)} links</TableCell>
                <TableCell><div className="flex min-w-52 items-center gap-3">{menu.featured_image_url ? <img src={menu.featured_image_url} alt="" className="h-12 w-20 rounded-md object-cover" /> : <div className="flex h-12 w-20 items-center justify-center rounded-md bg-muted"><Image className="size-4 text-muted-foreground" /></div>}<span className="line-clamp-2 text-sm">{menu.featured_title || "No promotion"}</span></div></TableCell>
                <TableCell>{menu.sort_order}</TableCell>
                <TableCell><Badge variant={menu.is_active ? "default" : "secondary"}>{menu.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${menu.label}`} onClick={() => openEdit(menu)}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${menu.label}`} onClick={() => setDeleteTarget(menu)}><Trash2 className="size-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <form onSubmit={handleSubmit} className="contents">
            <DialogHeader><DialogTitle>{editingMenu ? "Edit Mega Menu" : "Add Mega Menu"}</DialogTitle><DialogDescription>Configure a main navigation tab, grouped links, and its optional promotion.</DialogDescription></DialogHeader>
            <div className="space-y-6 py-2">
              <section className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2"><Label htmlFor="menu-label">Menu label</Label><Input id="menu-label" required value={form.label} placeholder="Speakers" onChange={(event) => setForm({ ...form, label: event.target.value, href: !editingMenu && (!form.href || form.href === collectionHref(form.label) || form.href === "/collection/") ? collectionHref(event.target.value) : form.href })} /></div>
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="menu-href">View all URL</Label><Input id="menu-href" required value={form.href} placeholder="/collection/speakers" onChange={(event) => setForm({ ...form, href: event.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="menu-order">Order</Label><Input id="menu-order" type="number" min={0} required value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} /></div>
                <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2 lg:col-span-4"><div className="space-y-2"><Label htmlFor="menu-active">Active menu</Label><p className="text-xs text-muted-foreground">Visible in the website navbar.</p></div><Switch id="menu-active" checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} /></div>
              </section>

              <section className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="menu-display-mode">Menu display</Label>
                  <Select value={form.display_mode} onValueChange={(value) => { if (value === "grouped" || value === "direct") setForm((current) => ({ ...current, display_mode: value })) }}>
                    <SelectTrigger id="menu-display-mode"><SelectValue>{form.display_mode === "direct" ? "Daftar langsung" : "Berkelompok"}</SelectValue></SelectTrigger>
                    <SelectContent><SelectItem value="grouped">Berkelompok</SelectItem><SelectItem value="direct">Daftar langsung</SelectItem></SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">{form.display_mode === "direct" ? "Show category links directly, e.g. Pre-amplifiers, Power amplifiers, Integrated amplifiers. Each link opens its product collection." : "Organize categories under headings, e.g. Digital Sources and Analogue Sources."}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-2"><h3 className="font-semibold">{form.display_mode === "direct" ? "Category links" : "Link groups"}</h3><p className="text-sm text-muted-foreground">Category names follow collection link labels automatically.</p></div>
                  {form.display_mode === "grouped" && <Button type="button" size="sm" variant="outline" disabled={form.groups.length >= 3} onClick={() => setForm({ ...form, groups: [...form.groups, emptyGroup()] })}><Plus className="size-4" />Add Group</Button>}
                </div>
                {form.display_mode === "direct" ? (
                  <>
                    <div className="space-y-2">{form.groups.flatMap((group, groupIndex) => group.links.map((_, linkIndex) => renderLink(groupIndex, linkIndex)))}</div>
                    <Button type="button" size="sm" variant="outline" disabled={form.groups.reduce((total, group) => total + group.links.length, 0) >= 36} onClick={addDirectLink}><Plus className="size-4" />Add Link</Button>
                  </>
                ) : form.groups.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-3 rounded-lg border p-4">
                    <div className="flex gap-2"><Input aria-label="Group title" required value={group.title} placeholder="Group title, e.g. Digital Sources" onChange={(event) => updateGroup(groupIndex, event.target.value)} /><Button type="button" variant="ghost" size="icon" aria-label="Remove group" disabled={form.groups.length === 1} onClick={() => setForm({ ...form, groups: form.groups.filter((_, index) => index !== groupIndex) })}><Trash2 className="size-4" /></Button></div>
                    <div className="space-y-2">{group.links.map((_, linkIndex) => renderLink(groupIndex, linkIndex))}</div>
                    <Button type="button" size="sm" variant="outline" disabled={group.links.length >= 12} onClick={() => setForm((current) => ({ ...current, groups: current.groups.map((item, index) => index === groupIndex ? { ...item, links: [...item.links, { label: "", href: "" }] } : item) }))}><Plus className="size-4" />Add Link</Button>
                  </div>
                ))}
              </section>

              <section className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><h3 className="font-semibold">Featured promotion</h3><p className="text-sm text-muted-foreground">Optional banner displayed on the right side of the mega menu.</p></div>
                <div className="space-y-2"><Label htmlFor="featured-title">Title</Label><Input id="featured-title" value={form.featured_title} onChange={(event) => setForm({ ...form, featured_title: event.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="featured-url">Destination URL</Label><Input id="featured-url" value={form.featured_url} placeholder="/collection/speakers" onChange={(event) => setForm({ ...form, featured_url: event.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="featured-alt">Image alt text</Label><Input id="featured-alt" value={form.featured_image_alt} onChange={(event) => setForm({ ...form, featured_image_alt: event.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="featured-image">Image</Label><Input id="featured-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setForm({ ...form, featured_image: event.target.files?.[0] ?? null })} /><p className="text-xs text-muted-foreground">JPG, PNG, or WebP. Maximum 8 MB. Automatically optimized to WebP.</p></div>
                {editingMenu?.featured_image_url && !form.featured_image && <img src={editingMenu.featured_image_url} alt="" className="h-28 w-48 rounded-lg object-cover" />}
              </section>
            </div>
            <DialogFooter><Button type="button" variant="outline" disabled={isSaving} onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="size-4 animate-spin" />}{isSaving ? "Saving..." : "Save Menu"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)} title="Delete mega menu?" description={`Delete “${deleteTarget?.label ?? "this menu"}” from the website navigation?`} confirmLabel={isDeleting ? "Deleting..." : "Delete"} destructive onConfirm={() => void handleDelete()} />
    </div>
  )
}
