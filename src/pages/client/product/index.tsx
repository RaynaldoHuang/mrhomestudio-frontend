import { useEffect, useMemo, useState } from "react"
import { Headphones, Minus, Plus, Share2, ShieldCheck, ShoppingBag, Truck } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"

import { Container } from "@/components/client/container"
import { Reveal } from "@/components/client/reveal"
import { useCart } from "@/contexts/cart-context"
import { getProduct, type Product } from "@/lib/product-api"

export function ProductDetailPage() {
  const { addItem, items } = useCart()
  const { id = "" } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    let active = true
    window.scrollTo({ top: 0, behavior: "instant" })

    getProduct(id)
      .then((item) => {
        if (!active) return
        setProduct(item)
        setLoadError(false)
        setActiveImage(0)
        setSelectedVariants(Object.fromEntries(item.variants.map((variant) => [variant.name, variant.values[0] ?? ""])))
      })
      .catch(() => active && setLoadError(true))

    return () => { active = false }
  }, [id])

  const selectedVariantLabel = useMemo(
    () => Object.entries(selectedVariants).map(([name, value]) => `${name}: ${value}`).join(", "),
    [selectedVariants],
  )

  if (loadError) return <div className="min-h-screen bg-black py-32 text-center text-white"><h1 className="text-2xl">Product not found</h1><Link to="/collection/all-products" className="mt-6 inline-block text-yellow-400">Back to collection</Link></div>
  if (!product || String(product.id) !== id) return <div className="min-h-screen bg-black py-32 text-center text-white/60">Loading product…</div>

  const addToCart = () => {
    const inCart = items.filter((item) => item.productId === product.id && !item.unavailableReason).reduce((total, item) => total + item.quantity, 0)
    if (inCart + quantity > product.stock) {
      toast.error("The requested quantity exceeds the available stock.")
      return
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      colour: selectedVariantLabel || "Standard",
      image: product.thumbnail_url,
      quantity,
      stock: product.stock,
      selectedVariants,
    })
    toast.success("Added to your cart", { description: `${quantity} × ${product.name}${selectedVariantLabel ? ` — ${selectedVariantLabel}` : ""}` })
  }

  const shareProduct = async () => {
    const shareData = { title: product.name, text: `Check out ${product.name} from MR Home Audio.`, url: window.location.href }
    try {
      if (navigator.share) return await navigator.share(shareData)
      await navigator.clipboard.writeText(shareData.url)
      toast.success("Product link copied")
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      toast.error("Unable to share this product")
    }
  }

  return (
    <div key={product.id} className="bg-black text-white">
      <Container className="max-w-none px-5 py-6 sm:px-8 sm:py-10 lg:px-16 lg:py-14">
        <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs text-white/45 sm:mb-10">
          <Link to="/" className="hover:text-yellow-400">Home</Link><span>/</span>
          <Link to={`/collection/${product.category_slug || "all-products"}`} className="hover:text-yellow-400">{product.category || "Products"}</Link><span>/</span>
          <span className="truncate text-white/75">{product.name}</span>
        </nav>

        <section className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          <Reveal onLoad className="grid min-w-0 gap-3 sm:grid-cols-[5.25rem_minmax(0,1fr)] sm:gap-4">
            <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:grid sm:auto-rows-[5.25rem] sm:gap-2 sm:overflow-visible">
              {product.images.map((image, index) => (
                <button key={image.id} type="button" onClick={() => setActiveImage(index)} aria-label={`Show product image ${index + 1}`} aria-pressed={activeImage === index} className={`aspect-square w-[4.5rem] shrink-0 cursor-pointer overflow-hidden bg-white sm:w-full ${activeImage === index ? "ring-2 ring-yellow-500 ring-inset" : "ring-1 ring-white/20 ring-inset"}`}>
                  <img src={image.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="relative order-1 aspect-square overflow-hidden bg-white sm:order-2">
              <span className="absolute top-4 left-4 z-10 bg-black px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white">New arrival</span>
              {product.images[activeImage] && <img src={product.images[activeImage].url} alt={product.name} className="h-full w-full object-cover" />}
            </div>
          </Reveal>

          <Reveal onLoad delay={0.12} className="lg:sticky lg:top-28">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-yellow-400">{product.category || "Premium audio"}</p>
            <h1 className="font-degular text-title font-medium tracking-tight sm:text-6xl xl:text-4xl sm:leading-[.88]">{product.name}</h1>
            <p className="mt-7 text-2xl tracking-tight">Rp{product.price.toLocaleString("id-ID")}</p>
            <p className="mt-5 max-w-xl whitespace-pre-line text-base leading-7 text-white/60">{product.description}</p>
            <p className={`mt-4 text-sm ${product.stock > 0 ? "text-emerald-400" : "text-red-400"}`}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>

            {product.variants.map((variant) => (
              <fieldset key={variant.name} className="mt-8">
                <legend className="mb-3 text-sm">{variant.name}: <span className="text-white/55">{selectedVariants[variant.name]}</span></legend>
                <div className="flex flex-wrap gap-2">
                  {variant.values.map((value) => <button key={value} type="button" onClick={() => setSelectedVariants((current) => ({ ...current, [variant.name]: value }))} className={`min-h-10 cursor-pointer border px-4 text-sm transition-colors ${selectedVariants[variant.name] === value ? "border-yellow-500 bg-yellow-500 text-black" : "border-white/30 hover:border-white"}`}>{value}</button>)}
                </div>
              </fieldset>
            ))}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-14 items-center justify-between border border-white/25 sm:w-36">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-full w-12 cursor-pointer items-center justify-center text-white/70 hover:text-yellow-400"><Minus className="size-4" /></button>
                <span className="text-sm font-medium">{quantity}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(Math.max(product.stock, 1), value + 1))} className="flex h-full w-12 cursor-pointer items-center justify-center text-white/70 hover:text-yellow-400"><Plus className="size-4" /></button>
              </div>
              <button type="button" disabled={product.stock < 1} onClick={addToCart} className="flex h-14 flex-1 cursor-pointer items-center justify-center gap-2 bg-yellow-500 px-6 text-sm font-medium text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/40"><ShoppingBag className="size-4" />{product.stock > 0 ? "Add to cart" : "Out of stock"}</button>
              <button type="button" onClick={shareProduct} aria-label="Share product" className="flex size-14 shrink-0 cursor-pointer items-center justify-center border border-white/25 hover:border-yellow-500 hover:text-yellow-400"><Share2 className="size-5" /></button>
            </div>

            <div className="mt-7 grid gap-y-6 border-t border-white/15 py-7 text-sm sm:flex sm:justify-between">
              <div className="flex gap-3"><Truck className="size-5 text-yellow-400" /><div><p>Complimentary delivery</p><p className="mt-1 text-xs text-white/45">Across Indonesia</p></div></div>
              <div className="flex gap-3"><ShieldCheck className="size-5 text-yellow-400" /><div><p>Official warranty</p><p className="mt-1 text-xs text-white/45">Protected purchase</p></div></div>
              <div className="flex gap-3"><Headphones className="size-5 text-yellow-400" /><div><p>Expert support</p><p className="mt-1 text-xs text-white/45">Audio specialists</p></div></div>
            </div>
          </Reveal>
        </section>
      </Container>

      {product.specifications.length > 0 && <Reveal as="section" className="border-t border-white/10 bg-neutral-950 py-16 sm:py-20 lg:py-24"><Container className="max-w-none px-5 sm:px-8 lg:px-16"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20"><div><p className="mb-4 text-xs uppercase tracking-[0.20em] text-yellow-400">Technical information</p><h2 className="font-degular text-title sm:text-5xl sm:leading-[0.95]">Product specifications</h2></div><dl className="border-t border-white/15">{product.specifications.map((specification) => <div key={`${specification.name}-${specification.value}`} className="grid grid-cols-2 gap-6 border-b border-white/15 py-4 text-sm sm:py-5"><dt className="text-white/45">{specification.name}</dt><dd>{specification.value}</dd></div>)}</dl></div></Container></Reveal>}
    </div>
  )
}
