import { BlockchainCode } from '@emeraldwallet/core';
import { application, tokens } from '../index';
import { IState } from '../types';
import { selectBalance, selectBalances } from './selectors';

describe('selectors', () => {
  it('selectBalances works for address without data', () => {
    const state: unknown = {
      [tokens.moduleName]: {
        [BlockchainCode.ETC]: {
          '0x2': {},
        },
      },
    };

    const balances = selectBalances(state as IState, BlockchainCode.ETC, '0x1');

    expect(balances).toBeUndefined();
  });

  it('selectBalance for particular token', () => {
    const contractAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

    const state = {
      [application.moduleName]: {
        tokens: [
          {
            name: 'Dai Stablecoin',
            blockchain: 100,
            address: contractAddress,
            symbol: 'DAI',
            decimals: 18,
            type: 'ERC20',
            stablecoin: true,
          },
        ],
      },
      [tokens.moduleName]: {
        [BlockchainCode.ETH]: {
          '0x1': {
            [contractAddress.toLowerCase()]: {
              symbol: 'DAI',
              unitsValue: '0',
            },
          },
        },
      },
    } as unknown as IState;

    const balance1 = selectBalance(state, BlockchainCode.ETH, '0x1', contractAddress);

    expect(balance1).toBeDefined();
    expect(balance1?.units.base.code).toEqual('DAI');
    expect(balance1?.toString()).toEqual('0 DAI');

    const balance2 = selectBalance(state, BlockchainCode.ETH, '0x2', contractAddress);

    expect(balance2).toBeUndefined();
  });
});
