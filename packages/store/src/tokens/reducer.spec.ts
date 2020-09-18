import { BlockchainCode } from '@emeraldwallet/core';
import { setTokenBalance } from './actions';
import {reducer} from './reducer';
import {ITokenBalance} from "./types";

describe('tokens reducer', () => {
  it('should update token balance for address', () => {
    const balance: ITokenBalance = {
      decimals: 8,
      symbol: 'DAI',
      tokenId: '0x66666',
      unitsValue: '888'
    };
    const address = '0x9999';

    let state = reducer(undefined, setTokenBalance(BlockchainCode.ETH, balance, address));
    expect(state[BlockchainCode.ETH]![address]![balance.tokenId].unitsValue).toEqual(balance.unitsValue);

    // update balance value
    balance.unitsValue = '777';
    state = reducer(state, setTokenBalance(BlockchainCode.ETH, balance, address));
    expect(state[BlockchainCode.ETH]![address]![balance.tokenId].unitsValue).toEqual('777');

    const anotherTokenBalance = {
      ...balance,
      tokenId: '0x88888'
    };
    state = reducer(state, setTokenBalance(BlockchainCode.ETH, anotherTokenBalance, address));
    expect(state[BlockchainCode.ETH]![address]![anotherTokenBalance.tokenId].unitsValue).toEqual('777');
  });
});
