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
    expect(balances).toBeUndefined();
  });

  it('selectBalance for particular token', () => {
    const appState: {[idx: string]: any} = {};
    appState[moduleName] = {
      [BlockchainCode.ETH]: {
        '0x1': {
          ['0x6B175474E89094C44Da98b954EedeAC495271d0F']: {
            symbol: "DAI",
            unitsValue: "0"
          }
        }
      }
    };
    // @ts-ignore
    const balance1 = selectBalance(appState, '0x6B175474E89094C44Da98b954EedeAC495271d0F', '0x1', BlockchainCode.ETH);
    expect(balance1).toBeDefined();
    expect(balance1!!.units.base.code).toEqual("DAI");
    expect(balance1!!.toString()).toEqual("0 DAI");
    // @ts-ignore
    const balance2 = selectBalance(appState, '0x6B175474E89094C44Da98b954EedeAC495271d0F', '0x2', BlockchainCode.ETH);
    expect(balance2).toBeUndefined();
  });
});
