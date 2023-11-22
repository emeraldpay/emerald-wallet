import { TokenRegistry } from '../../../blockchains';
import { EthereumPlainTx, TxMetaType } from '../types';
import { CreateErc20Tx, fromPlainDetails } from './CreateErc20Tx';

export class CreateErc20SpeedUpTx extends CreateErc20Tx {
  meta = { type: TxMetaType.ETHEREUM_SPEEDUP };

  static fromPlain(tokenRegistry: TokenRegistry, details: EthereumPlainTx): CreateErc20SpeedUpTx {
    return new CreateErc20SpeedUpTx(tokenRegistry, fromPlainDetails(tokenRegistry, details));
  }
}
