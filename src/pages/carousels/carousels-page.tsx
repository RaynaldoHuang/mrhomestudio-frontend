import { type FormEvent, useCallback, useEffect, useState } from "react"
import { AlignCenter, AlignLeft, AlignRight, Image, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { LoadingState } from "@/components/shared/loading-state"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  createCarousel,
  deleteCarousel,
  getAdminCarousels,
  updateCarousel,
  type CarouselFormValues,
  type CarouselSlide,
} from "@/lib/carousel-api"

const emptyForm: CarouselFormValues = {
  eyebrow: "",
  title: "",
  cta_label: "",
  cta_url: "/",
  image_alt: "",
  image_position: "object-center",
  sort_order: 0,
  is_active: true,
  image: null,
}

function valuesFromSlide(slide: CarouselSlide): CarouselFormValues {
  return {
    eyebrow: slide.eyebrow ?? "",
    title: slide.title,
    cta_label: slide.cta_label,
    cta_url: slide.cta_url,
    image_alt: slide.image_alt,
    image_position: slide.image_position,
    sort_order: slide.sort_order,
    is_active: slide.is_active,
    image: null,
  }
}

export function CarouselsPage() {
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CarouselSlide | null>(null)
  const [form, setForm] = useState<CarouselFormValues>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadSlides = useCallback(async () => {
    setIsLoading(true)
    setLoadError(false)

    try {
      setSlides(await getAdminCarousels())
    } catch {
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    getAdminCarousels()
      .then((items) => {
        if (isMounted) setSlides(items)
      })
      .catch(() => {
        if (isMounted) setLoadError(true)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const openCreateDialog = () => {
    setEditingSlide(null)
    setForm({ ...emptyForm, sort_order: slides.length + 1 })
    setDialogOpen(true)
  }

  const openEditDialog = (slide: CarouselSlide) => {
    setEditingSlide(slide)
    setForm(valuesFromSlide(slide))
    setDialogOpen(true)
  }

  const updateField = <Key extends keyof CarouselFormValues>(
    key: Key,
    value: CarouselFormValues[Key],
  ) => setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      if (editingSlide) {
        await updateCarousel(editingSlide.id, form)
        toast.success("Carousel updated successfully.")
      } else {
        await createCarousel(form)
        toast.success("Carousel created successfully.")
      }

      setDialogOpen(false)
      await loadSlides()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save carousel.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      await deleteCarousel(deleteTarget.id)
      toast.success("Carousel deleted successfully.")
      setDeleteTarget(null)
      await loadSlides()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete carousel.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) return <LoadingState rows={4} />

  if (loadError) {
    return (
      <ErrorState
        title="Unable to load carousels"
        description="Make sure the Laravel backend is running, then try again."
        onRetry={() => void loadSlides()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homepage Carousel"
        description="Manage the slides displayed in the homepage hero section."
        action={
          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="size-4" />
            Add Slide
          </Button>
        }
      />

      {slides.length === 0 ? (
        <EmptyState
          icon={Image}
          title="No carousel slides"
          description="Create the first slide for your homepage hero section."
          action={<Button onClick={openCreateDialog}>Add Slide</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slide</TableHead>
                <TableHead>CTA</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides.map((slide) => (
                <TableRow key={slide.id}>
                  <TableCell>
                    <div className="flex min-w-72 items-center gap-3">
                      {slide.image_url ? (
                        <img
                          src={slide.image_url}
                          alt=""
                          className="h-14 w-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-24 items-center justify-center rounded-lg bg-muted">
                          <Image className="size-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate font-medium">{slide.title}</div>
                        <div className="truncate text-sm text-muted-foreground">
                          {slide.eyebrow || "No eyebrow"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{slide.cta_label}</div>
                    <div className="text-xs text-muted-foreground">{slide.cta_url}</div>
                  </TableCell>
                  <TableCell>{slide.sort_order}</TableCell>
                  <TableCell>
                    <Badge variant={slide.is_active ? "default" : "secondary"}>
                      {slide.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${slide.title}`}
                        onClick={() => openEditDialog(slide)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${slide.title}`}
                        onClick={() => setDeleteTarget(slide)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <form onSubmit={handleSubmit} className="contents">
            <DialogHeader>
              <DialogTitle>{editingSlide ? "Edit Carousel" : "Add Carousel"}</DialogTitle>
              <DialogDescription>
                Configure the content, image, order, and visibility of this slide.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-2 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  required
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eyebrow">Eyebrow</Label>
                <Input
                  id="eyebrow"
                  placeholder="#homecinema"
                  value={form.eyebrow}
                  onChange={(event) => updateField("eyebrow", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_alt">Image alt text</Label>
                <Input
                  id="image_alt"
                  required
                  value={form.image_alt}
                  onChange={(event) => updateField("image_alt", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_label">Button label</Label>
                <Input
                  id="cta_label"
                  required
                  value={form.cta_label}
                  onChange={(event) => updateField("cta_label", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_url">Button URL</Label>
                <Input
                  id="cta_url"
                  required
                  placeholder="/services"
                  value={form.cta_url}
                  onChange={(event) => updateField("cta_url", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => updateField("image", event.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">JPG, PNG, or WebP. Maximum 8 MB. Automatically optimized to WebP.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_position">Image position</Label>
                <Select
                  value={form.image_position}
                  onValueChange={(value) => updateField("image_position", value as CarouselFormValues["image_position"])}
                >
                  <SelectTrigger id="image_position">
                    <SelectValue placeholder="Select image position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="object-left">
                      <AlignLeft />
                      Left
                    </SelectItem>
                    <SelectItem value="object-center">
                      <AlignCenter />
                      Center
                    </SelectItem>
                    <SelectItem value="object-right">
                      <AlignRight />
                      Right
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">Display order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min={0}
                  max={65535}
                  required
                  value={form.sort_order}
                  onChange={(event) => updateField("sort_order", Number(event.target.value))}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
                <div className="space-y-1">
                  <Label htmlFor="is_active">Active slide</Label>
                  <p className="text-xs text-muted-foreground">Only active slides appear on the homepage.</p>
                </div>
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => updateField("is_active", checked)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Carousel"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete carousel?"
        description={`Delete “${deleteTarget?.title ?? "this slide"}”? This action cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        destructive
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
