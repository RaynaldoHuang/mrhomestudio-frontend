import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"

import { Container } from "@/components/client/container"
import { getCategories } from "@/lib/category-api"
import { getPublicMegaMenus } from "@/lib/mega-menu-api"

import { footerCatalogLinks, type FooterLink } from "@/lib/footer-links"

const websiteLinks: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Shopping Cart", href: "/cart" },
]

export function Footer() {
  const { pathname } = useLocation()
  const [{ productLinks, categoryLinks }, setCatalogLinks] = useState(() => footerCatalogLinks([], []))

  useEffect(() => {
    let active = true
    let sequence = 0
    const refreshLinks = async () => {
      const request = ++sequence
      const [menus, categories] = await Promise.allSettled([getPublicMegaMenus(), getCategories()])
      if (!active || request !== sequence) return
      setCatalogLinks(footerCatalogLinks(
        menus.status === "fulfilled" ? menus.value : [],
        categories.status === "fulfilled" ? categories.value : [],
      ))
    }
    void refreshLinks()
    window.addEventListener("focus", refreshLinks)
    return () => {
      active = false
      window.removeEventListener("focus", refreshLinks)
    }
  }, [pathname])

  const footerGroups = [
    { title: "Website", links: websiteLinks },
    { title: "Products", links: productLinks },
    ...(categoryLinks.length > 0 ? [{ title: "Categories", links: categoryLinks }] : []),
  ]

  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <Container className="max-w-none px-8 pt-16 pb-8 sm:px-12 sm:pt-20 lg:px-16 lg:pt-24">
        <div className={`grid grid-cols-2 gap-x-8 gap-y-12 lg:gap-x-16 ${categoryLinks.length > 0 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={`${group.title} footer navigation`}>
              <h2 className="font-neue-haas text-xs font-normal uppercase text-white sm:text-sm">
                {group.title}
              </h2>

              <ul className="mt-8 space-y-2">
                {group.links.map((link) => (
                  <li key={`${link.href}:${link.label}`}>
                    <Link
                      to={link.href}
                      className="inline-block py-1 text-sm text-white/60 transition-colors hover:text-yellow-400 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-normal text-white">Medan, Indonesia</p>
            </div>

            <p className="text-xs text-white/45 sm:text-right sm:text-sm">
              Copyright ©{new Date().getFullYear()}, MR Home Audio. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
