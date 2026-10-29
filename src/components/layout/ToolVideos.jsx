import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import VideoFacade from '../ui/VideoFacade'
import { videosForPath, videoSchema } from '../../data/videos'

// "How it works" video(s) under a tool page (src/data/videos.js decides which pages). Lazy-loaded by
// Layout only when the page has a video; prerendering waits for it, so the VideoObject data below
// is part of the page's static HTML.
export default function ToolVideos({ pathname }) {
  const videos = videosForPath(pathname)
  if (!videos.length) return null
  const allShort = videos.every(v => v.kind === 'short')
  return (
    <section className="no-print no-present mx-auto my-10 max-w-4xl px-4" dir="rtl" aria-labelledby="tool-videos-h">
      <Helmet>
        {videos.map(v => <script key={v.id} type="application/ld+json">{JSON.stringify(videoSchema(v))}</script>)}
      </Helmet>
      <div className="rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-4 sm:p-6">
        <h2 id="tool-videos-h" className="mb-4 text-center text-2xl font-bold">🎬 איך זה עובד — {allShort ? 'סרטון קצר' : 'סרטון הדרכה'}</h2>
        <div className={videos.length > 1 ? `grid gap-6 ${allShort ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}` : ''}>
          {videos.map(v => <figure key={v.id} className={!allShort || videos.length > 1 ? '' : 'mx-auto max-w-[320px]'}>
            <VideoFacade video={v} />
            <figcaption className="mt-2 text-center text-base text-[var(--muted-foreground)]">{v.desc}</figcaption>
          </figure>)}
        </div>
        <p className="mt-4 text-center">
          <Link to="/videos" className="inline-flex min-h-[44px] items-center rounded-full border-2 border-[var(--border)] bg-white px-4 font-bold hover:bg-[var(--muted)]">כל הסרטונים של עוגה בוגה ←</Link>
        </p>
      </div>
    </section>
  )
}
