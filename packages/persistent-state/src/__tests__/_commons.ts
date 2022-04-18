var seq = 0;

export function tempPath(prefix: string) {
  const ts = new Date().getTime() - 1600000000000;
  seq++;
  return `./.tests/tmp-${prefix}-${ts}-${seq}`;
}
