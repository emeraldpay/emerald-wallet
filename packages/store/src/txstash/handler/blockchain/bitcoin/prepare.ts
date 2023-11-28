import { BitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { accounts } from '../../../..';
import { setChangeAddress, setPreparing } from '../../../actions';
import { EntryHandler } from '../../types';
import { fetchFee } from './fee';

const prepareTransaction: EntryHandler<BitcoinEntry, Promise<void>> =
  ({ entry }, _dataProvider, { dispatch }) =>
  async () => {
    const [{ address: changeAddress }] = await Promise.all(
      entry.xpub
        .filter(({ role }) => role === 'change')
        .map(({ role, xpub }) => dispatch(accounts.actions.getXPubPositionalAddress(entry.id, xpub, role))),
    );

    dispatch(setChangeAddress(changeAddress));
  };

export const prepareBitcoinTransaction: EntryHandler<BitcoinEntry> = (data, dataProvider, storeProvider) => () => {
  fetchFee(data, dataProvider, storeProvider)();

  prepareTransaction(data, dataProvider, storeProvider)().then(() => storeProvider.dispatch(setPreparing(false)));
};
