import { NextRequest, NextResponse } from 'next/server'
import { computeWoba } from '@/lib/metrics'
import type { HitterInputs, ApiMeta, WobaComputeResponse } from '@/types'

/**
 * POST /api/metrics/woba
 *
 * Compute wOBA for a hitter with optional explain mode
 *
 * Request body:
 * {
 *   stats: HitterInputs,
 *   season?: number (defaults to 2024),
 *   explain?: boolean (defaults to false)
 * }
 *
 * Response:
 * {
 *   data: WobaResult,
 *   meta: ApiMeta,
 *   explain?: ExplainPacket
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now()
  const requestId = crypto.randomUUID()

  try {
    const body = await request.json()
    const { stats, season = 2024, explain = false } = body as {
      stats: HitterInputs
      season?: number
      explain?: boolean
    }

    // Validate required fields
    if (!stats) {
      return NextResponse.json(
        {
          error: 'Missing required field: stats',
          meta: buildMeta(requestId, startTime),
        },
        { status: 400 }
      )
    }

    // Validate stats object has required fields
    const requiredFields: (keyof HitterInputs)[] = [
      'PA', 'AB', 'BB', 'HBP', 'singles', 'doubles', 'triples', 'HR', 'SF',
    ]

    const missingFields = requiredFields.filter(
      (field) => typeof stats[field] !== 'number'
    )

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required stat fields: ${missingFields.join(', ')}`,
          meta: buildMeta(requestId, startTime),
        },
        { status: 400 }
      )
    }

    // Compute wOBA
    const result = computeWoba(stats, season, explain)

    const response: WobaComputeResponse = {
      data: result.value,
      meta: buildMeta(requestId, startTime),
      ...(result.explain && { explain: result.explain }),
    }

    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        error: message,
        meta: buildMeta(requestId, startTime),
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/metrics/woba
 *
 * Return API documentation and example
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/metrics/woba',
    method: 'POST',
    description: 'Compute wOBA (Weighted On-Base Average) for a hitter',
    requestBody: {
      stats: {
        PA: 'number (Plate Appearances)',
        AB: 'number (At Bats)',
        BB: 'number (Walks)',
        IBB: 'number (optional, Intentional Walks)',
        HBP: 'number (Hit By Pitch)',
        singles: 'number (1B)',
        doubles: 'number (2B)',
        triples: 'number (3B)',
        HR: 'number (Home Runs)',
        SF: 'number (Sacrifice Flies)',
      },
      season: 'number (optional, defaults to 2024)',
      explain: 'boolean (optional, include calculation breakdown)',
    },
    example: {
      stats: {
        PA: 500,
        AB: 420,
        BB: 70,
        IBB: 5,
        HBP: 8,
        singles: 80,
        doubles: 30,
        triples: 2,
        HR: 35,
        SF: 5,
      },
      season: 2024,
      explain: true,
    },
  })
}

function buildMeta(requestId: string, startTime: number): ApiMeta {
  return {
    requestId,
    cache: 'MISS', // Future: implement caching
    sourceLatencyMs: Math.round(performance.now() - startTime),
    computedAt: new Date().toISOString(),
  }
}
