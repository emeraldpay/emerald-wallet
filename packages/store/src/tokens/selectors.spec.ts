import { BlockchainCode } from '@emeraldwallet/core';
import { selectBalances } from './selectors';
import { moduleName } from './types';

describe('selectors', () => {
  it('selectBalances works for address without data', () => {
    const appState: {[idx: string]: any} = {};
    appState[moduleName] = {
      [BlockchainCode.ETC]: {
        '0x2': {}
      }
    };
    const balances = selectBalances(appState, '0x1', BlockchainCode.ETC);
    expect(balances).toBeNull();
  });
});
