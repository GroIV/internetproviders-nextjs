'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

// Color palette for shifting mode (HSL values)
const COLOR_PALETTE = [
  { h: 180, s: 100, l: 43 }, // Cyan
  { h: 217, s: 91, l: 60 },  // Blue
  { h: 262, s: 83, l: 58 },  // Purple
]

// Interpolate between two HSL colors
function lerpHSL(
  color1: { h: number; s: number; l: number },
  color2: { h: number; s: number; l: number },
  t: number
): { h: number; s: number; l: number } {
  // Handle hue wrapping for smooth transitions
  let h1 = color1.h
  let h2 = color2.h
  const diff = h2 - h1

  if (Math.abs(diff) > 180) {
    if (diff > 0) {
      h1 += 360
    } else {
      h2 += 360
    }
  }

  return {
    h: ((h1 + (h2 - h1) * t) % 360 + 360) % 360,
    s: color1.s + (color2.s - color1.s) * t,
    l: color1.l + (color2.l - color1.l) * t,
  }
}

// Get current color based on time for shifting mode
function getShiftingColor(timeMs: number, cycleDuration: number = 30000): string {
  const progress = (timeMs % cycleDuration) / cycleDuration
  const numColors = COLOR_PALETTE.length
  const scaledProgress = progress * numColors
  const colorIndex = Math.floor(scaledProgress)
  const t = scaledProgress - colorIndex

  const currentColor = COLOR_PALETTE[colorIndex % numColors]
  const nextColor = COLOR_PALETTE[(colorIndex + 1) % numColors]
  const interpolated = lerpHSL(currentColor, nextColor, t)

  return `${Math.round(interpolated.h)}, ${Math.round(interpolated.s)}%, ${Math.round(interpolated.l)}%`
}

type ColorMode = 'static' | 'shift'

interface ParticleBackgroundProps {
  particleCount?: number
  connectionDistance?: number
  particleColor?: string
  lineColor?: string
  className?: string
  colorMode?: ColorMode
  colorCycleDuration?: number // Duration in ms for one complete color cycle
}

export function ParticleBackground({
  particleCount = 50,
  connectionDistance = 150,
  particleColor = '6, 182, 212',
  lineColor = '6, 182, 212',
  className = '',
  colorMode = 'static',
  colorCycleDuration = 30000,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const startTimeRef = useRef<number>(Date.now())

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      })
    }
    particlesRef.current = particles
  }, [particleCount])

  const animate = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height)

    const particles = particlesRef.current
    const mouse = mouseRef.current

    // Get current color based on mode
    let currentParticleColor = particleColor
    let currentLineColor = lineColor

    if (colorMode === 'shift') {
      const elapsed = Date.now() - startTimeRef.current
      const hslColor = getShiftingColor(elapsed, colorCycleDuration)
      // Convert HSL to format usable in hsla()
      currentParticleColor = hslColor
      currentLineColor = hslColor
    }

    // Determine if we're using HSL (shift mode) or RGB (static mode)
    const isHSL = colorMode === 'shift'
    const colorPrefix = isHSL ? 'hsla' : 'rgba'

    // Update and draw particles
    particles.forEach((particle, i) => {
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy

      // Bounce off edges
      if (particle.x < 0 || particle.x > width) particle.vx *= -1
      if (particle.y < 0 || particle.y > height) particle.vy *= -1

      // Keep in bounds
      particle.x = Math.max(0, Math.min(width, particle.x))
      particle.y = Math.max(0, Math.min(height, particle.y))

      // Draw particle
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = `${colorPrefix}(${currentParticleColor}, ${particle.opacity})`
      ctx.fill()

      // Draw glow
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 3
      )
      gradient.addColorStop(0, `${colorPrefix}(${currentParticleColor}, ${particle.opacity * 0.5})`)
      gradient.addColorStop(1, `${colorPrefix}(${currentParticleColor}, 0)`)
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw connections to nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j]
        const dx = particle.x - other.x
        const dy = particle.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * 0.3
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(other.x, other.y)
          ctx.strokeStyle = `${colorPrefix}(${currentLineColor}, ${opacity})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      // Mouse interaction - particles move toward mouse slightly
      const dx = mouse.x - particle.x
      const dy = mouse.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < 200 && distance > 0) {
        const force = (200 - distance) / 200 * 0.02
        particle.vx += (dx / distance) * force
        particle.vy += (dy / distance) * force
      }

      // Limit velocity
      const maxVel = 1
      const vel = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
      if (vel > maxVel) {
        particle.vx = (particle.vx / vel) * maxVel
        particle.vy = (particle.vy / vel) * maxVel
      }
    })

    animationRef.current = requestAnimationFrame(() => animate(ctx, width, height))
  }, [particleColor, lineColor, connectionDistance, colorMode, colorCycleDuration])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      initParticles(rect.width, rect.height)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', handleMouseMove)

    const rect = canvas.getBoundingClientRect()
    animate(ctx, rect.width, rect.height)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationRef.current)
    }
  }, [initParticles, animate])

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
