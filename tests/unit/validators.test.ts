import { describe, it, expect } from 'vitest';
import { isMp3Buffer } from '../../src/utils/validators';

describe('isMp3Buffer', () => {
  it('returns true for buffer starting with ID3 tag', () => {
    const buf = Buffer.from([0x49, 0x44, 0x33, 0x04, 0x00]);
    expect(isMp3Buffer(buf)).toBe(true);
  });

  it('returns true for buffer starting with MPEG sync word', () => {
    const buf = Buffer.from([0xff, 0xfb, 0x90, 0x00]);
    expect(isMp3Buffer(buf)).toBe(true);
  });

  it('returns false for empty buffer', () => {
    expect(isMp3Buffer(Buffer.alloc(0))).toBe(false);
  });

  it('returns false for non-MP3 data', () => {
    const buf = Buffer.from('not an mp3 file');
    expect(isMp3Buffer(buf)).toBe(false);
  });

  it('returns false for WAV file header', () => {
    const buf = Buffer.from('RIFF....WAVEfmt ');
    expect(isMp3Buffer(buf)).toBe(false);
  });

  it('returns false for single byte buffer', () => {
    expect(isMp3Buffer(Buffer.from([0xff]))).toBe(false);
  });
});
