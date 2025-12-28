import type { WobaWeights } from '@/types'

/**
 * wOBA Weights by Season
 *
 * These weights are derived from linear weights values published by FanGraphs.
 * They represent the run value of each offensive event relative to league context.
 *
 * The weights change each year because the run environment changes:
 * - In high-offense years, HRs are relatively less valuable
 * - In low-offense years, any hit is more valuable
 *
 * Source: FanGraphs Guts! page (https://www.fangraphs.com/guts.aspx)
 *
 * Note: For learning purposes, we include a subset of recent seasons.
 * Production apps would fetch these dynamically or maintain a complete table.
 */

export const WOBA_WEIGHTS: Record<number, WobaWeights> = {
  2024: {
    season: 2024,
    wBB: 0.696,
    wHBP: 0.726,
    w1B: 0.883,
    w2B: 1.244,
    w3B: 1.569,
    wHR: 2.015,
    wOBAScale: 1.185,
    leagueWOBA: 0.314,
  },
  2023: {
    season: 2023,
    wBB: 0.698,
    wHBP: 0.728,
    w1B: 0.887,
    w2B: 1.253,
    w3B: 1.583,
    wHR: 2.027,
    wOBAScale: 1.188,
    leagueWOBA: 0.318,
  },
  2022: {
    season: 2022,
    wBB: 0.699,
    wHBP: 0.729,
    w1B: 0.888,
    w2B: 1.252,
    w3B: 1.578,
    wHR: 2.025,
    wOBAScale: 1.186,
    leagueWOBA: 0.310,
  },
  2021: {
    season: 2021,
    wBB: 0.692,
    wHBP: 0.722,
    w1B: 0.879,
    w2B: 1.242,
    w3B: 1.568,
    wHR: 2.015,
    wOBAScale: 1.178,
    leagueWOBA: 0.318,
  },
  2020: {
    season: 2020,
    wBB: 0.699,
    wHBP: 0.729,
    w1B: 0.882,
    w2B: 1.256,
    w3B: 1.594,
    wHR: 2.072,
    wOBAScale: 1.197,
    leagueWOBA: 0.320,
  },
  2019: {
    season: 2019,
    wBB: 0.690,
    wHBP: 0.720,
    w1B: 0.870,
    w2B: 1.217,
    w3B: 1.529,
    wHR: 1.940,
    wOBAScale: 1.157,
    leagueWOBA: 0.320,
  },
}

/**
 * Get wOBA weights for a specific season
 * Falls back to most recent available season if requested season not found
 */
export function getWobaWeights(season: number): WobaWeights {
  if (WOBA_WEIGHTS[season]) {
    return WOBA_WEIGHTS[season]
  }

  // Fall back to most recent season
  const availableSeasons = Object.keys(WOBA_WEIGHTS)
    .map(Number)
    .sort((a, b) => b - a)

  const fallbackSeason = availableSeasons[0]

  console.warn(
    `wOBA weights not available for ${season}, using ${fallbackSeason} weights`
  )

  return WOBA_WEIGHTS[fallbackSeason]
}

/**
 * Get all available seasons for wOBA weights
 */
export function getAvailableSeasons(): number[] {
  return Object.keys(WOBA_WEIGHTS)
    .map(Number)
    .sort((a, b) => b - a)
}
