import { BlockchainCode } from '@emeraldwallet/core';
import { setTokenBalance } from './actions';
import { reducer } from './reducer';

describe('tokens reducer', () => {
  it('should update token balance for address', () => {
    const balance = {
      decimals: 8,
      symbol: 'BEC',
      tokenId: '0x66666',
      unitsValue: '888'
    };
    const address = '0x9999';

    let state = reducer(undefined, setTokenBalance(BlockchainCode.ETC, balance, address));
    expect(state[BlockchainCode.ETC]![address]![balance.tokenId].unitsValue).toEqual(balance.unitsValue);

    // update balance value
    balance.unitsValue = '777';
    state = reducer(state, setTokenBalance(BlockchainCode.ETC, balance, address));
    expect(state[BlockchainCode.ETC]![address]![balance.tokenId].unitsValue).toEqual('777');

    const anotherTokenBalance = {
      ...balance,
      tokenId: '0x88888'
    };
    state = reducer(state, setTokenBalance(BlockchainCode.ETC, anotherTokenBalance, address));
    expect(state[BlockchainCode.ETC]![address]![anotherTokenBalance.tokenId].unitsValue).toEqual('777');
  });
});
