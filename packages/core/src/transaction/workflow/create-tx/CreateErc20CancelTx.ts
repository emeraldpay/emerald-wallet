import { TokenRegistry } from '../../../blockchains';
import { EthereumPlainTx, TxMetaType } from '../types';
import { CreateErc20Tx, fromPlainDetails } from './CreateErc20Tx';

export class CreateErc20CancelTx extends CreateErc20Tx {
  meta = { type: TxMetaType.ETHEREUM_CANCEL };

  static fromPlain(tokenRegistry: TokenRegistry, details: EthereumPlainTx): CreateErc20CancelTx {
    return new CreateErc20CancelTx(tokenRegistry, fromPlainDetails(tokenRegistry, details));
  }
}
