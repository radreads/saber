import { HitterInputs, ExplainPacket, ExplainStep, WOBAWeights } from './types';
import { getWOBAWeights } from './woba-weights';

/**
 * Calculate wOBA (Weighted On-Base Average)
 *
 * wOBA measures a hitter's overall offensive value, with each outcome
 * weighted by its actual run value rather than treating all hits equally.
 *
 * Formula:
 * wOBA = (wBB×(BB-IBB) + wHBP×HBP + w1B×1B + w2B×2B + w3B×3B + wHR×HR) / (AB + BB - IBB + SF + HBP)
 *
 * @param inputs - The hitter's statistics
 * @param season - The season year (for proper weights)
 * @returns The calculated wOBA value
 */
export function calculateWOBA(inputs: HitterInputs, season: number = 2024): number {
  const weights = getWOBAWeights(season);

  // Calculate unintentional walks (IBB defaults to 0 if not provided)
  const uBB = inputs.BB - (inputs.IBB ?? 0);

  // Calculate numerator (weighted sum of all offensive events)
  const numerator =
    weights.wBB * uBB +
    weights.wHBP * inputs.HBP +
    weights.w1B * inputs.singles +
    weights.w2B * inputs.doubles +
    weights.w3B * inputs.triples +
    weights.wHR * inputs.HR;

  // Calculate denominator (plate appearances minus intentional walks)
  const denominator = inputs.AB + inputs.BB - (inputs.IBB ?? 0) + inputs.SF + inputs.HBP;

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

/**
 * Get a rating/interpretation for a wOBA value
 */
export function getWOBARating(woba: number): string {
  if (woba >= 0.400) return 'Excellent';
  if (woba >= 0.370) return 'Great';
  if (woba >= 0.340) return 'Above Average';
  if (woba >= 0.320) return 'Average';
  if (woba >= 0.300) return 'Below Average';
  if (woba >= 0.290) return 'Poor';
  return 'Awful';
}

/**
 * Generate a detailed explanation of a wOBA calculation
 *
 * This creates an ExplainPacket that breaks down:
 * - All inputs used
 * - The weights applied
 * - Step-by-step calculation
 * - Final interpretation
 *
 * @param inputs - The hitter's statistics
 * @param season - The season year (for proper weights)
 * @returns ExplainPacket with full calculation breakdown
 */
export function explainWOBA(inputs: HitterInputs, season: number = 2024): ExplainPacket {
  const weights = getWOBAWeights(season);
  const uBB = inputs.BB - (inputs.IBB ?? 0);

  // Calculate each weighted component
  const components = {
    walks: { count: uBB, weight: weights.wBB, value: weights.wBB * uBB },
    hitByPitch: { count: inputs.HBP, weight: weights.wHBP, value: weights.wHBP * inputs.HBP },
    singles: { count: inputs.singles, weight: weights.w1B, value: weights.w1B * inputs.singles },
    doubles: { count: inputs.doubles, weight: weights.w2B, value: weights.w2B * inputs.doubles },
    triples: { count: inputs.triples, weight: weights.w3B, value: weights.w3B * inputs.triples },
    homeRuns: { count: inputs.HR, weight: weights.wHR, value: weights.wHR * inputs.HR },
  };

  const numerator = Object.values(components).reduce((sum, c) => sum + c.value, 0);
  const denominator = inputs.AB + inputs.BB - (inputs.IBB ?? 0) + inputs.SF + inputs.HBP;
  const woba = denominator > 0 ? numerator / denominator : 0;

  // Build the steps array
  const steps: ExplainStep[] = [
    {
      description: 'Start with the hitter\'s raw counting stats for the season',
      components: [
        { name: 'At Bats (AB)', value: inputs.AB },
        { name: 'Walks (BB)', value: inputs.BB },
        { name: 'Intentional Walks (IBB)', value: inputs.IBB ?? 0 },
        { name: 'Hit By Pitch (HBP)', value: inputs.HBP },
        { name: 'Singles (1B)', value: inputs.singles },
        { name: 'Doubles (2B)', value: inputs.doubles },
        { name: 'Triples (3B)', value: inputs.triples },
        { name: 'Home Runs (HR)', value: inputs.HR },
        { name: 'Sacrifice Flies (SF)', value: inputs.SF },
      ],
      value: 'Raw inputs collected',
    },
    {
      description: `Apply ${season} season-specific weights to each offensive event`,
      formula: 'Each event type has a different run value based on league context',
      components: [
        { name: 'Walk weight (wBB)', value: weights.wBB },
        { name: 'HBP weight (wHBP)', value: weights.wHBP },
        { name: 'Single weight (w1B)', value: weights.w1B },
        { name: 'Double weight (w2B)', value: weights.w2B },
        { name: 'Triple weight (w3B)', value: weights.w3B },
        { name: 'Home Run weight (wHR)', value: weights.wHR },
      ],
      value: `Weights for ${season} season`,
    },
    {
      description: 'Calculate the weighted value of each event type',
      formula: 'weight × count for each event',
      components: [
        { name: `Walks: ${weights.wBB} × ${uBB}`, value: round(components.walks.value, 3) },
        { name: `HBP: ${weights.wHBP} × ${inputs.HBP}`, value: round(components.hitByPitch.value, 3) },
        { name: `Singles: ${weights.w1B} × ${inputs.singles}`, value: round(components.singles.value, 3) },
        { name: `Doubles: ${weights.w2B} × ${inputs.doubles}`, value: round(components.doubles.value, 3) },
        { name: `Triples: ${weights.w3B} × ${inputs.triples}`, value: round(components.triples.value, 3) },
        { name: `Home Runs: ${weights.wHR} × ${inputs.HR}`, value: round(components.homeRuns.value, 3) },
      ],
      value: `Weighted contributions`,
    },
    {
      description: 'Sum all weighted values to get the numerator',
      formula: `${round(components.walks.value, 3)} + ${round(components.hitByPitch.value, 3)} + ${round(components.singles.value, 3)} + ${round(components.doubles.value, 3)} + ${round(components.triples.value, 3)} + ${round(components.homeRuns.value, 3)}`,
      value: round(numerator, 3),
    },
    {
      description: 'Calculate plate appearances (excluding IBB) for the denominator',
      formula: `AB + BB - IBB + SF + HBP = ${inputs.AB} + ${inputs.BB} - ${inputs.IBB ?? 0} + ${inputs.SF} + ${inputs.HBP}`,
      value: denominator,
    },
    {
      description: 'Divide numerator by denominator to get wOBA',
      formula: `${round(numerator, 3)} ÷ ${denominator}`,
      value: round(woba, 3),
    },
  ];

  // Build notes based on the data
  const notes: string[] = [];

  if (inputs.IBB === undefined || inputs.IBB === 0) {
    notes.push('IBB data not available or zero - using all walks in calculation.');
  }

  if (denominator < 100) {
    notes.push(`Small sample size (${denominator} PA) - wOBA may not be reliable.`);
  }

  notes.push(`League average wOBA for ${season}: ${weights.lgwOBA}`);
  notes.push(`This player's wOBA is ${woba > weights.lgwOBA ? 'above' : woba < weights.lgwOBA ? 'below' : 'at'} league average.`);

  return {
    metricName: 'wOBA (Weighted On-Base Average)',
    finalValue: round(woba, 3),
    rating: getWOBARating(woba),
    inputs: {
      AB: inputs.AB,
      BB: inputs.BB,
      IBB: inputs.IBB ?? 0,
      HBP: inputs.HBP,
      '1B': inputs.singles,
      '2B': inputs.doubles,
      '3B': inputs.triples,
      HR: inputs.HR,
      SF: inputs.SF,
    },
    weights: {
      wBB: weights.wBB,
      wHBP: weights.wHBP,
      w1B: weights.w1B,
      w2B: weights.w2B,
      w3B: weights.w3B,
      wHR: weights.wHR,
      lgwOBA: weights.lgwOBA,
      wOBAScale: weights.wOBAScale,
    },
    steps,
    notes,
    referenceUrl: 'https://library.fangraphs.com/offense/woba/',
  };
}

/**
 * Round a number to a specified number of decimal places
 */
function round(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Calculate wRC+ (Weighted Runs Created Plus) from wOBA
 * This is a park and league adjusted version of wOBA
 *
 * Simplified formula (assumes no park factor):
 * wRC+ = ((wOBA - lgwOBA) / wOBAScale + lgR/PA) / lgR/PA * 100
 *
 * For V1, we'll use a simplified version
 */
export function calculateWRCPlus(woba: number, season: number = 2024): number {
  const weights = getWOBAWeights(season);

  // Simplified calculation without park factors
  // wRC+ = ((wOBA / lgwOBA) * 100
  const wrcPlus = (woba / weights.lgwOBA) * 100;

  return round(wrcPlus, 0);
}
