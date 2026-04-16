import { generateCombination } from '../lib/ai';
import { saveCombination } from '../lib/db';
import { BASE_ELEMENTS } from '../lib/types';

const SEED_LIST = [
  // TIER 1: THE CORE FUSIONS
  { a: 'Fire', b: 'Water', name: 'Steam', emoji: '💨', prompt: '8-bit high pressure steam hiss' },
  { a: 'Fire', b: 'Earth', name: 'Magma', emoji: '🌋', prompt: 'Deep bubbling lava gurgle' },
  { a: 'Water', b: 'Earth', name: 'Mud', emoji: '💩', prompt: 'Squishy wet mud splash' },
  { a: 'Air', b: 'Earth', name: 'Dust', emoji: '🌪️', prompt: 'Soft wind-blown granular rustle' },
  { a: 'Air', b: 'Fire', name: 'Smoke', emoji: '🌫️', prompt: 'Retro crackling ember pops' },
  { a: 'Air', b: 'Water', name: 'Mist', emoji: '☁️', prompt: 'Gentle ethereal water vapor chime' },
  { a: 'Magma', b: 'Water', name: 'Obsidian', emoji: '🪨', prompt: 'Glassy stone mineral clink' },
  { a: 'Steam', b: 'Air', name: 'Cloud', emoji: '⛅', prompt: 'Soft airy puff sound' },
  { a: 'Mud', b: 'Fire', name: 'Brick', emoji: '🧱', prompt: 'Solid fired clay clonk' },
  { a: 'Dust', b: 'Fire', name: 'Ash', emoji: '⚱️', prompt: 'Soft powdery crumble' },
  { a: 'Earth', b: 'Earth', name: 'Pressure', emoji: '💎', prompt: 'Deep seismic squeeze' },
  { a: 'Pressure', b: 'Earth', name: 'Stone', emoji: '🪦', prompt: 'Heavy rock impact' },
  { a: 'Stone', b: 'Fire', name: 'Metal', emoji: '☄️', prompt: 'Metallic resonance clang' },
  { a: 'Stone', b: 'Air', name: 'Sand', emoji: '🏖️', prompt: 'Gravelly sand shift' },
  { a: 'Sand', b: 'Fire', name: 'Glass', emoji: '🥛', prompt: 'Sharp crystal chime' },
  { a: 'Metal', b: 'Fire', name: 'Tools', emoji: '🛠️', prompt: 'Industrial clanking' },
  { a: 'Water', b: 'Water', name: 'Puddle', emoji: '💧', prompt: 'Liquid drip splash' },
  { a: 'Puddle', b: 'Water', name: 'Lake', emoji: '🌊', prompt: 'Calm water ripple' },
  { a: 'Lake', b: 'Water', name: 'Sea', emoji: '🗾', prompt: 'Ocean wave roll' },
  { a: 'Sea', b: 'Water', name: 'Ocean', emoji: '🌎', prompt: 'Deep sea ambience' },

  // FOUNDATIONAL CELESTIALS
  { a: 'Energy', b: 'Air', name: 'Sun', emoji: '☀️', prompt: 'Radiant cosmic hum' },
  { a: 'Cloud', b: 'Air', name: 'Sky', emoji: '🌌', prompt: 'Open atmospheric resonance' },
  { a: 'Sky', b: 'Stone', name: 'Moon', emoji: '🌙', prompt: 'Quiet lunar chime' },
  { a: 'Life', b: 'Energy', name: 'Mind', emoji: '💡', prompt: 'Ethereal spark of thought' },

  // THE PLATFORM PATH (SPECIAL REQUEST)
  { a: 'Sun', b: 'Sky', name: 'Daylight', emoji: '🌤️', prompt: 'Bright morning birdsong' },
  { a: 'Daylight', b: 'Moon', name: 'Time', emoji: '⏳', prompt: 'Grandfather clock tick' },
  { a: 'Stone', b: 'Time', name: 'Memory', emoji: '🧠', prompt: 'Mystical brain hum' },
  { a: 'Cloud', b: 'Memory', name: 'Turbopuffer', emoji: '🐡', prompt: 'Digital vector pop' },
  { a: 'Human', b: 'Air', name: 'Voice', emoji: '🗣️', prompt: 'Human vocalization' },
  { a: 'Cloud', b: 'Voice', name: 'Cloud Voice', emoji: '🌐', prompt: 'Echoing digital broadcast' },
  { a: 'Computer', b: 'Mind', name: 'AI', emoji: '🤖', prompt: 'Electronic processing' },
  { a: 'Voice', b: 'AI', name: 'ElevenLabs', emoji: '🎙️', prompt: 'Smooth AI speech synthesis' },
  { a: 'Turbopuffer', b: 'ElevenLabs', name: 'Winner', emoji: '🏆', prompt: 'Golden victory fanfare' },

  // TIER 2: NATURE & LIFE
  { a: 'Earth', b: 'Water', name: 'Plant', emoji: '🌱', prompt: 'Rustling leaves' },
  { a: 'Plant', b: 'Earth', name: 'Tree', emoji: '🌳', prompt: 'Deep wood creak' },
  { a: 'Tree', b: 'Tree', name: 'Forest', emoji: '🌲', prompt: 'Ambient woodland birds' },
  { a: 'Plant', b: 'Water', name: 'Reed', emoji: '🌾', prompt: 'Soft swamp rustle' },
  { a: 'Reed', b: 'Earth', name: 'Swamp', emoji: '🏜️', prompt: 'Wet marsh ambience' },
  { a: 'Cloud', b: 'Water', name: 'Rain', emoji: '🌧️', prompt: 'Steady rainwater pitter-patter' },
  { a: 'Rain', b: 'Water', name: 'Storm', emoji: '⛈️', prompt: 'Thunder and heavy rain' },
  { a: 'Cloud', b: 'Cold', name: 'Snow', emoji: '❄️', prompt: 'Soft winter silence' },
  { a: 'Snow', b: 'Earth', name: 'Glacier', emoji: '🏔️', prompt: 'Deep ice crackling' },
  { a: 'Rain', b: 'Sun', name: 'Rainbow', emoji: '🌈', prompt: 'Ethereal light shimmer' },
  { a: 'Plant', b: 'Wind', name: 'Seed', emoji: '🍂', prompt: 'Dry leaf rattle' },
  { a: 'Seed', b: 'Earth', name: 'Flower', emoji: '🌻', prompt: 'Gentle bloom sound' },
  { a: 'Flower', b: 'Wind', name: 'Pollen', emoji: '🍯', prompt: 'Sweet nectar hum' },
  { a: 'Ocean', b: 'Wind', name: 'Hurricane', emoji: '🌪️', prompt: 'Violent swirling wind' },
  { a: 'Rainbow', b: 'Mist', name: 'Unicorn', emoji: '🦄', prompt: 'Magical sparkle neigh' },
  { a: 'Plant', b: 'Mud', name: 'Mushroom', emoji: '🍄', prompt: 'Soft fungus pop' },

  // TIER 3: CRAFTING & INDUSTRY
  { a: 'Clay', b: 'Fire', name: 'Ceramic', emoji: '🏺', prompt: 'Hard pottery clink' },
  { a: 'Metal', b: 'Stone', name: 'Blade', emoji: '⚔️', prompt: 'Sharp metal unsheath' },
  { a: 'Blade', b: 'Wood', name: 'Axe', emoji: '🪓', prompt: 'Wood chopping thud' },
  { a: 'Metal', b: 'Water', name: 'Rust', emoji: '⚙️', prompt: 'Reedy metal grating' },
  { a: 'Metal', b: 'Metal', name: 'Chain', emoji: '⛓️', prompt: 'Rattling metal links' },
  { a: 'Chain', b: 'Tools', name: 'Weaponry', emoji: '🔨', prompt: 'Forging hammer strike' },
  { a: 'Brick', b: 'Brick', name: 'Wall', emoji: '📐', prompt: 'Solid construction thud' },
  { a: 'Wall', b: 'Wall', name: 'House', emoji: '🏠', prompt: 'Distant door closing' },
  { a: 'House', b: 'House', name: 'Village', emoji: '🏘️', prompt: 'Ambient town chatter' },
  { a: 'Village', b: 'House', name: 'City', emoji: '🏙️', prompt: 'Busy urban hum' },
  { a: 'Wood', b: 'Wood', name: 'Planks', emoji: '🪜', prompt: 'Wooden board clatter' },
  { a: 'Glass', b: 'Smoke', name: 'Sunglasses', emoji: '🕶️', prompt: 'Plastic lens click' },
  { a: 'Glass', b: 'Sun', name: 'Lens', emoji: '🔍', prompt: 'Light focusing hum' },
  { a: 'Lens', b: 'Lens', name: 'Telescope', emoji: '🔭', prompt: 'Mechanical slide click' },
  { a: 'Lens', b: 'Glass', name: 'Spectacles', emoji: '👓', prompt: 'Folding glass click' },
  { a: 'Metal', b: 'Fire', name: 'Bronze', emoji: '🪙', prompt: 'Solid metal resonance' },
  { a: 'Wood', b: 'Sea', name: 'Boat', emoji: '🛶', prompt: 'Wooden hull creak' },
  { a: 'Boat', b: 'Wood', name: 'Ship', emoji: '🚢', prompt: 'Deep fog horn' },
  { a: 'Ship', b: 'Metal', name: 'Steamship', emoji: '⛴️', prompt: 'Deep steam engine hum' },
  { a: 'Smoke', b: 'Metal', name: 'Train', emoji: '🚂', prompt: 'Steam whistle blast' },
  { a: 'Tools', b: 'Earth', name: 'Plow', emoji: '🚜', prompt: 'Heavy soil turning' },
  { a: 'Harvest', b: 'Stone', name: 'Flour', emoji: '🥯', prompt: 'Gritty grinding sound' },
  { a: 'Flour', b: 'Water', name: 'Dough', emoji: '🫓', prompt: 'Squishy kneading sound' },
  { a: 'Dough', b: 'Fire', name: 'Bread', emoji: '🍞', prompt: 'Crusty loaf crackle' },
  { a: 'Glass', b: 'Metal', name: 'Mirror', emoji: '🪞', prompt: 'Crystal glass chime' },
  { a: 'Steel', b: 'Wall', name: 'Skyscraper', emoji: '🏢', prompt: 'Modern elevator hum' },
  { a: 'Brick', b: 'Clay', name: 'Pottery', emoji: '🍶', prompt: 'Ceramic clunk' },

  // TIER 4: SCIENCE & CIVILIZATION
  { a: 'Fire', b: 'Fire', name: 'Energy', emoji: '⚡', prompt: 'High voltage hum' },
  { a: 'Energy', b: 'Metal', name: 'Electricity', emoji: '🔌', prompt: 'Static zapping' },
  { a: 'Electricity', b: 'Glass', name: 'Lightbulb', emoji: '💡', prompt: 'Filament spark click' },
  { a: 'Lightbulb', b: 'Metal', name: 'Flashlight', emoji: '🔦', prompt: 'Clicky switch sound' },
  { a: 'Electricity', b: 'Tools', name: 'Engine', emoji: '🏭', prompt: 'Industrial motor roar' },
  { a: 'Engine', b: 'Dust', name: 'Car', emoji: '🚗', prompt: 'Automobile engine rev' },
  { a: 'Engine', b: 'Air', name: 'Airplane', emoji: '✈️', prompt: 'Jet engine whine' },
  { a: 'Airplane', b: 'Energy', name: 'Rocket', emoji: '🚀', prompt: 'Massive rocket ignition' },
  { a: 'Rocket', b: 'Moon', name: 'Astronaut', emoji: '👨‍🚀', prompt: 'Static radio comms' },
  { a: 'Telescope', b: 'Stars', name: 'Galaxy', emoji: '✨', prompt: 'Ethereal cosmic chime' },
  { a: 'Galaxy', b: 'Energy', name: 'Cosmos', emoji: '🪐', prompt: 'Deep space vibration' },
  { a: 'Glass', b: 'Alchemy', name: 'Beaker', emoji: '🧪', prompt: 'Bubbling chemical glass' },
  { a: 'Alchemy', b: 'Stone', name: 'Gold', emoji: '🟡', prompt: 'Heavy coin clink' },
  { a: 'Gold', b: 'Tools', name: 'Crown', emoji: '👑', prompt: 'Regal metal resonance' },
  { a: 'Crown', b: 'Village', name: 'Kingdom', emoji: '🏰', prompt: 'Medieval trumpet fanfare' },
  { a: 'Tools', b: 'Energy', name: 'Computer', emoji: '💻', prompt: 'Modern server hum' },
  { a: 'Computer', b: 'Electricity', name: 'Internet', emoji: '🌐', prompt: 'Dial-up modem sounds' },
  { a: 'Computer', b: 'Tools', name: 'Smartphone', emoji: '📱', prompt: 'Digital notification ding' },
  { a: 'Time', b: 'Earth', name: 'Fossil', emoji: '🦴', prompt: 'Ancient rock crumble' },

  // TIER 5: LIFE & BIOLOGY
  { a: 'Sea', b: 'Energy', name: 'Life', emoji: '🦠', prompt: 'Squishy cellular movement' },
  { a: 'Life', b: 'Earth', name: 'Insect', emoji: '🐛', prompt: 'Tiny skittering' },
  { a: 'Insect', b: 'Plant', name: 'Butterfly', emoji: '🦋', prompt: 'Soft wing flapping' },
  { a: 'Life', b: 'Water', name: 'Fish', emoji: '🐟', prompt: 'Underwater bubble pop' },
  { a: 'Fish', b: 'Earth', name: 'Lizard', emoji: '🦎', prompt: 'Dry scale rustle' },
  { a: 'Lizard', b: 'Fire', name: 'Dragon', emoji: '🐉', prompt: 'Deep primal roar' },
  { a: 'Lizard', b: 'Wind', name: 'Bird', emoji: '🦅', prompt: 'Majestic eagle screech' },
  { a: 'Life', b: 'Tree', name: 'Monkey', emoji: '🐒', prompt: 'Primal jungle hoot' },
  { a: 'Monkey', b: 'Tools', name: 'Human', emoji: '🚶', prompt: 'Clear human footstep' },
  { a: 'Human', b: 'Tools', name: 'Worker', emoji: '👷', prompt: 'Hammer on metal' },
  { a: 'Human', b: 'Paper', name: 'Author', emoji: '✍️', prompt: 'Scratching pen sound' },
  { a: 'Human', b: 'Paint', name: 'Artist', emoji: '🎨', prompt: 'Wet brush stroke' },
  { a: 'Human', b: 'Blade', name: 'Ninja', emoji: '🥷', prompt: 'Silent swift blade' },

  // TIER 6: ADVANCED TECH
  { a: 'Energy', b: 'Pressure', name: 'Atom', emoji: '⚛️', prompt: 'Nuclear hum' },
  { a: 'Atom', b: 'Energy', name: 'Nuclear Power', emoji: '💥', prompt: 'Deep energy vibration' },
  { a: 'AI', b: 'Human', name: 'Cyborg', emoji: '🦾', prompt: 'Hydraulic metal movement' },
  { a: 'Rocket', b: 'Telescope', name: 'Satellite', emoji: '🛰️', prompt: 'Distant space signal' },
  { a: 'Satellite', b: 'Internet', name: 'GPS', emoji: '🗺️', prompt: 'Digital map ping' },
  { a: 'Computer', b: 'Paint', name: 'Video Game', emoji: '🎮', prompt: '8-bit victory sound' },
  { a: 'Video Game', b: 'Sunglasses', name: 'VR', emoji: '🥽', prompt: 'Immersive digital hum' },
  { a: 'Energy', b: 'Mirror', name: 'Laser', emoji: '🔴', prompt: 'High frequency laser zap' },
  { a: 'Laser', b: 'Glass', name: 'CD', emoji: '📀', prompt: 'Plastic disc spinning' },
  { a: 'CD', b: 'Computer', name: 'Software', emoji: '💿', prompt: 'Digital installation bleep' },

  // TIER 7: ABSTRACT
  { a: 'Galaxy', b: 'Galaxy', name: 'Black Hole', emoji: '⬛', prompt: 'Terrifying void hum' },
  { a: 'Black Hole', b: 'Time', name: 'Singularity', emoji: '🌀', prompt: 'Warped sound glitch' },
  { a: 'Energy', b: 'Galaxy', name: 'Supernova', emoji: '🎇', prompt: 'Massive star explosion' },
  { a: 'Meditation', b: 'Energy', name: 'Enlightenment', emoji: '🎆', prompt: 'Calm harmonic chime' },
  { a: 'Time', b: 'Time', name: 'Infinity', emoji: '♾️', prompt: 'Infinite echoing tone' },
  { a: 'Death', b: 'Infinity', name: 'Underworld', emoji: '👹', prompt: 'Spooky spectral howl' },
  { a: 'Magic', b: 'Stone', name: 'Crystal Ball', emoji: '🔮', prompt: 'Mystical glass hum' },
  { a: 'History', b: 'Time', name: 'Past', emoji: '🏺', prompt: 'Dusty stone shuffle' },
  { a: 'World', b: 'Magic', name: 'Alchemy Quest', emoji: '🧙‍♂️', prompt: 'Level up jingle' },
];

async function seed() {
  console.log('Starting Alchemical Seeding...');
  const usedEmojis = new Set<string>();
  
  for (const item of SEED_LIST) {
    if (usedEmojis.has(item.emoji)) {
      console.warn(`⚠️ Duplicate emoji found: ${item.emoji} for ${item.name}. Skipping or please fix!`);
      // continue; // Optional: Enforce uniqueness rigorously
    }
    usedEmojis.add(item.emoji);

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
  console.log(`Seeding Complete! Processed ${usedEmojis.size} unique discoveries.`);
}

seed();
