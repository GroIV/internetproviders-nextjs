'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

type TestPhase = 'idle' | 'latency' | 'download' | 'upload' | 'complete'

interface LiveGraphProps {
  phase: TestPhase
  dataPoints: number[]
  maxValue?: number
}

const phaseColors: Record<TestPhase, { stroke: string; fill: string }> = {
  idle: { stroke: '#6B7280', fill: 'rgba(107, 114, 128, 0.1)' },
  latency: { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.1)' },
  download: { stroke: '#06B6D4', fill: 'rgba(6, 182, 212, 0.1)' },
  upload: { stroke: '#A855F7', fill: 'rgba(168, 85, 247, 0.1)' },
  complete: { stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.1)' }
}

export function LiveGraph({ phase, dataPoints, maxValue = 500 }: LiveGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // const animationRef = useRef<number | undefined>(undefined) // Reserved for future animation
  const [dimensions, setDimensions] = useState({ width: 400, height: 150 })

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = dimensions
    const padding = { top: 20, right: 20, bottom: 30, left: 50 }
    const graphWidth = width - padding.left - padding.right
    const graphHeight = height - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Get colors for current phase
    const colors = phaseColors[phase]

    // Draw grid
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (graphHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()

      // Y-axis labels
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'right'
      const value = Math.round(maxValue - (maxValue / 4) * i)
      ctx.fillText(`${value}`, padding.left - 8, y + 4)
    }

    // Draw data if available
    if (dataPoints.length > 1) {
      const pointSpacing = graphWidth / (Math.max(dataPoints.length - 1, 1))

      // Create gradient for fill
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
      gradient.addColorStop(0, colors.fill.replace('0.1', '0.3'))
      gradient.addColorStop(1, colors.fill)

      // Draw filled area
      ctx.beginPath()
      ctx.moveTo(padding.left, height - padding.bottom)

      dataPoints.forEach((point, index) => {
        const x = padding.left + index * pointSpacing
        const normalizedValue = Math.min(point / maxValue, 1)
        const y = padding.top + graphHeight * (1 - normalizedValue)
        if (index === 0) {
          ctx.lineTo(x, y)
        } else {
          // Smooth curve
          const prevX = padding.left + (index - 1) * pointSpacing
          const prevPoint = dataPoints[index - 1]
          const prevY = padding.top + graphHeight * (1 - Math.min(prevPoint / maxValue, 1))
          const cpX = (prevX + x) / 2
          ctx.quadraticCurveTo(cpX, prevY, x, y)
        }
      })

      ctx.lineTo(padding.left + (dataPoints.length - 1) * pointSpacing, height - padding.bottom)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw line
      ctx.beginPath()
      dataPoints.forEach((point, index) => {
        const x = padding.left + index * pointSpacing
        const normalizedValue = Math.min(point / maxValue, 1)
        const y = padding.top + graphHeight * (1 - normalizedValue)

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          const prevX = padding.left + (index - 1) * pointSpacing
          const prevPoint = dataPoints[index - 1]
          const prevY = padding.top + graphHeight * (1 - Math.min(prevPoint / maxValue, 1))
          const cpX = (prevX + x) / 2
          ctx.quadraticCurveTo(cpX, prevY, x, y)
        }
      })

      ctx.strokeStyle = colors.stroke
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()

      // Draw glow effect on line
      ctx.shadowColor = colors.stroke
      ctx.shadowBlur = 10
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw current point indicator
      if (dataPoints.length > 0 && phase !== 'idle' && phase !== 'complete') {
        const lastIndex = dataPoints.length - 1
        const lastX = padding.left + lastIndex * pointSpacing
        const lastY = padding.top + graphHeight * (1 - Math.min(dataPoints[lastIndex] / maxValue, 1))

        // Outer glow
        ctx.beginPath()
        ctx.arc(lastX, lastY, 8, 0, Math.PI * 2)
        ctx.fillStyle = colors.fill.replace('0.1', '0.4')
        ctx.fill()

        // Inner dot
        ctx.beginPath()
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2)
        ctx.fillStyle = colors.stroke
        ctx.fill()
      }
    }

    // X-axis label
    ctx.fillStyle = '#6B7280'
    ctx.font = '10px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Time', width / 2, height - 8)

  }, [dataPoints, phase, maxValue, dimensions])

  return (
    <motion.div
      ref={containerRef}
      className="w-full h-40 bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ width: '100%', height: '100%' }}
      />
    </motion.div>
  )
}
