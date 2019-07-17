
export function addHexPrefix(str: string): string {
  if (str.slice(0, 2) === '0x') {
    return str;
  }
  return `0x${str}`;
}

export function separateThousands(number: string, separator: string) {
  return parseInt(number, 10).toLocaleString('en').split(',').join(separator);
}
