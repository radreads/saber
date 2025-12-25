import { WOBAWeights } from './types';

/**
 * wOBA weights by season
 * Source: FanGraphs Guts! page - https://www.fangraphs.com/guts.aspx?type=cn
 *
 * These weights reflect the run value of each offensive event
 * relative to the league environment for that season.
 */
export const WOBA_WEIGHTS: Record<number, WOBAWeights> = {
  2024: {
    season: 2024,
    wBB: 0.697,
    wHBP: 0.726,
    w1B: 0.883,
    w2B: 1.244,
    w3B: 1.569,
    wHR: 2.032,
    lgwOBA: 0.315,
    wOBAScale: 1.204,
  },
  2023: {
    season: 2023,
    wBB: 0.696,
    wHBP: 0.726,
    w1B: 0.881,
    w2B: 1.256,
    w3B: 1.601,
    wHR: 2.075,
    lgwOBA: 0.318,
    wOBAScale: 1.179,
  },
  2022: {
    season: 2022,
    wBB: 0.699,
    wHBP: 0.722,
    w1B: 0.888,
    w2B: 1.253,
    w3B: 1.581,
    wHR: 2.101,
    lgwOBA: 0.310,
    wOBAScale: 1.212,
  },
  2021: {
    season: 2021,
    wBB: 0.692,
    wHBP: 0.722,
    w1B: 0.879,
    w2B: 1.242,
    w3B: 1.568,
    wHR: 2.015,
    lgwOBA: 0.318,
    wOBAScale: 1.189,
  },
  2020: {
    season: 2020,
    wBB: 0.699,
    wHBP: 0.728,
    w1B: 0.883,
    w2B: 1.238,
    w3B: 1.558,
    wHR: 1.979,
    lgwOBA: 0.320,
    wOBAScale: 1.185,
  },
  2019: {
    season: 2019,
    wBB: 0.690,
    wHBP: 0.720,
    w1B: 0.870,
    w2B: 1.217,
    w3B: 1.529,
    wHR: 1.940,
    lgwOBA: 0.320,
    wOBAScale: 1.157,
  },
};

/**
 * Get wOBA weights for a specific season
 * Falls back to the most recent available season if exact match not found
 */
export function getWOBAWeights(season: number): WOBAWeights {
  if (WOBA_WEIGHTS[season]) {
    return WOBA_WEIGHTS[season];
  }

  // Find the closest available season
  const availableSeasons = Object.keys(WOBA_WEIGHTS).map(Number).sort((a, b) => b - a);
  const closestSeason = availableSeasons.find(s => s <= season) || availableSeasons[0];

  return WOBA_WEIGHTS[closestSeason];
}

/**
 * Get list of available seasons with weights
 */
export function getAvailableSeasons(): number[] {
  return Object.keys(WOBA_WEIGHTS).map(Number).sort((a, b) => b - a);
}
