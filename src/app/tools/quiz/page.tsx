'use client'

import { useState } from 'react'
import Link from 'next/link'

interface QuizAnswer {
  householdSize: string
  activities: string[]
  workFromHome: string
  gaming: string
  budget: string
  currentProvider: string
  zipCode: string
}

interface Recommendation {
  type: 'fiber' | 'cable' | 'dsl' | 'satellite' | 'fixed-wireless'
  minSpeed: number
  maxSpeed: number
  reason: string
}

const questions = [
  {
    id: 'householdSize',
    question: 'How many people live in your household?',
    options: [
      { value: '1', label: '1 person', icon: '👤' },
      { value: '2', label: '2 people', icon: '👥' },
      { value: '3-4', label: '3-4 people', icon: '👨‍👩‍👧' },
      { value: '5+', label: '5+ people', icon: '👨‍👩‍👧‍👦' },
    ],
  },
  {
    id: 'activities',
    question: 'What do you primarily use the internet for?',
    multiSelect: true,
    options: [
      { value: 'streaming', label: 'Streaming (Netflix, YouTube)', icon: '📺' },
      { value: 'browsing', label: 'Web browsing & email', icon: '🌐' },
      { value: 'video-calls', label: 'Video calls (Zoom, Teams)', icon: '📹' },
      { value: 'gaming', label: 'Online gaming', icon: '🎮' },
      { value: 'smart-home', label: 'Smart home devices', icon: '🏠' },
      { value: 'large-files', label: 'Large file downloads/uploads', icon: '📁' },
    ],
  },
  {
    id: 'workFromHome',
    question: 'Does anyone work from home?',
    options: [
      { value: 'no', label: 'No', icon: '🏢' },
      { value: 'sometimes', label: 'Sometimes', icon: '🔄' },
      { value: 'full-time', label: 'Yes, full-time', icon: '🏠' },
      { value: 'multiple', label: 'Multiple people WFH', icon: '👥' },
    ],
  },
  {
    id: 'gaming',
    question: 'How important is online gaming?',
    options: [
      { value: 'none', label: "Don't game online", icon: '❌' },
      { value: 'casual', label: 'Casual gaming', icon: '🎯' },
      { value: 'serious', label: 'Competitive gaming', icon: '🏆' },
      { value: 'streaming', label: 'Game streaming (Twitch)', icon: '📡' },
    ],
  },
  {
    id: 'budget',
    question: "What's your monthly budget for internet?",
    options: [
      { value: 'low', label: 'Under $50/month', icon: '💵' },
      { value: 'medium', label: '$50-$80/month', icon: '💰' },
      { value: 'high', label: '$80-$120/month', icon: '💎' },
      { value: 'unlimited', label: 'Price is not a concern', icon: '🚀' },
    ],
  },
  {
    id: 'zipCode',
    question: 'Enter your ZIP code to find providers',
    type: 'input',
  },
]

