import {SignedTx, WalletEntry} from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  EthereumBasicTransaction,
  EthereumTransaction,
  TokenRegistry,
  workflow
} from '@emeraldwallet/core';
import {Dispatched} from '../types';
import {getHandler} from './handler';
import {
  ActionTypes,
  CreateTxStage,
  FeeRange, moduleName,
  ResetAction,
  SetAssetAction,
  SetChangeAddressAction,
  SetEntryAction,
  SetFeeLoadingAction,
  SetFeeRangeAction,
  SetGasLimitAction,
  SetPreparingAction,
  SetSignedAction,
  SetStageAction,
  SetTransactionAction,
  SetTransactionFeeAction,
  TxOrigin,
} from './types';
import {getTokens} from "../application/selectors";
import {Wei} from "@emeraldpay/bigamount-crypto";

export function prepareTransaction({ action, entries, entry, initialAllowance, storedTx }: TxOrigin): Dispatched<void> {
  return (dispatch, getState, extra) => {
    const handler = getHandler({ action, entries, entry, initialAllowance, storedTx }, { dispatch, getState, extra });

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

export function estimateGasLimit(): Dispatched<void | SetGasLimitAction> {
  return (dispatch, getState, extra) => {
    let creatingTx = getState()[moduleName].transaction;

    if (!creatingTx) {
      return;
    }

    // In general, we want to estimate it only for transactions where it can change depending on tx details.
    // Which is basically when it makes a tx to a contract or with a non-empty data. Note that for a standard Ether Transfer it may target a contract address as well.
    // So basically it's everything expect a speedup (nothing changes except the price) and cancel (always 21_000 gas as we transfer to ourselves)
    const gasIsDefined = creatingTx.meta.type in [
      workflow.TxMetaType.ERC20_CANCEL,
      workflow.TxMetaType.ERC20_SPEEDUP,
      workflow.TxMetaType.ETHER_CANCEL,
      workflow.TxMetaType.ETHER_SPEEDUP,
    ];

    // nothing to estimate
    if (gasIsDefined) {
      return;
    }

    if (workflow.isEthereumPlainTx(creatingTx) && workflow.isEthereumBasicPlainTx(creatingTx)) {
      let builtTx: EthereumTransaction | undefined = workflow
        .fromEthereumPlainTx(creatingTx, new TokenRegistry(getTokens(getState())))
        .build();

      if (!builtTx) {
        return;
      }

      let estimateTx: EthereumBasicTransaction = {
        from: builtTx.from,
        to: builtTx.to,
        data: builtTx.data,
        value: new Wei(builtTx.value).toHex(),
      }

      if (estimateTx.to == null && estimateTx.data == null) {
        // tx is not filled yet with anything
        return;
      }

      return extra.backendApi
        .estimateGasLimit(creatingTx.blockchain, estimateTx)
        .then((gasLimit) => {
          let action: SetGasLimitAction = {
            type: ActionTypes.SET_GAS_LIMIT,
            payload: gasLimit
          }
          dispatch(action);
        })
        .catch((error) => {
          console.error('Failed to estimate gas limit', error);
        });
    }

  }
}
