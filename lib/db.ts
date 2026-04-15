import { Element } from './types';

export async function getCachedCombination(elementA: string, elementB: string): Promise<Element | null> {
  const key = [elementA, elementB].sort().join('+');
  const apiKey = process.env.NEXT_PUBLIC_TURBOPUFFER_API_KEY;
  
  // Minimal local cache just for instant feedback on base items
  const localCache: Record<string, Element> = {
    'Fire+Water': { id: 'steam', name: 'Steam', description: 'Hot vapor from boiling water.', emoji: '♨️' },

  };

  if (localCache[key]) return localCache[key];

  // Turbopuffer integration placeholder
  // If no exact match is found, we return null to trigger the INFINITE AI engine
  return null;
}

export async function saveCombination(elementA: string, elementB: string, result: Element) {
  const key = [elementA, elementB].sort().join('+');
  const apiKey = process.env.NEXT_PUBLIC_TURBOPUFFER_API_KEY;
  
  if (apiKey) {
    console.log(`[Turbopuffer] Saving discovery: ${key} -> ${result.name}`);
    // Real implementation would POST to turbopuffer API here
  }
}
