import type { LucideIcon } from "lucide-react"
import {
    ArrowDownRight,
    ArrowUpRight,
} from "lucide-react"

import {
    Card,
    CardContent,
} from "@/components/ui/card"

interface StatCardProps {
    title: string
    value: string
    description?: string
    change?: string
    trend?: "up" | "down" | "neutral"
    icon?: LucideIcon
}

export function StatCard({
    title,
    value,
    description,
    change,
    trend = "neutral",
    icon: Icon,
}: StatCardProps) {
    const isUp = trend === "up"
    const isDown = trend === "down"

    return (
        <Card className="py-0">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">
                            {title}
                        </p>

                        <p className="mt-2 truncate text-2xl font-semibold tracking-tight">
                            {value}
                        </p>
                    </div>

                    {Icon && (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/30">
                            <Icon className="size-4 text-muted-foreground" />
                        </div>
                    )}
                </div>

                {(change || description) && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                        {change && (
                            <span
                                className={[
                                    "flex items-center font-medium",
                                    isUp &&
                                    "text-emerald-600 dark:text-emerald-400",
                                    isDown &&
                                    "text-red-600 dark:text-red-400",
                                    trend === "neutral" &&
                                    "text-muted-foreground",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                            >
                                {isUp && (
                                    <ArrowUpRight className="mr-0.5 size-3.5" />
                                )}

                                {isDown && (
                                    <ArrowDownRight className="mr-0.5 size-3.5" />
                                )}

                                {change}
                            </span>
                        )}

                        {description && (
                            <span className="text-muted-foreground">
                                {description}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
