import { BigAmount, CreateAmount } from '@emeraldpay/bigamount';
import { BlockchainCode, amountFactory, workflow } from '@emeraldwallet/core';
import { IState } from '../types';
import { CreateTxStage, FeeState, Signed, TxOriginState } from './types';

export function getAsset(state: IState): string | undefined {
  return state.txStash.asset;
}

export function getEntry(state: IState): TxOriginState {
  const { entry, ownerAddress } = state.txStash;

  return { entry, ownerAddress };
}

export function getFee<T extends BigAmount>(state: IState, blockchain: BlockchainCode): FeeState<T> {
  const { range } = state.txStash.fee?.[blockchain] ?? {};

  const factory = amountFactory(blockchain) as CreateAmount<T>;
  const zeroAmount = factory(0);

  if (range == null) {
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

export function getSigned(state: IState): Signed | undefined {
  return state.txStash.signed;
}

export function getStage(state: IState): CreateTxStage {
  return state.txStash.stage;
}

export function getTransaction(state: IState): workflow.TxDetailsPlain | undefined {
  return state.txStash.transaction;
}
