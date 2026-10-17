import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Loader2, Pencil, Plus, Tags, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { LoadingState } from "@/components/shared/loading-state"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deleteBrand, getAdminBrands, saveBrand, type Brand } from "@/lib/brand-api"

export function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null)
  const [name, setName] = useState("")
  const [search, setSearch] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadBrands = useCallback(async () => {
    setIsLoading(true)
    setLoadError(false)
    try { setBrands(await getAdminBrands()) } catch { setLoadError(true) } finally { setIsLoading(false) }
  }, [])

  useEffect(() => {
    let active = true
    getAdminBrands()
      .then((items) => { if (active) setBrands(items) })
      .catch(() => { if (active) setLoadError(true) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  function openForm(brand: Brand | null) {
    setEditing(brand)
    setName(brand?.name ?? "")
    setDialogOpen(true)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return
    setIsSaving(true)
    try {
      await saveBrand(name, editing?.id)
      toast.success(editing ? "Merek berhasil diperbarui." : "Merek berhasil ditambahkan.")
      setDialogOpen(false)
      await loadBrands()
    } catch (error) { toast.error(error instanceof Error ? error.message : "Tidak dapat menyimpan merek.") }
    finally { setIsSaving(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteBrand(deleteTarget.id)
      toast.success("Merek berhasil dihapus.")
      setDeleteTarget(null)
      await loadBrands()
    } catch (error) { toast.error(error instanceof Error ? error.message : "Tidak dapat menghapus merek.") }
    finally { setIsDeleting(false) }
  }

  if (isLoading) return <LoadingState rows={5} />
  if (loadError) return <ErrorState title="Tidak dapat memuat merek" description="Silakan coba lagi." onRetry={() => void loadBrands()} />

  const visibleBrands = brands.filter((brand) => brand.name.toLowerCase().includes(search.trim().toLowerCase()))

  return (
    <div className="space-y-6">
      <PageHeader title="Merek" description="Kelola master merek untuk pilihan di form produk dan filter katalog." action={<Button size="sm" onClick={() => openForm(null)}><Plus className="size-4" /> Tambah Merek</Button>} />
      {brands.length === 0 ? <EmptyState icon={Tags} title="Belum ada merek" description="Tambahkan merek sebelum menggunakannya pada produk." action={<Button onClick={() => openForm(null)}>Tambah Merek</Button>} /> : <>
        <Input aria-label="Cari merek" placeholder="Cari merek…" value={search} onChange={(event) => setSearch(event.target.value)} className="sm:max-w-sm" />
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Nama Merek</TableHead><TableHead>Jumlah Produk</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
            <TableBody>
              {visibleBrands.map((brand) => <TableRow key={brand.id}>
                <TableCell className="font-medium">{brand.name}</TableCell><TableCell>{brand.products_count}</TableCell>
                <TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${brand.name}`} onClick={() => openForm(brand)}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" disabled={brand.products_count > 0} title={brand.products_count > 0 ? "Merek masih digunakan oleh produk" : `Hapus ${brand.name}`} aria-label={`Hapus ${brand.name}`} onClick={() => setDeleteTarget(brand)}><Trash2 className="size-4 text-destructive" /></Button></div></TableCell>
              </TableRow>)}
              {visibleBrands.length === 0 && <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">Merek tidak ditemukan.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground">Merek yang masih digunakan oleh produk tidak dapat dihapus.</p>
      </>}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!isSaving) setDialogOpen(open) }}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader><DialogTitle>{editing ? "Edit Merek" : "Tambah Merek"}</DialogTitle><DialogDescription>Gunakan satu nama yang konsisten untuk setiap merek. Perubahan nama berlaku pada semua produk terkait.</DialogDescription></DialogHeader>
            <div className="space-y-2"><Label htmlFor="brand-name">Nama Merek</Label><Input id="brand-name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Marantz" /></div>
            <DialogFooter><Button type="button" variant="outline" disabled={isSaving} onClick={() => setDialogOpen(false)}>Batal</Button><Button type="submit" disabled={isSaving || !name.trim()}>{isSaving && <Loader2 className="size-4 animate-spin" />} Simpan</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open && !isDeleting) setDeleteTarget(null) }} title="Hapus merek?" description={`Hapus “${deleteTarget?.name ?? "merek ini"}” dari master data?`} confirmLabel={isDeleting ? "Menghapus…" : "Hapus"} destructive onConfirm={() => void handleDelete()} />
    </div>
  )
}
