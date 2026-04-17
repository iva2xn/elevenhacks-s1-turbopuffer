const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const { generateSound } = require('./lib/elevenlabs');
const { BASE_ELEMENTS } = require('./lib/types');

async function seedBaseSounds() {
  console.log('--- Generating sounds for BASE_ELEMENTS ---');
  for (const base of BASE_ELEMENTS) {
    if (base.soundPrompt) {
      console.log(`Checking sound for base element: ${base.name}`);
      const res = await generateSound(base.id, base.soundPrompt);
      if (res) {
         console.log(`✅ Generated: ${res}`);
      } else {
         console.log(`❌ Failed: ${base.name}`);
      }
    }
  }
}

seedBaseSounds();
