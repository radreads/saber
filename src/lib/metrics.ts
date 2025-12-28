/**
 * Metrics Computation Module
 *
 * This module contains the core calculation logic for advanced baseball metrics.
 * Each function follows the pattern: inputs → validate → compute → explain
 *
 * Key Design Principles:
 * 1. Never compute directly from raw API JSON
 * 2. Always validate inputs before calculation
 * 3. Provide full transparency via ExplainPacket
 * 4. Handle edge cases gracefully
 */

import type {
  HitterInputs,
  WobaResult,
  ExplainPacket,
  CalculationStep,
  MetricResult,
} from '@/types'
import { getWobaWeights } from './woba-weights'

// ============================================================================
// wOBA Calculation
// ============================================================================

/**
 * The wOBA Formula:
 *
 * wOBA = (wBB×(BB-IBB) + wHBP×HBP + w1B×1B + w2B×2B + w3B×3B + wHR×HR) / (AB + BB - IBB + SF + HBP)
 *
 * Where:
 * - wBB, wHBP, w1B, w2B, w3B, wHR are year-specific weights
 * - The denominator represents "plate appearances that result in a wOBA event"
 *
 * Key insight: IBB is excluded because the hitter has no control over it
 */

interface WobaValidation {
  isValid: boolean
  warnings: string[]
  errors: string[]
}

/**
 * Validate hitter inputs before wOBA calculation
 */
function validateWobaInputs(stats: HitterInputs): WobaValidation {
  const warnings: string[] = []
  const errors: string[] = []

  // Check for negative values
  const numericFields: (keyof HitterInputs)[] = [
    'PA', 'AB', 'BB', 'HBP', 'singles', 'doubles', 'triples', 'HR', 'SF',
  ]

  for (const field of numericFields) {
    const value = stats[field]
    if (typeof value === 'number' && value < 0) {
      errors.push(`${field} cannot be negative (got ${value})`)
    }
  }

  // Check for sufficient plate appearances
  if (stats.PA < 10) {
    warnings.push(
      `Small sample size: ${stats.PA} PA. wOBA is less reliable with fewer plate appearances.`
    )
  }

  // Check IBB doesn't exceed BB
  const ibb = stats.IBB ?? 0
  if (ibb > stats.BB) {
    errors.push(`IBB (${ibb}) cannot exceed total BB (${stats.BB})`)
  }

  // Sanity check: hits + walks should roughly match PA minus outs
  const totalOnBase = stats.singles + stats.doubles + stats.triples + stats.HR + stats.BB + stats.HBP
  if (totalOnBase > stats.PA) {
    warnings.push(
      `On-base events (${totalOnBase}) exceed plate appearances (${stats.PA}). Check your data.`
    )
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  }
}

/**
 * Compute wOBA with optional explain mode
 *
 * @param stats - Hitter statistics
 * @param season - Season year for weight lookup (defaults to 2024)
 * @param includeExplain - Whether to include detailed explanation
 * @returns wOBA result with optional explanation
 */
