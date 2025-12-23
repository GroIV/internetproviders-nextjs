'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

type TestPhase = 'idle' | 'running' | 'complete'

interface Results {
  download: number
  upload: number
  latency: number
  jitter: number
}

function SpeedTestContent() {
  const [phase, setPhase] = useState<TestPhase>('idle')
  const [results, setResults] = useState<Results | null>(null)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [currentTest, setCurrentTest] = useState<'download' | 'upload' | 'latency'>('latency')
  const [progress, setProgress] = useState(0)
  const speedTestRef = useRef<unknown>(null)

  const runSpeedTest = useCallback(async () => {
    setPhase('running')
    setProgress(0)
    setResults(null)
    setCurrentSpeed(0)
    setCurrentTest('latency')

    try {
      // Dynamically import the speedtest module (only works in browser)
      const SpeedTestModule = await import('@cloudflare/speedtest')
      const SpeedTest = SpeedTestModule.default

      const speedTest = new SpeedTest({
        autoStart: false,
        measurements: [
          { type: 'latency', numPackets: 4 },
          { type: 'download', bytes: 1e5, count: 1 },
          { type: 'download', bytes: 1e6, count: 4 },
          { type: 'download', bytes: 1e7, count: 4 },
          { type: 'upload', bytes: 1e5, count: 1 },
          { type: 'upload', bytes: 1e6, count: 4 },
        ],
      })

      speedTestRef.current = speedTest

      let downloadSpeeds: number[] = []
      let uploadSpeeds: number[] = []

      speedTest.onRunningChange = (running: boolean) => {
        if (!running) {
          setPhase('complete')
          setProgress(100)
        }
      }

      speedTest.onResultsChange = ({ type }: { type: string }) => {
        const summary = speedTest.results.getSummary()

        if (type === 'latency') {
          setCurrentTest('download')
          setProgress(10)
        } else if (type === 'download') {
          setCurrentTest('download')
          if (summary.download) {
            const speedMbps = summary.download / 1e6
            setCurrentSpeed(speedMbps)
            downloadSpeeds.push(speedMbps)
          }
          setProgress(10 + (downloadSpeeds.length / 5) * 50)
        } else if (type === 'upload') {
          setCurrentTest('upload')
          if (summary.upload) {
            const speedMbps = summary.upload / 1e6
            setCurrentSpeed(speedMbps)
            uploadSpeeds.push(speedMbps)
          }
          setProgress(60 + (uploadSpeeds.length / 5) * 35)
        }
      }

      speedTest.onFinish = (results: { getSummary: () => { download?: number; upload?: number; latency?: number; jitter?: number } }) => {
        const summary = results.getSummary()
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

  const getSpeedRating = (download: number): { label: string; color: string; description: string } => {
    if (download >= 100) {
      return { label: 'Excellent', color: 'text-green-400', description: 'Great for 4K streaming, gaming, and large downloads' }
    } else if (download >= 50) {
      return { label: 'Good', color: 'text-blue-400', description: 'Suitable for HD streaming and video calls' }
    } else if (download >= 25) {
      return { label: 'Average', color: 'text-yellow-400', description: 'Okay for basic streaming and browsing' }
    } else {
      return { label: 'Slow', color: 'text-red-400', description: 'May struggle with video streaming' }
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/tools" className="hover:text-white">Tools</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Speed Test</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Internet Speed Test</h1>
          <p className="text-gray-400">
            Test your current internet connection speed
          </p>
        </div>

        {/* Speed Test Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          {/* Speedometer Display */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background arc */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#374151"
                strokeWidth="8"
                strokeDasharray="212 71"
              />
              {/* Progress arc */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={phase === 'complete' ? '#10B981' : currentTest === 'download' ? '#3B82F6' : currentTest === 'upload' ? '#8B5CF6' : '#F59E0B'}
                strokeWidth="8"
                strokeDasharray={`${(progress / 100) * 212} 283`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold">
                {phase === 'idle' ? '0' :
                 phase === 'complete' ? results?.download :
                 currentSpeed.toFixed(1)}
              </div>
              <div className="text-gray-400 text-sm">Mbps</div>
              {phase === 'running' && (
                <div className={`text-sm mt-2 capitalize ${
                  currentTest === 'download' ? 'text-blue-400' :
                  currentTest === 'upload' ? 'text-purple-400' :
                  'text-yellow-400'
                }`}>
                  Testing {currentTest}...
                </div>
              )}
            </div>
          </div>

          {/* Start Button or Results */}
          {phase === 'idle' && (
            <button
              onClick={runSpeedTest}
              className="w-full py-4 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Speed Test
            </button>
          )}

          {phase === 'running' && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-white">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentTest === 'download' ? 'bg-blue-600' :
                    currentTest === 'upload' ? 'bg-purple-600' :
                    'bg-yellow-600'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {phase === 'complete' && results && (
            <div className="space-y-6">
              {/* Results Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{results.download}</div>
                  <div className="text-xs text-gray-400">Download Mbps</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{results.upload}</div>
                  <div className="text-xs text-gray-400">Upload Mbps</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">{results.latency}</div>
                  <div className="text-xs text-gray-400">Ping ms</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-400">{results.jitter}</div>
                  <div className="text-xs text-gray-400">Jitter ms</div>
                </div>
              </div>

              {/* Rating */}
              {(() => {
                const rating = getSpeedRating(results.download)
                return (
                  <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                    <div className={`text-xl font-semibold ${rating.color}`}>
                      {rating.label} Speed
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {rating.description}
                    </div>
                  </div>
                )
              })()}

              {/* Test Again Button */}
              <button
                onClick={() => {
                  setPhase('idle')
                  setProgress(0)
                  setResults(null)
                  setCurrentSpeed(0)
                }}
                className="w-full py-3 border border-gray-700 text-gray-300 rounded-lg font-medium hover:border-gray-600 hover:text-white transition-colors"
              >
                Test Again
              </button>
            </div>
          )}
        </div>

        {/* Powered by */}
        <div className="mt-4 text-center text-xs text-gray-500">
          Powered by <a href="https://speed.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Cloudflare</a>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Tips for Accurate Results</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Close other browser tabs and applications
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Use a wired connection if possible
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Run the test multiple times for accuracy
            </li>
          </ul>
        </div>

        {/* Understanding Results */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Understanding Your Results</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-blue-400 mb-2">Download Speed</h3>
              <p className="text-sm text-gray-400">
                How fast you can pull data. Important for streaming and browsing.
              </p>
              <div className="mt-2 text-xs text-gray-500">
                25+ Mbps: HD | 100+ Mbps: 4K | 300+ Mbps: Multiple users
              </div>
            </div>
            <div>
              <h3 className="font-medium text-purple-400 mb-2">Upload Speed</h3>
              <p className="text-sm text-gray-400">
                How fast you can send data. Important for video calls and uploads.
              </p>
              <div className="mt-2 text-xs text-gray-500">
                5+ Mbps: Video calls | 50+ Mbps: Content creators
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Not happy with your speeds?</p>
          <Link
            href="/compare"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Compare Faster Providers
          </Link>
        </div>
      </div>
    </div>
  )
}

// Use dynamic import to prevent SSR issues with the Cloudflare package
export default function SpeedTestPage() {
  return <SpeedTestContent />
}
