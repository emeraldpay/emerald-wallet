import { EthereumBasicPlainTx, TxMetaType } from '../types';
import { CreateEtherTx, fromPlainDetails } from './CreateEtherTx';

export class CreateEtherRecoveryTx extends CreateEtherTx {
  meta = { type: TxMetaType.ETHER_RECOVERY };

  static fromPlain(details: EthereumBasicPlainTx): CreateEtherRecoveryTx {
    return new CreateEtherRecoveryTx(fromPlainDetails(details));
  }
}
