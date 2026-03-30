import { describe, it, expect } from 'vitest';
import {
  MPEG1_LAYER3_BITRATES,
  MPEG1_SAMPLE_RATES,
  SYNC_WORD_MASK,
  MPEG_VERSION_1,
  LAYER_3,
  SAMPLES_PER_FRAME,
  FRAME_HEADER_SIZE,
} from '../../src/utils/mp3-constants';

describe('mp3-constants', () => {
  it('has 16 bitrate entries (indices 0-15)', () => {
    expect(MPEG1_LAYER3_BITRATES).toHaveLength(16);
  });

  it('has correct bitrate for index 5 (64 kbps)', () => {
    expect(MPEG1_LAYER3_BITRATES[5]).toBe(64000);
  });

  it('has correct bitrate for index 14 (320 kbps)', () => {
    expect(MPEG1_LAYER3_BITRATES[14]).toBe(320000);
  });

  it('marks index 0 and 15 as invalid (0)', () => {
    expect(MPEG1_LAYER3_BITRATES[0]).toBe(0);
    expect(MPEG1_LAYER3_BITRATES[15]).toBe(0);
  });

  it('has 4 sample rate entries (indices 0-3)', () => {
    expect(MPEG1_SAMPLE_RATES).toHaveLength(4);
  });

  it('has correct sample rate for index 0 (44100)', () => {
    expect(MPEG1_SAMPLE_RATES[0]).toBe(44100);
  });

  it('marks index 3 as invalid (0)', () => {
    expect(MPEG1_SAMPLE_RATES[3]).toBe(0);
  });

  it('defines sync word mask as 0xFFE0', () => {
    expect(SYNC_WORD_MASK).toBe(0xffe0);
  });

  it('defines MPEG version 1 as 0b11', () => {
    expect(MPEG_VERSION_1).toBe(3);
  });

  it('defines Layer 3 as 0b01', () => {
    expect(LAYER_3).toBe(1);
  });

  it('defines samples per frame as 1152', () => {
    expect(SAMPLES_PER_FRAME).toBe(1152);
  });

  it('defines frame header size as 4 bytes', () => {
    expect(FRAME_HEADER_SIZE).toBe(4);
  });
});
