import { BigAmount } from '@emeraldpay/bigamount';
import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { CurrencyAmount, TokenRegistry, workflow } from '@emeraldwallet/core';
import { Allowance, CreateTxStage, FeeState, StoredTransaction } from '@emeraldwallet/store';
import * as React from 'react';
import { Asset } from '../../../common/SelectAsset';
import {
  BitcoinCancelFlow,
  BitcoinSpeedUpFlow,
  BitcoinTransferFlow,
  Erc20ApproveFlow,
  Erc20ConvertFlow,
  EthereumCancelFlow,
  EthereumRecoveryFlow,
  EthereumSpeedUpFlow,
  EthereumTransferFlow,
} from './blockchain';

export type BlockchainFlow =
  | BitcoinCancelFlow
  | BitcoinSpeedUpFlow
  | BitcoinTransferFlow
  | Erc20ApproveFlow
  | Erc20ConvertFlow
  | EthereumCancelFlow
  | EthereumRecoveryFlow
  | EthereumSpeedUpFlow
  | EthereumTransferFlow;

export interface Data<C extends workflow.AnyCreateTx, E extends WalletEntry> {
  asset: string;
  assets: Asset[];
  createTx: C;
  entries: WalletEntry[];
  entry: E;
  fee: FeeState;
  allowance?: Allowance;
  ownerAddress?: string;
  storedTx?: StoredTransaction;
  tokenRegistry: TokenRegistry;
  transactionFee?: workflow.FeeRange;
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

export abstract class CommonFlow {
  abstract readonly data: Data<workflow.AnyCreateTx, WalletEntry>;
  abstract readonly dataProvider: DataProvider;
  abstract readonly handler: Handler;
  abstract render(): React.ReactElement;
}
