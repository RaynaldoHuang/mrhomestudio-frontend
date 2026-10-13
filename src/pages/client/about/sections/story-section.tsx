import { Film, Music2, Sparkles } from "lucide-react"

import composerPortrait from "@/assets/img/mh.webp"
import { Container } from "@/components/client/container"
import { AboutReveal } from "../about-reveal"

export function StorySection() {
  return (
    <>
      <section id="our-story" tabIndex={-1} className="scroll-mt-20 bg-neutral-950 py-20 text-white outline-none sm:py-28 lg:scroll-mt-18 lg:py-36">
        <Container className="max-w-none px-6 sm:px-10 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[.65fr_1.35fr] lg:gap-24">
            <p className="text-xs uppercase tracking-[.15em] text-yellow-400">Our belief</p>
            <AboutReveal className="flex max-w-5xl flex-col gap-8">
              <h2 className="font-degular text-title sm:text-6xl lg:text-7xl sm:leading-none">
                Music is more than something we hear.
              </h2>
              <div className="grid gap-7 text-base leading-6 text-white/60 sm:grid-cols-2">
                <p>It creates emotion, builds atmosphere, strengthens a message, and turns a moment into something people remember.</p>
                <p>That belief inspired us to create a platform dedicated to original background music crafted to complement your content, not simply sit behind it.</p>
              </div>
            </AboutReveal>
          </div>
        </Container>
      </section>

      <section className="bg-yellow-400 py-20 text-black sm:py-28 lg:py-36">
        <Container className="max-w-none px-6 sm:px-10 lg:px-16">
          <div className="grid items-start gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-16 xl:gap-20">
            <figure className="w-full max-w-[38rem] lg:sticky lg:top-24 lg:justify-self-center">
              <AboutReveal className="aspect-[4/5] overflow-hidden bg-black">
                <img src={composerPortrait} alt="Vincent Jogia" className="h-full w-full object-cover" />
              </AboutReveal>
            </figure>

            <div className="flex min-w-0 flex-col gap-10">
              <AboutReveal className="flex flex-col gap-4">
                <p className="text-xs uppercase tracking-[.15em] text-black/55">Our Composer</p>
                <h2 className="font-degular text-title sm:text-7xl sm:leading-none">Vincent Jogia</h2>
              </AboutReveal>

              <AboutReveal as="blockquote" className="border-l-2 border-black pl-6 font-degular text-3xl leading-normal sm:pl-8 sm:text-2xl">
                “I have always believed that music plays an important role in our lives. It is a universal language that brings people together. In my case, music has shaped me into who I am today.”
              </AboutReveal>

              <AboutReveal className="flex flex-col gap-6 text-base leading-8 text-black/65">
                <p>Vincent’s journey with music began at an early age. He started learning the piano as a child, developing a natural curiosity for melody, harmony, and the emotions music could create. After graduating from high school, he chose to pursue his passion professionally at one of Taiwan’s renowned art schools. During this period, his interest evolved beyond simply playing an instrument.</p>
              </AboutReveal>

              <AboutReveal className="bg-black p-8 text-white sm:p-9">
                <p className="text-xs uppercase tracking-[.22em] text-yellow-400">A deeper passion</p>
                <p className="mt-5 font-degular text-title sm:text-4xl sm:leading-none">Creating music for stories.</p>
                <p className="mt-6 max-w-2xl leading-6 text-white/60">From films and advertisements to digital products and visual content, Vincent became fascinated by the relationship between sound and imagery—and how the right composition could completely transform how a piece of content feels.</p>
              </AboutReveal>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-black py-20 text-white sm:py-28 lg:py-36">
        <Container className="max-w-none px-6 sm:px-10 lg:px-16">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <AboutReveal className="flex flex-col gap-8">
              <p className="text-xs uppercase tracking-[.22em] text-yellow-400">When great content needs the right sound</p>
              <h2 className="font-degular text-title sm:text-6xl lg:text-7xl sm:leading-18">Great visuals do not always create a complete experience.</h2>
            </AboutReveal>
            <AboutReveal className="flex flex-col gap-8 text-base leading-8 text-white/60 lg:pt-16">
              <p>Over the years, Vincent often found himself watching beautifully produced videos, advertisements, and digital experiences and thinking:</p>
              <p className="font-degular text-3xl leading-tight text-white sm:text-4xl">“What brilliant content. If only the background music felt just as right.”</p>
              <p>Music gives content its emotional identity. A powerful soundtrack can build anticipation, create excitement, communicate warmth, or turn a simple visual into something unforgettable.</p>
            </AboutReveal>
          </div>

          <div className="mt-16 grid gap-px bg-white/15 sm:grid-cols-3 lg:mt-24">
            {[
              { icon: Film, title: "Shape the message", text: "The right score changes how an audience experiences a story." },
              { icon: Sparkles, title: "Build emotion", text: "Sound creates anticipation, warmth, energy, and lasting impact." },
              { icon: Music2, title: "Create identity", text: "A distinct composition helps a brand or project feel unmistakably its own." },
            ].map(({ icon: Icon, title, text }, index) => (
              <AboutReveal delay={index * 0.1} key={title} className="flex flex-col gap-8 bg-black p-7 sm:p-9 lg:p-11">
                <Icon className="size-7 text-yellow-400" strokeWidth={1.4} />
                <div className="flex flex-col gap-3"><h3 className="text-lg font-medium">{title}</h3><p className="text-sm leading-7 text-white/50">{text}</p></div>
              </AboutReveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
