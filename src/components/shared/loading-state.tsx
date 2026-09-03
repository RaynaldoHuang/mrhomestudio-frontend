import { Skeleton } from "@/components/ui/skeleton"

interface LoadingStateProps {
    rows?: number
}

export function LoadingState({
    rows = 5,
}: LoadingStateProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-9 w-24" />
            </div>

            <div className="overflow-hidden rounded-lg border">
                <div className="border-b p-4">
                    <Skeleton className="h-5 w-48" />
                </div>

                {Array.from({ length: rows }).map(
                    (_, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-4 gap-4 border-b p-4 last:border-b-0"
                        >
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                    )
                )}
            </div>
        </div>
    )
}