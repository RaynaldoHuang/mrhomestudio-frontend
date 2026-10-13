import { useLayoutEffect } from "react"
import { Outlet } from "react-router-dom"

import { Footer } from "@/components/client/footer"
import { Navbar } from "@/components/client/navbar"
import { BackToTop } from "@/components/client/back-to-top"

export function ClientLayout() {
  useLayoutEffect(() => {
    const htmlBackground = document.documentElement.style.backgroundColor
    const bodyBackground = document.body.style.backgroundColor

    document.documentElement.style.backgroundColor = "#000000"
    document.body.style.backgroundColor = "#000000"

    return () => {
      document.documentElement.style.backgroundColor = htmlBackground
      document.body.style.backgroundColor = bodyBackground
    }
  }, [])

  return (
    <div className="min-h-svh w-full bg-black font-neue-haas text-white [&_h1]:font-degular [&_h2]:font-degular [&_h3]:font-degular">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
