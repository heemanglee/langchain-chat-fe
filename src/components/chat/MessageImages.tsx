import type { ImageSummary } from '@/types/chat'

interface MessageImagesProps {
  images: ImageSummary[]
}

function MessageImages({ images }: MessageImagesProps) {
  const isSingle = images.length === 1

  return (
    <div
      className={
        isSingle
          ? 'mt-2'
          : 'mt-2 grid grid-cols-2 gap-2'
      }
    >
      {images.map((img) => (
        <a
          key={img.id}
          href={img.original_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/img block overflow-hidden rounded-lg"
        >
          <img
            src={img.thumbnail_url}
            alt={img.original_filename}
            width={img.width}
            height={img.height}
            loading="lazy"
            className={`rounded-lg object-cover transition-opacity group-hover/img:opacity-90 ${
              isSingle ? 'max-w-xs' : 'aspect-square w-full'
            }`}
          />
        </a>
      ))}
    </div>
  )
}

export { MessageImages }
