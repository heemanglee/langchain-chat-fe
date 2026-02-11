import { useState, useCallback, useRef } from 'react'
import { Icon } from '@iconify/react'
import type { ImageSummary } from '@/types/chat'

interface MessageImagesProps {
  images: ImageSummary[]
}

function ImageItem({ img, isSingle }: { img: ImageSummary; isSingle: boolean }) {
  const [src, setSrc] = useState(img.thumbnail_url)
  const [hasError, setHasError] = useState(false)
  const triedOriginalRef = useRef(false)

  const handleError = useCallback(() => {
    if (!triedOriginalRef.current && img.thumbnail_url !== img.original_url) {
      triedOriginalRef.current = true
      setSrc(img.original_url)
    } else {
      setHasError(true)
    }
  }, [img.thumbnail_url, img.original_url])

  if (hasError) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800 ${
          isSingle ? 'max-w-xs' : ''
        }`}
      >
        <Icon icon="solar:file-text-bold" width={20} className="shrink-0 text-zinc-400" />
        <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {img.original_filename}
        </span>
      </div>
    )
  }

  return (
    <a
      href={img.original_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group/img block overflow-hidden rounded-lg"
    >
      <img
        src={src}
        alt={img.original_filename}
        {...(img.width > 0 && img.height > 0
          ? { width: img.width, height: img.height }
          : {})}
        onError={handleError}
        className={`rounded-lg object-cover transition-opacity group-hover/img:opacity-90 ${
          isSingle ? 'max-w-xs' : 'aspect-square w-full'
        }`}
      />
    </a>
  )
}

function MessageImages({ images }: MessageImagesProps) {
  const isSingle = images.length === 1

  return (
    <div
      className={
        isSingle
          ? 'mt-2'
          : 'mt-2 grid max-w-sm grid-cols-2 gap-2'
      }
    >
      {images.map((img) => (
        <ImageItem key={img.id} img={img} isSingle={isSingle} />
      ))}
    </div>
  )
}

export { MessageImages }
