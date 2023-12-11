import { SignedTx, WalletEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, workflow } from '@emeraldwallet/core';
import { Dispatched } from '../types';
import { getHandler } from './handler';
import {
  ActionTypes,
  CreateTxStage,
  FeeRange,
  ResetAction,
  SetAssetAction,
  SetChangeAddressAction,
  SetEntryAction,
  SetFeeLoadingAction,
  SetFeeRangeAction,
  SetPreparingAction,
  SetSignedAction,
  SetStageAction,
  SetTransactionAction,
  SetTransactionFeeAction,
  TxOrigin,
} from './types';

export function prepareTransaction({ action, entry, initialAllowance, storedTx }: TxOrigin): Dispatched<void> {
  return (dispatch, getState, extra) => {
    const handler = getHandler({ action, entry, initialAllowance, storedTx }, { dispatch, getState, extra });

    handler?.();
  };
}

export function reset(): ResetAction {
  return { type: ActionTypes.RESET };
}

export function setAsset(asset: string): SetAssetAction {
  return {
    type: ActionTypes.SET_ASSET,
    payload: { asset },
  };
}

export function setChangeAddress(changeAddress: string): SetChangeAddressAction {
  return {
    type: ActionTypes.SET_CHANGE_ADDRESS,
    payload: { changeAddress },
  };
}

export function setEntry(entry: WalletEntry, ownerAddress?: string): SetEntryAction {
  return {
    type: ActionTypes.SET_ENTRY,
    payload: { entry, ownerAddress },
  };
}

export function setFeeLoading(blockchain: BlockchainCode): SetFeeLoadingAction {
  return {
    type: ActionTypes.SET_FEE_LOADING,
    payload: { blockchain },
  };
}

export function setFeeRange(blockchain: BlockchainCode, range: FeeRange): SetFeeRangeAction {
  return {
    type: ActionTypes.SET_FEE_RANGE,
    payload: { blockchain, range },
  };
}

export function setPreparing(preparing: boolean): SetPreparingAction {
  return {
    type: ActionTypes.SET_PREPARING,
    payload: { preparing },
  };
}

export function setSigned(signed: SignedTx): SetSignedAction {
  return {
    type: ActionTypes.SET_SIGNED,
    payload: { signed },
  };
}

export function setStage(stage: CreateTxStage): SetStageAction {
  return {
    type: ActionTypes.SET_STAGE,
    payload: { stage },
  };
}

export function setTransaction(transaction: workflow.AnyPlainTx): SetTransactionAction {
  return {
    type: ActionTypes.SET_TRANSACTION,
    payload: { transaction },
  };
}

export function setTransactionFee(transactionFee: FeeRange): SetTransactionFeeAction {
  return {
    type: ActionTypes.SET_TRANSACTION_FEE,
    payload: { transactionFee },
  };
}
