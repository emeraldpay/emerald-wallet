import { BigAmount } from '@emeraldpay/bigamount';
import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { CurrencyAmount, TokenRegistry, workflow } from '@emeraldwallet/core';
import { CreateTxStage, FeeState } from '@emeraldwallet/store';
import { Asset } from '../../../../common/SelectAsset';
import { BitcoinTransferFlow, EthereumTransferFlow } from './blockchain';

export type BlockchainFlow = BitcoinTransferFlow | EthereumTransferFlow;

export interface Data<C extends workflow.AnyCreateTx, E extends WalletEntry> {
  asset: string;
  assets: Asset[];
  createTx: C;
  fee: FeeState;
  entry: E;
  entries: WalletEntry[];
  ownerAddress?: string;
  tokenRegistry: TokenRegistry;
}

export interface DataProvider {
  getBalance(entry: WalletEntry, asset: string, ownerAddress?: string): BigAmount;
  getFiatBalance(asset: string): CurrencyAmount | undefined;
}

export interface Handler {
  onCancel(): void;
  setAsset(asset: string): void;
  setEntry(entry: WalletEntry, ownerAddress?: string): void;
  setStage(stage: CreateTxStage): void;
  setTransaction(transaction: workflow.AnyPlainTx): void;
}
