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

// Compact speed gauge for panel
function CompactGauge({ phase, currentSpeed, progress }: { phase: TestPhase; currentSpeed: number; progress: number }) {
  const isIdle = phase === 'idle'
  const isComplete = phase === 'complete'
  const isRunning = !isIdle && !isComplete

  return (
    <div className="relative flex items-center justify-center py-6">
      {/* Progress ring */}
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
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
            <div className="text-3xl font-bold text-white">GO</div>
            <div className="text-xs text-gray-500">Click to start</div>
          </motion.div>
        )}

        {isRunning && (
          <motion.div
            className="text-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <div className="text-2xl font-bold text-white">
              {currentSpeed.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Mbps</div>
          </motion.div>
        )}

        {isComplete && (
          <motion.div
            className="text-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <svg className="w-8 h-8 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="text-xs text-gray-400 mt-1">Complete</div>
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

      // Shorter test for panel (faster results)
      const speedTest = new SpeedTest({
        autoStart: false,
        measurements: [
          { type: 'latency', numPackets: 10 },
          { type: 'download', bytes: 1e5, count: 2 },
          { type: 'download', bytes: 1e6, count: 6 },
          { type: 'download', bytes: 1e7, count: 4 },
          { type: 'upload', bytes: 1e5, count: 2 },
          { type: 'upload', bytes: 1e6, count: 4 },
        ],
      })

      speedTestRef.current = speedTest

      let downloadCount = 0
      let uploadCount = 0
      const totalDownloads = 12
      const totalUploads = 6

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
      <div className="space-y-4">
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
          {phase === 'complete' && results && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-cyan-400">{results.download}</div>
                  <div className="text-xs text-gray-500">Download Mbps</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-purple-400">{results.upload}</div>
                  <div className="text-xs text-gray-500">Upload Mbps</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-amber-400">{results.latency}</div>
                  <div className="text-xs text-gray-500">Ping ms</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-pink-400">{results.jitter}</div>
                  <div className="text-xs text-gray-500">Jitter ms</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start button for idle state */}
        {phase === 'idle' && (
          <button
            onClick={runSpeedTest}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-cyan-500 hover:to-purple-500 transition-all"
          >
            Start Speed Test
          </button>
        )}

        {/* Powered by */}
        <div className="text-center text-xs text-gray-600">
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
