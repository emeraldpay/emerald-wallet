const second = 1000;
const minute = 60 * second;

export const intervalRates = {
  second, // (whilei) this must be the newfangled object-shorthand...?
  minute,
  // (whilei: development: loading so often slows things a lot for me and clutters logs; that's why I have
  // stand-in times here for development)
  // Continue is repeating timeouts.
  continueLoadSyncRate: minute, // prod: second
  continueLoadHeightRate: 5 * minute, // prod: 5 * second
  continueRefreshAllTxRate: 60 * second, // prod: 2 * second
  continueRefreshLongRate: 900 * second, // 5 o'clock somewhere.
};