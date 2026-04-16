import fs from 'fs';
import path from 'path';

export async function generateSound(id: string, prompt: string): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.warn('ELEVENLABS_API_KEY is missing. Skipping sound generation.');
    return null;
  }

  // Use a stable filename based on ID to avoid duplicates and allow caching
  const safeId = id.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const fileName = `${safeId}.mp3`;
  const soundsDir = path.join(process.cwd(), 'public', 'sounds');
  const filePath = path.join(soundsDir, fileName);

  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`[ElevenLabs] Sound already exists for: ${id}, skipping API call.`);
    return `/sounds/${fileName}`;
  }

  console.log(`[ElevenLabs] Generating sound for: ${id} with prompt: ${prompt}`);

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: 1.5,
        prompt_influence: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ElevenLabs] Sound generation failed (Status ${response.status}):`, errorText);
      return null;
    }

    const buffer = await response.arrayBuffer();
    
    if (!fs.existsSync(soundsDir)) {
      fs.mkdirSync(soundsDir, { recursive: true });
    }

    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    return `/sounds/${fileName}`;
  } catch (error) {
    console.error('Error in generateSound:', error);
    return null;
  }
}
export async function generateMusic(id: string, prompt: string): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  const safeId = id.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const fileName = `music_${safeId}.mp3`;
  const soundsDir = path.join(process.cwd(), 'public', 'sounds');
  const filePath = path.join(soundsDir, fileName);

  if (fs.existsSync(filePath)) {
    console.log(`[ElevenLabs] Music already exists for: ${id}, skipping API call.`);
    return `/sounds/${fileName}`;
  }

  console.log(`[ElevenLabs] Generating music for: ${id} with prompt: ${prompt}`);

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: 10.0, // Longer for music
        prompt_influence: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ElevenLabs] Music generation failed (Status ${response.status}):`, errorText);
      return null;
    }

    const buffer = await response.arrayBuffer();
    
    if (!fs.existsSync(soundsDir)) {
      fs.mkdirSync(soundsDir, { recursive: true });
    }

    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    return `/sounds/${fileName}`;
  } catch (error) {
    console.error('Error in generateMusic:', error);
    return null;
  }
}

export async function generateMusicV2(id: string, compositionPlan: any): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  const safeId = id.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const fileName = `song_${safeId}.mp3`;
  const soundsDir = path.join(process.cwd(), 'public', 'sounds');
  const filePath = path.join(soundsDir, fileName);

  if (fs.existsSync(filePath)) {
    console.log(`[ElevenLabs] Song already exists for: ${id}, skipping API call.`);
    return `/sounds/${fileName}`;
  }

  console.log(`[ElevenLabs] Generating full song for: ${id}`);

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/music', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(compositionPlan),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ElevenLabs] Music V2 generation failed (Status ${response.status}):`, errorText);
      return null;
    }

    const buffer = await response.arrayBuffer();
    
    if (!fs.existsSync(soundsDir)) {
      fs.mkdirSync(soundsDir, { recursive: true });
    }

    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    return `/sounds/${fileName}`;
  } catch (error) {
    console.error('Error in generateMusicV2:', error);
    return null;
  }
}
