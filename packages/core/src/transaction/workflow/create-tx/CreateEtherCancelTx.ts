import { amountFactory } from '../../../blockchains';
import { EthereumTransaction } from '../../ethereum';
import { EthereumBasicPlainTx, TxMetaType, ValidationResult } from '../types';
import { CreateEtherTx, fromPlainDetails } from './CreateEtherTx';

export class CreateEtherCancelTx extends CreateEtherTx {
  meta = { type: TxMetaType.ETHER_CANCEL };

  static fromPlain(details: EthereumBasicPlainTx): CreateEtherCancelTx {
    return new CreateEtherCancelTx(fromPlainDetails(details));
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
