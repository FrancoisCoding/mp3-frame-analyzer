/**
 * Minimum number of bytes needed to read an ID3v2 header.
 * 3 bytes magic ("ID3") + 2 bytes version + 1 byte flags + 4 bytes size.
 */
const ID3V2_HEADER_SIZE = 10;

/**
 * Determines the total size of an ID3v2 tag at the start of a buffer.
 *
 * ID3v2 tags use a "syncsafe integer" encoding for their size field:
 * each byte contributes only 7 bits (MSB is always 0), preventing
 * false sync-word detection inside the tag.
 *
 * @param buffer - The raw file buffer to inspect.
 * @returns The total tag size in bytes (header + body), or 0 if no ID3v2 tag is present.
 */
export function getID3v2TagSize(buffer: Buffer): number {
  if (buffer.length < ID3V2_HEADER_SIZE) {
    return 0;
  }

  // Check for "ID3" magic bytes
  if (buffer[0] !== 0x49 || buffer[1] !== 0x44 || buffer[2] !== 0x33) {
    return 0;
  }

  // Decode the 4-byte syncsafe integer (bytes 6-9)
  const size =
    ((buffer[6] & 0x7f) << 21) |
    ((buffer[7] & 0x7f) << 14) |
    ((buffer[8] & 0x7f) << 7) |
    (buffer[9] & 0x7f);

  return ID3V2_HEADER_SIZE + size;
}
