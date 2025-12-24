/**
 * Sabermetrics Calculations
 *
 * Core metric computations: wOBA, FIP, OPS+
 * All formulas are documented with sources.
 */

/**
 * wOBA weights by season (source: FanGraphs)
 * https://library.fangraphs.com/offense/woba/
 */
export const WOBA_WEIGHTS: Record<number, {
  wBB: number
  wHBP: number
  w1B: number
  w2B: number
  w3B: number
  wHR: number
}> = {
  2024: {
    wBB: 0.690,
    wHBP: 0.720,
    w1B: 0.883,
    w2B: 1.244,
    w3B: 1.569,
    wHR: 2.015,
  },
}

/**
 * FIP constants by season (source: FanGraphs)
 * https://library.fangraphs.com/pitching/fip/
 */
export const FIP_CONSTANTS: Record<number, number> = {
  2024: 3.15,
}

// TODO: Implement wOBA calculation
// TODO: Implement FIP calculation
// TODO: Implement OPS+ calculation
