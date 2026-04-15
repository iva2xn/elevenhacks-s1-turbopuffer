import { GoogleGenAI } from '@google/genai';
import { Element } from './types';

// The new SDK automatically uses GOOGLE_APPLICATION_CREDENTIALS from .env.local
const ai = new GoogleGenAI({
  project: process.env.GOOGLE_CLOUD_PROJECT || 'live-agents-hackathon',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'global',
  vertexai: true,
});

const MODEL_ID = 'gemini-3.1-flash-lite-preview';

export async function generateCombination(
  elementA: string,
  elementB: string,
  usedIcons: string[] = []
): Promise<Partial<Element>> {
  const usedList = usedIcons.length > 0 ? usedIcons.join(', ') : 'none';

  const prompt = `You are a master of alchemy. You MUST ALWAYS produce a result.

TASK: Combine "${elementA}" and "${elementB}" into a new element.

ABSOLUTE RULES:
1. You MUST return a new element. NEVER return null. NEVER say "impossible". Every pair creates something.
2. Be creative and surprising. Examples:
   - Fire + Fire = Sun
   - Water + Water = Ocean
   - Steam + Steam = Pressure
   - Mud + Fire = Brick
   - Ocean + Sun = Life
3. For the visual: pick an emoji that is NOT already used. Already used emojis: [${usedList}]
   If no unique emoji fits, set emoji to null and generate an SVG instead.
4. SVG must use viewBox="0 0 64 64", vibrant gradients, rounded shapes, 3D glossy style.

RESPOND WITH THIS EXACT JSON FORMAT:
{
  "name": "New Element Name",
  "description": "One-line poetic description",
  "emoji": "single emoji character or null if already used",
  "svg": "full <svg>...</svg> string or null if emoji is provided"
}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('AI response blocked or empty. Check safety filters or project quota.');

    const parsed = JSON.parse(text);
    if (!parsed.name) throw new Error('No name in response');

    let finalEmoji: string | undefined = parsed.emoji || undefined;
    let finalSvg: string | undefined = parsed.svg || undefined;
    
    if (finalEmoji && usedIcons.includes(finalEmoji)) {
      finalEmoji = undefined;
    }

    return {
      id: parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: parsed.name,
      description: parsed.description || 'A mysterious new element.',
      emoji: finalEmoji,
      svg: finalSvg,
    };
  } catch (error: any) {
    console.error('Gen AI Combination failed:', error.message);
    
    // Fallback logic
    const fallbackName = `${elementA}-${elementB}`;
    return {
      id: fallbackName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: `${elementA} ${elementB}`,
      description: 'A strange fusion of elements.',
    };
  }
}
