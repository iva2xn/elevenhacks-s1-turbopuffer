import { NextRequest, NextResponse } from 'next/server';
import { generateCombination } from '@/lib/ai';
import { getCachedCombination, saveCombination } from '@/lib/db';

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
  { a: 'Mud', b: 'Sand', name: 'Clay', emoji: '🏺', prompt: 'Wet earth squelch' },
  { a: 'Metal', b: 'Magma', name: 'Liquid Metal', emoji: '🥄', prompt: 'Hissing molten metal' },
  { a: 'Stone', b: 'Stone', name: 'Pebble', emoji: '🔘', prompt: 'Tiny stone click' },
  { a: 'Water', b: 'Water', name: 'Puddle', emoji: '💧', prompt: 'Liquid drip splash' },
  { a: 'Puddle', b: 'Water', name: 'Lake', emoji: '🌊', prompt: 'Calm water ripple' },
  { a: 'Lake', b: 'Water', name: 'Sea', emoji: '🗾', prompt: 'Ocean wave roll' },
  { a: 'Sea', b: 'Water', name: 'Ocean', emoji: '🌎', prompt: 'Deep sea ambience' },

  // THE PLATFORM PATH (SPECIAL REQUEST)
  { a: 'Stone', b: 'Time', name: 'Memory', emoji: '🧠', prompt: 'Mystical brain hum' },
  { a: 'Cloud', b: 'Memory', name: 'Turbopuffer', emoji: '🐡', prompt: 'Digital vector pop' },
  { a: 'Human', b: 'Air', name: 'Voice', emoji: '🗣️', prompt: 'Human vocalization' },
  { a: 'Computer', b: 'Mind', name: 'AI', emoji: '🤖', prompt: 'Electronic processing' },
  { a: 'Voice', b: 'AI', name: 'ElevenLabs', emoji: '🎙️', prompt: 'Smooth AI speech synthesis' },
  { a: 'Turbopuffer', b: 'ElevenLabs', name: 'Winner', emoji: '🏆', prompt: 'Golden victory fanfare' },
  { a: 'Cloud', b: 'Air', name: 'Sky', emoji: '🌌', prompt: 'Vast open sky ambience' },
  { a: 'Energy', b: 'Air', name: 'Sun', emoji: '☀️', prompt: 'Bright solar hum' },
  { a: 'Sky', b: 'Stone', name: 'Moon', emoji: '🌙', prompt: 'Quiet lunar silence' },
  { a: 'Sun', b: 'Sky', name: 'Daylight', emoji: '🌤️', prompt: 'Brinding morning birds' },
  { a: 'Life', b: 'Energy', name: 'Mind', emoji: '💡', prompt: 'Spark of consciousness' },

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
  { a: 'Liquid Metal', b: 'Clay', name: 'Bronze', emoji: '🪙', prompt: 'Solid metal resonance' },
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
  { a: 'Daylight', b: 'Moon', name: 'Time', emoji: '⏳', prompt: 'Grandfather clock tick' },
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

  // TIER 8: SOCIETY & CONCEPTS
  { a: 'Human', b: 'Money', name: 'Merchant', emoji: '🧑‍💼', prompt: 'Coin purse rattle' },
  { a: 'Human', b: 'Law', name: 'Judge', emoji: '🧑‍⚖️', prompt: 'Gavel pound' },
  { a: 'Human', b: 'Knowledge', name: 'Scientist', emoji: '🧑‍🔬', prompt: 'Liquid bubbling in glass' },
  { a: 'Human', b: 'Art', name: 'Masterpiece', emoji: '🖼️', prompt: 'Angelic choir note' },
  { a: 'Village', b: 'Wall', name: 'Fortress', emoji: '🏰', prompt: 'Heavy horn blast' },
  { a: 'City', b: 'Energy', name: 'Metropolis', emoji: '🏙️', prompt: 'Distant siren and traffic' },
  { a: 'Internet', b: 'Money', name: 'Bitcoin', emoji: '🪙', prompt: 'Digital coin chink' },
  { a: 'Internet', b: 'Human', name: 'Social Media', emoji: '📱', prompt: 'Multi-device notification chirp' },
  { a: 'Knowledge', b: 'Computer', name: 'Wikipedia', emoji: '📚', prompt: 'Paper page flip digital' },
  { a: 'Time', b: 'History', name: 'Library', emoji: '🏛️', prompt: 'Echoing hall silence' },
  { a: 'Money', b: 'Money', name: 'Bank', emoji: '🏦', prompt: 'Heavy vault door closing' },
  { a: 'Bank', b: 'Internet', name: 'Fintech', emoji: '💳', prompt: 'Credit card swipe beep' },

  // TIER 9: FOOD & CUISINE
  { a: 'Fire', b: 'Plant', name: 'Tobacco', emoji: '🚬', prompt: 'Deep slow exhale' },
  { a: 'Plant', b: 'Sun', name: 'Fruit', emoji: '🍎', prompt: 'Crisp bite crunch' },
  { a: 'Fruit', b: 'Fire', name: 'Jam', emoji: '🍯', prompt: 'Sticky jar opening' },
  { a: 'Tree', b: 'Fire', name: 'Charcoal', emoji: '🪵', prompt: 'Dry wood snap' },
  { a: 'Fruit', b: 'Time', name: 'Wine', emoji: '🍷', prompt: 'Cork pop' },
  { a: 'Wine', b: 'Fire', name: 'Vinegar', emoji: '🧪', prompt: 'Sharp acidic hiss' },
  { a: 'Fruit', b: 'Cold', name: 'Smoothie', emoji: '🥤', prompt: 'Blender whir' },
  { a: 'Milk', b: 'Cold', name: 'Ice Cream', emoji: '🍦', prompt: 'Sweet soft chime' },
  { a: 'Milk', b: 'Time', name: 'Cheese', emoji: '🧀', prompt: 'Dense knife cut' },
  { a: 'Dough', b: 'Cheese', name: 'Pizza', emoji: '🍕', prompt: 'Italian accordion chord' },
  { a: 'Meat', b: 'Fire', name: 'Steak', emoji: '🥩', prompt: 'Sizzling grill hiss' },
  { a: 'Steak', b: 'Bread', name: 'Burger', emoji: '🍔', prompt: 'Satisfying bite sound' },
  { a: 'Fish', b: 'Rice', name: 'Sushi', emoji: '🍣', prompt: 'Soft chopstick click' },
  { a: 'Water', b: 'Plant', name: 'Tea', emoji: '🍵', prompt: 'Hot water pour' },
  { a: 'Seed', b: 'Fire', name: 'Coffee', emoji: '☕', prompt: 'Espresso machine hiss' },

  // TIER 10: MYTHOLOGY & FANTASY
  { a: 'Human', b: 'Death', name: 'Ghost', emoji: '👻', prompt: 'Eerie low whistle' },
  { a: 'Ghost', b: 'Earth', name: 'Zombie', emoji: '🧟', prompt: 'Gravelly groan' },
  { a: 'Human', b: 'Blood', name: 'Vampire', emoji: '🧛', prompt: 'Bat wing flutter' },
  { a: 'Human', b: 'Moon', name: 'Werewolf', emoji: '🐺', prompt: 'Distance wolf howl' },
  { a: 'Horse', b: 'Horn', name: 'Unicorn', emoji: '🦄', prompt: 'Magical sparkle neigh' },
  { a: 'Bird', b: 'Fire', name: 'Phoenix', emoji: '🐦‍🔥', prompt: 'Flaring wing rush' },
  { a: 'Lizard', b: 'Magic', name: 'Hydra', emoji: '🐍', prompt: 'Multi-head hiss' },
  { a: 'Man', b: 'Horse', name: 'Centaur', emoji: '🐎', prompt: 'Galloping hoofbeats' },
  { a: 'Man', b: 'Sea', name: 'Merman', emoji: '🧜‍♂️', prompt: 'Deep underwater splash' },
  { a: 'Magic', b: 'Weaponry', name: 'Excalibur', emoji: '🗡️', prompt: 'Divine metal hum' },
  { a: 'Magic', b: 'House', name: 'Wizard Tower', emoji: '🧙', prompt: 'Humming magical aura' },
  { a: 'Magic', b: 'Ring', name: 'Artifact', emoji: '💍', prompt: 'Pulsing magic chime' },

  // TIER 11: SPACE & COSMOS (EXPANDED)
  { a: 'Rocket', b: 'Mars', name: 'Colony', emoji: '🏘️', prompt: 'Air-lock pressurization' },
  { a: 'Star', b: 'Star', name: 'Binary System', emoji: '♊', prompt: 'Oscillating space hum' },
  { a: 'Sun', b: 'Death', name: 'Red Giant', emoji: '🔴', prompt: 'Deep solar roar' },
  { a: 'Red Giant', b: 'Death', name: 'Supernova', emoji: '🎆', prompt: 'Cataclysmic blast' },
  { a: 'Star', b: 'Metal', name: 'Neutron Star', emoji: '💫', prompt: 'Rapid pulsar click' },
  { a: 'Cosmos', b: 'Mind', name: 'Philosophy', emoji: '🧐', prompt: 'Reverberating thought' },
  { a: 'Sun', b: 'Moon', name: 'Eclipse', emoji: '🌑', prompt: 'Ominous hush sound' },
  { a: 'Earth', b: 'Sun', name: 'Orbit', emoji: '🔄', prompt: 'Cyclical celestial whir' },
  { a: 'Alien', b: 'Human', name: 'First Contact', emoji: '🛸', prompt: 'Multi-tonal synth greeting' },

  // TIER 12: EMOTIONS & ABSTRACTIONS
  { a: 'Human', b: 'Human', name: 'Love', emoji: '❤️', prompt: 'Soft harp pluck' },
  { a: 'Love', b: 'Time', name: 'Marriage', emoji: '💍', prompt: 'Wedding bell chime' },
  { a: 'Love', b: 'Death', name: 'Tragedy', emoji: '🎭', prompt: 'Crying violin note' },
  { a: 'Knowledge', b: 'Time', name: 'Wisdom', emoji: '👴', prompt: 'Deep resonant bell' },
  { a: 'Energy', b: 'Mind', name: 'Idea', emoji: '💡', prompt: 'High pitch bleep' },
  { a: 'Idea', b: 'Paper', name: 'Blueprint', emoji: '📜', prompt: 'Unrolling parchment' },
  { a: 'Pressure', b: 'Mind', name: 'Stress', emoji: '😰', prompt: 'Ticking clock speed-up' },
  { a: 'Music', b: 'Mind', name: 'Melody', emoji: '🎵', prompt: 'Short piano run' },
  { a: 'Melody', b: 'Sound', name: 'Harmony', emoji: '🎶', prompt: 'Perfect chord swell' },
  { a: 'Harmony', b: 'Chaos', name: 'Art', emoji: '🎨', prompt: 'Swishing paint stroke' },
  { a: 'Chaos', b: 'Air', name: 'Storm', emoji: '🌪️', prompt: 'Howling wind gust' },
  { a: 'Storm', b: 'Electricity', name: 'Lightning', emoji: '⚡', prompt: 'Sharp electric crack' },

  // TIER 13: ELEMENTS & MINERALS
  { a: 'Stone', b: 'Water', name: 'Erosion', emoji: '⏳', prompt: 'Sanding rock sound' },
  { a: 'Sand', b: 'Time', name: 'Hourglass', emoji: '⌛', prompt: 'Dropping sand hiss' },
  { a: 'Glass', b: 'Electricity', name: 'Fiber Optics', emoji: '🔦', prompt: 'High speed data pulse' },
  { a: 'Metal', b: 'Air', name: 'Oxidation', emoji: '🧪', prompt: 'Slow rustling corrosion' },
  { a: 'Carbon', b: 'Pressure', name: 'Diamond', emoji: '💎', prompt: 'Crystal glass clink' },
  { a: 'Diamond', b: 'Metal', name: 'Jewelry', emoji: '💍', prompt: 'Sparkling metal chime' },
  { a: 'Gold', b: 'Silver', name: 'Electrum', emoji: '📀', prompt: 'Dual metal resonance' },
  { a: 'Metal', b: 'Carbon', name: 'Steel', emoji: '🔩', prompt: 'Solid industrial clang' },
  { a: 'Steel', b: 'Electricity', name: 'Magnet', emoji: '🧲', prompt: 'Magnetic snap pull' },
  { a: 'Magnet', b: 'Electricity', name: 'Motor', emoji: '⚙️', prompt: 'Spinning electric hum' },
  { a: 'Motor', b: 'Tools', name: 'Robot', emoji: '🤖', prompt: 'Mechanical servo whir' },
  { a: 'Robot', b: 'AI', name: 'Android', emoji: '👤', prompt: 'Synthetic human voice' },
];



export async function GET(req: NextRequest) {
  const results = [];
  const usedEmojis = new Set<string>();

  for (const item of SEED_LIST) {
    if (usedEmojis.has(item.emoji)) {
      results.push(`Skipped duplicate emoji: ${item.emoji} for ${item.name}`);
      continue;
    }
    usedEmojis.add(item.emoji);

    // Check if already seeded
    const existing = await getCachedCombination(item.a, item.b);
    if (existing && existing.name === item.name) {
      results.push(`Already seeded: ${item.name}`);
      continue;
    }

    try {
      const result = await generateCombination(item.a, item.b);
      result.name = item.name;
      result.emoji = item.emoji;
      (result as any).soundPrompt = item.prompt;
      result.discoveredAt = Date.now();

      await saveCombination(item.a, item.b, result as any);
      results.push(`Seeded ${item.name}`);
      // Slower delay for large seed to avoid hitting tight quotas
      await new Promise(r => setTimeout(r, 3500));
    } catch (e: any) {
      results.push(`Failed ${item.name}: ${e.message}`);
    }
  }

  return NextResponse.json({ results, totalUnique: usedEmojis.size });
}
