
export function addHexPrefix(str: string): string {
  if (str.slice(0, 2) === '0x') {
    return str;
  }
  return `0x${str}`;
}
