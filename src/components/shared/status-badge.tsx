import { Badge } from "@/components/ui/badge"

type Status =
    | "active"
    | "inactive"
    | "pending"
    | "completed"
    | "processing"
    | "cancelled"

interface StatusBadgeProps {
    status: Status
}

const statusConfig: Record<
    Status,
    {
        label: string
        className: string
    }
> = {
    active: {
        label: "Active",
        className:
            "border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    },
    inactive: {
        label: "Inactive",
        className:
            "border-transparent bg-muted text-muted-foreground",
    },
    pending: {
        label: "Pending",
        className:
            "border-transparent bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    },
    completed: {
        label: "Completed",
        className:
            "border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    },
    processing: {
        label: "Processing",
        className:
            "border-transparent bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    },
    cancelled: {
        label: "Cancelled",
        className:
            "border-transparent bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    },
}

export function StatusBadge({
    status,
}: StatusBadgeProps) {
    const config = statusConfig[status]

    return (
        <Badge
            variant="outline"
            className={config.className}
        >
            {config.label}
        </Badge>
    )
}