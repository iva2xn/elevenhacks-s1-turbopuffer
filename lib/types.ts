export interface Element {
  id: string;
  name: string;
  description: string;
  image?: string;
  emoji?: string;
  svg?: string;
  sound?: string;
  soundPrompt?: string;
  explanationSong?: string;
  isBase?: boolean;
  discoveredAt: number;
}

export interface CanvasElement extends Element {
  instanceId: string;
  x: number;
  y: number;
}

export const BASE_ELEMENTS: Element[] = [
  { id: 'fire', name: 'Fire', description: 'Hot and dangerous.', isBase: true, emoji: '🔥', discoveredAt: 0, soundPrompt: 'Crackling fire and embers', sound: '/sounds/fire.mp3' },
  { id: 'water', name: 'Water', description: 'The source of life.', isBase: true, emoji: '💧', discoveredAt: 0, soundPrompt: 'Gentle water ripples and splashes', sound: '/sounds/water.mp3' },
  { id: 'earth', name: 'Earth', description: 'Solid ground.', isBase: true, emoji: '🌍', discoveredAt: 0, soundPrompt: 'Deep shifting dirt and falling stones', sound: '/sounds/earth.mp3' },
  { id: 'air', name: 'Air', description: 'Essential for breathing.', isBase: true, emoji: '🌬️', discoveredAt: 0, soundPrompt: 'Soft whistling wind', sound: '/sounds/air.mp3' },
];

