import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { countMp3Frames } from '../utils/mp3-parser.js';
import { isMp3Buffer } from '../utils/validators.js';

export const app = new Hono();

app.use('/*', cors());

function buildErrorResponse(error: string, code: string) {
  return { error, code };
}

app.post('/file-upload', async (context) => {
  try {
    const body = await context.req.parseBody();
    const file = body.file;

    if (!(file instanceof File)) {
      return context.json(buildErrorResponse('No file was uploaded.', 'NO_FILE_PROVIDED'), 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!isMp3Buffer(buffer)) {
      return context.json(
        buildErrorResponse('Expected an MP3 file with MPEG1 Layer 3 audio.', 'INVALID_FILE_TYPE'),
        400,
      );
    }

    const result = countMp3Frames(buffer);

    if (result.frameCount === 0) {
      return context.json(
        buildErrorResponse(
          'The uploaded file did not contain readable MPEG1 Layer 3 frames.',
          'NO_VALID_MPEG1_LAYER3_FRAMES',
        ),
        400,
      );
    }

    return context.json({
      frameCount: result.frameCount,
      logicalFrameCount: result.logicalFrameCount,
    });
  } catch (error) {
    console.error('Unexpected error processing upload:', error);
    return context.json(
      buildErrorResponse(
        'The server could not finish analyzing that file.',
        'INTERNAL_SERVER_ERROR',
      ),
      500,
    );
  }
});
