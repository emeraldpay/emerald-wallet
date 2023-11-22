import { EthereumPlainTx, TxMetaType } from '../types';
import { CreateEthereumTx, fromPlainDetails } from './CreateEthereumTx';

export class CreateEthereumSpeedUpTx extends CreateEthereumTx {
  meta = { type: TxMetaType.ETHEREUM_SPEEDUP };

  static fromPlain(details: EthereumPlainTx): CreateEthereumSpeedUpTx {
    return new CreateEthereumSpeedUpTx(fromPlainDetails(details));
  }
}
