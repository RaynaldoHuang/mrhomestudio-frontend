import { useEffect, useState } from "react"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

import { useCart } from "@/contexts/cart-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

type CartDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatPrice(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, itemCount, subtotal, updateQuantity, removeItem, refreshProducts, isSyncing, syncError } = useCart()
  const [removingIds, setRemovingIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    if (open) void refreshProducts()
  }, [open, refreshProducts])

  const removeItemSmoothly = (id: string) => {
    if (removingIds.has(id)) return

    setRemovingIds((current) => new Set(current).add(id))
    window.setTimeout(() => {
      removeItem(id)
      setRemovingIds((current) => {
        const next = new Set(current)
        next.delete(id)
        return next
      })
    }, 300)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        overlayClassName="bg-black/55 backdrop-blur-none! supports-backdrop-filter:backdrop-blur-none!"
        className="inset-0! m-0! h-dvh! max-h-dvh! w-full! max-w-none! gap-0 rounded-none border-0! bg-neutral-950 text-white outline-none md:left-auto! md:max-w-xl! md:border-l! md:border-white/10 [&_[data-slot=sheet-close]]:top-6 [&_[data-slot=sheet-close]]:text-white [&_[data-slot=sheet-close]]:hover:bg-white/10 md:[&_[data-slot=sheet-close]]:top-7"
      >
        <SheetHeader className="shrink-0 border-b border-white/10 px-5 py-6 pr-16 sm:px-8 sm:py-7">
          <div className="flex items-baseline gap-3">
            <SheetTitle className="font-degular text-xl font-normal text-white">Added to your cart</SheetTitle>
            <span className="text-xs text-white/40">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <ShoppingBag className="size-9 text-white/25" strokeWidth={1.25} />
              <p className="text-lg">Your cart is empty</p>
            </div>
            <p className="mt-2 text-sm text-white/45">Find the perfect addition to your listening room.</p>
            <Link
              to="/collection/all-products"
              onClick={() => onOpenChange(false)}
              className="mt-7 inline-flex h-12 items-center bg-yellow-500 px-6 text-xs font-medium uppercase tracking-[0.16em] text-black hover:bg-yellow-400"
            >
              Explore collection
            </Link>
          </div>
        ) : (
          <>
            {items.length > 0 && (isSyncing || syncError) && <p role="status" className="px-5 pt-4 text-xs text-white/60 sm:px-8">{isSyncing ? "Updating cart from the latest product data…" : <>Unable to update product data. <button type="button" onClick={() => void refreshProducts()} className="underline">Retry</button></>}</p>}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-8">
              {items.map((item) => (
                <article key={item.id} className={`grid grid-cols-[6rem_minmax(0,1fr)] gap-4 overflow-hidden transition-all duration-300 ease-out sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-6 ${
                  removingIds.has(item.id)
                    ? "max-h-0 translate-x-4 py-0 opacity-0"
                    : "max-h-[22rem] py-6 opacity-100"
                }`}>
                  <Link
                    to={`/product/${item.productId}`}
                    onClick={() => onOpenChange(false)}
                    className="aspect-square overflow-hidden bg-white"
                  >
                    {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-contain" />}
                  </Link>

                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link to={`/product/${item.productId}`} onClick={() => onOpenChange(false)} className="font-medium leading-5 hover:text-yellow-400">
                          {item.name}
                        </Link>
                        <p className="mt-1 text-xs text-white/45">{item.colour}</p>
                        {item.unavailableReason && <p className="mt-2 text-xs text-red-400">{item.unavailableReason}</p>}
                      </div>
                      <p className="shrink-0 text-sm">{formatPrice(item.price * item.quantity)}</p>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-4 pt-5">
                      <div className="flex h-9 items-center border border-white/20">
                        <button type="button" disabled={item.quantity <= 1 || Boolean(item.unavailableReason)} aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-full w-9 cursor-pointer items-center justify-center hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30">
                          <Minus className="size-3" />
                        </button>
                        <span className="w-7 text-center text-xs">{item.quantity}</span>
                        <button type="button" disabled={Boolean(item.unavailableReason) || item.quantity >= Number.MAX_SAFE_INTEGER} aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-full w-9 cursor-pointer items-center justify-center hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30">
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <button type="button" disabled={removingIds.has(item.id)} onClick={() => removeItemSmoothly(item.id)} className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-white/40 hover:text-red-400">
                        <Trash2 className="size-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}

            </div>

            <div className="shrink-0 border-t border-white/10 bg-black px-5 py-6 sm:px-8">
              <p className="mb-5 text-xs text-white/40">Tax and discounts are calculated at checkout.</p>
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm">Subtotal</span>
                <span className="text-xl font-medium">{formatPrice(subtotal)}</span>
              </div>
              <Link
                to="/cart"
                onClick={() => onOpenChange(false)}
                className="flex h-14 w-full items-center justify-center bg-yellow-500 text-sm font-medium uppercase text-black transition-colors hover:bg-yellow-400"
              >
                Go to cart
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
