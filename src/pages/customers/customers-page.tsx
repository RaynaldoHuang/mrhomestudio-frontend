import { Plus } from "lucide-react"

import { DataTable } from "@/components/data-table/data-table"
import { PageHeader } from "@/components/shared/page-header"

import { buttonVariants } from "@/components/ui/button"

import { customerColumns } from "./columns"
import { customers } from "./data"

import { Link } from "react-router-dom"

export function CustomersPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Customers"
                description="Manage your customers and customer information."
                action={
                    <Link
                        to="/admin/customers/create"
                        className={buttonVariants({ size: "sm" })}
                    >
                        <Plus className="size-4" />
                        Add Customer
                    </Link>
                }
            />

            <DataTable
                columns={customerColumns}
                data={customers}
                searchColumn="name"
                searchPlaceholder="Search customers..."
                emptyMessage="No customers found."
            />
        </div>
    )
}
