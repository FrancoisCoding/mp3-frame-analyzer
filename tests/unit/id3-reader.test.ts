import { describe, it, expect } from 'vitest';
import { getID3v2TagSize } from '../../src/utils/id3-reader';

describe('getID3v2TagSize', () => {
  it('returns 0 when buffer does not start with ID3', () => {
    const buf = Buffer.from([0xff, 0xfb, 0x90, 0x00]);
    expect(getID3v2TagSize(buf)).toBe(0);
  });

  it('returns 0 when buffer is too short', () => {
    const buf = Buffer.from([0x49, 0x44, 0x33]);
    expect(getID3v2TagSize(buf)).toBe(0);
  });

  it('parses syncsafe integer size correctly', () => {
    // ID3v2.4.0, no flags, size = 0x00 0x00 0x00 0x22 = 34 bytes
    // Total = 10 (header) + 34 = 44
    const buf = Buffer.from([
      0x49, 0x44, 0x33, // "ID3"
      0x04, 0x00, //       version 2.4.0
      0x00, //             flags
      0x00, 0x00, 0x00, 0x22, // syncsafe size = 34
    ]);
    expect(getID3v2TagSize(buf)).toBe(44);
  });

  it('parses larger syncsafe integer correctly', () => {
    // syncsafe: 0x00 0x00 0x02 0x01 = (0 << 21) | (0 << 14) | (2 << 7) | 1 = 257
    // Total = 10 + 257 = 267
    const buf = Buffer.from([
      0x49, 0x44, 0x33,
      0x03, 0x00,
      0x00,
      0x00, 0x00, 0x02, 0x01,
    ]);
    expect(getID3v2TagSize(buf)).toBe(267);
  });

  it('returns 0 for empty buffer', () => {
    expect(getID3v2TagSize(Buffer.alloc(0))).toBe(0);
  });
});