export function computeWoba(
  stats: HitterInputs,
  season: number = 2024,
  includeExplain: boolean = false
): MetricResult<WobaResult> {
  // Step 1: Validate inputs
  const validation = validateWobaInputs(stats)
  if (!validation.isValid) {
    throw new Error(`Invalid inputs: ${validation.errors.join('; ')}`)
  }

  // Step 2: Get season-specific weights
  const weights = getWobaWeights(season)

  // Step 3: Calculate non-intentional walks
  const nonIntentionalBB = stats.BB - (stats.IBB ?? 0)

  // Step 4: Calculate numerator (weighted sum of events)
  const bbContribution = weights.wBB * nonIntentionalBB
  const hbpContribution = weights.wHBP * stats.HBP
  const singlesContribution = weights.w1B * stats.singles
  const doublesContribution = weights.w2B * stats.doubles
  const triplesContribution = weights.w3B * stats.triples
  const hrContribution = weights.wHR * stats.HR

  const numerator =
    bbContribution +
    hbpContribution +
    singlesContribution +
    doublesContribution +
    triplesContribution +
    hrContribution

  // Step 5: Calculate denominator
  const denominator =
    stats.AB + stats.BB - (stats.IBB ?? 0) + stats.SF + stats.HBP

  // Step 6: Calculate wOBA (guard against division by zero)
  const wOBA = denominator > 0 ? numerator / denominator : 0

  // Build components breakdown
  const components = [
    { name: 'BB (non-IBB)', count: nonIntentionalBB, weight: weights.wBB, contribution: bbContribution },
    { name: 'HBP', count: stats.HBP, weight: weights.wHBP, contribution: hbpContribution },
    { name: '1B', count: stats.singles, weight: weights.w1B, contribution: singlesContribution },
    { name: '2B', count: stats.doubles, weight: weights.w2B, contribution: doublesContribution },
    { name: '3B', count: stats.triples, weight: weights.w3B, contribution: triplesContribution },
    { name: 'HR', count: stats.HR, weight: weights.wHR, contribution: hrContribution },
  ]

  const result: WobaResult = {
    wOBA: Number(wOBA.toFixed(3)),
    numerator: Number(numerator.toFixed(3)),
    denominator,
    components,
  }

  // Build explanation if requested
  if (includeExplain) {
    const explain = buildWobaExplanation(stats, weights, result, validation.warnings)
    return { value: result, explain }
  }

  return { value: result }
}

/**
 * Build a detailed explanation packet for wOBA calculation
 */
