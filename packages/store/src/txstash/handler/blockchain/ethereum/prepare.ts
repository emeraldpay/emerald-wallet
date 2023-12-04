import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { setPreparing } from '../../../actions';
import { EntryHandler } from '../../types';
import { fetchFee } from './fee';

export const prepareEthereumTx: EntryHandler<EthereumEntry> = (data, storeProvider) => () => {
  fetchFee(data, storeProvider)();

  storeProvider.dispatch(setPreparing(false));
};
