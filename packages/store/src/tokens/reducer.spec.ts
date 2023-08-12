import { BlockchainCode } from '@emeraldwallet/core';
import { setTokenBalance } from './actions';
import { reducer } from './reducer';
import { TokenBalance } from './types';

describe('tokens reducer', () => {
  it('should update token balance for address', () => {
    const address = '0x9999';

    const balance: TokenBalance = {
      decimals: 8,
      symbol: 'DAI',
      unitsValue: '888',
    };

    let state = reducer(undefined, setTokenBalance(BlockchainCode.ETH, address, '0x66666', balance));

    expect(state.balances[BlockchainCode.ETH]?.[address]?.['0x66666']?.unitsValue).toEqual(balance.unitsValue);

    balance.unitsValue = '777';

    state = reducer(state, setTokenBalance(BlockchainCode.ETH, address, '0x66666', balance));

    expect(state.balances[BlockchainCode.ETH]?.[address]?.['0x66666']?.unitsValue).toEqual('777');

    state = reducer(state, setTokenBalance(BlockchainCode.ETH, address, '0x88888', balance));

    expect(state.balances[BlockchainCode.ETH]?.[address]?.['0x88888']?.unitsValue).toEqual('777');
  });
});
