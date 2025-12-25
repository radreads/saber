/**
 * MLB Stats API Client
 *
 * This module handles all communication with the MLB Stats API.
 * All external API calls are made through this client.
 *
 * Key learning: The MLB API doesn't have a name search endpoint.
 * We fetch all players and filter locally (with caching).
 */

import * as cache from './cache'

const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1'
const CURRENT_SEASON = 2024
const PLAYERS_CACHE_KEY = `players_${CURRENT_SEASON}`
const PLAYERS_CACHE_TTL = 60 * 60 * 6 // 6 hours in seconds

/**
 * Raw player data from MLB API
 * (This is what the API actually returns)
 */
interface MLBApiPlayer {
  id: number
  fullName: string
  firstName: string
  lastName: string
  primaryNumber?: string
  currentTeam?: {
    id: number
    name: string
  }
  primaryPosition?: {
    code: string
    name: string
    abbreviation: string
  }
  batSide?: {
    code: string
    description: string
  }
  pitchHand?: {
    code: string
    description: string
  }
  active: boolean
}

interface MLBApiPlayersResponse {
  people: MLBApiPlayer[]
}

/**
 * Our clean player search result
 * (Transformed from the raw API data)
 */
export interface PlayerSearchResult {
  id: number
  fullName: string
  firstName: string
  lastName: string
  jerseyNumber: string | null
  currentTeam: string | null
  teamId: number | null
  primaryPosition: string | null
  positionAbbrev: string | null
  bats: string | null
  throws: string | null
  active: boolean
}

/**
 * Transform raw MLB API player to our clean format
 */
function transformPlayer(raw: MLBApiPlayer): PlayerSearchResult {
  return {
    id: raw.id,
    fullName: raw.fullName,
    firstName: raw.firstName,
    lastName: raw.lastName,
    jerseyNumber: raw.primaryNumber ?? null,
    currentTeam: raw.currentTeam?.name ?? null,
    teamId: raw.currentTeam?.id ?? null,
    primaryPosition: raw.primaryPosition?.name ?? null,
    positionAbbrev: raw.primaryPosition?.abbreviation ?? null,
    bats: raw.batSide?.code ?? null,
    throws: raw.pitchHand?.code ?? null,
    active: raw.active,
  }
}

/**
 * Fetch all players from MLB API (with caching)
 *
 * Learning point: We fetch ALL players once and cache them.
 * This is better than hitting the API for every search.
 */
async function fetchAllPlayers(): Promise<PlayerSearchResult[]> {
  // Check cache first
  const cached = cache.get<PlayerSearchResult[]>(PLAYERS_CACHE_KEY)
  if (cached) {
    return cached
  }

  // Fetch from MLB API
  const url = `${MLB_API_BASE}/sports/1/players?season=${CURRENT_SEASON}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`MLB API error: ${response.status} ${response.statusText}`)
  }

  const data: MLBApiPlayersResponse = await response.json()
  const players = data.people.map(transformPlayer)

  // Cache the results
  cache.set(PLAYERS_CACHE_KEY, players, PLAYERS_CACHE_TTL)

  return players
}

/**
 * Search for players by name
 *
 * @param query - Search term (matches first name, last name, or full name)
 * @returns Matching players (max 25 results)
 */
export async function searchPlayers(query: string): Promise<{
  players: PlayerSearchResult[]
  fromCache: boolean
  totalMatches: number
}> {
  const allPlayers = await fetchAllPlayers()
  const fromCache = cache.has(PLAYERS_CACHE_KEY)

  // Normalize query for case-insensitive search
  const normalizedQuery = query.toLowerCase().trim()

  if (!normalizedQuery) {
    return { players: [], fromCache, totalMatches: 0 }
  }

  // Filter players whose name contains the query
  const matches = allPlayers.filter((player) => {
    const fullName = player.fullName.toLowerCase()
    const firstName = player.firstName.toLowerCase()
    const lastName = player.lastName.toLowerCase()

    return (
      fullName.includes(normalizedQuery) ||
      firstName.includes(normalizedQuery) ||
      lastName.includes(normalizedQuery)
    )
  })

  // Sort: exact matches first, then by name
  matches.sort((a, b) => {
    const aExact = a.fullName.toLowerCase() === normalizedQuery
    const bExact = b.fullName.toLowerCase() === normalizedQuery
    if (aExact && !bExact) return -1
    if (!aExact && bExact) return 1
    return a.fullName.localeCompare(b.fullName)
  })

  // Limit results
  const limited = matches.slice(0, 25)

  return {
    players: limited,
    fromCache,
    totalMatches: matches.length,
  }
}

/**
 * Get a single player by ID
 */
export async function getPlayer(playerId: number): Promise<PlayerSearchResult | null> {
  const allPlayers = await fetchAllPlayers()
  return allPlayers.find((p) => p.id === playerId) ?? null
}
