import { Element } from './types';
import { embedText } from './ai';

const TURBOPUFFER_API_KEY = process.env.NEXT_PUBLIC_TURBOPUFFER_API_KEY;
const NAMESPACE = 'alchemy-combinations';

export async function getCachedCombination(elementA: string, elementB: string): Promise<Element | null> {
  if (!TURBOPUFFER_API_KEY) return null;

  const key = [elementA, elementB].sort().join('+');
  
  // Minimal local cache just for instant feedback on base items
  const localCache: Record<string, Element> = {
    'Fire+Water': { id: 'steam', name: 'Steam', description: 'Hot vapor from boiling water.', emoji: '♨️' },
  };

  if (localCache[key]) return localCache[key];

  try {
    const response = await fetch(`https://api.turbopuffer.com/v1/vectors/${NAMESPACE}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURBOPUFFER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filters: ['id', 'Eq', key],
        include_attributes: ['name', 'description', 'emoji', 'svg', 'sound', 'discoveredAt']
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data && data.length > 0) {
      const row = data[0];
      const attr = row.attributes || row;
      
      const getVal = (v: any) => Array.isArray(v) ? v[0] : v;

      return {
        id: row.id,
        name: getVal(attr.name),
        description: getVal(attr.description),
        emoji: getVal(attr.emoji),
        svg: getVal(attr.svg),
        sound: getVal(attr.sound),
        discoveredAt: getVal(attr.discoveredAt)
      };
    }
  } catch (error) {
    console.error('Error fetching from Turbopuffer:', error);
  }

  return null;
}

export async function saveCombination(elementA: string, elementB: string, result: Element) {
  if (!TURBOPUFFER_API_KEY) return;

  const key = [elementA, elementB].sort().join('+');
  
  try {
    const vector = await embedText(`${result.name}: ${result.description}`);

    const response = await fetch(`https://api.turbopuffer.com/v1/vectors/${NAMESPACE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURBOPUFFER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids: [key],
        vectors: [vector],
        distance_metric: 'cosine_distance',
        attributes: {
          name: [result.name],
          description: [result.description],
          emoji: [result.emoji || ''],
          svg: [result.svg || ''],
          sound: [result.sound || ''],
          discoveredAt: [result.discoveredAt || Date.now()]
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Turbopuffer] Save failed (${response.status}):`, errorText);
    } else {
      console.log(`[Turbopuffer] Saved discovery! ${key} -> ${result.name}`);
    }
  } catch (error) {
    console.error('[Turbopuffer] Network error:', error);
  }
}
