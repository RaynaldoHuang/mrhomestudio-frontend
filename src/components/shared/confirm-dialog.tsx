import type { ReactNode } from "react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ConfirmDialogProps {
    trigger?: ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    title?: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    destructive?: boolean
    closeOnBackdropClick?: boolean
    onConfirm: () => void
}

export function ConfirmDialog({
    trigger,
    open,
    onOpenChange,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive = false,
    closeOnBackdropClick = false,
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <AlertDialog
            open={open}
            onOpenChange={onOpenChange}
        >
            {trigger ? (
                <AlertDialogTrigger>
                    {trigger}
                </AlertDialogTrigger>
            ) : null}

            <AlertDialogContent
                onBackdropClick={
                    closeOnBackdropClick
                        ? () => onOpenChange?.(false)
                        : undefined
                }
            >
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {title}
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>
                        {cancelLabel}
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onConfirm}
                        className={
                            destructive
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : undefined
                        }
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
