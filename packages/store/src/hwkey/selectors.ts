import { LedgerApp } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, ledgerByBlockchain } from '@emeraldwallet/core';
import { HWKeyState } from './types';
import { IState } from '../types';

export function isWatching(state: HWKeyState): boolean {
  return state.watch;
}

export function getLedgerApp(state: HWKeyState): LedgerApp | null {
  return state.ledger.app;
}

export function isBlockchainOpen(state: IState, blockchain: BlockchainCode): boolean {
  const { app, connected } = state.hwkey.ledger;

  if (app != null && connected) {
    const { [app]: ledgerBlockchain } = ledgerByBlockchain;

    return (
      ledgerBlockchain === blockchain || (ledgerBlockchain === BlockchainCode.ETC && blockchain === BlockchainCode.ETH)
    );
  }

  return false;
}
