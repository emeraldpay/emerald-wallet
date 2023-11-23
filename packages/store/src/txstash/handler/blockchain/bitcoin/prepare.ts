import { BitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { accounts } from '../../../..';
import { setChangeAddress, setPreparing } from '../../../actions';
import { EntryHandler } from '../../types';
import { getFee } from './fee';

const prepareTransaction: EntryHandler<BitcoinEntry, Promise<void>> =
  ({ entry }, { dispatch }) =>
  async () => {
    const [{ address: changeAddress }] = await Promise.all(
      entry.xpub
        .filter(({ role }) => role === 'change')
        .map(({ role, xpub }) => dispatch(accounts.actions.getXPubPositionalAddress(entry.id, xpub, role))),
    );

    dispatch(setChangeAddress(changeAddress));
  };

export const prepareBitcoinTransaction: EntryHandler<BitcoinEntry> = (data, provider) => () => {
  getFee(data, provider)();

  prepareTransaction(data, provider)().then(() => provider.dispatch(setPreparing(false)));
};
