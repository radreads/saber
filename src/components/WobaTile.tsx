'use client'

import { useState, useEffect } from 'react'
import { MetricExplainer } from './MetricExplainer'
import type { HitterInputs, WobaResult, ExplainPacket } from '@/types'

interface WobaTileProps {
  playerName: string
  season: number
  stats: HitterInputs
}

/**
 * WobaTile Component
 *
 * Displays a player's wOBA with:
 * - The computed value and rating
 * - Component breakdown showing contribution of each event type
 * - Toggle for full explain mode (calculation steps)
 */
export function WobaTile({ playerName, season, stats }: WobaTileProps) {
  const [result, setResult] = useState<WobaResult | null>(null)
  const [explain, setExplain] = useState<ExplainPacket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showExplain, setShowExplain] = useState(false)

  useEffect(() => {
    async function fetchWoba() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/metrics/woba', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stats,
            season,
            explain: true, // Always fetch explain data
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to compute wOBA')
        }

        const data = await response.json()
        setResult(data.data)
        setExplain(data.explain)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchWoba()
  }, [stats, season])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
        <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">
          Error Computing wOBA
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    )
  }

  if (!result) return null

  const rating = getWobaRating(result.wOBA)
  const colorClass = getWobaColorClass(result.wOBA)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{playerName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {season} Season
            </p>
          </div>
          <button
            onClick={() => setShowExplain(!showExplain)}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            {showExplain ? 'Hide' : 'Show'} Explain Mode
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-4">
        {/* wOBA Value */}
        <div className="flex items-end gap-3 mb-4">
          <span className={`text-5xl font-bold font-mono ${colorClass}`}>
            {result.wOBA.toFixed(3)}
          </span>
          <div className="mb-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              wOBA
            </span>
            <span
              className={`ml-2 px-2 py-0.5 text-xs font-medium rounded ${colorClass} bg-opacity-10`}
            >
              {rating}
            </span>
          </div>
        </div>

        {/* Component Breakdown */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Contribution by Event Type
          </h4>
          <div className="space-y-2">
            {result.components.map((comp) => {
              const percentage =
                result.numerator > 0
                  ? (comp.contribution / result.numerator) * 100
                  : 0

              return (
                <div key={comp.name} className="flex items-center gap-2">
                  <span className="w-20 text-sm text-gray-600 dark:text-gray-400">
                    {comp.name}
                  </span>
                  <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 dark:bg-blue-600 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-mono text-gray-600 dark:text-gray-400">
                    {percentage.toFixed(1)}%
                  </span>
                  <span className="w-8 text-right text-xs text-gray-400">
                    ({comp.count})
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Formula Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Numerator</span>
            <span className="font-mono">{result.numerator}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Denominator</span>
            <span className="font-mono">{result.denominator}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 flex justify-between text-sm font-medium">
            <span>wOBA</span>
            <span className="font-mono">
              {result.numerator} / {result.denominator} = {result.wOBA.toFixed(3)}
            </span>
          </div>
        </div>

        {/* Explain Panel */}
        {showExplain && explain && <MetricExplainer explain={explain} />}
      </div>
    </div>
  )
}

// ============================================================================
// Helper Functions
// ============================================================================

function getWobaRating(wOBA: number): string {
  if (wOBA >= 0.400) return 'Excellent'
  if (wOBA >= 0.370) return 'Great'
  if (wOBA >= 0.340) return 'Above Average'
  if (wOBA >= 0.310) return 'Average'
  if (wOBA >= 0.290) return 'Below Average'
  return 'Poor'
}

function getWobaColorClass(wOBA: number): string {
  if (wOBA >= 0.400) return 'text-green-600 dark:text-green-400'
  if (wOBA >= 0.370) return 'text-green-500'
  if (wOBA >= 0.340) return 'text-blue-500 dark:text-blue-400'
  if (wOBA >= 0.310) return 'text-gray-600 dark:text-gray-400'
  if (wOBA >= 0.290) return 'text-orange-500 dark:text-orange-400'
  return 'text-red-500 dark:text-red-400'
}
