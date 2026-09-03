/* eslint-disable react-refresh/only-export-components */
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import {
    Eye,
    MoreHorizontal,
    Pencil,
    Trash2,
} from "lucide-react"

import type { Customer } from "./data"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { StatusBadge } from "@/components/shared/status-badge"

import { Button } from "@/components/ui/button"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Customer row actions
 *
 * Dipisahkan dari column definition supaya:
 * - state dialog tidak berada langsung di cell
 * - mudah ditambahkan API
 * - mudah ditambahkan loading
 * - mudah ditambahkan toast
 */
function CustomerActions({
    customer,
}: {
    customer: Customer
}) {
    const [deleteOpen, setDeleteOpen] = useState(false)

    const handleView = () => {
        console.log("View customer:", customer.id)

        // Nanti:
        // navigate(`/customers/${customer.id}`)
    }

    const handleEdit = () => {
        console.log("Edit customer:", customer.id)

        // Nanti:
        // navigate(`/customers/${customer.id}/edit`)
    }

    const handleDelete = () => {
        console.log("Delete customer:", customer.id)

        // Nanti ganti dengan API:
        // await deleteCustomer(customer.id)
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Open actions for ${customer.name}`}
                    >
                        <MoreHorizontal className="size-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    className="w-40"
                >
                    <DropdownMenuItem onClick={handleView}>
                        <Eye className="size-4" />

                        <span>View details</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleEdit}>
                        <Pencil className="size-4" />

                        <span>Edit</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => setDeleteOpen(true)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="size-4" />

                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete customer?"
                description={`Are you sure you want to delete ${customer.name}? This action cannot be undone.`}
                confirmLabel="Delete"
                destructive
                onConfirm={handleDelete}
            />
        </>
    )
}

export const customerColumns: ColumnDef<Customer>[] = [
    {
        accessorKey: "name",

        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Customer"
            />
        ),

        cell: ({ row }) => (
            <div className="min-w-0">
                <div className="font-medium">
                    {row.original.name}
                </div>

                <div className="truncate text-sm text-muted-foreground">
                    {row.original.email}
                </div>
            </div>
        ),
    },

    {
        accessorKey: "phone",

        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Phone"
            />
        ),

        cell: ({ row }) => (
            <span className="whitespace-nowrap">
                {row.original.phone}
            </span>
        ),
    },

    {
        accessorKey: "status",

        header: "Status",

        cell: ({ row }) => (
            <StatusBadge
                status={row.original.status}
            />
        ),
    },

    {
        accessorKey: "createdAt",

        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Created"
            />
        ),

        cell: ({ row }) => (
            <span className="whitespace-nowrap text-muted-foreground">
                {row.original.createdAt}
            </span>
        ),
    },

    {
        id: "actions",

        enableSorting: false,
        enableHiding: false,

        cell: ({ row }) => (
            <div className="flex justify-end">
                <CustomerActions
                    customer={row.original}
                />
            </div>
        ),
    },
]