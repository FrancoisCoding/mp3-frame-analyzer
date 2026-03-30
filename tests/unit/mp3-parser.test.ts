import { describe, it, expect } from 'vitest';
import { countMp3Frames } from '../../src/utils/mp3-parser';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('countMp3Frames', () => {
  it('returns zero frames for an empty buffer', () => {
    const result = countMp3Frames(Buffer.alloc(0));
    expect(result.frameCount).toBe(0);
    expect(result.logicalFrameCount).toBe(0);
  });

  it('returns zero frames for random data', () => {
    const buf = Buffer.from('this is not an mp3 file at all');
    const result = countMp3Frames(buf);
    expect(result.frameCount).toBe(0);
    expect(result.logicalFrameCount).toBe(0);
  });

  it('does not count a single isolated MPEG1 Layer III frame', () => {
    // Header: FF FB 90 00 = MPEG1, Layer III, 128kbps, 44100Hz, no padding
    // Frame size = floor(144 * 128000 / 44100) = 417 bytes
    const frameSize = 417;
    const buf = Buffer.alloc(frameSize, 0);
    buf[0] = 0xff;
    buf[1] = 0xfb;
    buf[2] = 0x90;
    buf[3] = 0x00;
    const result = countMp3Frames(buf);
    expect(result.frameCount).toBe(0);
    expect(result.logicalFrameCount).toBe(0);
  });

  it('parses two consecutive valid frames', () => {
    const frameSize = 417;
    const buf = Buffer.alloc(frameSize * 2, 0);
    // Frame 1
    buf[0] = 0xff;
    buf[1] = 0xfb;
    buf[2] = 0x90;
    buf[3] = 0x00;
    // Frame 2
    buf[frameSize] = 0xff;
    buf[frameSize + 1] = 0xfb;
    buf[frameSize + 2] = 0x90;
    buf[frameSize + 3] = 0x00;
    const result = countMp3Frames(buf);
    expect(result.frameCount).toBe(2);
    expect(result.logicalFrameCount).toBe(2);
  });

  it('skips ID3v2 tag and finds frames after it', () => {
    const id3Size = 44; // 10 header + 34 body
    const frameSize = 417;
    const buf = Buffer.alloc(id3Size + frameSize * 2, 0);

    // Write ID3 header
    buf[0] = 0x49;
    buf[1] = 0x44;
    buf[2] = 0x33; // "ID3"
    buf[3] = 0x04;
    buf[4] = 0x00; // v2.4.0
    buf[5] = 0x00; // flags
    buf[6] = 0x00;
    buf[7] = 0x00;
    buf[8] = 0x00;
    buf[9] = 0x22; // size=34

    // Frame 1 at offset 44
    buf[id3Size] = 0xff;
    buf[id3Size + 1] = 0xfb;
    buf[id3Size + 2] = 0x90;
    buf[id3Size + 3] = 0x00;

    // Frame 2
    buf[id3Size + frameSize] = 0xff;
    buf[id3Size + frameSize + 1] = 0xfb;
    buf[id3Size + frameSize + 2] = 0x90;
    buf[id3Size + frameSize + 3] = 0x00;

    const result = countMp3Frames(buf);
    expect(result.frameCount).toBe(2);
    expect(result.logicalFrameCount).toBe(2);
  });

  it('skips false sync words that do not form consecutive frames', () => {
    // Place a fake sync word that doesn't lead to another valid frame
    const buf = Buffer.alloc(1000, 0);
    buf[0] = 0xff;
    buf[1] = 0xfb;
    buf[2] = 0x90;
    buf[3] = 0x00;
    // No valid frame at offset 417, so the parser should skip this false positive
    // and find nothing else
    const result = countMp3Frames(buf);
    expect(result.frameCount).toBe(0);
    expect(result.logicalFrameCount).toBe(0);
  });

  it('exposes Xing-style and logical counts separately when the first frame is a Xing frame', () => {
    const frameSize = 417;
    const buf = Buffer.alloc(frameSize * 2, 0);

    buf[0] = 0xff;
    buf[1] = 0xfb;
    buf[2] = 0x90;
    buf[3] = 0x00;

    buf[36] = 0x58;
    buf[37] = 0x69;
    buf[38] = 0x6e;
    buf[39] = 0x67;

    buf[frameSize] = 0xff;
    buf[frameSize + 1] = 0xfb;
    buf[frameSize + 2] = 0x90;
    buf[frameSize + 3] = 0x00;

    const result = countMp3Frames(buf);

    expect(result.frameCount).toBe(1);
    expect(result.logicalFrameCount).toBe(2);
  });

  it('returns both Xing-style and logical counts for sample.mp3', () => {
    const samplePath = resolve(__dirname, '../../fixtures/sample.mp3');
    const buffer = readFileSync(samplePath);
    const result = countMp3Frames(buffer);
    expect(result.frameCount).toBe(6089);
    expect(result.logicalFrameCount).toBe(6090);
  });
});
