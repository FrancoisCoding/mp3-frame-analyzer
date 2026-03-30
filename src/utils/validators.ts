/**
 * Checks whether a buffer likely contains MP3 data by inspecting its
 * leading bytes for either an ID3v2 tag header or an MPEG sync word.
 *
 * This is a fast, shallow check — it does not parse full frames.
 *
 * @param buffer - The raw file buffer to inspect.
 * @returns True if the buffer appears to be an MP3 file.
 */
export function isMp3Buffer(buffer: Buffer): boolean {
  if (buffer.length < 2) {
    return false;
  }

  // Check for ID3v2 tag ("ID3")
  if (
    buffer.length >= 3 &&
    buffer[0] === 0x49 &&
    buffer[1] === 0x44 &&
    buffer[2] === 0x33
  ) {
    return true;
  }

  // Check for MPEG sync word (first 11 bits = 1)
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) {
    return true;
  }

  return false;
}
