import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, workflow } from '@emeraldwallet/core';

export const moduleName = 'txStash';

export enum CreateTxStage {
  SETUP = 'setup',
  SIGN = 'sign',
  BROADCAST = 'broadcast',
}

export type GasPriceType = number | string;
export type GasPrice<T = GasPriceType> = Record<'max' | 'priority', T>;

export const DEFAULT_GAS_PRICE: GasPrice = { max: 0, priority: 0 } as const;
export const FEE_KEYS = ['avgLast', 'avgTail5', 'avgMiddle'] as const;

interface LastFee {
  range: workflow.FeeRange<GasPriceType>;
  timestamp: number;
}

interface BlockchainFee {
  [blockchain: string]: LastFee | undefined;
}

export interface Signed {
  raw: string;
  txId: string;
}

export interface TxStashState {
  asset?: string;
  entry?: WalletEntry;
  fee?: BlockchainFee;
  ownerAddress?: string;
  signed?: Signed;
  stage: CreateTxStage;
  transaction?: workflow.TxDetailsPlain;
}

export enum ActionTypes {
  RESET = 'TX_STASH/RESET',
  SET_ASSET = 'TX_STASH/SET_ASSET',
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
    range: workflow.FeeRange<GasPriceType>;
  };
}

export interface SetSignedAction {
  type: ActionTypes.SET_SIGNED;
  payload: {
    signed: Signed;
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
    transaction: workflow.TxDetailsPlain;
  };
}

export type TxStashAction =
  | ResetAction
  | SetAssetAction
  | SetEntryAction
  | SetFeeLoadingAction
  | SetFeeRangeAction
  | SetSignedAction
  | SetStageAction
  | SetTransactionAction;

export interface FeeState<T> {
  loading: boolean;
  range: workflow.FeeRange<T>;
}

export interface TxOriginState {
  entry?: WalletEntry;
  ownerAddress?: string;
}
