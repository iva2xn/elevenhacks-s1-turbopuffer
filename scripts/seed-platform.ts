import { generateCombination } from '../lib/ai';
import { saveCombination } from '../lib/db';

const PLATFORM_NEEDED = [
  // FOUNDATIONAL CELESTIALS (The Missing Links)
  { a: 'Energy', b: 'Air', name: 'Sun', emoji: '☀️', prompt: 'Radiant cosmic hum' },
  { a: 'Cloud', b: 'Air', name: 'Sky', emoji: '🌌', prompt: 'Open atmospheric resonance' },
  { a: 'Sky', b: 'Stone', name: 'Moon', emoji: '🌙', prompt: 'Quiet lunar chime' },
  { a: 'Life', b: 'Energy', name: 'Mind', emoji: '💡', prompt: 'Ethereal spark of thought' },

  // THE PLATFORM PATH
  { a: 'Sun', b: 'Sky', name: 'Daylight', emoji: '🌤️', prompt: 'Bright morning birdsong' },
  { a: 'Daylight', b: 'Moon', name: 'Time', emoji: '⏳', prompt: 'Grandfather clock tick' },
  { a: 'Stone', b: 'Time', name: 'Memory', emoji: '🧠', prompt: 'Mystical brain hum' },
  { a: 'Cloud', b: 'Memory', name: 'Turbopuffer', emoji: '🐡', prompt: 'Digital vector pop' },
  { a: 'Human', b: 'Air', name: 'Voice', emoji: '🗣️', prompt: 'Human vocalization' },
  { a: 'Cloud', b: 'Voice', name: 'Cloud Voice', emoji: '🌐', prompt: 'Echoing digital broadcast' },
  { a: 'Computer', b: 'Mind', name: 'AI', emoji: '🤖', prompt: 'Electronic processing' },
  { a: 'Voice', b: 'AI', name: 'ElevenLabs', emoji: '🎙️', prompt: 'Smooth AI speech synthesis' },
  { a: 'Turbopuffer', b: 'ElevenLabs', name: 'Winner', emoji: '🏆', prompt: 'Golden victory fanfare' },
];

async function seedPlatform() {
  console.log('🚀 Seeding ONLY Platform Requirements...');
  for (const item of PLATFORM_NEEDED) {
    try {
      console.log(`Seeding: ${item.a} + ${item.b} -> ${item.name}`);
      const result = await generateCombination(item.a, item.b);
      result.name = item.name;
      result.emoji = item.emoji;
      (result as any).soundPrompt = item.prompt;
      result.discoveredAt = Date.now();
      await saveCombination(item.a, item.b, result as any);
      console.log(`✅ Seeded ${item.name}`);
      await new Promise(r => setTimeout(r, 1200));
    } catch (e) {
      console.error(`❌ Failed to seed ${item.name}:`, e);
    }
  }
  console.log('✨ Platform Seeding Complete!');
}

seedPlatform();
