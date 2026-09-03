import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"

import {
    CustomerForm,
    type CustomerFormValues,
} from "./customer-form"

export function CreateCustomerPage() {
    const navigate = useNavigate()

    const handleSubmit = async (
        values: CustomerFormValues
    ) => {
        try {
            console.log("Create customer:", values)

            // Nanti ketika API sudah tersedia:
            // await customerApi.create(values)

            toast.success("Customer created successfully", {
                description: `${values.name} has been added to your customers.`,
            })

            navigate("/customers")
        } catch (error) {
            console.error("Failed to create customer:", error)

            toast.error("Failed to create customer", {
                description: "Something went wrong. Please try again.",
            })
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Create Customer"
                description="Add a new customer to your workspace."
            />

            <CustomerForm
                mode="create"
                onSubmit={handleSubmit}
                onCancel={() => navigate("/customers")}
            />
        </div>
    )
}