import React, { useEffect, useRef } from "react"
import { useTheme } from "@/context/theme-context"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  baseRadius: number
  color: string
  alpha: number
}

export interface NeuralFlowFieldProps {
  className?: string
  particleCount?: number
}

export const NeuralFlowField: React.FC<NeuralFlowFieldProps> = ({
  className = "",
  particleCount = 65,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    const isDark = theme === "dark"
    const BRAND_COLOR = "244, 42, 24" // #F42A18
    const NEUTRAL_COLOR = isDark ? "255, 255, 255" : "40, 40, 40"

    const getDimensions = () => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width || canvas.parentElement?.clientWidth || window.innerWidth
      const h = rect.height || canvas.parentElement?.clientHeight || 600
      return { w, h }
    }

    let { w: width, h: height } = getDimensions()
    canvas.width = width
    canvas.height = height

    const actualParticleCount = Math.min(
      particleCount,
      Math.max(40, Math.floor((width * height) / 10000))
    )

    const particles: Particle[] = []

    for (let i = 0; i < actualParticleCount; i++) {
      const isBrand = Math.random() < 0.4 // 40% brand red particles
      const color = isBrand ? BRAND_COLOR : NEUTRAL_COLOR
      const radius = Math.random() * 2.2 + 1.8 // 1.8px - 4px radius
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.65,
        vy: (Math.random() - 0.5) * 0.65,
        radius,
        baseRadius: radius,
        color,
        alpha: Math.random() * 0.4 + 0.5, // 0.5 - 0.9 alpha
      })
    }

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 160,
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    const handleResize = () => {
      if (!canvas) return
      const dims = getDimensions()
      width = canvas.width = dims.w
      height = canvas.height = dims.h
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.addEventListener("mouseleave", handleMouseLeave)

    const MAX_DISTANCE = 135

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Update & Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Move
        p.x += p.vx
        p.y += p.vy

        // Wrap around bounds
        if (p.x < 0) p.x = width
        else if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        else if (p.y > height) p.y = 0

        // Mouse interaction (gentle repulsion/attraction)
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const distToMouse = Math.hypot(dx, dy)

        if (distToMouse < mouse.radius && distToMouse > 0) {
          const force = (1 - distToMouse / mouse.radius) * 1.8
          p.x -= (dx / distToMouse) * force
          p.y -= (dy / distToMouse) * force
          p.radius = p.baseRadius * (1 + force * 0.7)
        } else {
          p.radius += (p.baseRadius - p.radius) * 0.05
        }

        // Draw particle node
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`
        ctx.shadowBlur = p.color === BRAND_COLOR ? 12 : 5
        ctx.shadowColor = `rgba(${p.color}, 0.6)`
        ctx.fill()
        ctx.shadowBlur = 0 // reset shadow

        // Draw neural connections to neighboring particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y)

          if (dist < MAX_DISTANCE) {
            const lineAlpha = (1 - dist / MAX_DISTANCE) * 0.35
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)

            const strokeColor =
              p.color === BRAND_COLOR || p2.color === BRAND_COLOR
                ? BRAND_COLOR
                : NEUTRAL_COLOR
            ctx.strokeStyle = `rgba(${strokeColor}, ${lineAlpha})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }

        // Connect particles near mouse cursor
        if (distToMouse < mouse.radius) {
          const mouseLineAlpha = (1 - distToMouse / mouse.radius) * 0.45
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.strokeStyle = `rgba(${BRAND_COLOR}, ${mouseLineAlpha})`
          ctx.lineWidth = 1.2
          ctx.stroke()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [theme, particleCount])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 block h-full w-full ${className}`}
    />
  )
}
