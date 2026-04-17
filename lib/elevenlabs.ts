import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';

const isVercel = process.env.VERCEL === '1';
const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

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

  // We only stop if we are on Vercel AND we don't have a Blob token.
  // If we have a Blob token, we can proceed even on Vercel.
  if (isVercel && !hasBlob) {
    console.warn(`[ElevenLabs] Missing BLOB_READ_WRITE_TOKEN on Vercel. Cannot persist sound ${fileName}.`);
    return null; 
  }

  console.log(`[ElevenLabs] Generating sound for: ${id} with prompt: ${prompt}`);

  let retries = 3;
  let delay = 1000;

  for (let i = 0; i < retries; i++) {
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

      if (response.status === 429) {
        console.warn(`[ElevenLabs] System busy (429). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ElevenLabs] Sound generation failed (Status ${response.status}):`, errorText);
        return null;
      }

      const buffer = await response.arrayBuffer();
      
      // Persist to Vercel Blob if in production
      if (isVercel || hasBlob) {
        console.log(`[ElevenLabs] Uploading ${fileName} to Vercel Blob...`);
        const { url } = await put(`sounds/${fileName}`, Buffer.from(buffer), {
          access: 'public',
          contentType: 'audio/mpeg',
          allowOverwrite: true,
        });
        console.log(`[ElevenLabs] Successfully uploaded to: ${url}`);
        return url;
      }

      // Otherwise save locally for DEV
      if (!fs.existsSync(soundsDir)) {
        fs.mkdirSync(soundsDir, { recursive: true });
      }

      fs.writeFileSync(filePath, Buffer.from(buffer));
      
      console.log(`[ElevenLabs] Successfully generated sound: ${fileName}`);
      return `/sounds/${fileName}`;
    } catch (error) {
      console.error(`[ElevenLabs] Attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  return null;
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

  if (isVercel && !hasBlob) {
    console.warn(`[ElevenLabs] Cannot write music to disk on Vercel without Blob token.`);
    return null;
  }

  console.log(`[ElevenLabs] Generating music for: ${id} with prompt: ${prompt}`);

  let retries = 3;
  let delay = 1000;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: prompt,
          duration_seconds: 10.0,
          prompt_influence: 0.7,
        }),
      });

      if (response.status === 429) {
        console.warn(`[ElevenLabs] System busy (429). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ElevenLabs] Music generation failed (Status ${response.status}):`, errorText);
        return null;
      }

      const buffer = await response.arrayBuffer();
      
      if (isVercel || hasBlob) {
        const { url } = await put(`sounds/${fileName}`, Buffer.from(buffer), {
          access: 'public',
          contentType: 'audio/mpeg',
          allowOverwrite: true,
        });
        return url;
      }

      if (!fs.existsSync(soundsDir)) {
        fs.mkdirSync(soundsDir, { recursive: true });
      }

      fs.writeFileSync(filePath, Buffer.from(buffer));
      return `/sounds/${fileName}`;
    } catch (error) {
      console.error(`[ElevenLabs] Music attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  return null;
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

  if (isVercel && !hasBlob) {
    console.warn(`[ElevenLabs] Cannot write song to disk on Vercel without Blob token.`);
    return null;
  }

  console.log(`[ElevenLabs] Generating full song for: ${id}`);

  let retries = 2; // Songs are expensive/long, fewer retries
  let delay = 2000;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/music', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(compositionPlan),
      });

      if (response.status === 429) {
        console.warn(`[ElevenLabs] Music V2 busy (429). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ElevenLabs] Music V2 generation failed (Status ${response.status}):`, errorText);
        return null;
      }

      const buffer = await response.arrayBuffer();
      
      if (isVercel || hasBlob) {
        const { url } = await put(`sounds/${fileName}`, Buffer.from(buffer), {
          access: 'public',
          contentType: 'audio/mpeg',
          allowOverwrite: true,
        });
        return url;
      }

      if (!fs.existsSync(soundsDir)) {
        fs.mkdirSync(soundsDir, { recursive: true });
      }

      fs.writeFileSync(filePath, Buffer.from(buffer));
      return `/sounds/${fileName}`;
    } catch (error) {
      console.error(`[ElevenLabs] Music V2 attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  return null;
}
