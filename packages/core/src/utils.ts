export function addHexPrefix(hex: string): string {
  if (hex.slice(0, 2) === '0x') {
    return hex;
  }

  return `0x${hex}`;
}

export function isHex(value: string): boolean {
  if (value == null || value === '') {
    return true;
  }

  return /^[0-9A-Fa-f]+$/.test(value.substring(0, 2) === '0x' ? value.substring(2) : value);
}

/**
 * Parse a date which can be represented as string (ISO format), number (milliseconds or seconds) or Date itself
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDate(value: any, defaultValue?: Date): Date | undefined {
  if (value == null) {
    return defaultValue;
  }

  if (typeof value === 'string') {
    return new Date(value);
  }

  if (typeof value === 'number') {
    /**
     * Must likely second, for milliseconds it's Sat 24 January 1970 03:33:20.000 UTC
     */
    if (value < 2_000_000_000) {
      return new Date(value * 1000);
    }

    return new Date(value);
  }

  if (typeof value.toUTCString === 'function') {
    return value;
  }

  return defaultValue;
}

export function separateThousands(value: string, separator: string): string {
  return parseInt(value, 10).toLocaleString('en').split(',').join(separator);
}
