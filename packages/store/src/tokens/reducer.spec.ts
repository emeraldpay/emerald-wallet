import { BlockchainCode } from '@emeraldwallet/core';
import { setTokenBalance } from './actions';
import { reducer } from './reducer';
import { TokenBalance } from './types';

describe('tokens reducer', () => {
  it('should update token balance for address', () => {
    const address = '0x9999';
    const balance1: TokenBalance = {
      decimals: 8,
      symbol: 'DAI',
      tokenId: '0x66666',
      unitsValue: '888',
    };

    let state = reducer(undefined, setTokenBalance(BlockchainCode.ETH, balance1, address));

    expect(state[BlockchainCode.ETH]?.[address]?.[balance1.tokenId].unitsValue).toEqual(balance1.unitsValue);

    balance1.unitsValue = '777';

    state = reducer(state, setTokenBalance(BlockchainCode.ETH, balance1, address));

    expect(state[BlockchainCode.ETH]?.[address]?.[balance1.tokenId].unitsValue).toEqual('777');

    const balance2: TokenBalance = {
      ...balance1,
      tokenId: '0x88888',
    };

    state = reducer(state, setTokenBalance(BlockchainCode.ETH, balance2, address));

    expect(state[BlockchainCode.ETH]?.[address]?.[balance2.tokenId].unitsValue).toEqual('777');
  });
});
