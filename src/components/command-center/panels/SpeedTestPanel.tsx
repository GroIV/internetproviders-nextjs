'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { PanelWrapper } from './PanelWrapper'
import { useCommandCenter } from '@/contexts/CommandCenterContext'

type TestPhase = 'idle' | 'latency' | 'download' | 'upload' | 'complete'

interface Results {
  download: number
  upload: number
  latency: number
  jitter: number
}

// Rating thresholds and labels
function getDownloadRating(speed: number): { label: string; color: string; description: string } {
  if (speed >= 500) return { label: 'Excellent', color: 'text-emerald-400', description: '4K streaming, large downloads, multiple devices' }
  if (speed >= 100) return { label: 'Great', color: 'text-green-400', description: 'HD streaming, video calls, gaming' }
  if (speed >= 25) return { label: 'Good', color: 'text-yellow-400', description: 'Basic streaming, web browsing' }
  return { label: 'Slow', color: 'text-red-400', description: 'May struggle with video streaming' }
}

function getUploadRating(speed: number): { label: string; color: string; description: string } {
  if (speed >= 100) return { label: 'Excellent', color: 'text-emerald-400', description: 'Live streaming, large file uploads' }
  if (speed >= 20) return { label: 'Great', color: 'text-green-400', description: 'Video calls, cloud backups' }
  if (speed >= 5) return { label: 'Good', color: 'text-yellow-400', description: 'Basic video calls, photo uploads' }
  return { label: 'Slow', color: 'text-red-400', description: 'May struggle with video calls' }
}

function getLatencyRating(ms: number): { label: string; color: string; description: string } {
  if (ms <= 20) return { label: 'Excellent', color: 'text-emerald-400', description: 'Competitive gaming, real-time apps' }
  if (ms <= 50) return { label: 'Great', color: 'text-green-400', description: 'Online gaming, video calls' }
  if (ms <= 100) return { label: 'Good', color: 'text-yellow-400', description: 'Casual gaming, streaming' }
  return { label: 'High', color: 'text-red-400', description: 'Noticeable lag in real-time apps' }
}

function getJitterRating(ms: number): { label: string; color: string; description: string } {
  if (ms <= 5) return { label: 'Stable', color: 'text-emerald-400', description: 'Consistent, reliable connection' }
  if (ms <= 15) return { label: 'Good', color: 'text-green-400', description: 'Minor fluctuations, barely noticeable' }
  if (ms <= 30) return { label: 'Fair', color: 'text-yellow-400', description: 'Some inconsistency in speeds' }
  return { label: 'Unstable', color: 'text-red-400', description: 'Connection quality varies significantly' }
}

