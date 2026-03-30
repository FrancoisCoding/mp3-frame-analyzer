/**
 * MPEG1 Layer 3 bitrate lookup table.
 * Index 0 = "free" (invalid for our purposes), index 15 = "bad" (invalid).
 * Values are in bits per second.
 */
export const MPEG1_LAYER3_BITRATES: readonly number[] = [
  0, //      0: free (invalid)
  32000, //  1: 32 kbps
  40000, //  2: 40 kbps
  48000, //  3: 48 kbps
  56000, //  4: 56 kbps
  64000, //  5: 64 kbps
  80000, //  6: 80 kbps
  96000, //  7: 96 kbps
  112000, // 8: 112 kbps
  128000, // 9: 128 kbps
  160000, // 10: 160 kbps
  192000, // 11: 192 kbps
  224000, // 12: 224 kbps
  256000, // 13: 256 kbps
  320000, // 14: 320 kbps
  0, //      15: bad (invalid)
] as const;

/**
 * MPEG1 sample rate lookup table.
 * Index 3 is reserved (invalid).
 * Values are in Hz.
 */
export const MPEG1_SAMPLE_RATES: readonly number[] = [
  44100, // 0
  48000, // 1
  32000, // 2
  0, //    3: reserved (invalid)
] as const;

/** 11-bit sync word mask applied to the first 2 bytes of a frame header. */
export const SYNC_WORD_MASK = 0xffe0;

/** MPEG version 1 identifier (2-bit value: 0b11). */
export const MPEG_VERSION_1 = 0b11;

/** Layer III identifier (2-bit value: 0b01). */
export const LAYER_3 = 0b01;

/** Number of samples per MPEG1 Layer 3 frame. */
export const SAMPLES_PER_FRAME = 1152;

/** Size of an MP3 frame header in bytes. */
export const FRAME_HEADER_SIZE = 4;
