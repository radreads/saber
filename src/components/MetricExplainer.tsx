'use client'

import { useState } from 'react'
import type { ExplainPacket, CalculationStep } from '@/types'

interface MetricExplainerProps {
  explain: ExplainPacket
  defaultExpanded?: boolean
}

/**
 * MetricExplainer Component
 *
 * Renders a detailed breakdown of how a metric was calculated.
 * This is the core "Learning Mode" component that provides
 * full transparency into the calculation pipeline.
 */
export function MetricExplainer({
  explain,
  defaultExpanded = false,
}: MetricExplainerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [activeTab, setActiveTab] = useState<'steps' | 'inputs' | 'weights'>('steps')

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
      >
        <span className="font-medium text-sm">
          {expanded ? 'Hide' : 'Show'} Calculation Breakdown
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Interpretation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {explain.interpretation}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <TabButton
              active={activeTab === 'steps'}
              onClick={() => setActiveTab('steps')}
            >
              Steps ({explain.steps.length})
            </TabButton>
            <TabButton
              active={activeTab === 'inputs'}
              onClick={() => setActiveTab('inputs')}
            >
              Inputs
            </TabButton>
            <TabButton
              active={activeTab === 'weights'}
              onClick={() => setActiveTab('weights')}
            >
              Weights
            </TabButton>
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'steps' && <StepsPanel steps={explain.steps} />}
            {activeTab === 'inputs' && <InputsPanel inputs={explain.inputs} />}
            {activeTab === 'weights' && (
              <WeightsPanel
                weights={explain.weights}
                constants={explain.constants}
              />
            )}
          </div>

          {/* Notes */}
          {explain.notes.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium mb-2">Notes</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {explain.notes.map((note, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources */}
          {explain.sources.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium mb-2">Sources</h4>
              <ul className="text-sm space-y-1">
                {explain.sources.map((source, i) => (
                  <li key={i}>
                    <a
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {source}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  )
}

function StepsPanel({ steps }: { steps: CalculationStep[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <div
          key={step.order}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center justify-center mr-2">
                {step.order}
              </span>
              <span className="text-sm font-medium">{step.description}</span>
            </div>
            <span className="text-sm font-mono font-bold text-green-600 dark:text-green-400">
              = {step.result}
            </span>
          </div>
          <div className="ml-8">
            <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
              {step.formula}
            </code>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(step.values).map(([key, value]) => (
                <span
                  key={key}
                  className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                >
                  {key}: <span className="font-mono">{value}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function InputsPanel({ inputs }: { inputs: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Object.entries(inputs).map(([key, value]) => (
        <div
          key={key}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center"
        >
          <div className="text-2xl font-bold font-mono">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{key}</div>
        </div>
      ))}
    </div>
  )
}

function WeightsPanel({
  weights,
  constants,
}: {
  weights?: Record<string, number>
  constants?: Record<string, number>
}) {
  return (
    <div className="space-y-4">
      {weights && (
        <div>
          <h4 className="text-sm font-medium mb-2">Weights (per event)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(weights).map(([key, value]) => (
              <div
                key={key}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center"
              >
                <div className="text-xl font-bold font-mono">{value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {key}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {constants && (
        <div>
          <h4 className="text-sm font-medium mb-2">League Constants</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(constants).map(([key, value]) => (
              <div
                key={key}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center"
              >
                <div className="text-xl font-bold font-mono">{value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {key}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
