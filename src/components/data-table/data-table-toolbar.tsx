import type { Table } from "@tanstack/react-table"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    searchColumn?: string
    searchPlaceholder?: string
}

export function DataTableToolbar<TData>({
    table,
    searchColumn,
    searchPlaceholder = "Search...",
}: DataTableToolbarProps<TData>) {
    const isFiltered =
        table.getState().columnFilters.length > 0

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
                {searchColumn && (
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            placeholder={searchPlaceholder}
                            value={
                                (table
                                    .getColumn(searchColumn)
                                    ?.getFilterValue() as string) ?? ""
                            }
                            onChange={(event) =>
                                table
                                    .getColumn(searchColumn)
                                    ?.setFilterValue(event.target.value)
                            }
                            className="pl-9"
                        />
                    </div>
                )}

                {isFiltered && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => table.resetColumnFilters()}
                    >
                        Reset
                        <X className="ml-2 size-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}