import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { app } from '../../src/server/index';

function buildFormData(filename: string, content: Buffer): FormData {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(content)], { type: 'audio/mpeg' });

  formData.append('file', blob, filename);

  return formData;
}

describe('POST /file-upload', () => {
  it('returns 400 when no file is provided', async () => {
    const response = await app.request('/file-upload', {
      method: 'POST',
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'No file provided',
    });
  });

  it('returns 400 for non-MP3 file', async () => {
    const formData = buildFormData('test.txt', Buffer.from('not an mp3'));
    const response = await app.request('/file-upload', {
      method: 'POST',
      body: formData,
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid file type. Expected MP3 (MPEG1 Layer 3)',
    });
  });

  it('returns correct frame count for sample.mp3', async () => {
    const samplePath = resolve(__dirname, '../../fixtures/sample.mp3');
    const formData = buildFormData('sample.mp3', readFileSync(samplePath));
    const response = await app.request('/file-upload', {
      method: 'POST',
      body: formData,
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      frameCount: 6089,
      logicalFrameCount: 6090,
    });
  });

  it('returns correct content-type header', async () => {
    const samplePath = resolve(__dirname, '../../fixtures/sample.mp3');
    const formData = buildFormData('sample.mp3', readFileSync(samplePath));
    const response = await app.request('/file-upload', {
      method: 'POST',
      body: formData,
    });

    expect(response.headers.get('content-type')).toContain('application/json');
  });

  it('returns 400 when file has no valid frames', async () => {
    const buffer = Buffer.alloc(100, 0);

    buffer[0] = 0x49;
    buffer[1] = 0x44;
    buffer[2] = 0x33;
    buffer[3] = 0x04;
    buffer[4] = 0x00;
    buffer[5] = 0x00;
    buffer[6] = 0x00;
    buffer[7] = 0x00;
    buffer[8] = 0x00;
    buffer[9] = 0x50;

    const formData = buildFormData('empty.mp3', buffer);
    const response = await app.request('/file-upload', {
      method: 'POST',
      body: formData,
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'No valid MPEG1 Layer 3 frames found in file',
    });
  });
});
