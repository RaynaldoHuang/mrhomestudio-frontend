import { useEffect, useLayoutEffect, useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Link } from "react-router-dom"

import { Container } from "@/components/client/container"
import { menuDisplayGroups, type MenuDisplayMode } from "@/lib/menu-display"
import type { MegaMenuGroup } from "@/lib/mega-menu-api"

type MobileMenuItem = {
  label: string
  href: string
  display_mode?: MenuDisplayMode
  groups?: MegaMenuGroup[]
}

type MobileMenuProps = {
  items: MobileMenuItem[]
  isOpen: boolean
  onNavigate: () => void
}

export function MobileMenu({ items, isOpen, onNavigate }: MobileMenuProps) {
  const [activeItem, setActiveItem] = useState<MobileMenuItem | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([])

  useLayoutEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onNavigate()
    }
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [isOpen, onNavigate])

  useEffect(() => {
    if (!isOpen) {
      const timeout = window.setTimeout(() => {
        setActiveItem(null)
        setCollapsedGroups([])
      }, 0)
      return () => window.clearTimeout(timeout)
    }
  }, [isOpen])

  function openSubmenu(item: MobileMenuItem) {
    setActiveItem(item)
    setCollapsedGroups([])
  }

  function toggleGroup(title: string) {
    setCollapsedGroups((current) => current.includes(title)
      ? current.filter((item) => item !== title)
      : [...current, title])
  }

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="mobile-menu"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 top-20 bottom-0 z-40 overflow-y-auto overscroll-contain border-t border-white/10 bg-black text-white lg:hidden"
        >
          <Container className="flex min-h-full max-w-none flex-col px-5 sm:px-8">
            <AnimatePresence mode="wait">
              {activeItem ? (
                <motion.div
                  key={`submenu-${activeItem.label}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-1 flex-col py-5 sm:py-7"
                >
            <div className="flex items-center gap-3 border-b border-white/10 pb-5">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-yellow-400 hover:text-yellow-400"
                aria-label="Back to all menus"
              >
                <ChevronLeft className="size-4 stroke-[1.7]" aria-hidden="true" />
              </button>
              <p className="font-degular text-2xl">{activeItem.label}</p>
            </div>

            <Link
              to={activeItem.href}
              onClick={onNavigate}
              className="py-4 text-base font-medium text-yellow-400 transition-colors hover:text-yellow-300"
            >
              View All {activeItem.label}
            </Link>

            <nav aria-label={`${activeItem.label} categories`} className="pb-8">
              {activeItem.display_mode === "direct" ? (
                <ul className="divide-y divide-white/10">
                  {menuDisplayGroups(activeItem.groups ?? [], "direct").flatMap((group) => group.links).map((link) => (
                    <li key={link.href}><Link to={link.href} onClick={onNavigate} className="block py-4 font-degular text-xl text-white/75 hover:text-yellow-400">{link.label}</Link></li>
                  ))}
                </ul>
              ) : activeItem.groups?.map((group) => {
                const collapsed = collapsedGroups.includes(group.title)
                return (
                  <section key={group.title} className="border-b border-white/10 py-1 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.title)}
                      className="flex w-full items-center justify-between py-3.5 text-left text-xs font-medium text-white/40 transition-colors hover:text-white"
                      aria-expanded={!collapsed}
                    >
                      <span>{group.title}</span>
                      <ChevronDown className={`size-3.5 stroke-[1.7] transition-transform ${collapsed ? "" : "rotate-180"}`} aria-hidden="true" />
                    </button>

                    <AnimatePresence initial={false}>
                      {!collapsed && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden pb-3"
                      >
                        {group.links.map((link) => (
                          <li key={`${link.label}-${link.href}`}>
                            <Link
                              to={link.href}
                              onClick={onNavigate}
                              className="block py-1.5 pl-3 font-degular text-xl text-white/75 transition-colors hover:text-yellow-400"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                      )}
                    </AnimatePresence>
                  </section>
                )
              })}
            </nav>
                </motion.div>
              ) : (
                <motion.div
                  key="main-menu"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-1 flex-col"
                >
            <motion.nav
              aria-label="Mobile navigation"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { delayChildren: 0.06, staggerChildren: 0.055 } },
              }}
              className="flex flex-col py-5 sm:py-7"
            >
              {items.map((item) => (
                <motion.div
                  key={item.label}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
                  }}
                >
                  {item.groups && item.groups.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => openSubmenu(item)}
                      className="group flex min-h-14 w-full items-center justify-between gap-4 border-b border-white/10 py-3 text-left font-degular text-2xl font-normal transition-colors hover:text-yellow-400"
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="size-4 shrink-0 stroke-[1.6] text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-yellow-400" aria-hidden="true" />
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={onNavigate}
                      className="group flex min-h-14 items-center justify-between gap-4 border-b border-white/10 py-3 font-degular text-2xl font-normal transition-colors hover:text-yellow-400"
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="size-4 shrink-0 stroke-[1.6] text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-yellow-400" aria-hidden="true" />
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.nav>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="mt-auto border-t border-white/10 py-6 sm:py-8"
            >
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[.2em] text-white/35">Visit our studio</p>
              <a
                href="https://share.google/Xmkh6TTsVpXAeyyId"
                target="_blank"
                rel="noreferrer"
                onClick={onNavigate}
                className="group flex items-center gap-4 py-2"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-yellow-400 transition-colors group-hover:border-yellow-400 group-hover:bg-yellow-400 group-hover:text-black">
                  <MapPin className="size-5 stroke-[1.6]" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-medium transition-colors group-hover:text-yellow-400">MR Home Studio</span>
                  <span className="mt-1 block text-xs text-white/45">Open location in Google Maps</span>
                </span>
                <ChevronRight className="ml-auto size-4 shrink-0 stroke-[1.6] text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-yellow-400" aria-hidden="true" />
              </a>
            </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
