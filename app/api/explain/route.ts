import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { generateMusicV2 } from '@/lib/elevenlabs';
import { getDiscoveryById, updateDiscovery } from '@/lib/db';

const ai = new GoogleGenAI({
  project: process.env.GOOGLE_CLOUD_PROJECT || 'live-agents-hackathon',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'global',
  vertexai: true,
});

export async function POST(req: Request) {
  try {
    const { elementId, name, description } = await req.json();

    console.log(`[Explain API] Crafting a musical explanation for: ${name}`);

    // 1. Check if we already have a song in the database
    const existing = await getDiscoveryById(elementId);
    if (existing?.explanationSong) {
      const filePath = path.join(process.cwd(), 'public', existing.explanationSong);
      if (fs.existsSync(filePath)) {
        console.log(`[Explain API] Using existing song for: ${name}`);
        return NextResponse.json({ songUrl: existing.explanationSong, lyrics: 'Lyrics loaded from vault...' });
      }
      console.log(`[Explain API] Song found in DB but missing from disk. Regenerating...`);
    }

    // 1. Ask Gemini to compose the song structure
    const prompt = `You are a mystical alchemical composer. 
    TASK: Compose a 30-second musical "explanation song" about an alchemical element called "${name}".
    Description: ${description}.

    Provide a valid JSON for the ElevenLabs Music API "composition_plan" format.
    The song should have 2 sections: A Verse (mysterious) and a Chorus (epic discovery).
    
    JSON STRUCTURE:
    {
      "composition_plan": {
        "positive_global_styles": ["ambient", "ethereal", "mystical vocals"],
        "negative_global_styles": [],
        "sections": [
          {
            "section_name": "Verse",
            "positive_local_styles": ["whispered vocals", "bells"],
            "negative_local_styles": [],
            "duration_ms": 15000,
            "lines": ["Line 1 of lyrics", "Line 2 of lyrics"]
          },
          {
            "section_name": "Chorus",
            "positive_local_styles": ["anthemic", "choir"],
            "negative_local_styles": [],
            "duration_ms": 15000,
            "lines": ["Line 1 of chorus", "Line 2 of chorus"]
          }
        ]
      }
    }
    
    ONLY return the valid JSON. No other text.`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' }
    });

    const planText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!planText) throw new Error('AI failed to generate song plan');

    const plan = JSON.parse(planText);

    // Extract lyrics for the UI display
    const lyrics = plan.composition_plan.sections.flatMap((s: any) => s.lines).join('\n');

    // 2. Generate the song using ElevenLabs Music V2
    const songUrl = await generateMusicV2(elementId, plan);

    if (!songUrl) {
      console.error('[Explain API] Failed to generate music V2 URL');
      return NextResponse.json({ error: 'Failed to generate song' }, { status: 500 });
    }

    // 3. Save to database (background)
    updateDiscovery(elementId, { explanationSong: songUrl }).catch(e => 
      console.error('[Explain API] Failed to update discovery with song:', e)
    );

    console.log(`[Explain API] Full song discovery generated at: ${songUrl}`);

    return NextResponse.json({ songUrl, lyrics });
  } catch (error: any) {
    console.error('Explain API failed:', error.message || error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
