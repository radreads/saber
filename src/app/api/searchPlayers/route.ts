import { NextRequest, NextResponse } from 'next/server'

/**
 * API Response format (from CLAUDE.md):
 * { data, meta: { requestId, cache, sourceLatencyMs } }
 */
interface ApiResponse<T> {
  data: T
  meta: {
    requestId: string
    cache: 'hit' | 'miss'
    sourceLatencyMs: number
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json(
      { error: 'Missing query parameter "q"' },
      { status: 400 }
    )
  }

  // TODO: Implement player search
  return NextResponse.json({
    data: [],
    meta: {
      requestId: crypto.randomUUID(),
      cache: 'miss',
      sourceLatencyMs: 0,
    },
  })
}
