import { EthereumPlainTx, TxMetaType } from '../types';
import { CreateEthereumTx, fromPlainDetails } from './CreateEthereumTx';

export class CreateEthereumCancelTx extends CreateEthereumTx {
  meta = { type: TxMetaType.ETHEREUM_CANCEL };

  static fromPlain(details: EthereumPlainTx): CreateEthereumCancelTx {
    return new CreateEthereumCancelTx(fromPlainDetails(details));
  }
}
