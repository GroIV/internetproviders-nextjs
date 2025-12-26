'use client'

import { useRef, Children, isValidElement } from 'react'
import { motion, useInView } from 'framer-motion'

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'

interface StaggerContainerProps {
  children: React.ReactNode
  staggerDelay?: number
  direction?: Direction
  className?: string
  once?: boolean
  threshold?: number
  baseDelay?: number
}

const getItemVariants = (direction: Direction) => {
  const distance = 30

  const variants = {
    up: {
      hidden: { opacity: 0, y: distance },
      visible: { opacity: 1, y: 0 },
    },
    down: {
      hidden: { opacity: 0, y: -distance },
      visible: { opacity: 1, y: 0 },
    },
    left: {
      hidden: { opacity: 0, x: distance },
      visible: { opacity: 1, x: 0 },
    },
    right: {
      hidden: { opacity: 0, x: -distance },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.85 },
      visible: { opacity: 1, scale: 1 },
    },
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
  } as const

  return variants[direction]
}

export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  direction = 'up',
  className = '',
  once = true,
  threshold = 0.1,
  baseDelay = 0,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, {
    once,
    amount: threshold,
  })

  const itemVariants = getItemVariants(direction)

  const customContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: baseDelay,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={customContainerVariants}
      className={className}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child

        // Wrap all children in motion.div for staggering
        return (
          <motion.div
            key={index}
            variants={itemVariants}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            {child}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
