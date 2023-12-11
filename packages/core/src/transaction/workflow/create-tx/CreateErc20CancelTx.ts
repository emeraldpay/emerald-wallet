import { TokenRegistry, amountFactory } from '../../../blockchains';
import { EthereumTransaction } from '../../ethereum';
import { EthereumBasicPlainTx, TxMetaType, ValidationResult } from '../types';
import { CreateErc20Tx, fromPlainDetails } from './CreateErc20Tx';

export class CreateErc20CancelTx extends CreateErc20Tx {
  meta = { type: TxMetaType.ERC20_CANCEL };

  static fromPlain(tokenRegistry: TokenRegistry, details: EthereumBasicPlainTx): CreateErc20CancelTx {
    return new CreateErc20CancelTx(tokenRegistry, fromPlainDetails(tokenRegistry, details));
  }

  build(): EthereumTransaction {
    return {
      ...super.build(),
      data: undefined,
      value: amountFactory(this.blockchain)(0),
    };
  }

  validate(): ValidationResult {
    return ValidationResult.OK;
  }
}
