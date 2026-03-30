import { describe, it, expect } from 'vitest';
import { decodeFrameHeader } from '../../src/utils/frame-header';

describe('decodeFrameHeader', () => {
  it('returns null for buffer shorter than 4 bytes', () => {
    const buf = Buffer.from([0xff, 0xfb, 0x90]);
    expect(decodeFrameHeader(buf, 0)).toBeNull();
  });

  it('returns null when sync word is missing', () => {
    const buf = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    expect(decodeFrameHeader(buf, 0)).toBeNull();
  });

  it('returns null for non-MPEG1 version', () => {
    // 0xFF 0xE3 = sync + MPEG2 (version bits = 10) + Layer III (01) + protection (1)
    const buf = Buffer.from([0xff, 0xe3, 0x90, 0x00]);
    expect(decodeFrameHeader(buf, 0)).toBeNull();
  });

  it('returns null for non-Layer-III', () => {
    // 0xFF 0xFD = sync + MPEG1 (11) + Layer I (11) + protection (1)
    const buf = Buffer.from([0xff, 0xfd, 0x90, 0x00]);
    expect(decodeFrameHeader(buf, 0)).toBeNull();
  });

  it('returns null for invalid bitrate index 0', () => {
    // 0xFF 0xFB = sync + MPEG1 + Layer III + no CRC
    // 0x00 = bitrate index 0, sample rate index 0
    const buf = Buffer.from([0xff, 0xfb, 0x00, 0x00]);
    expect(decodeFrameHeader(buf, 0)).toBeNull();
  });

  it('returns null for invalid bitrate index 15', () => {
    const buf = Buffer.from([0xff, 0xfb, 0xf0, 0x00]);
    expect(decodeFrameHeader(buf, 0)).toBeNull();
  });

  it('returns null for reserved sample rate (index 3)', () => {
    // 0x9C = bitrate index 9 + sample rate index 3 (reserved)
    const buf = Buffer.from([0xff, 0xfb, 0x9c, 0x00]);
    expect(decodeFrameHeader(buf, 0)).toBeNull();
  });

  it('decodes a valid MPEG1 Layer III header (128kbps, 44100Hz, no padding)', () => {
    // 0xFF 0xFB = sync(11 bits) + MPEG1(11) + Layer III(01) + no protection(1)
    // 0x90 = bitrate index 9 (128kbps) + sample rate index 0 (44100) + no padding
    // 0x00 = stereo + mode ext + copy + orig + emphasis
    const buf = Buffer.from([0xff, 0xfb, 0x90, 0x00]);
    const header = decodeFrameHeader(buf, 0);

    expect(header).not.toBeNull();
    expect(header!.bitrate).toBe(128000);
    expect(header!.sampleRate).toBe(44100);
    expect(header!.padding).toBe(false);
    expect(header!.frameSize).toBe(417);
  });

  it('decodes a valid header with padding', () => {
    // 0x92 = bitrate index 9 (128kbps) + sample rate index 0 (44100) + padding=1
    const buf = Buffer.from([0xff, 0xfb, 0x92, 0x00]);
    const header = decodeFrameHeader(buf, 0);

    expect(header).not.toBeNull();
    expect(header!.padding).toBe(true);
    expect(header!.frameSize).toBe(418);
  });

  it('decodes at a non-zero offset', () => {
    const prefix = Buffer.alloc(100, 0);
    const frame = Buffer.from([0xff, 0xfb, 0x90, 0x00]);
    const buf = Buffer.concat([prefix, frame]);
    const header = decodeFrameHeader(buf, 100);

    expect(header).not.toBeNull();
    expect(header!.bitrate).toBe(128000);
  });

  it('decodes 64kbps, 44100Hz frame correctly', () => {
    // 0x50 = bitrate index 5 (64kbps) + sample rate index 0 (44100) + no padding
    const buf = Buffer.from([0xff, 0xfb, 0x50, 0x00]);
    const header = decodeFrameHeader(buf, 0);

    expect(header).not.toBeNull();
    expect(header!.bitrate).toBe(64000);
    expect(header!.sampleRate).toBe(44100);
    expect(header!.frameSize).toBe(208);
  });
});
