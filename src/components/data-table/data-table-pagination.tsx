import type { Table } from "@tanstack/react-table"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"

interface DataTablePaginationProps<TData> {
    table: Table<TData>
}

export function DataTablePagination<TData>({
    table,
}: DataTablePaginationProps<TData>) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>

            <div className="flex items-center gap-2">
                <div className="mr-2 text-sm text-muted-foreground">
                    Page{" "}
                    <span className="font-medium text-foreground">
                        {table.getState().pagination.pageIndex + 1}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                        {table.getPageCount() || 1}
                    </span>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="hidden size-8 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="First page"
                >
                    <ChevronsLeft className="size-4" />
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="size-4" />
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Next page"
                >
                    <ChevronRight className="size-4" />
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="hidden size-8 lg:flex"
                    onClick={() =>
                        table.setPageIndex(table.getPageCount() - 1)
                    }
                    disabled={!table.getCanNextPage()}
                    aria-label="Last page"
                >
                    <ChevronsRight className="size-4" />
                </Button>
            </div>
        </div>
    )
}