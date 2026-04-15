import fs from 'fs';
import path from 'path';

export async function generateSound(id: string, prompt: string): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.warn('ELEVENLABS_API_KEY is missing. Skipping sound generation.');
    return null;
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
      console.error('ElevenLabs sound generation failed:', errorText);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const fileName = `${id}-${Date.now()}.mp3`;
    const soundsDir = path.join(process.cwd(), 'public', 'sounds');
    
    if (!fs.existsSync(soundsDir)) {
      fs.mkdirSync(soundsDir, { recursive: true });
    }

    const filePath = path.join(soundsDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    return `/sounds/${fileName}`;
  } catch (error) {
    console.error('Error in generateSound:', error);
    return null;
  }
}
export async function generateExplanation(id: string, text: string): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  console.log(`[ElevenLabs] Generating explanation for: ${id}`);

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/jsCq9Anv6qn9G4e2w1Yw', { // Use a fun voice ID
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const fileName = `explain-${id}-${Date.now()}.mp3`;
    const soundsDir = path.join(process.cwd(), 'public', 'sounds');
    
    if (!fs.existsSync(soundsDir)) fs.mkdirSync(soundsDir, { recursive: true });

    const filePath = path.join(soundsDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    return `/sounds/${fileName}`;
  } catch (error) {
    console.error('Error in generateExplanation:', error);
    return null;
  }
}
