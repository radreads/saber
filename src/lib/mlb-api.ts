/**
 * MLB Stats API Client
 *
 * This module handles all communication with the MLB Stats API.
 * All external API calls are made through this client.
 */

const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1'

export interface PlayerSearchResult {
  id: number
  fullName: string
  currentTeam?: string
  primaryPosition?: string
  active: boolean
}

/**
 * Search for players by name
 */
export async function searchPlayers(query: string): Promise<PlayerSearchResult[]> {
  // TODO: Implement MLB API call
  throw new Error('Not implemented')
}
