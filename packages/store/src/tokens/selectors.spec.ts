import { BlockchainCode } from '@emeraldwallet/core';
import { allowance, application, tokens } from '../index';
import { IState } from '../types';
import { selectBalance, selectBalances } from './selectors';

describe('selectors', () => {
  it('selectBalances works for address without data', () => {
    const state: unknown = {
      [allowance.moduleName]: {},
      [tokens.moduleName]: {
        [BlockchainCode.ETC]: {
          '0x2': {},
        },
      },
    };

    const balances = selectBalances(state as IState, BlockchainCode.ETC, '0x1');

    expect(balances.length).toEqual(0);
  });

  it('selectBalance for particular token', () => {
    const contractAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

    const state = {
      [allowance.moduleName]: {},
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
              unitsValue: '1000000000000000000',
            },
          },
        },
      },
    } as unknown as IState;

    const balance1 = selectBalance(state, BlockchainCode.ETH, '0x1', contractAddress);

    expect(balance1?.toString()).toEqual('1 DAI');

    const balance2 = selectBalance(state, BlockchainCode.ETH, '0x2', contractAddress);

    expect(balance2?.toString()).toEqual('0 DAI');

    const balance3 = selectBalance(state, BlockchainCode.ETH, '0x1', '0x3');

    expect(balance3).toBeUndefined();
  });
});
