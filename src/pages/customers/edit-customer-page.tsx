import {
    useNavigate,
    useParams,
} from "react-router-dom"

import { PageHeader } from "@/components/shared/page-header"

import {
    CustomerForm,
    type CustomerFormValues,
} from "./customer-form"

export function EditCustomerPage() {
    const navigate = useNavigate()
    const { id } = useParams()

    // Dummy data sementara.
    // Nanti data ini berasal dari API.
    const customer: CustomerFormValues = {
        name: "Michael Tan",
        email: "michael@example.com",
        phone: "0812-1234-5678",
        status: "active",
        notes: "Regular customer.",
    }

    const handleSubmit = async (
        values: CustomerFormValues
    ) => {
        console.log(
            "Update customer:",
            id,
            values
        )

        // Nanti:
        // await customerApi.update(id, values)

        navigate("/admin/customers")
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Customer"
                description="Update customer information."
            />

            <CustomerForm
                mode="edit"
                defaultValues={customer}
                onSubmit={handleSubmit}
                onCancel={() =>
                    navigate("/admin/customers")
                }
            />
        </div>
    )
}
