import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { blockchainIdToCode, workflow } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { application } from '../../../..';
import { setFeeRange } from '../../../actions';
import { FEE_KEYS } from '../../../types';
import { EntryHandler } from '../../types';

type GasPrice<T = string> = Record<'max' | 'priority', T>;

function sortBigNumber(first: BigNumber, second: BigNumber): number {
  if (first.eq(second)) {
    return 0;
  }

  return first.gt(second) ? 1 : -1;
}

export const fetchFee: EntryHandler<EthereumEntry, Promise<void>> =
  ({ entry }, { dispatch, getState, extra }) =>
  async () => {
    const state = getState();

    const blockchain = blockchainIdToCode(entry.blockchain);

    const { timestamp } = state.txStash.fee?.[blockchain] ?? {};

    const rangeTtl = application.selectors.getFeeRangeTtl(state, blockchain);

    if (timestamp == null || rangeTtl == null || timestamp < Date.now() - rangeTtl * 1000) {
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
    }
  };
