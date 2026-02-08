import { useCallback, useRef } from 'react'
import { MAX_TEXTAREA_ROWS } from '@/lib/constants'

function useAutoResize() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
    const maxHeight = lineHeight * MAX_TEXTAREA_ROWS
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [])

  const reset = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
  }, [])

  return { textareaRef, resize, reset }
}

export { useAutoResize }
