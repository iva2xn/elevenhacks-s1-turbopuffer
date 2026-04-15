import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { Element } from './types';

// The new SDK automatically uses GOOGLE_APPLICATION_CREDENTIALS from .env.local
const ai = new GoogleGenAI({
  project: process.env.GOOGLE_CLOUD_PROJECT || 'live-agents-hackathon',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'global',
  vertexai: true,
});

const MODEL_ID = 'gemini-3.1-flash-lite-preview';
const EMBEDDING_MODEL_ID = 'text-embedding-004';

export async function embedText(text: string): Promise<number[]> {
  try {
    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL_ID,
      contents: [{ parts: [{ text }] }],
    });
    
    const values = response.embeddings?.[0]?.values;
    if (!values) {
      throw new Error('No embedding values returned from Gemini');
    }
    
    return values;
  } catch (error) {
    console.error('Embedding failed:', error);
    // Fallback: return a zero vector of correct dimension (768 for text-embedding-004)
    return new Array(768).fill(0);
  }
}

export async function generateCombination(
  elementA: string,
  elementB: string,
  usedIcons: string[] = []
): Promise<Partial<Element> & { soundPrompt?: string }> {
  const usedList = usedIcons.length > 0 ? usedIcons.join(', ') : 'none';

  const prompt = `You are a master of alchemy and a world-class SVG artist. You MUST ALWAYS produce a result.

TASK: Combine "${elementA}" and "${elementB}" into a new element.

VISUAL RULES:
1. Pick a perfect emoji. If the best emoji is in [${usedList}], you MUST return null for emoji and generate an SVG.
2. SVG GENERATION (The Goal is PRECISE HIGH-FIDELITY ART):
   - Use viewBox="0 0 64 64".
   - MUST use <defs> with <linearGradient> and <radialGradient>.
   - MUST use overlapping <path> or <circle> elements to create depth.
   - Use <filter id="glow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>.
   - Design: 3D glossy style, vibrant saturation, and alchemical mystical vibes.
   - Make it look like a high-end, rare game asset.

AUDIO RULES:
1. Provide a "soundPrompt" for a sound effect. It MUST be Minecraft-themed. 
   Examples: "Minecraft-style block breaking", "8-bit water splash", "Retro pixelated fire crackle".

RESPOND WITH THIS EXACT JSON FORMAT:
{
  "name": "New Element Name",
  "description": "One-line poetic description",
  "emoji": "character OR null",
  "svg": "full <svg>...</svg> string OR null",
  "soundPrompt": "Description of the Minecraft-themed sound"
}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        // Set safety settings to be more permissive for creative alchemy
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      },
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('AI response blocked or empty.');

    const parsed = JSON.parse(text);
    if (!parsed.name) throw new Error('No name in response');

    let finalEmoji: string | undefined = parsed.emoji || undefined;
    let finalSvg: string | undefined = parsed.svg || undefined;
    
    if (finalEmoji && usedIcons.includes(finalEmoji)) {
      finalEmoji = undefined;
    }

    // If both are null, force a simple circle SVG so we don't have an empty icon
    if (!finalEmoji && !finalSvg) {
      finalSvg = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="28" fill="url(#grad)"/><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" /><stop offset="100%" style="stop-color:#4c1d95;stop-opacity:1" /></linearGradient></defs></svg>`;
    }

    return {
      id: parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: parsed.name,
      description: parsed.description || 'A mysterious new element.',
      emoji: finalEmoji,
      svg: finalSvg,
      soundPrompt: parsed.soundPrompt
    };
  } catch (error: any) {
    console.error('Gen AI Combination failed:', error.message);
    
    const fallbackName = `${elementA}-${elementB}`;
    return {
      id: fallbackName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: `${elementA} ${elementB}`,
      description: 'A strange fusion of elements.',
      soundPrompt: `Minecraft-style discovery sound for ${elementA} and ${elementB}`
    };
  }
}
