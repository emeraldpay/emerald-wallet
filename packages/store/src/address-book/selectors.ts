import { BlockchainCode, PersistentState } from '@emeraldwallet/core';
import { IState } from '../types';
import { moduleName } from './types';

export function all(state: IState): PersistentState.AddressbookItem[] {
  const { contacts } = state[moduleName];
  const blockchains = Object.keys(contacts) as BlockchainCode[];

  return blockchains.reduce<PersistentState.AddressbookItem[]>((carry, blockchain) => {
    const blockchainContacts = contacts[blockchain];

    if (blockchainContacts == null) {
      return carry;
    }

    return [...carry, ...Object.values(blockchainContacts)];
  }, []);
}
