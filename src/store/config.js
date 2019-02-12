const second = 1000;
const minute = 60 * second;

export const intervalRates = {
  second, // (whilei) this must be the newfangled object-shorthand...?
  minute,
  // (whilei: development: loading so often slows things a lot for me and clutters logs; that's why I have
  // stand-in times here for development)
  // Continue is repeating timeouts.
  continueLoadSyncRate: 15 * second, // prod: second
  continueLoadHeightRate: 1 * minute, // prod: 5 * second
  continueRefreshAllTxRate: 20 * second, // prod: 2 * second
  continueRefreshLongRate: 60 * second, // 5 o'clock somewhere.
};

export const TERMS_VERSION = '2019-02-12';