import type { ReactNode } from "react"

interface PageContainerProps {
    children: ReactNode
}

export function PageContainer({
    children,
}: PageContainerProps) {
    return (
        <main className="flex flex-1 flex-col">
            <div className="w-full flex-1 p-4 md:p-6 lg:p-8">
                {children}
            </div>
        </main>
    )
}