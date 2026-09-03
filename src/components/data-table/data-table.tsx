/* eslint-disable react-hooks/incompatible-library */
import { useState } from "react"

import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]

    searchColumn?: string
    searchPlaceholder?: string

    emptyMessage?: string
    pageSize?: number
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchColumn,
    searchPlaceholder = "Search...",
    emptyMessage = "No results found.",
    pageSize = 10,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] =
        useState<SortingState>([])

    const [columnFilters, setColumnFilters] =
        useState<ColumnFiltersState>([])

    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})

    const [rowSelection, setRowSelection] = useState({})

    const table = useReactTable({
        data,
        columns,

        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },

        initialState: {
            pagination: {
                pageSize,
            },
        },

        enableRowSelection: true,

        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,

        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <div className="space-y-4">
            <DataTableToolbar
                table={table}
                searchColumn={searchColumn}
                searchPlaceholder={searchPlaceholder}
            />

            <div className="overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table
                                .getHeaderGroups()
                                .map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(
                                            (header) => (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef
                                                                .header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            )
                                        )}
                                    </TableRow>
                                ))}
                        </TableHeader>

                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={
                                            row.getIsSelected() &&
                                            "selected"
                                        }
                                    >
                                        {row
                                            .getVisibleCells()
                                            .map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-32 text-center"
                                    >
                                        <div className="text-sm text-muted-foreground">
                                            {emptyMessage}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <DataTablePagination table={table} />
        </div>
    )
}