function getRecommendation(answers: QuizAnswer): Recommendation {
  let speedScore = 0
  let needsLowLatency = false
  let needsSymmetrical = false

  // Household size scoring
  if (answers.householdSize === '1') speedScore += 1
  else if (answers.householdSize === '2') speedScore += 2
  else if (answers.householdSize === '3-4') speedScore += 3
  else if (answers.householdSize === '5+') speedScore += 4

  // Activities scoring
  if (answers.activities.includes('streaming')) speedScore += 2
  if (answers.activities.includes('video-calls')) {
    speedScore += 2
    needsSymmetrical = true
  }
  if (answers.activities.includes('gaming')) {
    speedScore += 1
    needsLowLatency = true
  }
  if (answers.activities.includes('large-files')) {
    speedScore += 3
    needsSymmetrical = true
  }
  if (answers.activities.includes('smart-home')) speedScore += 1

  // Work from home
  if (answers.workFromHome === 'sometimes') {
    speedScore += 1
    needsSymmetrical = true
  }
  if (answers.workFromHome === 'full-time') {
    speedScore += 2
    needsSymmetrical = true
  }
  if (answers.workFromHome === 'multiple') {
    speedScore += 4
    needsSymmetrical = true
  }

  // Gaming
  if (answers.gaming === 'casual') needsLowLatency = true
  if (answers.gaming === 'serious') {
    needsLowLatency = true
    speedScore += 1
  }
  if (answers.gaming === 'streaming') {
    needsLowLatency = true
    needsSymmetrical = true
    speedScore += 3
  }

  // Determine recommendation
  let type: Recommendation['type'] = 'cable'
  let minSpeed = 25
  let maxSpeed = 100
  let reason = ''

  if (speedScore >= 12 || needsSymmetrical) {
    type = 'fiber'
    minSpeed = 300
    maxSpeed = 1000
    reason = 'Based on your household size and heavy usage patterns, fiber internet will provide the fastest, most reliable connection with symmetrical upload speeds.'
  } else if (speedScore >= 8) {
    type = 'fiber'
    minSpeed = 200
    maxSpeed = 500
    reason = 'Your usage suggests you need fast, reliable internet. Fiber is ideal, but high-speed cable would also work well.'
  } else if (speedScore >= 5) {
    type = 'cable'
    minSpeed = 100
    maxSpeed = 300
    reason = 'Cable internet should handle your needs well. Look for plans with at least 100 Mbps download speed.'
  } else if (speedScore >= 3) {
    type = 'cable'
    minSpeed = 50
    maxSpeed = 100
    reason = 'A basic cable or DSL plan should work for your moderate usage. 50-100 Mbps will cover your needs.'
  } else {
    type = 'dsl'
    minSpeed = 25
    maxSpeed = 50
    reason = 'For light usage, even basic DSL or fixed wireless can work. Focus on reliability over raw speed.'
  }

  if (needsLowLatency && type !== 'fiber') {
    reason += ' Since you game online, prioritize providers known for low latency.'
  }

  return { type, minSpeed, maxSpeed, reason }
}

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer>({
    householdSize: '',
    activities: [],
    workFromHome: '',
    gaming: '',
    budget: '',
    currentProvider: '',
    zipCode: '',
  })
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  const handleSelect = (value: string) => {
    const questionId = currentQuestion.id as keyof QuizAnswer

    if (currentQuestion.multiSelect) {
      const currentValues = answers[questionId] as string[]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      setAnswers({ ...answers, [questionId]: newValues })
    } else {
      setAnswers({ ...answers, [questionId]: value })
      // Auto-advance for single select
      setTimeout(() => {
        if (currentStep < questions.length - 1) {
          setCurrentStep(currentStep + 1)
        }
      }, 300)
    }
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowResults(true)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isCurrentAnswered = () => {
    const questionId = currentQuestion.id as keyof QuizAnswer
    const answer = answers[questionId]
    if (currentQuestion.multiSelect) {
      return (answer as string[]).length > 0
    }
    if (currentQuestion.type === 'input') {
      return (answer as string).length === 5
    }
    return answer !== ''
  }

  const recommendation = showResults ? getRecommendation(answers) : null

  const typeLabels: Record<string, { label: string; color: string }> = {
    fiber: { label: 'Fiber', color: 'text-green-400' },
    cable: { label: 'Cable', color: 'text-blue-400' },
    dsl: { label: 'DSL', color: 'text-yellow-400' },
    satellite: { label: 'Satellite', color: 'text-orange-400' },
    'fixed-wireless': { label: 'Fixed Wireless', color: 'text-cyan-400' },
  }

  if (showResults && recommendation) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <nav className="mb-8 text-sm text-gray-400">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/tools" className="hover:text-white">Tools</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Quiz Results</span>
          </nav>

          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Your Recommendation</h1>
            <p className="text-gray-400">Based on your answers, here&apos;s what we suggest</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
            <div className="text-center mb-6">
              <div className={`text-4xl font-bold ${typeLabels[recommendation.type].color}`}>
                {typeLabels[recommendation.type].label} Internet
              </div>
              <div className="text-gray-400 mt-2">
                {recommendation.minSpeed} - {recommendation.maxSpeed} Mbps recommended
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <p className="text-gray-300">{recommendation.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{recommendation.minSpeed}+</div>
                <div className="text-xs text-gray-400">Min Download Mbps</div>
              </div>
              <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{recommendation.maxSpeed}</div>
                <div className="text-xs text-gray-400">Ideal Download Mbps</div>
              </div>
            </div>

            {answers.zipCode && (
              <Link
                href={`/compare?zip=${answers.zipCode}`}
                className="block w-full py-4 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Find Providers in {answers.zipCode}
              </Link>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowResults(false)
                setCurrentStep(0)
                setAnswers({
                  householdSize: '',
                  activities: [],
                  workFromHome: '',
                  gaming: '',
                  budget: '',
                  currentProvider: '',
                  zipCode: '',
                })
              }}
              className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-lg font-medium hover:border-gray-600 hover:text-white transition-colors"
            >
              Retake Quiz
            </button>
            <Link
              href="/tools/speed-test"
              className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-lg font-medium hover:border-gray-600 hover:text-white transition-colors text-center"
            >
              Test Current Speed
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/tools" className="hover:text-white">Tools</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Find Your ISP</span>
        </nav>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">{currentQuestion.question}</h2>

          {currentQuestion.type === 'input' ? (
            <div className="max-w-xs mx-auto">
              <input
                type="text"
                maxLength={5}
                placeholder="Enter ZIP code"
                value={answers.zipCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 5)
                  setAnswers({ ...answers, zipCode: value })
                }}
                className="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:border-blue-500"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options?.map((option) => {
                const questionId = currentQuestion.id as keyof QuizAnswer
                const isSelected = currentQuestion.multiSelect
                  ? (answers[questionId] as string[]).includes(option.value)
                  : answers[questionId] === option.value

                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-medium">{option.label}</div>
                  </button>
                )
              })}
            </div>
          )}

          {currentQuestion.multiSelect && (
            <p className="text-center text-sm text-gray-400 mt-4">
              Select all that apply
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex-1 py-3 border border-gray-700 text-gray-300 rounded-lg font-medium hover:border-gray-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isCurrentAnswered()}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === questions.length - 1 ? 'Get Recommendation' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
