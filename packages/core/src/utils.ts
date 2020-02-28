
export function addHexPrefix (str: string): string {
  if (str.slice(0, 2) === '0x') {
    return str;
  }
  return `0x${str}`;
}

export function separateThousands (value: string, separator: string) {
  return parseInt(value, 10).toLocaleString('en').split(',').join(separator);
}

/**
 * Parse a date which can be represented as string (ISO format), number (ms or seconds) or Date itself
 *
 * @param value
 * @param defaultValue
 */
export function parseDate (value: any, defaultValue?: Date): Date | undefined {
  if (typeof value === 'undefined' || value == null) {
    return defaultValue;
  }
  if (typeof value === 'string') {
    return new Date(value);
  }
  if (typeof value === 'number') {
    if (value < 2_000_000_000) { // must likely seconds, for ms it's Sat 24 January 1970 03:33:20.000 UTC
      return new Date(value * 1000);
    }
    return new Date(value);
  }
  if (typeof value.toUTCString === 'function') {
    return value;
  }
  return defaultValue;
}
