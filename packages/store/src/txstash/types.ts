import { SignedTx, WalletEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, workflow } from '@emeraldwallet/core';

export const moduleName = 'txStash';

export const FEE_KEYS = ['avgLast', 'avgTail5', 'avgMiddle'] as const;

export type FeeRange = workflow.BitcoinFeeRange | workflow.EthereumFeeRange<string>;
export type GasPrice<T = string> = Record<'max' | 'priority', T>;
export type GetFee = (blockchain: BlockchainCode) => Promise<void>;

interface LastFee {
  range: FeeRange;
  timestamp: number;
}

interface BlockchainFee {
  [blockchain: string]: LastFee | undefined;
}

export enum CreateTxStage {
  SETUP = 'setup',
  SIGN = 'sign',
  BROADCAST = 'broadcast',
}

export interface TxStashState {
  asset?: string;
  entry?: WalletEntry;
  changeAddress?: string;
  fee?: BlockchainFee;
  ownerAddress?: string;
  signed?: SignedTx;
  stage: CreateTxStage;
  transaction?: workflow.AnyPlainTx;
}

export enum ActionTypes {
  RESET = 'TX_STASH/RESET',
  SET_ASSET = 'TX_STASH/SET_ASSET',
  SET_CHANGE_ADDRESS = 'TX_STASH/SET_CHANGE_ADDRESS',
  SET_ENTRY = 'TX_STASH/SET_ENTRY',
  SET_FEE_LOADING = 'TX_STASH/SET_FEE_LOADING',
  SET_FEE_RANGE = 'TX_STASH/SET_FEE_RANGE',
  SET_SIGNED = 'TX_STASH/SET_SIGNED',
  SET_STAGE = 'TX_STASH/SET_STAGE',
  SET_TRANSACTION = 'TX_STASH/SET_TRANSACTION',
}

export interface ResetAction {
  type: ActionTypes.RESET;
}

export interface SetAssetAction {
  type: ActionTypes.SET_ASSET;
  payload: {
    asset: string;
  };
}

export interface SetChangeAddressAction {
  type: ActionTypes.SET_CHANGE_ADDRESS;
  payload: {
    changeAddress: string;
  };
}

export interface SetEntryAction {
  type: ActionTypes.SET_ENTRY;
  payload: {
    entry: WalletEntry;
    ownerAddress?: string;
  };
}

export interface SetFeeLoadingAction {
  type: ActionTypes.SET_FEE_LOADING;
  payload: {
    blockchain: BlockchainCode;
  };
}

export interface SetFeeRangeAction {
  type: ActionTypes.SET_FEE_RANGE;
  payload: {
    blockchain: BlockchainCode;
    range: FeeRange;
  };
}

export interface SetSignedAction {
  type: ActionTypes.SET_SIGNED;
  payload: {
    signed: SignedTx;
  };
}

export interface SetStageAction {
  type: ActionTypes.SET_STAGE;
  payload: {
    stage: CreateTxStage;
  };
}

export interface SetTransactionAction {
  type: ActionTypes.SET_TRANSACTION;
  payload: {
    transaction: workflow.AnyPlainTx;
  };
}

export type TxStashAction =
  | ResetAction
  | SetAssetAction
  | SetChangeAddressAction
  | SetEntryAction
  | SetFeeLoadingAction
  | SetFeeRangeAction
  | SetSignedAction
  | SetStageAction
  | SetTransactionAction;

export interface EntryState {
  entry?: WalletEntry;
  ownerAddress?: string;
}

export interface FeeState {
  loading: boolean;
  range: workflow.FeeRange;
}
