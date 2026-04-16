import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCachedCombination, saveCombination } from '@/lib/db';
import { generateCombination } from '@/lib/ai';
import { generateSound } from '@/lib/elevenlabs';
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
      // Check if sound file actually exists on disk (if it's a local path)
      let soundMissing = !cached.sound;
      if (cached.sound && cached.sound.startsWith('/sounds/')) {
        const filePath = path.join(process.cwd(), 'public', cached.sound);
        if (!fs.existsSync(filePath)) {
          console.log(`[Sound Missing] File not found at ${filePath}, force regenerating...`);
          soundMissing = true;
          cached.sound = ''; 
        }
      }

      // JIT Audio: If sound is missing but soundPrompt exists, generate it now
      if (soundMissing && (cached as any).soundPrompt) {
        console.log(`[JIT Audio] Generating sound for cached element: ${cached.name}`);
        const soundUrl = await generateSound(cached.id, (cached as any).soundPrompt);
        if (soundUrl) {
          cached.sound = soundUrl;
          // Update the cache with the newly generated sound (background)
          saveCombination(elementA, elementB, cached).catch(e => 
            console.error('Failed to update JIT sound in cache:', e)
          );
        }
      }
      return NextResponse.json({ result: cached, cached: true });
    }

    // 2. Call AI
    const generated = await generateCombination(elementA, elementB, usedIcons);

    const newElement: Element = {
      id: generated.id || elementA + '-' + elementB,
      name: generated.name || `${elementA} ${elementB}`,
      description: generated.description || '',
      emoji: generated.emoji,
      svg: generated.svg,
      discoveredAt: Date.now()
    };

    // 3. Generate sound effect
    if (generated.soundPrompt) {
      const soundUrl = await generateSound(newElement.id, generated.soundPrompt);
      if (soundUrl) {
        newElement.sound = soundUrl;
      }
    }

    // 4. Background: Save to cache (fire and forget)
    saveCombination(elementA, elementB, { 
      ...newElement, 
      soundPrompt: generated.soundPrompt 
    } as any).catch(e => 
      console.error('Background save failed:', e)
    );

    return NextResponse.json({ result: newElement, cached: false });
  } catch (error) {
    console.error('Combination error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
