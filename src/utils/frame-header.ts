import {
  MPEG1_LAYER3_BITRATES,
  MPEG1_SAMPLE_RATES,
  MPEG_VERSION_1,
  LAYER_3,
  FRAME_HEADER_SIZE,
} from './mp3-constants';

/** Decoded MPEG1 Layer 3 frame header. */
export interface FrameHeader {
  /** Bitrate in bits per second. */
  bitrate: number;
  /** Sample rate in Hz. */
  sampleRate: number;
  /** Whether this frame has a padding byte. */
  padding: boolean;
  /** Total frame size in bytes (header + audio data). */
  frameSize: number;
}

/**
 * Decodes a 4-byte MPEG frame header at the given buffer offset.
 *
 * Validates the sync word, MPEG version (must be V1), layer (must be III),
 * bitrate, and sample rate. Returns null if any validation fails.
 *
 * Frame header layout (32 bits, big-endian):
 *   [31:21] sync word   — 11 bits, all 1s
 *   [20:19] version     — 11 = MPEG1
 *   [18:17] layer       — 01 = Layer III
 *   [16]    protection  — 0 = CRC, 1 = none
 *   [15:12] bitrate idx — lookup in MPEG1_LAYER3_BITRATES
 *   [11:10] sample rate — lookup in MPEG1_SAMPLE_RATES
 *   [9]     padding     — 1 = extra byte appended
 *   [8]     private bit
 *   [7:6]   channel mode
 *   [5:4]   mode extension
 *   [3]     copyright
 *   [2]     original
 *   [1:0]   emphasis
 *
 * @param buffer - The raw file buffer.
 * @param offset - Byte offset where the 4-byte header starts.
 * @returns Decoded header or null if invalid.
 */
export function decodeFrameHeader(buffer: Buffer, offset: number): FrameHeader | null {
  if (offset + FRAME_HEADER_SIZE > buffer.length) {
    return null;
  }

  const header = buffer.readUInt32BE(offset);

  // Bits [31:21] — sync word (must be all 1s)
  if (header >>> 21 !== 0x7ff) {
    return null;
  }

  // Bits [20:19] — MPEG version
  const version = (header >>> 19) & 0b11;
  if (version !== MPEG_VERSION_1) {
    return null;
  }

  // Bits [18:17] — Layer
  const layer = (header >>> 17) & 0b11;
  if (layer !== LAYER_3) {
    return null;
  }

  // Bits [15:12] — Bitrate index
  const bitrateIndex = (header >>> 12) & 0xf;
  const bitrate = MPEG1_LAYER3_BITRATES[bitrateIndex];
  if (bitrate === 0) {
    return null;
  }

  // Bits [11:10] — Sample rate index
  const sampleRateIndex = (header >>> 10) & 0b11;
  const sampleRate = MPEG1_SAMPLE_RATES[sampleRateIndex];
  if (sampleRate === 0) {
    return null;
  }

  // Bit [9] — Padding
  const padding = ((header >>> 9) & 1) === 1;

  // Frame size: floor(144 * bitrate / sampleRate) + padding
  const frameSize = Math.floor((144 * bitrate) / sampleRate) + (padding ? 1 : 0);

  return { bitrate, sampleRate, padding, frameSize };
}
