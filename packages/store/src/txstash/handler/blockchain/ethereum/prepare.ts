import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { setPreparing } from '../../../actions';
import { EntryHandler } from '../../types';
import { getFee } from './fee';

export const prepareEthereumTransaction: EntryHandler<EthereumEntry> = (data, provider) => () => {
  getFee(data, provider)();

  provider.dispatch(setPreparing(false));
};
