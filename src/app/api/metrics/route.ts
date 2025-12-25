import { NextRequest, NextResponse } from 'next/server';
import { calculateWOBA, explainWOBA } from '@/lib/metrics';
import { HitterInputs, ApiResponse, ExplainPacket } from '@/lib/types';

interface WOBARequest {
  inputs: HitterInputs;
  season?: number;
  explain?: boolean;
}

interface WOBAResponse {
  wOBA: number;
  rating: string;
  explain?: ExplainPacket;
}

/**
 * POST /api/metrics
 *
 * Calculate wOBA and optionally return the explanation packet
 *
 * Request body:
 * {
 *   inputs: HitterInputs,
 *   season?: number (defaults to 2024),
 *   explain?: boolean (defaults to false)
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json() as WOBARequest;

    // Validate required inputs
    if (!body.inputs) {
      return NextResponse.json(
        { error: 'Missing required field: inputs' },
        { status: 400 }
      );
    }

    const { inputs, season = 2024, explain = false } = body;

    // Validate input fields
    const requiredFields = ['AB', 'BB', 'HBP', 'singles', 'doubles', 'triples', 'HR', 'SF'];
    const missingFields = requiredFields.filter(
      field => inputs[field as keyof HitterInputs] === undefined
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required input fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Calculate wOBA
    const wOBA = calculateWOBA(inputs, season);

    // Build response
    const responseData: WOBAResponse = {
      wOBA: Math.round(wOBA * 1000) / 1000,
      rating: getWOBARating(wOBA),
    };

    // Include explanation if requested
    if (explain) {
      responseData.explain = explainWOBA(inputs, season);
    }

    const response: ApiResponse<WOBAResponse> = {
      data: responseData,
      meta: {
        requestId,
        cache: 'MISS', // No caching in V1 for computed metrics
        sourceLatencyMs: Date.now() - startTime,
        computedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate metrics',
        meta: { requestId },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/metrics
 *
 * Calculate wOBA from query parameters (simpler interface for testing)
 *
 * Query params: AB, BB, HBP, singles, doubles, triples, HR, SF, IBB (optional), season (optional), explain (optional)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const { searchParams } = new URL(request.url);

    // Parse inputs from query params
    const inputs: HitterInputs = {
      AB: parseInt(searchParams.get('AB') || '0', 10),
      BB: parseInt(searchParams.get('BB') || '0', 10),
      IBB: searchParams.get('IBB') ? parseInt(searchParams.get('IBB')!, 10) : undefined,
      HBP: parseInt(searchParams.get('HBP') || '0', 10),
      singles: parseInt(searchParams.get('singles') || '0', 10),
      doubles: parseInt(searchParams.get('doubles') || '0', 10),
      triples: parseInt(searchParams.get('triples') || '0', 10),
      HR: parseInt(searchParams.get('HR') || '0', 10),
      SF: parseInt(searchParams.get('SF') || '0', 10),
    };

    const season = parseInt(searchParams.get('season') || '2024', 10);
    const explain = searchParams.get('explain') === 'true';

    // Calculate wOBA
    const wOBA = calculateWOBA(inputs, season);

    // Build response
    const responseData: WOBAResponse = {
      wOBA: Math.round(wOBA * 1000) / 1000,
      rating: getWOBARating(wOBA),
    };

    if (explain) {
      responseData.explain = explainWOBA(inputs, season);
    }

    const response: ApiResponse<WOBAResponse> = {
      data: responseData,
      meta: {
        requestId,
        cache: 'MISS',
        sourceLatencyMs: Date.now() - startTime,
        computedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate metrics',
        meta: { requestId },
      },
      { status: 500 }
    );
  }
}

function getWOBARating(woba: number): string {
  if (woba >= 0.400) return 'Excellent';
  if (woba >= 0.370) return 'Great';
  if (woba >= 0.340) return 'Above Average';
  if (woba >= 0.320) return 'Average';
  if (woba >= 0.300) return 'Below Average';
  if (woba >= 0.290) return 'Poor';
  return 'Awful';
}
