import { useEffect, useState } from "react"

import { Container } from "@/components/client/container"
import { getPublicHomeLogos, type HomeLogo } from "@/lib/home-logo-api"

export function LogoSection() {
  const [logos, setLogos] = useState<HomeLogo[]>([])

  useEffect(() => {
    let active = true
    getPublicHomeLogos()
      .then((items) => { if (active) setLogos(items) })
      .catch(() => { /* Keep the homepage usable when logo content is unavailable. */ })
    return () => { active = false }
  }, [])

  if (logos.length === 0) return null

  return (
    <section aria-label="Our audio brands" className="flex min-h-48 items-center bg-black py-12 sm:min-h-56">
      <Container className="max-w-none px-6 sm:px-12 lg:px-16">
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 lg:gap-x-16">
          {logos.map((logo) => (
            <li key={logo.id} className="flex h-12 w-32 items-center justify-center sm:h-14 sm:w-40 lg:w-48">
              <img
                src={logo.image_url}
                alt={logo.name}
                loading="lazy"
                decoding="async"
                className="max-h-10 max-w-full object-contain grayscale-100 sm:max-h-12"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
