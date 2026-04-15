import { NextResponse } from 'next/server';

export async function GET() {
  const TURBOPUFFER_API_KEY = process.env.NEXT_PUBLIC_TURBOPUFFER_API_KEY;
  const NAMESPACE = 'alchemy-combinations';

  if (!TURBOPUFFER_API_KEY) {
    return NextResponse.json({ error: 'API key missing' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.turbopuffer.com/v1/vectors/${NAMESPACE}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TURBOPUFFER_API_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Turbopuffer' }, { status: response.status });
    }

    // Note: Turbopuffer's /vectors/{namespace} returns metadata including approximate total count
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Network error' }, { status: 500 });
  }
}
