/* eslint-disable react-hooks/incompatible-library */
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { FormActions } from "@/components/shared/form-actions"
import { FormCard } from "@/components/shared/form-card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const customerSchema = z.object({
    name: z
        .string()
        .min(2, "Name must contain at least 2 characters"),

    email: z
        .string()
        .email("Please enter a valid email address"),

    phone: z
        .string()
        .min(8, "Please enter a valid phone number"),

    status: z.enum([
        "active",
        "inactive",
    ]),

    notes: z
        .string()
        .optional(),
})

export type CustomerFormValues =
    z.infer<typeof customerSchema>

interface CustomerFormProps {
    mode: "create" | "edit"
    defaultValues?: Partial<CustomerFormValues>
    onSubmit?: (
        values: CustomerFormValues
    ) => void | Promise<void>
    onCancel?: () => void
}

export function CustomerForm({
    mode,
    defaultValues,
    onSubmit,
    onCancel,
}: CustomerFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),

        defaultValues: {
            name: "",
            email: "",
            phone: "",
            status: "active",
            notes: "",
            ...defaultValues,
        },
    })

    const status = watch("status")

    const handleFormSubmit = async (
        values: CustomerFormValues
    ) => {
        if (onSubmit) {
            await onSubmit(values)
            return
        }

        console.log(
            mode === "create"
                ? "Create customer:"
                : "Update customer:",
            values
        )
    }

    return (
        <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-6"
        >
            <FormCard
                title="Basic Information"
                description="Enter the customer's primary information."
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Name
                        </Label>

                        <Input
                            id="name"
                            placeholder="Customer name"
                            {...register("name")}
                        />

                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email
                        </Label>

                        <Input
                            id="email"
                            type="email"
                            placeholder="customer@example.com"
                            {...register("email")}
                        />

                        {errors.email && (
                            <p className="text-sm text-destructive">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">
                            Phone
                        </Label>

                        <Input
                            id="phone"
                            placeholder="0812-3456-7890"
                            {...register("phone")}
                        />

                        {errors.phone && (
                            <p className="text-sm text-destructive">
                                {errors.phone.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Status
                        </Label>

                        <Select
                            value={status}
                            onValueChange={(value) =>
                                setValue(
                                    "status",
                                    value as "active" | "inactive",
                                    {
                                        shouldValidate: true,
                                    }
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="active">
                                    Active
                                </SelectItem>

                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {errors.status && (
                            <p className="text-sm text-destructive">
                                {errors.status.message}
                            </p>
                        )}
                    </div>
                </div>
            </FormCard>

            <FormCard
                title="Additional Information"
                description="Optional information about this customer."
            >
                <div className="space-y-2">
                    <Label htmlFor="notes">
                        Notes
                    </Label>

                    <Textarea
                        id="notes"
                        placeholder="Add notes about this customer..."
                        className="min-h-28 resize-y"
                        {...register("notes")}
                    />

                    {errors.notes && (
                        <p className="text-sm text-destructive">
                            {errors.notes.message}
                        </p>
                    )}
                </div>
            </FormCard>

            <FormActions
                isSubmitting={isSubmitting}
                submitLabel={
                    mode === "create"
                        ? "Create Customer"
                        : "Save Changes"
                }
                submittingLabel={
                    mode === "create"
                        ? "Creating..."
                        : "Saving..."
                }
                onCancel={onCancel}
            />
        </form>
    )
}