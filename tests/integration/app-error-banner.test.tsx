// @vitest-environment jsdom

import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { App } from '../../src/app/App';

describe('App error banner', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
    window.localStorage.clear();
  });

  it('shows the hosted size limit guidance when the upload API returns 413', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('too large', {
        status: 413,
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    const input = screen.getByLabelText('Browse local file');
    const file = new File(['mpeg'], 'sample.mp3', { type: 'audio/mpeg' });

    await userEvent.upload(input, file);

    await screen.findByText('File too large for this web app');
    expect(
      screen.getByText(
        'This web deployment only accepts uploads up to 4.5 MB. Run locally for larger files.',
      ),
    ).toBeTruthy();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  it('shows upload route guidance when the endpoint is missing', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('missing route', {
        status: 404,
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    const input = screen.getByLabelText('Browse local file');
    const file = new File(['mpeg'], 'sample.mp3', { type: 'audio/mpeg' });

    await userEvent.upload(input, file);

    await screen.findByText('Upload route unavailable');
    expect(
      screen.getByText('This deployment is missing the file upload endpoint.'),
    ).toBeTruthy();
  });
});
