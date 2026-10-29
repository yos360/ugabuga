import { useEffect, useRef, useState } from 'react'
import { videoEmbed, videoThumb } from '../../data/videos'

// A light YouTube player: only the thumbnail and a play button until the visitor clicks, then the
// real (privacy-enhanced, youtube-nocookie) iframe. Keeps YouTube's ~1 MB of scripts and its
// cookies off every page that merely shows a video. The box has a fixed aspect ratio, so swapping
// in the iframe never moves the page.
export default function VideoFacade({ video, className = '' }) {
  const [playing, setPlaying] = useState(false)
  const frame = useRef(null)
  useEffect(() => { if (playing) frame.current?.focus() }, [playing])
  const short = video.kind === 'short'
  const box = short ? 'mx-auto w-full max-w-[320px] aspect-[9/16]' : 'w-full aspect-video'
  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-black ${box} ${className}`}>
      {playing ? (
        <iframe ref={frame} src={videoEmbed(video.id)} title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="absolute inset-0 h-full w-full border-0" />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`הפעלת הסרטון: ${video.title}`}
          className="group absolute inset-0 block h-full w-full cursor-pointer text-right focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-amber-400">
          <img src={videoThumb(video.id)} alt="" width="480" height="360" loading="lazy" decoding="async"
            className="absolute inset-0 h-full w-full object-cover" />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-black/0" />
          <span aria-hidden="true" className="absolute left-1/2 top-1/2 grid h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-red-600 text-white shadow-lg ring-4 ring-white/80 transition-transform group-hover:scale-110">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 p-3 text-base font-bold leading-snug text-white" dir="rtl">{video.title}</span>
        </button>
      )}
    </div>
  )
}
