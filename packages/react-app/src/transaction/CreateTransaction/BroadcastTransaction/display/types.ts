import { SignedTx, WalletEntry } from '@emeraldpay/emerald-vault-core';
import { workflow } from '@emeraldwallet/core';
import { BroadcastData } from '@emeraldwallet/store';
import { BitcoinDisplay, EthereumDisplay } from './blockchain';

export type BlockchainDisplay = BitcoinDisplay | EthereumDisplay;

export interface Data<T extends workflow.AnyCreateTx> {
  createTx: T;
  entry: WalletEntry;
  signed: SignedTx;
}

export interface Handler {
  broadcastTx(data: BroadcastData): Promise<void>;
  onCancel(): void;
}
