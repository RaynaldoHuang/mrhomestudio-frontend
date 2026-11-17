import { useState } from "react"
import { ArrowUpRight, Play } from "lucide-react"

import { Container } from "@/components/client/container"

const videoId = "k6Z-_-3gO8I"
const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

export function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [thumbnail, setThumbnail] = useState(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`)

  return (
    <section aria-labelledby="featured-video-title" className="bg-black pt-8 pb-2 text-white sm:py-10 lg:py-12">
      <Container className="font-neue-haas max-w-none px-5 sm:px-12 lg:px-16">
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <p className="mb-4 text-xs tracking-[0.2em] text-yellow-400 uppercase">
            Watch & discover
          </p>
          <h2
            id="featured-video-title"
            className="font-degular max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Experience sound, up close.
          </h2>
        </div>
        <div className="relative aspect-video overflow-hidden bg-neutral-900">
          {isPlaying ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
              title="MR Homme Audio featured video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              aria-label="Play MR Homme Audio featured video"
              className="group absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-yellow-400"
            >
              <img
                src={thumbnail}
                alt="Video thumbnail — play to watch"
                loading="lazy"
                width={1280}
                height={720}
                onError={() => {
                  const fallback = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                  if (thumbnail !== fallback) setThumbnail(fallback)
                }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.025]"
              />
              <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
              <span className="relative flex size-16 items-center justify-center rounded-full bg-yellow-400 text-black shadow-lg transition-transform duration-300 motion-safe:group-hover:scale-110 sm:size-20">
                <Play className="ml-1 size-6 fill-current sm:size-7" aria-hidden="true" />
              </span>
              <span className="absolute bottom-4 left-4 text-xs tracking-[0.16em] text-white uppercase sm:bottom-6 sm:left-6">
                Watch the film
              </span>
            </button>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 text-xs text-white/65 transition-colors hover:text-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
          >
            Watch on YouTube
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </Container>
    </section>
  )
}
