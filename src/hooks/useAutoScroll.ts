import { useCallback, useEffect, useRef, useState } from 'react'

function useAutoScroll(dependencies: unknown[]) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [])

  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const threshold = 50
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight
    setIsAtBottom(distanceFromBottom <= threshold)
  }, [])

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return { containerRef, isAtBottom, scrollToBottom, handleScroll }
}

export { useAutoScroll }
