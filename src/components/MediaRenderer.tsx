import type { Media } from '../data/topics'

export function MediaRenderer({ media }: { media: Media }) {
  return <figure className={`content-media content-media-${media.type}`}>
    <img alt={media.alt} src={media.src} />
    {(media.caption || media.source) && <figcaption>{media.caption && <span>{media.caption}</span>}{media.source && <cite>Source: {media.source}</cite>}</figcaption>}
  </figure>
}
