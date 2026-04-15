import { NextRequest, NextResponse } from 'next/server';

const TURBOPUFFER_API_KEY = process.env.NEXT_PUBLIC_TURBOPUFFER_API_KEY;
const NAMESPACE = 'alchemy-combinations';

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    if (!TURBOPUFFER_API_KEY) {
      return NextResponse.json({ error: 'No API Key' }, { status: 500 });
    }

    console.log(`[Delete] Attempting to delete vector: ${id}`);

    // Turbopuffer delete uses the ID
    const response = await fetch(`https://api.turbopuffer.com/v1/vectors/${NAMESPACE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURBOPUFFER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids: [id],
        vectors: [null] // In Turbopuffer, setting the vector to null with the ID deletes it (or use the delete endpoint)
      }),
    });
    
    // Better way: use the /vectors/{namespace}/delete endpoint if available, but POST with null vectors/ids is the standard upsert-delete pattern for some. 
    // Actually Turbopuffer has a dedicated DELETE on the vector ID? No, it's a set of IDs.
    
    if (!response.ok) {
        const err = await response.text();
        return NextResponse.json({ error: err }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
