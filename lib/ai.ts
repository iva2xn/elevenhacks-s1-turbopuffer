import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { Element } from './types';
import fs from 'fs';
import path from 'path';

// Handle Google Cloud Auth for Vercel/Production
if (process.env.GCP_SERVICE_ACCOUNT) {
  const tempKeyPath = path.join('/tmp', 'gcp-key.json');
  try {
    fs.writeFileSync(tempKeyPath, process.env.GCP_SERVICE_ACCOUNT);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tempKeyPath;
  } catch (e) {
    console.error('Failed to write temporary GCP key:', e);
  }
}

// Decide between Vertex AI and Gemini API
const aiOptions: any = {};
if (process.env.GEMINI_API_KEY) {
  aiOptions.apiKey = process.env.GEMINI_API_KEY;
} else {
  aiOptions.project = process.env.GOOGLE_CLOUD_PROJECT || 'live-agents-hackathon';
  aiOptions.location = process.env.GOOGLE_CLOUD_LOCATION || 'global';
  aiOptions.vertexai = true;
}

export const ai = new GoogleGenAI(aiOptions);

const MODEL_ID = 'gemini-3.1-flash-lite-preview';
const EMBEDDING_MODEL_ID = 'text-embedding-004';

export async function embedText(text: string, retries = 3): Promise<number[]> {
  for (let i = 0; i < retries; i++) {
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
    } catch (error: any) {
      if (error.status === 429 && i < retries - 1) {
        const wait = Math.pow(2, i) * 1000;
        console.warn(`[Embedding] Rate limited. Retrying in ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      console.error('Embedding failed:', error);
      if (i === retries - 1) {
        // Fallback: return a zero vector of correct dimension (768 for text-embedding-004)
        return new Array(768).fill(0);
      }
    }
  }
  return new Array(768).fill(0);
}

export async function generateCombination(
  elementA: string,
  elementB: string,
  usedIcons: string[] = []
): Promise<Partial<Element> & { soundPrompt?: string }> {
  const usedList = usedIcons.length > 0 ? usedIcons.join(', ') : 'none';

  const prompt = `You are a legendary alchemist and world-class SVG artisan. 
  TASK: Synthesize a LIKELY and LOGICAL discovery from combining "${elementA}" and "${elementB}".
  
  LOGIC RULE: The result MUST make sense. Do not use overly 'epic' or 'gamey' names like 'Aether-Mist Prism'. 
  Think: What would literally happen if these two things collided or were mixed?
  Example: Fire + Water -> Steam (NOT 'Aqua-Flare Essence'). Earth + Fire -> Magma.

  VISUAL CONSTRAINTS (MANDATORY):
  1. EMOJI: Choose a fitting emoji. IF THE EMOJI IS IN THIS LIST: [${usedList}], IT IS STRICTLY FORBIDDEN to use it. In that case, you MUST set "emoji" to null and provide a full SVG.
  2. SVG (CRITICAL): If you cannot provide a NEW emoji, you MUST generate a high-fidelity SVG.
     - Style: 3D glossy, glassmorphic, vibrant colors, mystical.
     - Technical: viewBox="0 0 64 64". Use <defs>, <linearGradient>, and <filter id="glow">.
     - Depth: Use layered <path> and <circle> elements.
     - No placeholders. No simple shapes. Make it look like a unique artifact.

  AUDIO: Provide a Minecraft-themed sound prompt description.

  RESPONSE (VALID JSON ONLY):
  {
    "name": "Logical Result Name",
    "description": "Short poetic line",
    "emoji": "character OR null",
    "svg": "full <svg>...</svg> string OR null",
    "soundPrompt": "Minecraft sound description"
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

    // FORCE SVG if emoji is missing
    if (!finalEmoji && !finalSvg) {
      finalSvg = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="essenceGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#8D6E63;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2D1E17;stop-opacity:1" />
          </radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <circle cx="32" cy="32" r="24" fill="url(#essenceGrad)" filter="url(#glow)"/>
        <path d="M32 12 L38 28 L54 32 L38 36 L32 52 L26 36 L10 32 L26 28 Z" fill="rgba(255,255,255,0.2)" />
      </svg>`;
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
