import { SignedTx, WalletEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, workflow } from '@emeraldwallet/core';
import { Allowance } from '../allowances/types';
import { StoredTransaction } from '../txhistory/types';

export const moduleName = 'txStash';

export enum CreateTxStage {
  SETUP,
  SIGN,
  BROADCAST,
}

export enum TxAction {
  APPROVE,
  CANCEL,
  CONVERT,
  RECOVERY,
  SPEEDUP,
  TRANSFER,
}

export type FeeRange = workflow.BitcoinFeeRange | workflow.EthereumFeeRange<string>;

export const FEE_KEYS = ['avgLast', 'avgTail5', 'avgMiddle'] as const;

interface LastFee {
  range: FeeRange;
  timestamp: number;
}

interface BlockchainFee {
  [blockchain: string]: LastFee | undefined;
}

export interface TxStashState {
  asset?: string;
  changeAddress?: string;
  entry?: WalletEntry;
  fee?: BlockchainFee;
  ownerAddress?: string;
  preparing: boolean;
  signed?: SignedTx;
  stage: CreateTxStage;
  transaction?: workflow.AnyPlainTx;
  transactionFee?: FeeRange;
}

export enum ActionTypes {
  RESET = 'TX_STASH/RESET',
  SET_ASSET = 'TX_STASH/SET_ASSET',
  SET_CHANGE_ADDRESS = 'TX_STASH/SET_CHANGE_ADDRESS',
  SET_ENTRY = 'TX_STASH/SET_ENTRY',
  SET_FEE_LOADING = 'TX_STASH/SET_FEE_LOADING',
  SET_FEE_RANGE = 'TX_STASH/SET_FEE_RANGE',
  SET_PREPARING = 'TX_STASH/SET_PREPARING',
  SET_SIGNED = 'TX_STASH/SET_SIGNED',
  SET_STAGE = 'TX_STASH/SET_STAGE',
  SET_TRANSACTION = 'TX_STASH/SET_TRANSACTION',
  SET_TRANSACTION_FEE = 'TX_STASH/SET_TRANSACTION_FEE',
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

export interface SetPreparingAction {
  type: ActionTypes.SET_PREPARING;
  payload: {
    preparing: boolean;
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

export interface SetTransactionFeeAction {
  type: ActionTypes.SET_TRANSACTION_FEE;
  payload: {
    transactionFee: FeeRange;
  };
}

export type TxStashAction =
  | ResetAction
  | SetAssetAction
  | SetChangeAddressAction
  | SetEntryAction
  | SetFeeLoadingAction
  | SetFeeRangeAction
  | SetPreparingAction
  | SetSignedAction
  | SetStageAction
  | SetTransactionAction
  | SetTransactionFeeAction;

export interface TxOrigin {
  action: TxAction;
  entries: WalletEntry[];
  entry: WalletEntry;
  initialAllowance?: Allowance;
  storedTx?: StoredTransaction;
}

export interface EntryState {
  entry?: WalletEntry;
  ownerAddress?: string;
}

export interface FeeState {
  loading: boolean;
  range: workflow.FeeRange;
}
