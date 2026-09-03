import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface FormActionsProps {
    isSubmitting?: boolean
    submitLabel?: string
    submittingLabel?: string
    onCancel?: () => void
}

export function FormActions({
    isSubmitting = false,
    submitLabel = "Save",
    submittingLabel = "Saving...",
    onCancel,
}: FormActionsProps) {
    return (
        <div className="flex items-center justify-end gap-2">
            <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
            >
                Cancel
            </Button>

            <Button
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting && (
                    <Loader2 className="size-4 animate-spin" />
                )}

                {isSubmitting
                    ? submittingLabel
                    : submitLabel}
            </Button>
        </div>
    )
}