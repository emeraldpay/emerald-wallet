import { WalletEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, blockchainIdToCode } from '@emeraldwallet/core';
import { IState } from '../types';
import { Allowance, moduleName } from './types';

export function getAddressAllowances(state: IState, blockchain: BlockchainCode, address: string): Allowance[] {
  const { allowedFor = {}, approvedBy = {} } = state[moduleName][blockchain]?.[address] ?? {};

  return [...Object.values(approvedBy), ...Object.values(allowedFor)].flat();
}

export function getEntryAllowances(state: IState, entry: WalletEntry): Allowance[] {
  if (isEthereumEntry(entry) && entry.address != null) {
    return getAddressAllowances(state, blockchainIdToCode(entry.blockchain), entry.address.value);
  }

  return [];
}

export function getEntriesGroupedAllowances(state: IState, entries: WalletEntry[]): Allowance[] {
  return entries.reduce<Allowance[]>((carry, entry) => {
    if (isEthereumEntry(entry) && entry.address != null) {
      const blockchainCode = blockchainIdToCode(entry.blockchain);

      const { allowedFor = {}, approvedBy = {} } = state[moduleName][blockchainCode]?.[entry.address.value] ?? {};

      const allowances = new Map(Object.entries(allowedFor));

      const grouped = Object.entries(approvedBy).reduce<Allowance[]>((carry, [contractAddress, approved]) => {
        const allowed = allowances.get(contractAddress);

        if (allowed == null) {
          return [...carry, ...approved];
        }

        allowances.delete(contractAddress);

        return [...carry, ...approved, ...allowed];
      }, []);

      const restAllowances = [...allowances.values()].flat();

      return [...carry, ...grouped, ...restAllowances];
    }

    return carry;
  }, []);
}
