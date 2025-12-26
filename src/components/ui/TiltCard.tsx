'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

type GlowColor = 'cyan' | 'blue' | 'purple' | 'pink' | 'orange' | 'emerald'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: GlowColor
  tiltIntensity?: number
  glowIntensity?: number
  scale?: number
  disabled?: boolean
}

const glowColors: Record<GlowColor, string> = {
  cyan: '6, 182, 212',
  blue: '59, 130, 246',
  purple: '139, 92, 246',
  pink: '236, 72, 153',
  orange: '249, 115, 22',
  emerald: '16, 185, 129',
}

export function TiltCard({
  children,
  className = '',
  glowColor = 'cyan',
  tiltIntensity = 10,
  glowIntensity = 0.3,
  scale = 1.02,
  disabled = false,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Motion values for tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring configuration for smooth return
  const springConfig = { damping: 20, stiffness: 300 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]), springConfig)

  // Glow position
  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig)
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Normalize to -0.5 to 0.5
    const normalizedX = (e.clientX - centerX) / rect.width
    const normalizedY = (e.clientY - centerY) / rect.height

    mouseX.set(normalizedX)
    mouseY.set(normalizedY)
  }

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  const rgb = glowColors[glowColor]

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX: disabled ? 0 : rotateX,
          rotateY: disabled ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isHovered ? scale : 1,
        }}
        transition={{
          scale: { duration: 0.2, ease: 'easeOut' },
        }}
        className="relative w-full h-full"
      >
        {/* Dynamic glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(${rgb}, ${glowIntensity}) 0%, transparent 60%)`,
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Card content */}
        {children}

        {/* Border glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: isHovered
              ? `0 0 30px rgba(${rgb}, 0.3), 0 0 60px rgba(${rgb}, 0.15), inset 0 0 20px rgba(${rgb}, 0.05)`
              : 'none',
            transition: 'box-shadow 0.3s ease',
          }}
        />
      </motion.div>
    </motion.div>
  )
}
