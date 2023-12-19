import { TokenRegistry } from '../../../blockchains';
import { EthereumBasicPlainTx, TxMetaType } from '../types';
import { CreateErc20Tx, fromPlainDetails } from './CreateErc20Tx';

export class CreateErc20RecoveryTx extends CreateErc20Tx {
  meta = { type: TxMetaType.ERC20_RECOVERY };

  static fromPlain(details: EthereumBasicPlainTx, tokenRegistry: TokenRegistry): CreateErc20RecoveryTx {
    return new CreateErc20RecoveryTx(fromPlainDetails(details, tokenRegistry), tokenRegistry);
  }
}
