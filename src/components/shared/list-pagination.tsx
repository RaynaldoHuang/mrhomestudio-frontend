import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { paginationPages } from "@/lib/pagination"

type ListPaginationProps = {
  page: number
  totalPages: number
  start: number
  end: number
  total: number
  pageSize: number
  label: string
  onPageChange: (page: number) => void
}

export function ListPagination({ page, totalPages, start, end, total, pageSize, label, onPageChange }: ListPaginationProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p role="status" className="text-sm text-muted-foreground">
        Menampilkan {start}–{end} dari {total} {label} · {pageSize} per halaman
      </p>
      {totalPages > 1 && (
        <nav aria-label={`Halaman ${label}`} className="flex flex-wrap items-center gap-1">
          <Button type="button" variant="outline" size="icon" aria-label="Halaman sebelumnya" disabled={page === 1} onClick={() => onPageChange(page - 1)}><ChevronLeft className="size-4" /></Button>
          {paginationPages(page, totalPages).map((item, index) => item === "ellipsis"
            ? <span key={`ellipsis-${index}`} className="px-1" aria-hidden="true">…</span>
            : <Button key={item} type="button" variant={item === page ? "default" : "outline"} size="icon" aria-label={`Halaman ${item}`} aria-current={item === page ? "page" : undefined} onClick={() => onPageChange(item)}>{item}</Button>)}
          <Button type="button" variant="outline" size="icon" aria-label="Halaman berikutnya" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight className="size-4" /></Button>
        </nav>
      )}
    </div>
  )
}
