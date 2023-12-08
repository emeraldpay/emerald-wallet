import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { setPreparing } from '../../../actions';
import { EntryHandler } from '../../types';
import { fetchFee } from './fee';

export const prepareEthereumTransaction: EntryHandler<EthereumEntry> = (data, dataProvider, storeProvider) => () => {
  fetchFee(data, dataProvider, storeProvider)();

  storeProvider.dispatch(setPreparing(false));
};
