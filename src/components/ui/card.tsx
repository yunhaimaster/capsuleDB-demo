import * as React from "react"
import { useCallback, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, onMouseMove, onMouseLeave, onTouchMove, onTouchEnd, children, ...props }, ref) => {
  const localRef = useRef<HTMLDivElement | null>(null)

  const setRefs = (node: HTMLDivElement | null) => {
    localRef.current = node
    if (typeof ref === "function") {
      ref(node)
    } else if (ref) {
      ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    }
  }

  const updatePointer = (event: React.MouseEvent | React.TouchEvent) => {
    const target = localRef.current
    if (!target) return

    const rect = target.getBoundingClientRect()
    let clientX: number
    let clientY: number

    if ('clientX' in event && 'clientY' in event) {
      clientX = event.clientX
      clientY = event.clientY
    } else {
      const touchEvent = event as React.TouchEvent
      const touch = touchEvent.touches[0]
      clientX = touch.clientX
      clientY = touch.clientY
    }

    const xPercent = ((clientX - rect.left) / rect.width) * 100
    const yPercent = ((clientY - rect.top) / rect.height) * 100

    target.style.setProperty("--lg-pointer-x", `${xPercent}%`)
    target.style.setProperty("--lg-pointer-y", `${yPercent}%`)
  }

  const resetPointer = () => {
    const target = localRef.current
    if (!target) return
    target.style.setProperty("--lg-pointer-x", "50%")
    target.style.setProperty("--lg-pointer-y", "50%")
  }

  const computeLuminance = (color: string) => {
    const match = color.match(/rgba?\(([^)]+)\)/)
    if (!match) return null
    const parts = match[1]
      .split(",")
      .map((part) => parseFloat(part.trim()))
      .filter((value) => !Number.isNaN(value))

    if (parts.length < 3) return null
    const [r, g, b] = parts

    const channel = (value: number) => {
      const ratio = value / 255
      return ratio <= 0.03928 ? ratio / 12.92 : Math.pow((ratio + 0.055) / 1.055, 2.4)
    }

    const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
    return luminance
  }

  const detectBackgroundTone = useCallback(() => {
    const target = localRef.current
    if (!target) return

    const rect = target.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Temporarily disable pointer events to sample underlying element
    const previousPointerEvents = target.style.pointerEvents
    target.style.pointerEvents = "none"
    const elementBelow = document.elementFromPoint(centerX, centerY)
    target.style.pointerEvents = previousPointerEvents

    if (!elementBelow) {
      target.dataset.glassTone = "neutral"
      return
    }

    const styles = window.getComputedStyle(elementBelow)
    const backgroundColor = styles.backgroundColor || "rgba(255,255,255,1)"
    const luminance = computeLuminance(backgroundColor)

    if (luminance === null) {
      target.dataset.glassTone = "neutral"
      return
    }

    if (luminance >= 0.82) {
      target.dataset.glassTone = "light"
    } else if (luminance <= 0.28) {
      target.dataset.glassTone = "dark"
    } else {
      target.dataset.glassTone = "neutral"
    }
  }, [])

  useEffect(() => {
    resetPointer()
    if (localRef.current) {
      localRef.current.dataset.glassTone = "neutral"
    }
    detectBackgroundTone()

    const handleResize = () => detectBackgroundTone()
    const handleScroll = () => detectBackgroundTone()

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll, { passive: true })

    const observer = new ResizeObserver(() => detectBackgroundTone())
    if (localRef.current) {
      observer.observe(localRef.current)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={setRefs}
      onMouseMove={(event) => {
        updatePointer(event)
        onMouseMove?.(event)
      }}
      onMouseLeave={(event) => {
        resetPointer()
        onMouseLeave?.(event)
      }}
      onTouchMove={(event) => {
        updatePointer(event)
        if (localRef.current) {
          localRef.current.classList.add("is-touching")
        }
        onTouchMove?.(event)
      }}
      onTouchEnd={(event) => {
        resetPointer()
        if (localRef.current) {
          localRef.current.classList.remove("is-touching")
        }
        onTouchEnd?.(event)
      }}
      className={cn(
        "rounded-2xl border border-white/50 bg-white/60 text-[--brand-neutral] shadow-[0_24px_48px_rgba(24,66,96,0.08)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_32px_60px_rgba(24,66,96,0.12)]",
        "relative overflow-hidden touch-glow-surface",
        className
      )}
      {...props}
    >
      <span className="liquid-glass-caustic" aria-hidden="true" />
      {children}
    </div>
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-2 p-6 pb-4 text-[--brand-neutral]",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg md:text-xl font-semibold leading-tight tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 space-y-4", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
