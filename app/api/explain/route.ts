import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { generateExplanation } from '@/lib/elevenlabs';

const ai = new GoogleGenAI({
  project: process.env.GOOGLE_CLOUD_PROJECT || 'live-agents-hackathon',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'global',
  vertexai: true,
});

export async function POST(req: Request) {
  try {
    const { elementId, name, description } = await req.json();

    const prompt = `Write a short, catchy, 4-line rhyming explanation "song" about an alchemical element called "${name}". 
    Description: ${description}. 
    The lyrics should be fun, rhythmic, and perfect for a magical alchemy game. 
    Only return the lyrics, no other text.`;

    const lyricsResponse = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const lyrics = lyricsResponse.candidates?.[0]?.content?.parts?.[0]?.text || `Behold ${name}, so rare and grand, the finest find in all the land!`;
    
    const songUrl = await generateExplanation(elementId, lyrics);

    return NextResponse.json({ songUrl, lyrics });
  } catch (error) {
    console.error('Explain API failed:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
