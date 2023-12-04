import { BitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { blockchainIdToCode, workflow } from '@emeraldwallet/core';
import { setPreparing, setTransaction } from '../../../../actions';
import { getTransaction } from '../../../../selectors';
import { EntryHandler } from '../../../types';
import { restoreBitcoinTx } from './restore';

const convertTx: EntryHandler<BitcoinEntry> =
  ({ entry }, { dispatch, getState }) =>
  () => {
    const tx = getTransaction(getState());

    if (tx != null && workflow.isBitcoinPlainTx(tx)) {
      const createTx = workflow.CreateBitcoinCancelTx.fromPlain(
        {
          blockchain: blockchainIdToCode(entry.blockchain),
          changeAddress: tx.changeAddress,
          entryId: entry.id,
        },
        tx,
      );

      dispatch(setTransaction(createTx.dump()));
    }
  };

export const restoreBitcoinCancelTx: EntryHandler<BitcoinEntry, Promise<void>> = (data, storeProvider) => async () => {
  await restoreBitcoinTx(data, storeProvider)();

  convertTx(data, storeProvider)();

  storeProvider.dispatch(setPreparing(false));
};
