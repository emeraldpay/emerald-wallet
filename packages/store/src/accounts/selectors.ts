import { Wei } from '@emeraldplatform/eth';
import { BlockchainCode, IAccount } from '@emeraldwallet/core';
import { List, Map } from 'immutable';
import { Address, AddressList, AddressMap, moduleName } from './types';

export function all (state: any): AddressList {
  return state[moduleName]
    .get('addresses')
    .filter((address: any) => typeof address !== 'undefined')
    .toList();
}

export function allAsArray (state: any): AddressMap[] {
  return state[moduleName]
    .get('addresses')
    .filter((address: any) => typeof address !== 'undefined')
    .toArray();
}

export function allByBlockchain (state: any, blockchain: BlockchainCode): AddressList {
  return all(state)
    .filter((address) => address!.get('blockchain').toLowerCase() === blockchain.toLowerCase())
    .toList();
}

export const isLoading = (state: any): boolean => state[moduleName].get('loading');

export function find (state: any, address: string, blockchain: BlockchainCode): IAccount | undefined {
  if (!address) {
    return undefined;
  }
  const result = allByBlockchain(state, blockchain).find((a: any) =>
    a.get('id').toLowerCase() === address.toLowerCase()
  );

  if (result) {
    return result.toJS() as IAccount;
  }
  return undefined;
}

export function findAllChains (state: any, address: string): AddressList {
  if (!address) {
    return List.of();
  }
  return all(state).filter((a: any) =>
    a.get('id') === address.toLowerCase().toLowerCase()
  ).toList();
}

export function balanceByChain (state: any, blockchain: BlockchainCode): Wei {
  return allByBlockchain(state, blockchain)
    .map((a: any) => (a.get('balance') ? a.get('balance') : Wei.ZERO))
    .reduce((r: Wei | undefined, val: Wei | undefined) => r!.plus(val!), Wei.ZERO)
      || Wei.ZERO;
}
