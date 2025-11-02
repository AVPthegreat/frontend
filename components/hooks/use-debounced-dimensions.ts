"use client"

import { useEffect, useState } from "react"

interface Dimensions {
  width: number
  height: number
}

export function useDimensions(ref: React.RefObject<HTMLElement>, debounceMs = 100): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 })

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    let timeoutId: NodeJS.Timeout

    const updateDimensions = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setDimensions({
          width: element.offsetWidth,
          height: element.offsetHeight,
        })
      }, debounceMs)
    }

    // Initial measurement
    updateDimensions()

    // Observe size changes
    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(element)

    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
    }
  }, [ref, debounceMs])

  return dimensions
}