// Enhanced result card with explanation
function ResultCard({
  value,
  unit,
  label,
  icon,
  rating,
  color,
  delay
}: {
  value: number | string
  unit: string
  label: string
  icon: React.ReactNode
  rating: { label: string; color: string; description: string }
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50"
    >
      {/* Main content */}
      <div className="flex items-start justify-between mb-1">
        <div className={`p-1.5 rounded-lg bg-gray-900/50 ${color}`}>
          {icon}
        </div>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-900/50 ${rating.color}`}>
          {rating.label}
        </span>
      </div>

      <div className="mt-2">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">{unit}</div>
        <div className="text-xs text-gray-400 mt-0.5">{label}</div>
      </div>

      {/* Always visible description */}
      <div className="mt-2 pt-2 border-t border-gray-700/30">
        <p className="text-[10px] text-gray-500 leading-relaxed">{rating.description}</p>
      </div>
    </motion.div>
  )
}

// Overall score calculation
function getOverallScore(results: Results): { score: number; label: string; color: string; summary: string } {
  let score = 0

  // Download weight: 40%
  if (results.download >= 500) score += 40
  else if (results.download >= 100) score += 30
  else if (results.download >= 25) score += 20
  else score += 10

  // Upload weight: 25%
  if (results.upload >= 100) score += 25
  else if (results.upload >= 20) score += 20
  else if (results.upload >= 5) score += 15
  else score += 5

  // Latency weight: 25%
  if (results.latency <= 20) score += 25
  else if (results.latency <= 50) score += 20
  else if (results.latency <= 100) score += 15
  else score += 5

  // Jitter weight: 10%
  if (results.jitter <= 5) score += 10
  else if (results.jitter <= 15) score += 8
  else if (results.jitter <= 30) score += 5
  else score += 2

  if (score >= 90) return { score, label: 'Excellent', color: 'text-emerald-400', summary: 'Your connection is top-tier! Great for any online activity.' }
  if (score >= 70) return { score, label: 'Great', color: 'text-green-400', summary: 'Solid connection for streaming, gaming, and video calls.' }
  if (score >= 50) return { score, label: 'Good', color: 'text-yellow-400', summary: 'Handles most tasks well. Consider upgrading for heavy use.' }
  return { score, label: 'Fair', color: 'text-orange-400', summary: 'Basic browsing works, but you may experience issues with video.' }
}

// Compact speed gauge for panel
function CompactGauge({ phase, currentSpeed, progress }: { phase: TestPhase; currentSpeed: number; progress: number }) {
  const isIdle = phase === 'idle'
  const isComplete = phase === 'complete'
  const isRunning = !isIdle && !isComplete

  return (
    <div className="relative flex items-center justify-center py-4">
      {/* Progress ring */}
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-gray-800"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className={
            phase === 'download' ? 'text-cyan-500' :
            phase === 'upload' ? 'text-purple-500' :
            phase === 'latency' ? 'text-amber-500' :
            'text-green-500'
          }
          strokeDasharray={264}
          animate={{ strokeDashoffset: 264 - (264 * progress / 100) }}
          transition={{ duration: 0.3 }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isIdle && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-2xl font-bold text-white">GO</div>
            <div className="text-[10px] text-gray-500">Click to start</div>
          </motion.div>
        )}

        {isRunning && (
          <motion.div
            className="text-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <div className="text-xl font-bold text-white">
              {currentSpeed.toFixed(1)}
            </div>
            <div className="text-[10px] text-gray-500">Mbps</div>
          </motion.div>
        )}

        {isComplete && (
          <motion.div
            className="text-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <svg className="w-7 h-7 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="text-[10px] text-gray-400 mt-0.5">Complete</div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export function SpeedTestPanel() {
  const { goBack } = useCommandCenter()
  const [phase, setPhase] = useState<TestPhase>('idle')
  const [results, setResults] = useState<Results | null>(null)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [progress, setProgress] = useState(0)
  const speedTestRef = useRef<unknown>(null)

  const runSpeedTest = useCallback(async () => {
    setPhase('latency')
    setProgress(0)
    setResults(null)
    setCurrentSpeed(0)

    try {
      const SpeedTestModule = await import('@cloudflare/speedtest')
      const SpeedTest = SpeedTestModule.default

      // More thorough test configuration (~8-12 seconds)
      const speedTest = new SpeedTest({
        autoStart: false,
        measurements: [
          { type: 'latency', numPackets: 20 },
          { type: 'download', bytes: 1e5, count: 4 },
          { type: 'download', bytes: 1e6, count: 8 },
          { type: 'download', bytes: 1e7, count: 6 },
          { type: 'download', bytes: 2.5e7, count: 4 },
          { type: 'upload', bytes: 1e5, count: 4 },
          { type: 'upload', bytes: 1e6, count: 6 },
          { type: 'upload', bytes: 5e6, count: 4 },
        ],
      })

      speedTestRef.current = speedTest

      let downloadCount = 0
      let uploadCount = 0
      const totalDownloads = 22
      const totalUploads = 14

      speedTest.onRunningChange = (running: boolean) => {
        if (!running) {
          setPhase('complete')
          setProgress(100)
        }
      }

      speedTest.onResultsChange = ({ type }: { type: string }) => {
        const summary = speedTest.results.getSummary()

        if (type === 'latency') {
          setPhase('download')
          setProgress(10)
        } else if (type === 'download') {
          setPhase('download')
          downloadCount++
          if (summary.download) {
            setCurrentSpeed(summary.download / 1e6)
          }
          setProgress(10 + (downloadCount / totalDownloads) * 50)
        } else if (type === 'upload') {
          setPhase('upload')
          uploadCount++
          if (summary.upload) {
            setCurrentSpeed(summary.upload / 1e6)
          }
          setProgress(60 + (uploadCount / totalUploads) * 35)
        }
      }

      speedTest.onFinish = (testResults: { getSummary: () => { download?: number; upload?: number; latency?: number; jitter?: number } }) => {
        const summary = testResults.getSummary()
        setResults({
          download: Math.round((summary.download || 0) / 1e6 * 10) / 10,
          upload: Math.round((summary.upload || 0) / 1e6 * 10) / 10,
          latency: Math.round(summary.latency || 0),
          jitter: Math.round((summary.jitter || 0) * 10) / 10,
        })
        setPhase('complete')
        setProgress(100)
      }

      speedTest.play()
    } catch (error) {
      console.error('Speed test error:', error)
      setPhase('idle')
    }
  }, [])

  const resetTest = useCallback(() => {
    setPhase('idle')
    setProgress(0)
    setResults(null)
    setCurrentSpeed(0)
  }, [])

  const overallScore = results ? getOverallScore(results) : null

  return (
    <PanelWrapper
      title="Speed Test"
      accentColor="purple"
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      }
      onClose={goBack}
    >
      <div className="space-y-3">
        {/* Speed Gauge */}
        <div
          className={phase === 'idle' ? 'cursor-pointer' : ''}
          onClick={phase === 'idle' ? runSpeedTest : undefined}
        >
          <CompactGauge phase={phase} currentSpeed={currentSpeed} progress={progress} />
        </div>

        {/* Phase indicator */}
        {phase !== 'idle' && phase !== 'complete' && (
          <div className="text-center text-sm text-gray-400">
            {phase === 'latency' && 'Testing latency...'}
            {phase === 'download' && 'Testing download speed...'}
            {phase === 'upload' && 'Testing upload speed...'}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {phase === 'complete' && results && overallScore && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Overall Score */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center p-3 rounded-xl bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-gray-700/50"
              >
                <div className={`text-lg font-bold ${overallScore.color}`}>
                  {overallScore.label} Connection
                </div>
                <p className="text-xs text-gray-400 mt-1">{overallScore.summary}</p>
              </motion.div>

              {/* Result cards */}
              <div className="grid grid-cols-2 gap-2">
                <ResultCard
                  value={results.download}
                  unit="Mbps"
                  label="Download"
                  icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>}
                  rating={getDownloadRating(results.download)}
                  color="text-cyan-400"
                  delay={0.15}
                />
                <ResultCard
                  value={results.upload}
                  unit="Mbps"
                  label="Upload"
                  icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>}
                  rating={getUploadRating(results.upload)}
                  color="text-purple-400"
                  delay={0.2}
                />
                <ResultCard
                  value={results.latency}
                  unit="ms"
                  label="Ping"
                  icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  rating={getLatencyRating(results.latency)}
                  color="text-amber-400"
                  delay={0.25}
                />
                <ResultCard
                  value={results.jitter}
                  unit="ms"
                  label="Jitter"
                  icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                  rating={getJitterRating(results.jitter)}
                  color="text-pink-400"
                  delay={0.3}
                />
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-2"
              >
                <button
                  onClick={resetTest}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
                >
                  Test Again
                </button>
                <Link
                  href="/tools/speed-test"
                  className="py-2 px-4 bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition-all"
                >
                  Full Test
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start button for idle state */}
        {phase === 'idle' && (
          <div className="space-y-3">
            <button
              onClick={runSpeedTest}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-cyan-500 hover:to-purple-500 transition-all"
            >
              Start Speed Test
            </button>

            {/* Pre-test info */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/30">
                <div className="font-semibold text-cyan-400 mb-0.5">Download</div>
                <div className="text-gray-500">How fast you receive data (streaming, browsing)</div>
              </div>
              <div className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/30">
                <div className="font-semibold text-purple-400 mb-0.5">Upload</div>
                <div className="text-gray-500">How fast you send data (video calls, uploads)</div>
              </div>
              <div className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/30">
                <div className="font-semibold text-amber-400 mb-0.5">Ping</div>
                <div className="text-gray-500">Response time (lower = better for gaming)</div>
              </div>
              <div className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/30">
                <div className="font-semibold text-pink-400 mb-0.5">Jitter</div>
                <div className="text-gray-500">Connection stability (lower = more stable)</div>
              </div>
            </div>
          </div>
        )}

        {/* Powered by */}
        <div className="text-center text-[10px] text-gray-600">
          Powered by{' '}
          <a
            href="https://speed.cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-400"
          >
            Cloudflare
          </a>
        </div>
      </div>
    </PanelWrapper>
  )
}
