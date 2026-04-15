export interface Element {
  id: string;
  name: string;
  description: string;
  image?: string;
  emoji?: string;
  svg?: string;
  isBase?: boolean;
  discoveredAt?: number;
}

export interface CanvasElement extends Element {
  instanceId: string;
  x: number;
  y: number;
}

export const BASE_ELEMENTS: Element[] = [
  { id: 'fire', name: 'Fire', description: 'Hot and dangerous.', isBase: true, emoji: '🔥' },
  { id: 'water', name: 'Water', description: 'The source of life.', isBase: true, emoji: '💧' },
  { id: 'earth', name: 'Earth', description: 'Solid ground.', isBase: true, emoji: '🌍' },
  { id: 'air', name: 'Air', description: 'Essential for breathing.', isBase: true, emoji: '🌬️' },
];

