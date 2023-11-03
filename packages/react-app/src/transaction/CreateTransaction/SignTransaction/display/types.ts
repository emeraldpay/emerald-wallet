import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, workflow } from '@emeraldwallet/core';
import { BitcoinDisplay, EthereumDisplay } from './blockchain';

export type BlockchainDisplay = BitcoinDisplay | EthereumDisplay;

export interface Data<T extends workflow.AnyCreateTx> {
  createTx: T;
  entry: WalletEntry;
  isHardware: boolean;
}

export interface DataProvider {
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
}

export interface Handler {
  onCancel(): void;
  signTx(createTx: workflow.AnyCreateTx, entry: WalletEntry, password?: string): Promise<void>;
  verifyGlobalKey(password: string): Promise<boolean>;
}
