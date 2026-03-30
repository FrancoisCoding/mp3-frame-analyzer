import { getID3v2TagSize } from './id3-reader';
import { decodeFrameHeader } from './frame-header';
import { FRAME_HEADER_SIZE } from './mp3-constants';

/** Result of parsing an MP3 buffer for frame count. */
export interface ParseResult {
  /** Total number of valid MPEG1 Layer 3 frames found. */
  frameCount: number;
}

/**
 * Counts the number of MPEG1 Layer 3 frames in an MP3 file buffer.
 *
 * Algorithm:
 * 1. Skip any ID3v2 tag at the start of the buffer.
 * 2. Scan for the MPEG sync word (0xFF followed by 0xE0+ mask).
 * 3. When a candidate sync is found, decode the frame header.
 * 4. Validate by checking that the next frame starts at the expected offset.
 * 5. Once locked on, count sequentially by jumping frame-size bytes.
 * 6. If the sequence breaks, re-enter scanning mode.
 *
 * @param buffer - The raw MP3 file contents.
 * @returns Object containing the total frame count.
 */
export function countMp3Frames(buffer: Buffer): ParseResult {
  if (buffer.length < FRAME_HEADER_SIZE) {
    return { frameCount: 0 };
  }

  let offset = getID3v2TagSize(buffer);
  let frameCount = 0;
  let locked = false;

  while (offset + FRAME_HEADER_SIZE <= buffer.length) {
    // Look for sync word: 0xFF followed by byte with top 3 bits set
    if (buffer[offset] !== 0xff || (buffer[offset + 1] & 0xe0) !== 0xe0) {
      offset++;
      locked = false;
      continue;
    }

    const header = decodeFrameHeader(buffer, offset);

    if (!header) {
      // Looks like sync but header is invalid — skip this byte
      offset++;
      locked = false;
      continue;
    }

    if (!locked) {
      // Verify by checking that the next position also holds a valid frame
      const nextOffset = offset + header.frameSize;
      if (nextOffset + FRAME_HEADER_SIZE <= buffer.length) {
        const nextHeader = decodeFrameHeader(buffer, nextOffset);
        if (!nextHeader) {
          // Next position isn't a valid frame — false positive
          offset++;
          continue;
        }
      } else {
        // Not enough data for a second frame — can't confirm, skip
        break;
      }
      locked = true;
    }

    frameCount++;
    offset += header.frameSize;
  }

  return { frameCount };
}
