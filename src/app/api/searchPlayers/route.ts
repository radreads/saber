import { NextRequest, NextResponse } from 'next/server'
import { searchPlayers, PlayerSearchResult } from '@/lib/mlb-api'

/**
 * API Response format (from CLAUDE.md):
 * { data, meta: { requestId, cache, sourceLatencyMs } }
 */
interface ApiResponse {
  data: PlayerSearchResult[]
  meta: {
    requestId: string
    cache: 'hit' | 'miss'
    sourceLatencyMs: number
    totalMatches: number
  }
}

/**
 * GET /api/searchPlayers?q=<query>
 *
 * Search for MLB players by name.
 *
 * Learning point: This route runs on the SERVER.
 * The browser never calls MLB directly - it calls this route,
 * and this route calls MLB. This is the "middleman" pattern.
 */
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  // Validate input
  if (!query) {
    return NextResponse.json(
      { error: 'Missing query parameter "q"' },
      { status: 400 }
    )
  }

  if (query.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
      { status: 400 }
    )
  }

  try {
    // Call our MLB API client
    const result = await searchPlayers(query)
    const sourceLatencyMs = Date.now() - startTime

    const response: ApiResponse = {
      data: result.players,
      meta: {
        requestId,
        cache: result.fromCache ? 'hit' : 'miss',
        sourceLatencyMs,
        totalMatches: result.totalMatches,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[searchPlayers] Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to search players',
        meta: { requestId },
      },
      { status: 500 }
    )
  }
}
