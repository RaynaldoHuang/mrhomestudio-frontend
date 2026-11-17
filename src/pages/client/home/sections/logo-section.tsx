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
    <section aria-label="Our audio brands" className="bg-black">
      <Container className="max-w-none px-6 py-9 sm:px-12 sm:py-11 lg:px-16">
        <ul className="grid grid-cols-2 items-center gap-x-10 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-16">
          {logos.map((logo) => (
            <li key={logo.id} className="flex h-12 min-w-0 items-center justify-center sm:h-14">
              <img
                src={logo.image_url}
                alt={logo.name}
                loading="lazy"
                decoding="async"
                className="max-h-10 max-w-full object-contain opacity-75 grayscale sm:max-h-12"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
