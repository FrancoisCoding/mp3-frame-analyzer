import { describe, expect, it } from 'vitest';

import {
  getUploadErrorFeedback,
  getUploadNetworkFeedback,
  readUploadResponse,
} from '../../src/app/upload-feedback';

describe('readUploadResponse', () => {
  it('reads JSON responses with the correct content-type', async () => {
    const response = new Response(JSON.stringify({ error: 'Bad request' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });

    await expect(readUploadResponse(response)).resolves.toEqual({
      error: 'Bad request',
    });
  });

  it('parses JSON bodies even when the content-type is missing', async () => {
    const response = new Response(JSON.stringify({ code: 'INVALID_FILE_TYPE' }), {
      status: 400,
    });

    await expect(readUploadResponse(response)).resolves.toEqual({
      code: 'INVALID_FILE_TYPE',
    });
  });

  it('returns null for non-JSON bodies', async () => {
    const response = new Response('<html>bad gateway</html>', {
      status: 502,
      headers: { 'content-type': 'text/html' },
    });

    await expect(readUploadResponse(response)).resolves.toBeNull();
  });
});

describe('getUploadErrorFeedback', () => {
  it('maps known API codes to actionable feedback', () => {
    const response = new Response(null, { status: 400 });

    expect(
      getUploadErrorFeedback(response, {
        code: 'NO_VALID_MPEG1_LAYER3_FRAMES',
        error: 'The uploaded file did not contain readable MPEG1 Layer 3 frames.',
      }),
    ).toEqual({
      title: 'No MPEG frames found',
      detail: 'This file was uploaded as MP3, but no readable MPEG1 Layer 3 frames were found.',
    });
  });

  it('explains hosted upload size failures', () => {
    const response = new Response('too large', { status: 413 });

    expect(getUploadErrorFeedback(response, null)).toEqual({
      title: 'File too large for this web app',
      detail:
        'This web deployment only accepts uploads up to 4.5 MB. Run locally for larger files.',
    });
  });

  it('explains missing upload routes', () => {
    const response = new Response('not found', { status: 404 });

    expect(getUploadErrorFeedback(response, null)).toEqual({
      title: 'Upload route unavailable',
      detail: 'This deployment is missing the file upload endpoint.',
    });
  });

  it('explains rate limiting', () => {
    const response = new Response('slow down', { status: 429 });

    expect(getUploadErrorFeedback(response, null)).toEqual({
      title: 'Too many upload attempts',
      detail: 'The server is rate limiting requests. Wait a moment and try again.',
    });
  });
});

describe('getUploadNetworkFeedback', () => {
  it('returns a recovery hint for connectivity failures', () => {
    expect(getUploadNetworkFeedback()).toEqual({
      title: 'Could not reach the upload endpoint',
      detail: 'Check that the API is running, then try again.',
    });
  });
});
