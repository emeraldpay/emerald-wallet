import { BitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { accounts } from '../../../..';
import { setChangeAddress, setPreparing } from '../../../actions';
import { EntryHandler } from '../../types';
import { fetchFee } from './fee';

const prepareTx: EntryHandler<BitcoinEntry, Promise<void>> =
  ({ entry }, { dispatch }) =>
  async () => {
    const [{ address: changeAddress }] = await Promise.all(
      entry.xpub
        .filter(({ role }) => role === 'change')
        .map(({ role, xpub }) => dispatch(accounts.actions.getXPubPositionalAddress(entry.id, xpub, role))),
    );

    dispatch(setChangeAddress(changeAddress));
  };

export const prepareBitcoinTx: EntryHandler<BitcoinEntry> = (data, storeProvider) => () => {
  fetchFee(data, storeProvider)();

  prepareTx(data, storeProvider)().then(() => storeProvider.dispatch(setPreparing(false)));
};
