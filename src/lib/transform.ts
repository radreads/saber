/**
 * Data Transformation Layer
 *
 * Transforms raw MLB API JSON into stable internal models.
 * Never use raw API data directly in the UI.
 */

import type { PlayerSearchResult } from './mlb-api'

/**
 * Internal Player model (normalized)
 */
export interface Player {
  id: number
  name: string
  team: string | null
  position: string | null
  bats: string | null
  throws: string | null
}

/**
 * Transform raw MLB API player data to internal Player model
 */
export function transformPlayer(raw: PlayerSearchResult): Player {
  return {
    id: raw.id,
    name: raw.fullName,
    team: raw.currentTeam ?? null,
    position: raw.primaryPosition ?? null,
    bats: null, // Will be populated from detailed player info
    throws: null,
  }
}
