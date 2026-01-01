'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
}

interface NetworkMeshBackgroundProps {
  nodeCount?: number
  connectionDistance?: number
  className?: string
}

export function NetworkMeshBackground({
  nodeCount = 25,
  connectionDistance = 120,
  className = ''
}: NetworkMeshBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const animationRef = useRef<number | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const updateDimensions = () => {
      const rect = parent.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
      canvas.width = rect.width
      canvas.height = rect.height
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || dimensions.width === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize nodes
    nodesRef.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2
    }))

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      const nodes = nodesRef.current

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Update position
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < 0 || node.x > dimensions.width) node.vx *= -1
        if (node.y < 0 || node.y > dimensions.height) node.vy *= -1

        // Keep in bounds
        node.x = Math.max(0, Math.min(dimensions.width, node.x))
        node.y = Math.max(0, Math.min(dimensions.height, node.y))

        // Draw connections to nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j]
          const dx = node.x - other.x
          const dy = node.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.15
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)

            // Gradient line from cyan to purple
            const gradient = ctx.createLinearGradient(node.x, node.y, other.x, other.y)
            gradient.addColorStop(0, `rgba(34, 211, 238, ${opacity})`)
            gradient.addColorStop(1, `rgba(168, 85, 247, ${opacity})`)
            ctx.strokeStyle = gradient
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }

        // Draw node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(34, 211, 238, ${node.opacity})`
        ctx.fill()

        // Add glow effect
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2)
        const glowGradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 3
        )
        glowGradient.addColorStop(0, `rgba(34, 211, 238, ${node.opacity * 0.3})`)
        glowGradient.addColorStop(1, 'rgba(34, 211, 238, 0)')
        ctx.fillStyle = glowGradient
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions, nodeCount, connectionDistance])

  return (
    <motion.div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />

      {/* Animated mesh canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Subtle radial glow */}
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-purple-500/5 rounded-full blur-3xl" />
    </motion.div>
  )
}

// Simpler floating particles version for lower-end devices
export function FloatingParticles({ count = 15 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-400/30"
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}