function buildWobaExplanation(
  stats: HitterInputs,
  weights: ReturnType<typeof getWobaWeights>,
  result: WobaResult,
  warnings: string[]
): ExplainPacket {
  const nonIntentionalBB = stats.BB - (stats.IBB ?? 0)

  const steps: CalculationStep[] = [
    {
      order: 1,
      description: 'Calculate non-intentional walks (BB - IBB)',
      formula: 'BB - IBB',
      values: { BB: stats.BB, IBB: stats.IBB ?? 0 },
      result: nonIntentionalBB,
    },
    {
      order: 2,
      description: 'Calculate walk contribution',
      formula: 'wBB × (BB - IBB)',
      values: { wBB: weights.wBB, 'BB-IBB': nonIntentionalBB },
      result: Number((weights.wBB * nonIntentionalBB).toFixed(3)),
    },
    {
      order: 3,
      description: 'Calculate HBP contribution',
      formula: 'wHBP × HBP',
      values: { wHBP: weights.wHBP, HBP: stats.HBP },
      result: Number((weights.wHBP * stats.HBP).toFixed(3)),
    },
    {
      order: 4,
      description: 'Calculate singles contribution',
      formula: 'w1B × 1B',
      values: { w1B: weights.w1B, '1B': stats.singles },
      result: Number((weights.w1B * stats.singles).toFixed(3)),
    },
    {
      order: 5,
      description: 'Calculate doubles contribution',
      formula: 'w2B × 2B',
      values: { w2B: weights.w2B, '2B': stats.doubles },
      result: Number((weights.w2B * stats.doubles).toFixed(3)),
    },
    {
      order: 6,
      description: 'Calculate triples contribution',
      formula: 'w3B × 3B',
      values: { w3B: weights.w3B, '3B': stats.triples },
      result: Number((weights.w3B * stats.triples).toFixed(3)),
    },
    {
      order: 7,
      description: 'Calculate home run contribution',
      formula: 'wHR × HR',
      values: { wHR: weights.wHR, HR: stats.HR },
      result: Number((weights.wHR * stats.HR).toFixed(3)),
    },
    {
      order: 8,
      description: 'Sum all weighted contributions (numerator)',
      formula: 'wBB×(BB-IBB) + wHBP×HBP + w1B×1B + w2B×2B + w3B×3B + wHR×HR',
      values: {
        bbPart: Number((weights.wBB * nonIntentionalBB).toFixed(3)),
        hbpPart: Number((weights.wHBP * stats.HBP).toFixed(3)),
        singlesPart: Number((weights.w1B * stats.singles).toFixed(3)),
        doublesPart: Number((weights.w2B * stats.doubles).toFixed(3)),
        triplesPart: Number((weights.w3B * stats.triples).toFixed(3)),
        hrPart: Number((weights.wHR * stats.HR).toFixed(3)),
      },
      result: result.numerator,
    },
    {
      order: 9,
      description: 'Calculate denominator (plate appearances minus IBB)',
      formula: 'AB + BB - IBB + SF + HBP',
      values: {
        AB: stats.AB,
        BB: stats.BB,
        IBB: stats.IBB ?? 0,
        SF: stats.SF,
        HBP: stats.HBP,
      },
      result: result.denominator,
    },
    {
      order: 10,
      description: 'Calculate final wOBA',
      formula: 'numerator / denominator',
      values: { numerator: result.numerator, denominator: result.denominator },
      result: result.wOBA,
    },
  ]

  // Generate interpretation based on wOBA value
  let interpretation: string
  if (result.wOBA >= 0.400) {
    interpretation = `Excellent (.400+): A wOBA of ${result.wOBA} is elite-level production, among the best in baseball.`
  } else if (result.wOBA >= 0.370) {
    interpretation = `Great (.370-.399): A wOBA of ${result.wOBA} indicates a well-above-average hitter.`
  } else if (result.wOBA >= 0.340) {
    interpretation = `Above Average (.340-.369): A wOBA of ${result.wOBA} is above the league average.`
  } else if (result.wOBA >= 0.310) {
    interpretation = `Average (.310-.339): A wOBA of ${result.wOBA} is around league average (${weights.leagueWOBA}).`
  } else if (result.wOBA >= 0.290) {
    interpretation = `Below Average (.290-.309): A wOBA of ${result.wOBA} is below league average.`
  } else {
    interpretation = `Poor (<.290): A wOBA of ${result.wOBA} indicates below-average offensive production.`
  }

  const notes = [
    `Using ${weights.season} season weights (league wOBA: ${weights.leagueWOBA})`,
    'IBB is excluded because the hitter has no control over intentional walks',
    'wOBA is scaled to look like OBP (typically .300-.400 range)',
    ...warnings,
  ]

  return {
    metricName: 'wOBA (Weighted On-Base Average)',
    metricValue: result.wOBA,
    inputs: {
      PA: stats.PA,
      AB: stats.AB,
      BB: stats.BB,
      IBB: stats.IBB ?? 0,
      HBP: stats.HBP,
      '1B': stats.singles,
      '2B': stats.doubles,
      '3B': stats.triples,
      HR: stats.HR,
      SF: stats.SF,
    },
    weights: {
      wBB: weights.wBB,
      wHBP: weights.wHBP,
      w1B: weights.w1B,
      w2B: weights.w2B,
      w3B: weights.w3B,
      wHR: weights.wHR,
    },
    constants: {
      wOBAScale: weights.wOBAScale,
      leagueWOBA: weights.leagueWOBA,
    },
    steps,
    notes,
    interpretation,
    sources: [
      'https://library.fangraphs.com/offense/woba/',
      'https://www.fangraphs.com/guts.aspx',
    ],
  }
}

/**
 * Quick wOBA calculation without explain mode
 * Convenience function for simple use cases
 */
export function quickWoba(stats: HitterInputs, season: number = 2024): number {
  const result = computeWoba(stats, season, false)
  return result.value.wOBA
}

/**
 * Get wOBA rating category
 */
export function getWobaRating(wOBA: number): string {
  if (wOBA >= 0.400) return 'Excellent'
  if (wOBA >= 0.370) return 'Great'
  if (wOBA >= 0.340) return 'Above Average'
  if (wOBA >= 0.310) return 'Average'
  if (wOBA >= 0.290) return 'Below Average'
  return 'Poor'
}

/**
 * Get color class for wOBA value (for UI styling)
 */
export function getWobaColorClass(wOBA: number): string {
  if (wOBA >= 0.400) return 'text-green-600 dark:text-green-400'
  if (wOBA >= 0.370) return 'text-green-500 dark:text-green-500'
  if (wOBA >= 0.340) return 'text-blue-500 dark:text-blue-400'
  if (wOBA >= 0.310) return 'text-gray-600 dark:text-gray-400'
  if (wOBA >= 0.290) return 'text-orange-500 dark:text-orange-400'
  return 'text-red-500 dark:text-red-400'
}
