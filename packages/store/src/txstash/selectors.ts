import { CreateAmount } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { SignedTx } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, amountFactory, isBitcoin, workflow } from '@emeraldwallet/core';
import { IState } from '../types';
import { CreateTxStage, EntryState, FeeState } from './types';

export function getAsset(state: IState): string | undefined {
  return state.txStash.asset;
}

export function getChangeAddress(state: IState): string | undefined {
  return state.txStash.changeAddress;
}

export function getEntry(state: IState): EntryState {
  const { entry, ownerAddress } = state.txStash;

  return { entry, ownerAddress };
}

export function getFee(state: IState, blockchain: BlockchainCode): FeeState {
  const { range } = state.txStash.fee?.[blockchain] ?? {};

  if (isBitcoin(blockchain)) {
    if (range == null || workflow.CreateTxConverter.isEthereumFeeRange(range)) {
      return {
        loading: true,
        range: { std: 0, min: 0, max: 0 },
      };
    }

    return { range, loading: false };
  }

  const factory = amountFactory(blockchain) as CreateAmount<WeiAny>;
  const zeroAmount = factory(0);

  if (range == null || workflow.CreateTxConverter.isBitcoinFeeRange(range)) {
    return {
      loading: true,
      range: {
        stdMaxGasPrice: zeroAmount,
        lowMaxGasPrice: zeroAmount,
        highMaxGasPrice: zeroAmount,
        stdPriorityGasPrice: zeroAmount,
        lowPriorityGasPrice: zeroAmount,
        highPriorityGasPrice: zeroAmount,
      },
    };
  }

  return {
    loading: false,
    range: {
      stdMaxGasPrice: factory(range.stdMaxGasPrice),
      lowMaxGasPrice: factory(range.lowMaxGasPrice),
      highMaxGasPrice: factory(range.highMaxGasPrice),
      stdPriorityGasPrice: range.stdPriorityGasPrice == null ? zeroAmount : factory(range.stdPriorityGasPrice),
      lowPriorityGasPrice: range.lowPriorityGasPrice == null ? zeroAmount : factory(range.lowPriorityGasPrice),
      highPriorityGasPrice: range.highPriorityGasPrice == null ? zeroAmount : factory(range.highPriorityGasPrice),
    },
  };
}

export function getSigned(state: IState): SignedTx | undefined {
  return state.txStash.signed;
}

export function getStage(state: IState): CreateTxStage {
  return state.txStash.stage;
}

export function getTransaction(state: IState): workflow.AnyPlainTx | undefined {
  return state.txStash.transaction;
}
