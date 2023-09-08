let count = 0;

export function tempPath(prefix: string): string {
  count += 1;

  const timestamp = Date.now() - 1600000000000;

  return `./.tests/tmp-${prefix}-${timestamp}-${count}`;
}
