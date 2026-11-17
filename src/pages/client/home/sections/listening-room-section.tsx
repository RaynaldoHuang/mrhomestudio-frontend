import {
  ArrowUpRight,
  AudioLines,
  Check,
  ChevronDown,
  Disc3,
  Headphones,
  Camera,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Sofa,
  Users,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { Container } from "@/components/client/container"

const packages = [
  { hours: "1", price: "400.000", description: "A moment to discover.", label: "A first listen" },
  { hours: "4", price: "1.500.000", description: "Take time with your favourites.", label: "Stay a little longer" },
  { hours: "8", price: "2.800.000", description: "A whole day, at your own pace.", label: "A day of listening" },
]

const inclusions = [
  { icon: Headphones, title: "Exclusive high-end space", description: "A private space dedicated to listening." },
  { icon: AudioLines, title: "Flagship audio system", description: "Experience every detail of your music." },
  { icon: Disc3, title: "Multiple playback options", description: "Listen on vinyl, CD or a digital source." },
  { icon: Users, title: "Your session, your way", description: "Staff-assisted listening or self-service." },
  { icon: Sofa, title: "Comfort in every detail", description: "Comfortable seating and ambient lighting." },
  { icon: Music2, title: "Bring your own music", description: "Enjoy your favourite records and playlists." },
]

const termGroups = [
  {
    title: "Booking & payment",
    terms: [
      "Advance booking with a 70% deposit is required.",
      "Cancellation for full payment is less than 48 hours (deposit non-refundable).",
      "Overtime is charged at Rp 400.000 per hour.",
    ],
  },
  {
    title: "During your visit",
    terms: [
      "Maximum 3 guests. No food, drinks, smoking or alcohol.",
      "Guests may bring vinyl, CDs or a digital source with prior notice.",
      "No tampering with equipment. Guests are responsible for any damage.",
      "We are not liable for lost items, accidents or misuse.",
    ],
  },
  {
    title: "Photos & special arrangements",
    terms: [
      "Non-commercial personal photography is allowed.",
      "Professional recording requires approval.",
      "Private events are available by special arrangement.",
    ],
  },
]

const whatsappUrl = "https://wa.me/6281273516346"
const focusStyle = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"

function bookingUrl(hours?: string) {
  const message = hours
    ? `Hello MR Homme Audio, I would like to check availability for a ${hours}-hour Listening Room Rental.`
    : "Hello MR Homme Audio, I would like to enquire about Listening Room Rental."
  return `${whatsappUrl}?text=${encodeURIComponent(message)}`
}

export function ListeningRoomSection() {
  const reduceMotion = useReducedMotion()
  const reveal = (delay = 0, distance = 24) => ({
    initial: reduceMotion ? false as const : { opacity: 0, y: distance },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: reduceMotion ? 0 : 0.75, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
  })

  return (
    <section id="listening-room" aria-labelledby="listening-room-title" className="bg-black pt-8 pb-8 text-white sm:pt-24 sm:pb-10 lg:pt-28 lg:pb-12">
      <Container className="font-neue-haas max-w-none px-5 sm:px-12 lg:px-16">
        <div className="flex flex-col justify-between gap-8 border-b border-white/15 pb-10 lg:flex-row lg:items-end lg:gap-16 lg:pb-12">
          <div>
            <motion.p {...reveal()} className="mb-5 text-xs tracking-[0.2em] text-yellow-400 uppercase">
              The private listening experience
            </motion.p>
            <motion.h2
              id="listening-room-title"
              initial={reduceMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ staggerChildren: reduceMotion ? 0 : 0.12 }}
              className="font-degular text-5xl leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
            >
              {["Listening", "Room", "Rental."].map((word, index) => (
                <span key={word} className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
                  <motion.span
                    className={`inline-block ${index === 2 ? "text-yellow-400" : ""}`}
                    variants={{ hidden: { y: "110%" }, visible: { y: 0 } }}
                    transition={{ duration: reduceMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {word}
                  </motion.span>
                  {index < 2 ? "\u00a0" : null}
                </span>
              ))}
            </motion.h2>
            <motion.p {...reveal(0.2)} className="mt-5 max-w-lg text-base leading-7 text-white/60">
              Your favourite music. An exceptional sound system. A space to slow down and simply listen.
            </motion.p>
          </div>
          <motion.div {...reveal(0.25)} className="flex shrink-0 flex-col items-start gap-4">
            <a href={bookingUrl()} target="_blank" rel="noopener noreferrer" className={`group inline-flex min-h-12 items-center justify-center gap-8 rounded-full bg-yellow-400 px-6 py-3 text-sm font-medium text-black transition-[background-color,transform,box-shadow] duration-300 hover:bg-yellow-300 motion-safe:hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(250,204,21,0.18)] ${focusStyle}`}>
              Reserve your session <ArrowUpRight className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" aria-hidden="true" />
            </a>
            <p className="flex items-center gap-2 text-xs text-white/55"><Users className="size-3.5" aria-hidden="true" /> Private sessions · Up to 3 guests</p>
          </motion.div>
        </div>

        <div className="pt-10 sm:pt-12">
          <motion.div {...reveal()} className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-lg">Choose your listening time</h3>
            <p className="text-xs text-white/55">All prices in Indonesian Rupiah</p>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((option, index) => (
              <motion.article
                key={option.hours}
                {...reveal(index * 0.12, 36)}
                whileHover={reduceMotion ? undefined : { y: -6, transition: { duration: 0.25, delay: 0 } }}
                className="group flex flex-col border border-white/15 bg-white/[0.025] p-6 transition-[border-color,background-color,box-shadow] duration-300 hover:border-yellow-400/60 hover:bg-yellow-400/[0.035] hover:shadow-[0_16px_48px_rgba(250,204,21,0.05)] focus-within:border-yellow-400/60 sm:p-8"
              >
                <p className="text-[11px] tracking-[0.16em] text-white/55 uppercase">{option.label}</p>
                <h4 className="font-degular mt-6 flex items-baseline gap-2 text-6xl leading-none sm:text-7xl">
                  {option.hours}<span className="font-neue-haas text-lg text-white/65">{option.hours === "1" ? "hour" : "hours"}</span>
                </h4>
                <p className="mt-3 text-sm leading-6 text-white/55">{option.description}</p>
                <p className="mt-8 flex flex-wrap items-baseline gap-2 border-t border-white/10 pt-6">
                  <span className="text-sm text-yellow-400">Rp</span>
                  <span className="text-3xl tracking-tight text-yellow-400 tabular-nums lg:text-4xl">{option.price}</span>
                  <span className="text-xs text-white/45">/ session</span>
                </p>
                <a href={bookingUrl(option.hours)} target="_blank" rel="noopener noreferrer" aria-label={`Enquire about the ${option.hours}-hour listening session on WhatsApp`} className={`mt-6 flex min-h-11 items-center justify-between gap-3 border-b border-white/20 py-2 text-sm transition-colors hover:border-yellow-400 hover:text-yellow-400 ${focusStyle}`}>
                  Enquire about this session <ArrowUpRight className="size-4 shrink-0 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" aria-hidden="true" />
                </a>
              </motion.article>
            ))}
          </div>
          <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-white/55"><Check className="mt-0.5 size-3.5 shrink-0 text-yellow-400" aria-hidden="true" /> Advance booking required with a 70% deposit. Overtime: Rp 400.000 / hour.</p>
        </div>

        <div className="mt-12 grid gap-8 border-t border-white/15 py-10 sm:mt-16 sm:py-12 lg:grid-cols-[1fr_3fr] lg:gap-16">
          <motion.div {...reveal()}>
            <p className="mb-3 text-[11px] tracking-[0.18em] text-yellow-400 uppercase">Included in every session</p>
            <h3 className="font-degular text-3xl leading-tight sm:text-4xl">Settle in.<br />Tune everything else out.</h3>
          </motion.div>
          <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
            {inclusions.map(({ icon: Icon, title, description }, index) => (
              <motion.li key={title} {...reveal((index % 3) * 0.08)}>
                <Icon className="mb-4 size-5 text-yellow-400" strokeWidth={1.5} aria-hidden="true" />
                <h4 className="text-sm">{title}</h4>
                <p className="mt-2 max-w-64 text-sm leading-6 text-white/55">{description}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        <details className="group border-y border-white/15">
          <summary className={`flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 py-5 [&::-webkit-details-marker]:hidden ${focusStyle}`}>
            <span><span className="block text-lg">Terms & conditions</span><span className="mt-1 block text-xs leading-5 text-white/55">A few things to know before your visit</span></span>
            <ChevronDown className="size-5 shrink-0 text-white/60 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="grid gap-8 pb-8 pt-3 md:grid-cols-3 md:gap-10">
            {termGroups.map((group) => (
              <div key={group.title}>
                <h4 className="mb-4 text-sm text-yellow-400">{group.title}</h4>
                <ul className="list-disc space-y-3 pl-4 text-sm leading-6 text-white/65 marker:text-white/30">
                  {group.terms.map((term) => <li key={term}>{term}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </details>

        <div className="mt-8 flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
          <a href="https://www.google.com/maps/search/?api=1&query=Jl.+Duta+Permai+Malibu+Blok+C96+Medan+Polonia" target="_blank" rel="noopener noreferrer" className={`flex items-start gap-3 text-sm leading-6 text-white/60 transition-colors hover:text-yellow-400 ${focusStyle}`}>
            <MapPin className="mt-1 size-4 shrink-0 text-yellow-400" aria-hidden="true" />
            <span>Jl. Duta Permai Malibu Blok C96<span className="block text-xs text-white/45">Medan Polonia</span></span>
          </a>
          <div className="flex flex-col gap-x-6 gap-y-4 text-sm text-white/65 sm:flex-row sm:flex-wrap">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-6 items-center gap-2 transition-colors hover:text-yellow-400 ${focusStyle}`}><MessageCircle className="size-4 shrink-0" aria-hidden="true" />0812 7351 6346</a>
            <a href="https://www.instagram.com/mrhommeaudio/" target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-6 items-center gap-2 transition-colors hover:text-yellow-400 ${focusStyle}`}><Camera className="size-4 shrink-0" aria-hidden="true" />mrhommeaudio</a>
            <a href="mailto:toko.mrhaudio@gmail.com" className={`inline-flex min-h-6 items-center gap-2 transition-colors hover:text-yellow-400 ${focusStyle}`}><Mail className="size-4 shrink-0" aria-hidden="true" />toko.mrhaudio@gmail.com</a>
          </div>
        </div>
      </Container>
    </section>
  )
}
