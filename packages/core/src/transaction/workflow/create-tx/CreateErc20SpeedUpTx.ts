import { TokenRegistry } from '../../../blockchains';
import { EthereumBasicPlainTx, TxMetaType, ValidationResult } from '../types';
import { CreateErc20Tx, fromPlainDetails } from './CreateErc20Tx';

export class CreateErc20SpeedUpTx extends CreateErc20Tx {
  meta = { type: TxMetaType.ERC20_SPEEDUP };

  static fromPlain(tokenRegistry: TokenRegistry, details: EthereumBasicPlainTx): CreateErc20SpeedUpTx {
    return new CreateErc20SpeedUpTx(tokenRegistry, fromPlainDetails(tokenRegistry, details));
  }

  validate(): ValidationResult {
    return ValidationResult.OK;
  }
}
