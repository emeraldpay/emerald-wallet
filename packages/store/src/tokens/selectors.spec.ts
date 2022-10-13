import { BlockchainCode } from '@emeraldwallet/core';
import { selectBalance, selectBalances } from './selectors';
import { moduleName } from './types';
import { IState } from '../types';

describe('selectors', () => {
  it('selectBalances works for address without data', () => {
    const state: unknown = {
      [moduleName]: {
        [BlockchainCode.ETC]: {
          '0x2': {},
        },
      },
    };

    const balances = selectBalances(state as IState, BlockchainCode.ETC, '0x1');

    expect(balances).toBeUndefined();
  });

  it('selectBalance for particular token', () => {
    const state: unknown = {
      [moduleName]: {
        [BlockchainCode.ETH]: {
          '0x1': {
            ['0x6B175474E89094C44Da98b954EedeAC495271d0F']: {
              symbol: 'DAI',
              unitsValue: '0',
            },
          },
        },
      },
    };

    const balance1 = selectBalance(
      state as IState,
      BlockchainCode.ETH,
      '0x1',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    );

    expect(balance1).toBeDefined();
    expect(balance1?.units.base.code).toEqual('DAI');
    expect(balance1?.toString()).toEqual('0 DAI');

    const balance2 = selectBalance(
      state as IState,
      BlockchainCode.ETH,
      '0x2',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    );

    expect(balance2).toBeUndefined();
  });
});
