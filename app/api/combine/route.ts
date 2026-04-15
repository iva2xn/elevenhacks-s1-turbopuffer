import { NextRequest, NextResponse } from 'next/server';
import { getCachedCombination, saveCombination } from '@/lib/db';
import { generateCombination } from '@/lib/ai';
import { Element } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { elementA, elementB, usedIcons = [] } = await req.json();

    if (!elementA || !elementB) {
      return NextResponse.json({ error: 'Missing elements' }, { status: 400 });
    }

    // 1. Check cache
    const cached = await getCachedCombination(elementA, elementB);
    if (cached) {
      return NextResponse.json({ result: cached, cached: true });
    }

    // 2. Call AI — this ALWAYS returns a result (never null)
    const generated = await generateCombination(elementA, elementB, usedIcons);

    const newElement: Element = {
      id: generated.id || elementA + '-' + elementB,
      name: generated.name || `${elementA} ${elementB}`,
      description: generated.description || '',
      emoji: generated.emoji,
      svg: generated.svg,
      discoveredAt: Date.now()
    };

    // 3. Save to cache
    await saveCombination(elementA, elementB, newElement);

    return NextResponse.json({ result: newElement, cached: false });
  } catch (error) {
    console.error('Combination error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
