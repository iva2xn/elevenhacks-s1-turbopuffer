const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const apiKey = process.env.ELEVENLABS_API_KEY;
console.log('API Key length:', apiKey?.length);

async function testSound() {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'A soft bell chime',
        duration_seconds: 1.0,
      }),
    });

    console.log('Status:', response.status);
    if (!response.ok) {
      console.log('Error:', await response.text());
    } else {
      console.log('Success! Got audio buffer.');
    }
  } catch (e) {
    console.error('Fetch failed:', e);
  }
}

testSound();
