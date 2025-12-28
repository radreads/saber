/**
 * Core type definitions for the Saber Moneyball Dashboard
 *
 * These types model the data flow: Raw API → Transform → Compute → Render
 */

// ============================================================================
// Player Types
// ============================================================================

export interface Player {
  id: string
  name: string
  team: string
  position: string
  bats: 'L' | 'R' | 'S'
  throws: 'L' | 'R'
}

// ============================================================================
// Hitter Stats & Inputs
// ============================================================================

/**
 * Raw hitting statistics used as inputs for wOBA calculation
 */
export interface HitterInputs {
  PA: number      // Plate Appearances
  AB: number      // At Bats
  BB: number      // Walks (total)
  IBB?: number    // Intentional Walks (optional, defaults to 0)
  HBP: number     // Hit By Pitch
  singles: number // 1B
  doubles: number // 2B
  triples: number // 3B
  HR: number      // Home Runs
  SF: number      // Sacrifice Flies
}

/**
 * Hitter stats with computed values
 */
export interface HitterStats extends HitterInputs {
  AVG?: number
  OBP?: number
  SLG?: number
  OPS?: number
}

// ============================================================================
// Pitcher Stats & Inputs
// ============================================================================

/**
 * Raw pitching statistics used as inputs for FIP calculation
 */
export interface PitcherInputs {
  IP: number      // Innings Pitched
  HR: number      // Home Runs allowed
  BB: number      // Walks (total)
  IBB?: number    // Intentional Walks (optional)
  HBP: number     // Hit By Pitch
  K: number       // Strikeouts
}

// ============================================================================
// wOBA Configuration
// ============================================================================

/**
 * Year-specific wOBA weights from FanGraphs
 * Values change slightly each year based on league run environment
 */
export interface WobaWeights {
  season: number
  wBB: number     // Walk weight
  wHBP: number    // Hit by pitch weight
  w1B: number     // Single weight
  w2B: number     // Double weight
  w3B: number     // Triple weight
  wHR: number     // Home run weight
  wOBAScale: number   // Scale factor for conversion to OBP scale
  leagueWOBA: number  // League average wOBA for the season
}

// ============================================================================
// Explain Mode Types
// ============================================================================

/**
 * A single step in the calculation breakdown
 */
export interface CalculationStep {
  order: number
  description: string
  formula: string
  values: Record<string, number>
  result: number
}

/**
 * Complete explanation packet for a metric
 * Used in "Learning Mode" to show full calculation transparency
 */
export interface ExplainPacket {
  metricName: string
  metricValue: number
  inputs: Record<string, number>
  weights?: Record<string, number>
  constants?: Record<string, number>
  steps: CalculationStep[]
  notes: string[]
  interpretation: string
  sources: string[]
}

// ============================================================================
// Computed Metrics
// ============================================================================

/**
 * Container for computed advanced metrics
 */
export interface ComputedMetrics {
  wOBA?: number
  FIP?: number
  OPSPlus?: number
}

/**
 * Result of a metric computation with optional explanation
 */
export interface MetricResult<T = number> {
  value: T
  explain?: ExplainPacket
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Metadata returned with every API response
 */
export interface ApiMeta {
  requestId: string
  cache: 'HIT' | 'MISS' | 'STALE'
  sourceLatencyMs: number
  computedAt: string
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T
  meta: ApiMeta
}

// ============================================================================
// wOBA Specific Types
// ============================================================================

export interface WobaResult {
  wOBA: number
  numerator: number
  denominator: number
  components: {
    name: string
    count: number
    weight: number
    contribution: number
  }[]
}

export interface WobaComputeRequest {
  stats: HitterInputs
  season?: number
}

export interface WobaComputeResponse extends ApiResponse<WobaResult> {
  explain?: ExplainPacket
}
