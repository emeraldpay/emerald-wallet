import { EthereumPlainTx, TxMetaType, ValidationResult } from '../types';
import { CreateEtherTx, fromPlainDetails } from './CreateEtherTx';

export class CreateEtherSpeedUpTx extends CreateEtherTx {
  meta = { type: TxMetaType.ETHER_SPEEDUP };

  static fromPlain(details: EthereumPlainTx): CreateEtherSpeedUpTx {
    return new CreateEtherSpeedUpTx(fromPlainDetails(details));
  }

  validate(): ValidationResult {
    return ValidationResult.OK;
  }
}
