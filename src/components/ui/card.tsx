import * as React from "react"
import { useCallback, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "default" | "positive" | "caution" | "negative" | "neutral"
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>((
  {
    className,
    tone = "default",
    interactive = true,
    onMouseMove,
    onMouseLeave,
    onTouchMove,
    onTouchEnd,
    children,
    ...props
  },
  ref
) => {
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
    if (!interactive) return
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

    const attemptColors: string[] = []
    const elementStack: Element[] = []

    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    const previousPointerEvents = target.style.pointerEvents
    target.style.pointerEvents = "none"

    let elementBelow = document.elementFromPoint(centerX, centerY)
    while (elementBelow && elementBelow !== document.body && elementStack.length < 4) {
      elementStack.push(elementBelow)
      elementBelow = elementBelow.parentElement
    }

    target.style.pointerEvents = previousPointerEvents

    for (const element of elementStack) {
      const styles = window.getComputedStyle(element)
      const bg = styles.backgroundColor || ""
      if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
        attemptColors.push(bg)
      }
    }

    if (!attemptColors.length) {
      target.dataset.glassTone = "neutral"
      return
    }

    const validLuminances = attemptColors
      .map((color) => computeLuminance(color))
      .filter((value): value is number => value !== null)

    if (!validLuminances.length) {
      target.dataset.glassTone = "neutral"
      return
    }

    const luminance = validLuminances[validLuminances.length - 1]

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
  }, [detectBackgroundTone])

  const handleMouseMove = (event: React.MouseEvent) => {
    if (interactive) updatePointer(event)
    onMouseMove?.(event)
  }

  const handleMouseLeave = (event: React.MouseEvent) => {
    if (interactive) resetPointer()
    onMouseLeave?.(event)
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    if (interactive) {
      updatePointer(event)
      if (localRef.current) {
        localRef.current.classList.add("is-touching")
      }
    }
    onTouchMove?.(event)
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (interactive) {
      resetPointer()
      if (localRef.current) {
        localRef.current.classList.remove("is-touching")
      }
    }
    onTouchEnd?.(event)
  }

  return (
    <div
      ref={setRefs}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "rounded-2xl border border-white/50 bg-white/60 text-[--brand-neutral] shadow-[0_24px_48px_rgba(24,66,96,0.08)] backdrop-blur-xl",
        "relative overflow-hidden touch-glow-surface",
        tone !== "default" && `liquid-glass-tone-${tone}`,
        interactive ? "liquid-glass-interactive" : "liquid-glass-static",
        className
      )}
      {...props}
    >
      {interactive && <span className="liquid-glass-caustic" aria-hidden="true" />}
      {interactive && <span className="liquid-glass-ripple" aria-hidden="true" />}
      {children}
    </div>
  )
})
Card.displayName = "Card"

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
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
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0", className)}
    {...props}
  />
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
