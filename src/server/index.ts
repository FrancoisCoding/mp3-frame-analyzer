import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { countMp3Frames } from '../utils/mp3-parser';
import { isMp3Buffer } from '../utils/validators';

export const app = new Hono();

app.use('/*', cors());

app.post('/file-upload', async (context) => {
  try {
    const body = await context.req.parseBody();
    const file = body.file;

    if (!(file instanceof File)) {
      return context.json({ error: 'No file provided' }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!isMp3Buffer(buffer)) {
      return context.json({ error: 'Invalid file type. Expected MP3 (MPEG1 Layer 3)' }, 400);
    }

    const result = countMp3Frames(buffer);

    if (result.frameCount === 0) {
      return context.json({ error: 'No valid MPEG1 Layer 3 frames found in file' }, 400);
    }

    return context.json({ frameCount: result.frameCount });
  } catch (error) {
    console.error('Unexpected error processing upload:', error);
    return context.json({ error: 'Internal server error' }, 500);
  }
});
