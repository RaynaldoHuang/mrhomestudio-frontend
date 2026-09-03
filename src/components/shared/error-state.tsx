import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ErrorStateProps {
    title?: string
    description?: string
    retryLabel?: string
    onRetry?: () => void
}

export function ErrorState({
    title = "Something went wrong",
    description = "We couldn't load the requested data. Please try again.",
    retryLabel = "Try Again",
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex min-h-70 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="size-5 text-destructive" />
            </div>

            <h3 className="mt-4 text-sm font-semibold">
                {title}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {description}
            </p>

            {onRetry && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={onRetry}
                >
                    {retryLabel}
                </Button>
            )}
        </div>
    )
}