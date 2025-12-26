'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SpeedGauge,
  LiveGraph,
  ResultsCard,
  GradeDisplay,
  calculateGrade,
  ActivityGrid,
  PhaseTimeline,
  ComparisonBars
} from '@/components/speed-test'

type TestPhase = 'idle' | 'latency' | 'download' | 'upload' | 'complete'

interface Results {
  download: number
  upload: number
  latency: number
  jitter: number
  samples: number
  peakDownload: number
  peakUpload: number
}

function SpeedTestContent() {
  const [phase, setPhase] = useState<TestPhase>('idle')
  const [results, setResults] = useState<Results | null>(null)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [progress, setProgress] = useState(0)
  const [graphData, setGraphData] = useState<number[]>([])
  const [liveStats, setLiveStats] = useState({ peak: 0, samples: 0, variance: 0 })
  const speedTestRef = useRef<unknown>(null)
  const speedsRef = useRef<number[]>([])

  const runSpeedTest = useCallback(async () => {
    setPhase('latency')
    setProgress(0)
    setResults(null)
    setCurrentSpeed(0)
    setGraphData([])
    setLiveStats({ peak: 0, samples: 0, variance: 0 })
    speedsRef.current = []

    try {
      // Dynamically import the speedtest module (only works in browser)
      const SpeedTestModule = await import('@cloudflare/speedtest')
      const SpeedTest = SpeedTestModule.default

      // Extended test configuration for 45-60 second test
      const speedTest = new SpeedTest({
        autoStart: false,
        measurements: [
          // Extended latency testing
          { type: 'latency', numPackets: 20 },

          // Warmup downloads
          { type: 'download', bytes: 1e5, count: 2 },

          // Progressive download tests
          { type: 'download', bytes: 1e6, count: 8 },
          { type: 'download', bytes: 1e7, count: 6 },
          { type: 'download', bytes: 2.5e7, count: 4 },

          // Warmup uploads
          { type: 'upload', bytes: 1e5, count: 2 },

          // Progressive upload tests
          { type: 'upload', bytes: 1e6, count: 6 },
          { type: 'upload', bytes: 5e6, count: 4 },
        ],
      })

      speedTestRef.current = speedTest

      let downloadCount = 0
      let uploadCount = 0
      const totalDownloads = 20 // 2 + 8 + 6 + 4
      const totalUploads = 12 // 2 + 6 + 4
      let peakDownload = 0
      let peakUpload = 0

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
            const speedMbps = summary.download / 1e6

            // Track peak
            if (speedMbps > peakDownload) {
              peakDownload = speedMbps
            }

            // Update current speed and graph
            setCurrentSpeed(speedMbps)
            speedsRef.current.push(speedMbps)

            setGraphData(prev => {
              const newData = [...prev, speedMbps]
              // Keep last 30 points
              return newData.slice(-30)
            })

            // Calculate variance
            const speeds = speedsRef.current
            const avg = speeds.reduce((a, b) => a + b, 0) / speeds.length
            const variance = Math.sqrt(speeds.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / speeds.length)

            setLiveStats({
              peak: peakDownload,
              samples: downloadCount,
              variance: variance
            })
          }

          // Progress: 10% to 60% for downloads
          setProgress(10 + (downloadCount / totalDownloads) * 50)
        } else if (type === 'upload') {
          setPhase('upload')
          uploadCount++

          if (summary.upload) {
            const speedMbps = summary.upload / 1e6

            // Track peak
            if (speedMbps > peakUpload) {
              peakUpload = speedMbps
            }

            setCurrentSpeed(speedMbps)

            setGraphData(prev => {
              const newData = [...prev, speedMbps]
              return newData.slice(-30)
            })

            setLiveStats(prev => ({
              ...prev,
              peak: Math.max(prev.peak, speedMbps),
              samples: downloadCount + uploadCount
            }))
          }

          // Progress: 60% to 95% for uploads
          setProgress(60 + (uploadCount / totalUploads) * 35)
        }
      }

      speedTest.onFinish = (results: { getSummary: () => { download?: number; upload?: number; latency?: number; jitter?: number } }) => {
        const summary = results.getSummary()

        const finalDownload = Math.round((summary.download || 0) / 1e6 * 10) / 10
        const finalUpload = Math.round((summary.upload || 0) / 1e6 * 10) / 10

        setResults({
          download: finalDownload,
          upload: finalUpload,
          latency: Math.round(summary.latency || 0),
          jitter: Math.round((summary.jitter || 0) * 10) / 10,
          samples: downloadCount + uploadCount,
          peakDownload: Math.round(peakDownload * 10) / 10,
          peakUpload: Math.round(peakUpload * 10) / 10,
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
    setGraphData([])
    setLiveStats({ peak: 0, samples: 0, variance: 0 })
    speedsRef.current = []
  }, [])

  const gradeInfo = results ? calculateGrade(results.download, results.upload, results.latency, results.jitter) : null

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Speed Test</span>
          </nav>

          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Internet Speed Test
            </h1>
            <p className="text-gray-400">
              Test your connection with our comprehensive speed analysis
            </p>
          </motion.div>

          {/* Main Speed Test Card */}
          <motion.div
            className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 mb-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Speed Gauge */}
            <SpeedGauge
              phase={phase}
              currentSpeed={currentSpeed}
              progress={progress}
            />

            {/* Phase Timeline - only show during test */}
            {phase !== 'idle' && phase !== 'complete' && (
              <div className="mt-6">
                <PhaseTimeline currentPhase={phase} />
              </div>
            )}

            {/* Live Graph - only show during test */}
            <AnimatePresence>
              {(phase === 'download' || phase === 'upload') && graphData.length > 0 && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LiveGraph
                    phase={phase}
                    dataPoints={graphData}
                    maxValue={Math.max(200, ...graphData) * 1.2}
                  />

                  {/* Live Stats */}
                  <div className="flex justify-center gap-8 mt-4 text-sm">
                    <div className="text-center">
                      <div className="text-cyan-400 font-semibold">{liveStats.peak.toFixed(1)}</div>
                      <div className="text-gray-500 text-xs">Peak Mbps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-semibold">{liveStats.samples}</div>
                      <div className="text-gray-500 text-xs">Samples</div>
                    </div>
                    <div className="text-center">
                      <div className="text-amber-400 font-semibold">&plusmn;{liveStats.variance.toFixed(1)}</div>
                      <div className="text-gray-500 text-xs">Variance</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Start Button */}
            {phase === 'idle' && (
              <motion.button
                onClick={runSpeedTest}
                className="w-full mt-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-lg font-medium hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Speed Test
              </motion.button>
            )}

            {/* Progress during test */}
            {(phase === 'latency' || phase === 'download' || phase === 'upload') && (
              <div className="mt-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-gray-300">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      phase === 'latency' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                      phase === 'download' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                      'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Results Section */}
          <AnimatePresence>
            {phase === 'complete' && results && gradeInfo && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.5 }}
              >
                {/* Grade Display */}
                <div className="mb-6">
                  <GradeDisplay
                    grade={gradeInfo.grade}
                    description={gradeInfo.description}
                  />
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <ResultsCard
                    label="Download"
                    value={results.download}
                    unit="Mbps"
                    color="cyan"
                    delay={0.1}
                    icon={
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    }
                  />
                  <ResultsCard
                    label="Upload"
                    value={results.upload}
                    unit="Mbps"
                    color="purple"
                    delay={0.15}
                    icon={
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    }
                  />
                  <ResultsCard
                    label="Ping"
                    value={results.latency}
                    unit="ms"
                    color="amber"
                    delay={0.2}
                    icon={
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                  />
                  <ResultsCard
                    label="Jitter"
                    value={results.jitter}
                    unit="ms"
                    color="pink"
                    delay={0.25}
                    icon={
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    }
                  />
                  <ResultsCard
                    label="Peak Download"
                    value={results.peakDownload}
                    unit="Mbps"
                    color="blue"
                    delay={0.3}
                    icon={
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    }
                  />
                  <ResultsCard
                    label="Samples"
                    value={results.samples}
                    color="green"
                    delay={0.35}
                    icon={
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    }
                  />
                </div>

                {/* Comparison Bars & Activity Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <ComparisonBars
                    download={results.download}
                    upload={results.upload}
                  />
                  <ActivityGrid results={results} />
                </div>

                {/* Test Again Button */}
                <motion.button
                  onClick={resetTest}
                  className="w-full py-4 border border-gray-700 text-gray-300 rounded-xl font-medium hover:border-gray-600 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Test Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Powered by */}
          <div className="mt-6 text-center text-xs text-gray-500">
            Powered by{' '}
            <a
              href="https://speed.cloudflare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Cloudflare
            </a>
          </div>

          {/* Tips Section */}
          <motion.div
            className="mt-8 bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-200">Tips for Accurate Results</h2>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Close other browser tabs and applications using bandwidth
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Use a wired ethernet connection if possible for most accurate results
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Run the test multiple times at different hours to see consistency
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Test runs ~45-60 seconds for comprehensive analysis
              </li>
            </ul>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-gray-400 mb-4">Not happy with your speeds?</p>
            <Link
              href="/compare"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
            >
              Compare Faster Providers
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function SpeedTestPage() {
  return <SpeedTestContent />
}
