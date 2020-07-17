/**
 * Merge record with default values, which are not set. Copies to the current data when the field is undefined all
 * values from default
 *
 * @param current current values
 * @param defaults defaults for fields
 */
export default function <T extends Record<string, any | undefined>, D extends Partial<T>>(current: T, defaults: D): T {
  const copy: T = {...current};
  const keys = Object.keys(copy);
  // replace undefined value with default
  keys.forEach((name) => {
    if (typeof copy[name] == 'undefined') {
      // @ts-ignore
      copy[name] = defaults[name];
    }
  });
  // now set values that are not set in the current at all
  Object.keys(defaults)
    .filter((name) => keys.indexOf(name) < 0)
    .forEach((name) => {
      // @ts-ignore
      copy[name] = defaults[name];
    });

  return copy;
}