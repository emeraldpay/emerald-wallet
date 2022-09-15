import { BlockchainCode, PersistentState } from '@emeraldwallet/core';
import { moduleName } from './types';
import { IState } from '../types';

export function all(state: IState): PersistentState.AddressbookItem[] {
  const { contacts } = state[moduleName];
  const blockchains = Object.keys(contacts) as BlockchainCode[];

  return blockchains.reduce<PersistentState.AddressbookItem[]>((carry, blockchain) => {
    const { [blockchain]: blockchainContacts } = contacts;

    if (blockchainContacts == null) {
      return carry;
    }

    return [...carry, ...blockchainContacts];
  }, []);
}

export function byBlockchain(state: IState, blockchain: BlockchainCode | null): PersistentState.AddressbookItem[] {
  const { contacts } = state[moduleName];

  if (blockchain == null) {
    return all(state);
  }

  const { [blockchain]: blockchainContacts } = contacts;

  return blockchainContacts ?? [];
}
