import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Image, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
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
import { deleteHomeLogo, getAdminHomeLogos, saveHomeLogo, type HomeLogo, type HomeLogoForm } from "@/lib/home-logo-api"

const emptyForm: HomeLogoForm = { name: "", sort_order: 0, is_active: true, image: null }
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"]

export function HomeLogosPage() {
  const [logos, setLogos] = useState<HomeLogo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<HomeLogo | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HomeLogo | null>(null)
  const [form, setForm] = useState<HomeLogoForm>(emptyForm)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadLogos = useCallback(async () => {
    setIsLoading(true)
    setLoadError(false)
    try { setLogos(await getAdminHomeLogos()) } catch { setLoadError(true) } finally { setIsLoading(false) }
  }, [])

  useEffect(() => {
    let active = true
    getAdminHomeLogos()
      .then((items) => { if (active) setLogos(items) })
      .catch(() => { if (active) setLoadError(true) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  function openForm(logo: HomeLogo | null) {
    setEditing(logo)
    setPreviewUrl(null)
    setForm(logo
      ? { name: logo.name, sort_order: logo.sort_order, is_active: logo.is_active, image: null }
      : { ...emptyForm, sort_order: Math.min(65535, Math.max(0, ...logos.map((item) => item.sort_order)) + 1) })
    setDialogOpen(true)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.name.trim() || (!editing && !form.image)) return
    setIsSaving(true)
    try {
      await saveHomeLogo(form, editing?.id)
      toast.success(editing ? "Logo berhasil diperbarui." : "Logo berhasil ditambahkan.")
      setDialogOpen(false)
      setPreviewUrl(null)
      setForm(emptyForm)
      await loadLogos()
    } catch (error) { toast.error(error instanceof Error ? error.message : "Tidak dapat menyimpan logo.") }
    finally { setIsSaving(false) }
  }

  async function handleDelete() {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    try {
      await deleteHomeLogo(deleteTarget.id)
      toast.success("Logo berhasil dihapus.")
      setDeleteTarget(null)
      await loadLogos()
    } catch (error) { toast.error(error instanceof Error ? error.message : "Tidak dapat menghapus logo.") }
    finally { setIsDeleting(false) }
  }

  if (isLoading) return <LoadingState rows={4} />
  if (loadError) return <ErrorState title="Tidak dapat memuat logo" description="Pastikan backend berjalan, lalu coba lagi." onRetry={() => void loadLogos()} />

  const previewImage = form.image ? previewUrl : editing?.image_url

  return (
    <div className="space-y-6">
      <PageHeader title="Logo Homepage" description="Kelola deretan logo yang tampil tepat di bawah hero. Logo ditampilkan dalam warna abu-abu." action={<Button size="sm" onClick={() => openForm(null)}><Plus className="size-4" /> Tambah Logo</Button>} />
      {logos.length === 0 ? (
        <EmptyState icon={Image} title="Belum ada logo" description="Upload logo pertama untuk menampilkan section logo di homepage." action={<Button onClick={() => openForm(null)}>Tambah Logo</Button>} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Logo</TableHead><TableHead>Urutan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
            <TableBody>
              {logos.map((logo) => (
                <TableRow key={logo.id}>
                  <TableCell><div className="flex min-w-56 items-center gap-4"><div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-md border bg-[#fafafa] p-3"><img src={logo.image_url} alt="" className="max-h-full max-w-full object-contain grayscale" /></div><span className="font-medium">{logo.name}</span></div></TableCell>
                  <TableCell>{logo.sort_order}</TableCell>
                  <TableCell><Badge variant={logo.is_active ? "default" : "secondary"}>{logo.is_active ? "Aktif" : "Nonaktif"}</Badge></TableCell>
                  <TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${logo.name}`} onClick={() => openForm(logo)}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" aria-label={`Hapus ${logo.name}`} onClick={() => setDeleteTarget(logo)}><Trash2 className="size-4 text-destructive" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Urutan terkecil tampil lebih dahulu. Logo nonaktif disembunyikan dari homepage.</p>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!isSaving) { setDialogOpen(open); if (!open) { setForm(emptyForm); setPreviewUrl(null) } } }}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader><DialogTitle>{editing ? "Edit Logo" : "Tambah Logo"}</DialogTitle><DialogDescription>Gunakan logo dengan latar transparan atau putih agar tampil rapi.</DialogDescription></DialogHeader>
            <fieldset disabled={isSaving} className="space-y-5 disabled:opacity-60">
              <div className="space-y-2"><Label htmlFor="logo-name">Nama merek / partner</Label><Input id="logo-name" required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh: Marantz" /></div>
              <div className="space-y-2">
                <Label htmlFor="logo-image">Gambar logo{editing ? " (opsional)" : ""}</Label>
                <Input id="logo-image" type="file" accept="image/png,image/jpeg,image/webp" required={!editing} onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  if (file && (!allowedImageTypes.includes(file.type) || file.size > 2 * 1024 * 1024)) {
                    toast.error("Gunakan PNG, JPG, atau WebP dengan ukuran maksimal 2 MB.")
                    event.target.value = ""
                    setForm({ ...form, image: null })
                    setPreviewUrl(null)
                    return
                  }
                  setForm({ ...form, image: file })
                  setPreviewUrl(file ? URL.createObjectURL(file) : null)
                }} />
                <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, atau WebP. Maksimal 2 MB. {editing && "Kosongkan untuk mempertahankan gambar saat ini."}</p>
              </div>
              {previewImage && <div className="space-y-2"><p className="text-xs text-muted-foreground">Pratinjau tampilan di homepage</p><div className="flex h-28 items-center justify-center rounded-lg border bg-[#fafafa] p-6"><img src={previewImage} alt={form.name || "Pratinjau logo"} className="max-h-12 max-w-full object-contain opacity-45 grayscale" /></div></div>}
              <div className="space-y-2"><Label htmlFor="logo-order">Urutan tampil</Label><Input id="logo-order" type="number" required min={0} max={65535} step={1} value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} /></div>
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3"><div className="space-y-1"><Label htmlFor="logo-active">Tampilkan di homepage</Label><p className="text-xs text-muted-foreground">Hanya logo aktif yang ditampilkan.</p></div><Switch id="logo-active" checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} /></div>
            </fieldset>
            <DialogFooter><Button type="button" variant="outline" disabled={isSaving} onClick={() => { setDialogOpen(false); setForm(emptyForm); setPreviewUrl(null) }}>Batal</Button><Button type="submit" disabled={isSaving || !form.name.trim() || (!editing && !form.image)}>{isSaving && <Loader2 className="size-4 animate-spin" />} {isSaving ? "Menyimpan…" : "Simpan Logo"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open && !isDeleting) setDeleteTarget(null) }} title="Hapus logo?" description={`Logo “${deleteTarget?.name ?? "ini"}” akan dihapus dari homepage dan penyimpanan.`} confirmLabel={isDeleting ? "Menghapus…" : "Hapus"} destructive onConfirm={() => void handleDelete()} />
    </div>
  )
}
