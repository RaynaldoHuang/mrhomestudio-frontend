import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Search, ShoppingCart } from "lucide-react"
import { motion } from "motion/react"

import speakerImage from "@/assets/img/img4.png"
import headphoneImage from "@/assets/img/img3.png"
import subwooferImage from "@/assets/img/img1.png"
import accessoryImage from "@/assets/img/product1.png"
import logo from "@/assets/img/logo.webp"
import { Container } from "@/components/client/container"
import { MobileMenu } from "@/components/client/mobile-menu"
import { CartDrawer } from "@/components/client/cart-drawer"
import { SearchOverlay } from "@/components/client/search-overlay"
import { useCart } from "@/contexts/cart-context"
import { getPublicMegaMenus, type MegaMenuGroup } from "@/lib/mega-menu-api"

const rawNavigation = [
  {
    label: "Speakers",
    href: "/collection/speakers",
    groups: [
      { title: "By Category", links: ["Hi-Fi Speakers", "Wireless Speakers", "Soundbars", "Architectural", "Outdoor Speakers"] },
      { title: "By Type", links: ["Floorstanding", "Bookshelf", "Centre Channel", "In-Ceiling", "In-Wall"] },
      { title: "By Series", links: ["Reference Series", "Signature Series", "Studio Series", "Cinema Series", "Wireless Collection"] },
    ],
    featured: { title: "Wireless sound, beautifully at home", image: speakerImage },
  },
  {
    label: "Subwoofers",
    href: "/collection/subwoofers",
    groups: [
      { title: "By Type", links: ["Active Subwoofers", "Home Cinema", "Compact Subwoofers", "Architectural", "Wireless"] },
      { title: "By Room", links: ["Living Room", "Media Room", "Dedicated Cinema", "Studio", "Multi-Room"] },
      { title: "By Series", links: ["Reference Series", "Performance Series", "Cinema Series", "Compact Series", "Installation Series"] },
    ],
    featured: { title: "Deep impact with absolute control", image: subwooferImage },
  },
  {
    label: "Headphones",
    href: "/collection/headphones",
    groups: [
      { title: "By Type", links: ["Over-Ear", "In-Ear", "Wireless", "Noise Cancelling", "Open-Back"] },
      { title: "By Use", links: ["Home Listening", "Travel", "Studio", "Gaming", "Everyday Audio"] },
      { title: "Collections", links: ["Reference", "Signature", "Wireless", "Studio Monitor", "Limited Edition"] },
    ],
    featured: { title: "Private listening without compromise", image: headphoneImage },
  },
  {
    label: "Accessories",
    href: "/collection/accessories",
    groups: [
      { title: "Audio", links: ["Amplifiers", "Streamers", "DACs", "Turntables", "Phono Stages"] },
      { title: "Installation", links: ["Speaker Stands", "Wall Mounts", "Cables", "Connectors", "Remote Controls"] },
      { title: "Shop By", links: ["New Arrivals", "Best Sellers", "Upgrades", "Replacement Parts", "Special Offers"] },
    ],
    featured: { title: "Complete your listening system", image: accessoryImage },
  },
]

function toCollectionPath(label: string) {
  const id = label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  return `/collection/${id}`
}

type NavigationItem = {
  label: string
  href: string
  groups: MegaMenuGroup[]
  featured: { title: string; image: string | null; imageAlt: string; url: string }
}

const fallbackNavigation: NavigationItem[] = rawNavigation.map((item) => ({
  ...item,
  groups: item.groups.map((group) => ({
    ...group,
    links: group.links.map((label) => ({ label, href: toCollectionPath(label) })),
  })),
  featured: { ...item.featured, imageAlt: item.featured.title, url: item.href },
}))

