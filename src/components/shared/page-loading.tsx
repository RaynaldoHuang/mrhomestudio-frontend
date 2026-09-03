import { Loader2 } from "lucide-react"

export function PageLoading() {
  return (
    <div className="flex min-h-75 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />

        <p className="text-sm text-muted-foreground">
          Loading...
        </p>
      </div>
    </div>
  )
}