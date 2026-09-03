import type { LucideIcon } from "lucide-react"
import { Inbox } from "lucide-react"
import type { ReactNode } from "react"

interface EmptyStateProps {
    title?: string
    description?: string
    icon?: LucideIcon
    action?: ReactNode
}

export function EmptyState({
    title = "No data found",
    description = "There is currently no data to display.",
    icon: Icon = Inbox,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex min-h-70 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <Icon className="size-5 text-muted-foreground" />
            </div>

            <h3 className="mt-4 text-sm font-semibold">
                {title}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {description}
            </p>

            {action && (
                <div className="mt-4">
                    {action}
                </div>
            )}
        </div>
    )
}