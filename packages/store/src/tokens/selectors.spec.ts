import { BlockchainCode } from '@emeraldwallet/core';
import { IState } from '../types';
import { selectBalance, selectBalances } from './selectors';
import { moduleName } from './types';

describe('selectors', () => {
  it('selectBalances works for address without data', () => {
    const appState: {[idx: string]: any} = {};
    appState[moduleName] = {
      [BlockchainCode.ETC]: {
        '0x2': {
        }
      }
    };
    // @ts-ignore
    const balances = selectBalances(appState, '0x1', BlockchainCode.ETC);
    expect(balances).toBeNull();
  });

  it('selectBalance for particular token', () => {
    const appState: {[idx: string]: any} = {};
    appState[moduleName] = {
      [BlockchainCode.ETC]: {
        '0x1': {
          ['0xTOKEN']: {
            decimals: 8
          }
        }
      }
    };
    // @ts-ignore
    const balance1 = selectBalance(appState, '0xTOKEN', '0x1', BlockchainCode.ETC);
    expect(balance1).toBeDefined();
    expect(balance1!!.decimals).toEqual(8);
    // @ts-ignore
    const balance2 = selectBalance(appState, '0xTOKEN', '0x2', BlockchainCode.ETC);
    expect(balance2).toBeNull();
  });
});
