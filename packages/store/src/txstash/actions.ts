import { SignedTx, WalletEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, isBitcoin, workflow } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { application } from '..';
import { Dispatched, Dispatcher, IExtraArgument, IState } from '../types';
import {
  ActionTypes,
  CreateTxStage,
  FEE_KEYS,
  FeeRange,
  GasPrice,
  GetFee,
  ResetAction,
  SetAssetAction,
  SetChangeAddressAction,
  SetEntryAction,
  SetFeeLoadingAction,
  SetFeeRangeAction,
  SetSignedAction,
  SetStageAction,
  SetTransactionAction,
} from './types';

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

function sortBigNumber(first: BigNumber, second: BigNumber): number {
  if (first.eq(second)) {
    return 0;
  }

  return first.gt(second) ? 1 : -1;
}

function getBitcoinFee(state: IState, dispatch: Dispatcher, extra: IExtraArgument): GetFee {
  return async (blockchain) => {
    const results = await Promise.allSettled<Promise<number>>(
      FEE_KEYS.map((key) => extra.backendApi.estimateFee(blockchain, 6, key)),
    );

    const [min, std, max] = results
      .map((result) => (result.status === 'fulfilled' ? result.value : 0))
      .sort((first, second) => {
        if (first === second) {
          return 0;
        }

        return first > second ? 1 : -1;
      });

    if (max === 0) {
      const defaultFee = application.selectors.getDefaultFee<number>(state, blockchain);

      const defaults: workflow.BitcoinFeeRange = {
        min: defaultFee?.min ?? 0,
        max: defaultFee?.max ?? 0,
        std: defaultFee?.std ?? 0,
      };

      const cachedFee = await extra.api.cache.get(`fee_range.${blockchain}`);

      if (cachedFee == null) {
        dispatch(setFeeRange(blockchain, defaults));
      } else {
        try {
          dispatch(setFeeRange(blockchain, JSON.parse(cachedFee)));
        } catch (exception) {
          dispatch(setFeeRange(blockchain, defaults));
        }
      }
    } else {
      const fee: workflow.BitcoinFeeRange = { max, min, std };

      await extra.api.cache.put(
        `fee_range.${blockchain}`,
        JSON.stringify(fee),
        application.selectors.getFeeTtl(state, blockchain),
      );

      dispatch(setFeeRange(blockchain, fee));
    }
  };
}

function getEthereumFee(state: IState, dispatch: Dispatcher, extra: IExtraArgument): GetFee {
  return async (blockchain) => {
    let results = await Promise.allSettled<Promise<string>>(
      FEE_KEYS.map((key) => extra.backendApi.estimateFee(blockchain, 128, key)),
    );

    results = await Promise.allSettled(
      results.map((result, index) =>
        result.status === 'fulfilled'
          ? Promise.resolve(result.value)
          : extra.backendApi.estimateFee(blockchain, 256, FEE_KEYS[index]),
      ),
    );

    const defaultGasPrice: GasPrice<string> = { max: '0', priority: '0' };

    let [lowFee, stdFee, highFee] = results.map((result) => {
      const value = result.status === 'fulfilled' ? result.value ?? defaultGasPrice : defaultGasPrice;

      let max: string;
      let priority: string;

      if (typeof value === 'string') {
        ({ max, priority } = { ...defaultGasPrice, max: value });
      } else {
        ({ max, priority } = value);
      }

      return {
        max: new BigNumber(max),
        priority: new BigNumber(priority),
      };
    });

    let { highs, priorities } = [lowFee, stdFee, highFee].reduce<Record<'highs' | 'priorities', BigNumber[]>>(
      (carry, item) => ({
        highs: [...carry.highs, item.max],
        priorities: [...carry.priorities, item.priority],
      }),
      {
        highs: [],
        priorities: [],
      },
    );

    highs = highs.sort(sortBigNumber);
    priorities = priorities.sort(sortBigNumber);

    [lowFee, stdFee, highFee] = highs.reduce<Array<GasPrice<BigNumber>>>(
      (carry, item, index) => [
        ...carry,
        {
          max: item,
          priority: priorities[index],
        },
      ],
      [],
    );

    if (highFee.max.eq(0)) {
      const defaultFee = application.selectors.getDefaultFee<string>(state, blockchain);

      const defaults: workflow.EthereumFeeRange<string> = {
        stdMaxGasPrice: defaultFee?.max ?? '0',
        lowMaxGasPrice: defaultFee?.min ?? '0',
        highMaxGasPrice: defaultFee?.std ?? '0',
        stdPriorityGasPrice: defaultFee?.priority_max ?? '0',
        lowPriorityGasPrice: defaultFee?.priority_min ?? '0',
        highPriorityGasPrice: defaultFee?.priority_std ?? '0',
      };

      const cachedFee = await extra.api.cache.get(`fee_range.${blockchain}`);

      if (cachedFee == null) {
        dispatch(setFeeRange(blockchain, defaults));
      } else {
        try {
          dispatch(setFeeRange(blockchain, JSON.parse(cachedFee)));
        } catch (exception) {
          dispatch(setFeeRange(blockchain, defaults));
        }
      }
    } else {
      const fee: workflow.EthereumFeeRange<string> = {
        stdMaxGasPrice: stdFee.max.toString(),
        lowMaxGasPrice: lowFee.max.toString(),
        highMaxGasPrice: highFee.max.toString(),
        stdPriorityGasPrice: stdFee.priority.toString(),
        lowPriorityGasPrice: lowFee.priority.toString(),
        highPriorityGasPrice: highFee.priority.toString(),
      };

      await extra.api.cache.put(
        `fee_range.${blockchain}`,
        JSON.stringify(fee),
        application.selectors.getFeeTtl(state, blockchain),
      );

      dispatch(setFeeRange(blockchain, fee));
    }
  };
}

export function getFee(blockchain: BlockchainCode): Dispatched<void, SetFeeLoadingAction> {
  return async (dispatch, getState, extra) => {
    const state = getState();

    const { timestamp } = state.txStash.fee?.[blockchain] ?? {};

    const rangeTtl = application.selectors.getFeeRangeTtl(state, blockchain);

    if (timestamp == null || rangeTtl == null || timestamp < Date.now() - rangeTtl * 1000) {
      dispatch(setFeeLoading(blockchain));

      if (isBitcoin(blockchain)) {
        getBitcoinFee(state, dispatch, extra)(blockchain);
      } else {
        getEthereumFee(state, dispatch, extra)(blockchain);
      }
    }
  };
}
