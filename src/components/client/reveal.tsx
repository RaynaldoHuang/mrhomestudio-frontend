import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  onLoad?: boolean
  as?: "div" | "section" | "article" | "header" | "p" | "h1" | "h2" | "blockquote"
}

export function Reveal({ children, className, delay = 0, onLoad = false, as = "div" }: RevealProps) {
  const reduceMotion = useReducedMotion()
  const Element = motion[as]
  const visible = { opacity: 1, y: 0 }

  return (
    <Element
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={onLoad || reduceMotion ? visible : undefined}
      whileInView={onLoad || reduceMotion ? undefined : visible}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Element>
  )
}
