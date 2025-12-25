/**
 * Input data for hitter statistics
 * Used for wOBA and other batting metrics
 */
export interface HitterInputs {
  /** Walks (base on balls) */
  BB: number;
  /** Intentional walks (optional - will be subtracted from BB if provided) */
  IBB?: number;
  /** Hit by pitch */
  HBP: number;
  /** Singles */
  singles: number;
  /** Doubles */
  doubles: number;
  /** Triples */
  triples: number;
  /** Home runs */
  HR: number;
  /** At bats */
  AB: number;
  /** Sacrifice flies */
  SF: number;
  /** Plate appearances (optional - can be calculated) */
  PA?: number;
}

/**
 * Input data for pitcher statistics
 * Used for FIP and other pitching metrics
 */
export interface PitcherInputs {
  /** Home runs allowed */
  HR: number;
  /** Walks allowed */
  BB: number;
  /** Intentional walks (optional) */
  IBB?: number;
  /** Hit batters */
  HBP: number;
  /** Strikeouts */
  K: number;
  /** Innings pitched */
  IP: number;
}

/**
 * wOBA weights for a specific season
 * Values from FanGraphs: https://library.fangraphs.com/offense/woba/
 */
export interface WOBAWeights {
  season: number;
  wBB: number;
  wHBP: number;
  w1B: number;
  w2B: number;
  w3B: number;
  wHR: number;
  /** League average wOBA for context */
  lgwOBA: number;
  /** wOBA scale factor */
  wOBAScale: number;
}

/**
 * Step in a metric explanation
 */
export interface ExplainStep {
  /** Description of what this step does */
  description: string;
  /** The mathematical operation or formula */
  formula?: string;
  /** The computed value at this step */
  value: number | string;
  /** Optional breakdown of sub-components */
  components?: { name: string; value: number; weight?: number }[];
}

/**
 * Complete explanation packet for a metric calculation
 */
export interface ExplainPacket {
  /** Name of the metric */
  metricName: string;
  /** The final computed value */
  finalValue: number;
  /** Rating/interpretation of the value */
  rating: string;
  /** Raw inputs used */
  inputs: Record<string, number>;
  /** Weights or constants used (if applicable) */
  weights?: Record<string, number>;
  /** Step-by-step calculation breakdown */
  steps: ExplainStep[];
  /** Additional notes or caveats */
  notes: string[];
  /** Reference link for more information */
  referenceUrl?: string;
}

/**
 * Computed metrics result
 */
export interface ComputedMetrics {
  wOBA?: number;
  FIP?: number;
  OPSPlus?: number;
}

/**
 * Player information
 */
export interface Player {
  id: number;
  name: string;
  team: string;
  position: string;
  bats?: 'L' | 'R' | 'S';
  throws?: 'L' | 'R';
}

/**
 * API response wrapper with metadata
 */
export interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
    cache: 'HIT' | 'MISS';
    sourceLatencyMs: number;
    computedAt: string;
  };
}