export function Navbar() {
  const { itemCount } = useCart()
  const [activePanel, setActivePanel] = useState<"menu" | "cart" | "search" | null>(null)
  const isMenuOpen = activePanel === "menu"
  const isCartOpen = activePanel === "cart"
  const isSearchOpen = activePanel === "search"
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [navigation, setNavigation] = useState<NavigationItem[]>([])
  const activeNavigation = navigation.find((item) => item.label === activeMenu)

  const openSearch = () => {
    setActiveMenu(null)
    setActivePanel("search")
  }

  const openCart = () => {
    setActiveMenu(null)
    setActivePanel("cart")
  }

  const closeSearch = useCallback(() => {
    setActivePanel((current) => current === "search" ? null : current)
  }, [])

  const closeMenu = useCallback(() => {
    setActivePanel((current) => current === "menu" ? null : current)
  }, [])

  const handleCartOpenChange = useCallback((open: boolean) => {
    if (open) {
      setActiveMenu(null)
      setActivePanel("cart")
    } else {
      setActivePanel((current) => current === "cart" ? null : current)
    }
  }, [])

  useEffect(() => {
    let active = true
    getPublicMegaMenus()
      .then((menus) => {
        if (!active) return
        setNavigation(menus.map((menu) => {
          const fallback = fallbackNavigation.find((item) => item.label === menu.label)
          return {
            label: menu.label,
            href: menu.href,
            groups: menu.groups,
            featured: {
              title: menu.featured_title ?? menu.label,
              image: menu.featured_image_url ?? fallback?.featured.image ?? null,
              imageAlt: menu.featured_image_alt ?? menu.featured_title ?? menu.label,
              url: menu.featured_url ?? menu.href,
            },
          }
        }))
      })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  return (
    <header
      className="sticky top-0 z-50 bg-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
      onMouseLeave={() => setActiveMenu(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActiveMenu(null)
      }}
    >
      <Container className="max-w-none px-5 sm:px-8 lg:px-16">
        <div className="hidden h-18 grid-cols-[1fr_auto_1fr] items-center lg:grid">
          <nav aria-label="Main navigation" className="flex h-full items-center gap-5 xl:gap-8">
            {navigation.map((item) => (
              <button
                key={item.label}
                type="button"
                aria-expanded={activeMenu === item.label}
                aria-controls="desktop-mega-menu"
                onMouseEnter={() => setActiveMenu(item.label)}
                onFocus={() => setActiveMenu(item.label)}
                onClick={() =>
                  setActiveMenu((current) => (current === item.label ? null : item.label))
                }
                className={`relative flex h-full cursor-pointer items-center text-sm font-light transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:bg-yellow-500 after:transition-transform ${
                  activeMenu === item.label
                    ? "text-yellow-400 after:scale-x-100"
                    : "after:scale-x-0 hover:text-yellow-400 hover:after:scale-x-100"
                }`}
              >
                {item.label}
              </button>
            ))}
            <Link
              to="/about"
              onMouseEnter={() => setActiveMenu(null)}
              className="relative flex h-full items-center text-sm font-light transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-yellow-500 after:transition-transform hover:text-yellow-400 hover:after:scale-x-100"
            >
              About Us
            </Link>
          </nav>

          <Link
            to="/"
            aria-label="Mr Home Audio home"
            className="cursor-pointer justify-self-center"
          >
            <img src={logo} alt="Mr Home Audio" className="h-auto w-40 object-contain lg:w-40" />
          </Link>

          <div className="flex items-center justify-self-end gap-6 lg:gap-8">
            <button type="button" aria-label="Search" aria-expanded={isSearchOpen} onClick={openSearch} className="cursor-pointer transition-opacity hover:opacity-50">
              <Search className="size-6" strokeWidth={1} />
            </button>
            <button type="button" onClick={openCart} aria-expanded={isCartOpen} aria-label={`Shopping cart with ${itemCount} items`} className="relative cursor-pointer transition-opacity hover:opacity-70">
              <ShoppingCart className="size-6" strokeWidth={1} />
              {itemCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 flex min-w-5 items-center justify-center rounded-full bg-yellow-500 px-1 text-[10px] font-normal leading-5 text-black">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="relative flex h-20 items-center justify-between border-b border-black/70 lg:hidden">
          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => { setActiveMenu(null); setActivePanel((current) => current === "menu" ? null : "menu") }}
            className="flex size-10 cursor-pointer items-center justify-start"
          >
            <span className="relative block size-6" aria-hidden="true">
              <motion.span
                className="absolute top-1/2 left-0 h-px w-6 bg-current"
                animate={isMenuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.span
                className="absolute top-1/2 left-0 h-px w-6 bg-current"
                animate={isMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              />
              <motion.span
                className="absolute top-1/2 left-0 h-px w-6 bg-current"
                animate={isMenuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
          </button>

          <Link
            to="/"
            aria-label="Mr Home Audio home"
            onClick={closeMenu}
            className="absolute left-1/2 -translate-x-1/2 cursor-pointer"
          >
            <img src={logo} alt="Mr Home Audio" className="h-auto w-32 object-contain sm:w-36" />
          </Link>

          <div className="flex items-center gap-4">
            <button type="button" aria-label="Search" aria-expanded={isSearchOpen} onClick={openSearch} className="cursor-pointer">
              <Search className="size-5" strokeWidth={1.8} />
            </button>
            <button type="button" onClick={openCart} aria-expanded={isCartOpen} aria-label={`Shopping cart with ${itemCount} items`} className="relative cursor-pointer">
              <ShoppingCart className="size-5" strokeWidth={1.8} />
              {itemCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 flex min-w-5 items-center justify-center rounded-full bg-yellow-500 px-1 text-[10px] font-normal leading-5 text-black">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </Container>

      {activeNavigation && (
        <div
          id="desktop-mega-menu"
          className="absolute inset-x-0 top-full hidden border-t border-white/10 bg-black text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)] lg:block"
          onMouseEnter={() => setActiveMenu(activeNavigation.label)}
        >
          <Container className="max-w-none px-16 py-10 xl:px-20 xl:py-12">
            <div className="grid grid-cols-[repeat(3,minmax(0,1fr))_minmax(16rem,0.85fr)] gap-10 xl:gap-14">
              {activeNavigation.groups.map((group, index) => (
                <div key={group.title}>
                  {index === 0 && (
                    <Link
                      to={activeNavigation.href}
                      onClick={() => setActiveMenu(null)}
                      className="mb-7 inline-block text-sm font-medium text-yellow-500 hover:text-yellow-400"
                    >
                      View All {activeNavigation.label}
                    </Link>
                  )}
                  <p className="mb-4 text-xs font-normal text-white/45">
                    {group.title}
                  </p>
                  <ul className="space-y-3">
                    {group.links.map((link) => (
                      <li key={`${link.label}-${link.href}`}>
                        <Link
                          to={link.href}
                          onClick={() => setActiveMenu(null)}
                          className="text-sm text-white/70 transition-colors hover:text-yellow-400 xl:text-sm"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <Link
                to={activeNavigation.featured.url}
                onClick={() => setActiveMenu(null)}
                className="group block self-start"
              >
                <div className="aspect-[4/2.6] overflow-hidden bg-neutral-900">
                  {activeNavigation.featured.image ? <img
                    src={activeNavigation.featured.image}
                    alt={activeNavigation.featured.imageAlt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  /> : <div className="flex h-full items-center justify-center text-xs text-white/35">No promotional image</div>}
                </div>
                <p className="mt-4 text-base font-semibold leading-snug transition-colors group-hover:text-yellow-400">
                  {activeNavigation.featured.title}
                </p>
              </Link>
            </div>
          </Container>
        </div>
      )}

      <MobileMenu items={[...navigation.map(({ label, href, groups }) => ({ label, href, groups })), { label: "About Us", href: "/about" }]} isOpen={isMenuOpen} onNavigate={closeMenu} />
      <CartDrawer open={isCartOpen} onOpenChange={handleCartOpenChange} />
      <SearchOverlay open={isSearchOpen} onClose={closeSearch} animateExit={!isCartOpen && !isMenuOpen} />
    </header>
  )
}
