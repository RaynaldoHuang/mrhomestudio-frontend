import { ArrowLeft, Home } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function NotFoundPage() {
    return (
        <div className="flex min-h-[70vh] items-center justify-center p-6">
            <div className="max-w-md text-center">
                <p className="text-sm font-medium text-muted-foreground">
                    404
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                    Page not found
                </h1>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    The page you're looking for doesn't exist
                    or may have been moved.
                </p>

                <div className="mt-6 flex items-center justify-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="size-4" />
                        Go Back
                    </Button>

                    <Link to="/dashboard">
                        <Button>
                            <Home className="size-4" />
                            Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}