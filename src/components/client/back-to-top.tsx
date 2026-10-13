import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

export function BackToTop() {
  const [visible, setVisible] = useState(() => window.scrollY > 400)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          type="button"
          aria-label="Back to top"
          title="Back to top"
          onClick={backToTop}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
          whileHover={reduceMotion ? undefined : { y: -3 }}
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          className="fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 flex size-12 items-center justify-center rounded-full border border-yellow-400/50 bg-yellow-400 text-black shadow-lg transition-colors hover:bg-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400 sm:right-8 sm:size-13"
        >
          <ArrowUp className="size-5" strokeWidth={1.5} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
