import { BitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { blockchainIdToCode, workflow } from '@emeraldwallet/core';
import { application } from '../../../..';
import { setFeeRange } from '../../../actions';
import { FEE_KEYS } from '../../../types';
import { EntryHandler } from '../../types';

export const fetchFee: EntryHandler<BitcoinEntry, Promise<void>> =
  ({ entry }, _dataProvider, { dispatch, getState, extra }) =>
  async () => {
    const state = getState();

    const blockchain = blockchainIdToCode(entry.blockchain);

    const { timestamp } = state.txStash.fee?.[blockchain] ?? {};

    const rangeTtl = application.selectors.getFeeRangeTtl(state, blockchain);

    if (timestamp == null || rangeTtl == null || timestamp < Date.now() - rangeTtl * 1000) {
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
    }
  };
