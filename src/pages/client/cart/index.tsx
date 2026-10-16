import { useEffect, useState } from "react"
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

import { Container } from "@/components/client/container"
import { useCart } from "@/contexts/cart-context"

function formatPrice(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`
}

export function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, refreshProducts, isSyncing, syncError } = useCart()
  const [removingIds, setRemovingIds] = useState<Set<string>>(() => new Set())

  const checkoutDisabled = isSyncing || syncError || items.some((item) => item.unavailableReason)

  useEffect(() => {
    void refreshProducts()
  }, [refreshProducts])

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

  const checkoutViaWhatsApp = () => {
    if (checkoutDisabled) return
    const orderLines = items.map((item, index) =>
      [
        `*${String(index + 1).padStart(2, "0")} · ${item.name}*`,
        `Varian: ${item.colour}`,
        `Jumlah: ${item.quantity}`,
        `Harga satuan: ${formatPrice(item.price)}`,
        `Subtotal: *${formatPrice(item.price * item.quantity)}*`,
      ].join("\n"),
    )

    const message = [
      "*MR HOME AUDIO*",
      "_Pesanan Baru_",
      "━━━━━━━━━━━━━━━━",
      "",
      "Halo, saya ingin melakukan pemesanan produk berikut:",
      "",
      ...orderLines.flatMap((line, index) => [
        line,
        ...(index < orderLines.length - 1 ? ["──────────────", ""] : [""]),
      ]),
      "━━━━━━━━━━━━━━━━",
      `*TOTAL PESANAN: ${formatPrice(subtotal)}*`,
      "",
      "_Pengiriman gratis ke seluruh Indonesia._",
      "",
      "Mohon konfirmasi ketersediaan produk dan informasi proses pembayarannya. Terima kasih.",
    ].join("\n")

    window.open(
      `https://wa.me/6285928953264?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    )
  }

  return (
    <section className="min-h-[70vh] bg-black py-10 text-white sm:py-14 lg:py-20">
      <Container className="max-w-none px-5 sm:px-8 lg:px-16">
        <div className="mb-8 flex items-end justify-between gap-5">
          <div>
            <h1 className="mt-2 font-degular text-title sm:text-3xl sm:leading-none">Shopping cart</h1>
          </div>
          {itemCount > 0 && <p className="pb-1 text-sm text-white/50">{itemCount} {itemCount === 1 ? "item" : "items"}</p>}
        </div>

        {items.length > 0 && (isSyncing || syncError) && <p role="status" className="mb-5 text-sm text-white/60">{isSyncing ? "Updating cart from the latest product data…" : <>Unable to update product data. <button type="button" onClick={() => void refreshProducts()} className="underline">Retry</button></>}</p>}
        {items.length === 0 ? (
          <div className="flex min-h-96 flex-col items-center justify-center border border-white/10 bg-neutral-950 px-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <ShoppingBag className="size-10 text-white/25" strokeWidth={1.25} />
              <h2 className="text-xl font-medium">Your cart is empty</h2>
            </div>
            <p className="mt-2 text-sm text-white/50">Explore our collection and find your perfect sound.</p>
            <Link to="/collection/all-products" className="mt-7 inline-flex h-12 items-center gap-2 bg-yellow-500 px-7 text-sm text-black transition-colors hover:bg-yellow-400">
              Explore collection
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_28rem]">
            <div className="border border-white/10 bg-neutral-950 px-5 sm:px-8">
              {items.map((item) => (
                <article key={item.id} className={`grid grid-cols-[6.5rem_minmax(0,1fr)] gap-5 overflow-hidden border-b border-white/10 transition-all duration-300 ease-out last:border-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8 ${
                  removingIds.has(item.id)
                    ? "max-h-0 -translate-x-4 py-0 opacity-0 sm:py-0"
                    : "max-h-[30rem] py-7 opacity-100 sm:py-8"
                }`}>
                  <Link to={`/product/${item.productId}`} className="aspect-square overflow-hidden bg-white">
                    {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-contain" />}
                  </Link>

                  <div className="flex min-w-0 flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="min-w-0 self-start">
                      <Link to={`/product/${item.productId}`} className="text-lg font-medium transition-colors hover:text-yellow-400">{item.name}</Link>
                      <p className="mt-1 text-sm text-white/45">Variant: {item.colour}</p>
                      {item.unavailableReason && <p className="mt-2 text-xs text-red-400">{item.unavailableReason}</p>}
                      <button type="button" disabled={removingIds.has(item.id)} onClick={() => removeItemSmoothly(item.id)} className="mt-5 inline-flex cursor-pointer items-center gap-1.5 text-xs text-white/45 transition-colors hover:text-red-400">
                        <Trash2 className="size-3.5" /> Remove
                      </button>
                    </div>

                    <div className="flex items-end justify-between gap-5 sm:flex-col sm:items-end">
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      <div className="flex h-10 items-center border border-white/20">
                        <button type="button" disabled={item.quantity <= 1 || Boolean(item.unavailableReason)} aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-full w-10 cursor-pointer items-center justify-center hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30">
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm" aria-live="polite">{item.quantity}</span>
                        <button type="button" disabled={Boolean(item.unavailableReason) || item.quantity >= Number.MAX_SAFE_INTEGER} aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-full w-10 cursor-pointer items-center justify-center hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              <div className="flex py-7">
                <Link to="/collection/all-products" className="inline-flex items-center gap-2 text-sm font-reguler underline-offset-8 hover:text-yellow-400">
                  <ArrowLeft className="size-4" /> Continue shopping
                </Link>
              </div>
            </div>

            <aside className="border border-white/10 bg-neutral-950 p-6 sm:p-8 lg:sticky lg:top-24">
              <h2 className="font-degular text-title sm:text-3xl">Order summary</h2>
              <div className="mt-6 space-y-4 border-y border-white/10 py-6 text-sm">
                <div className="flex justify-between gap-4"><span className="text-white/45">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/45">Shipping</span><span className="font-medium">Free</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/45">Tax</span><span>Calculated at checkout</span></div>
              </div>
              <div className="flex items-end justify-between gap-4 py-6">
                <span className="text-sm">Total</span>
                <div className="text-right"><p className="text-2xl font-medium">{formatPrice(subtotal)}</p><p className="mt-1 text-xs text-white/35">Including VAT</p></div>
              </div>
              <button type="button" disabled={checkoutDisabled} onClick={checkoutViaWhatsApp} className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 bg-yellow-500 text-xs font-medium uppercase tracking-[0.1em] text-black transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/40">
                Checkout via WhatsApp
              </button>
              {items.some((item) => item.unavailableReason) && <p className="mt-3 text-xs text-red-400">Remove unavailable items or choose another variant before checking out.</p>}
              <p className="mt-4 text-center text-xs leading-5 text-white/35">Secure checkout and complimentary delivery across Indonesia.</p>
            </aside>
          </div>
        )}
      </Container>
    </section>
  )
}
