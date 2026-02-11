import { useMemo } from 'react'
import { Icon } from '@iconify/react'

interface ImagePreviewListProps {
  images: File[]
  onRemove: (index: number) => void
}

function ImagePreviewItem({
  file,
  index,
  onRemove,
}: {
  file: File
  index: number
  onRemove: (index: number) => void
}) {
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file])

  return (
    <div className="group/preview relative">
      <img
        src={previewUrl}
        alt={file.name}
        className="h-16 w-16 rounded-lg object-cover"
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white opacity-0 transition-opacity group-hover/preview:opacity-100 dark:bg-zinc-100 dark:text-zinc-900"
        aria-label={`${file.name} 제거`}
      >
        <Icon icon="solar:close-circle-linear" width={14} />
      </button>
      <p className="mt-0.5 max-w-[64px] truncate text-[10px] text-zinc-500 dark:text-zinc-400">
        {file.name}
      </p>
    </div>
  )
}

function ImagePreviewList({ images, onRemove }: ImagePreviewListProps) {
  if (images.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto px-2 pb-2" role="list" aria-label="첨부 이미지 목록">
      {images.map((file, index) => (
        <ImagePreviewItem
          key={`${file.name}-${file.size}-${file.lastModified}`}
          file={file}
          index={index}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

export { ImagePreviewList }
