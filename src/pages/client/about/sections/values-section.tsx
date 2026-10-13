import { Container } from "@/components/client/container"
import { AboutReveal } from "../about-reveal"

export function ValuesSection() {
  return (
    <>
      <section className="bg-yellow-400 py-20 text-black sm:py-28 lg:py-32">
        <Container className="max-w-none px-6 sm:px-10 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-24">
            <p className="text-xs uppercase tracking-[.22em]">Musical cohesion</p>
            <AboutReveal className="flex max-w-5xl flex-col gap-8">
              <h2 className="font-degular text-title sm:text-6xl lg:text-7xl">The connection between music, emotion, and storytelling.</h2>
              <p className="max-w-2xl text-lg leading-8 text-black/65">In advertising, the soundtrack helps shape how viewers experience the message. It can strengthen emotional impact, create a lasting impression, and influence how an audience perceives a brand. We believe that connection matters.</p>
            </AboutReveal>
          </div>
        </Container>
      </section>

      <section className="bg-stone-100 py-20 text-black sm:py-28 lg:py-36">
        <Container className="max-w-none px-6 sm:px-10 lg:px-16">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
            <AboutReveal className="flex flex-col gap-7">
              <p className="text-xs uppercase tracking-[.22em] text-yellow-700">Why we created this platform</p>
              <h2 className="font-degular text-title sm:text-6xl lg:text-7xl sm:leading-20">Finding music is easy. Finding music that belongs is not.</h2>
            </AboutReveal>
            <AboutReveal className="flex flex-col gap-7 text-base leading-7 text-black/65 lg:pt-14">
              <p>This platform was created to offer background tracks designed with the content itself in mind. Rather than simply adding music behind a video, we want the soundtrack to feel like part of the story.</p>
              <div className="border-y border-black/15 py-4 font-degular text-3xl leading-tight text-black sm:text-4xl">
                <p>Music that follows the emotion.</p>
                <p>Music that supports the message.</p>
                <p>Music that gives your work its own identity.</p>
              </div>
              <p>Whether for an advertisement, brand campaign, film, social content, digital product, presentation, or creative project, our goal is simple: to create music that makes your content feel complete.</p>
            </AboutReveal>
          </div>

        </Container>
      </section>
    </>
  )
}
