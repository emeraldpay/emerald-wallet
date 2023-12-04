import { SatoshiAny } from '@emeraldpay/bigamount-crypto';
import { InputUtxo } from '../../../blockchains';
import { BitcoinPlainTx } from '../types';
import { BitcoinTxOutput, CreateBitcoinTx } from './CreateBitcoinTx';

export class CreateBitcoinModifyTx extends CreateBitcoinTx {
  originalFees?: SatoshiAny;

  get fees(): SatoshiAny {
    const { originalFees } = this;

    const fees = super.fees;

    if (originalFees != null && originalFees.isGreaterThan(fees)) {
      return originalFees;
    }

    return fees;
  }

  dump(): BitcoinPlainTx {
    const tx = super.dump();

    return {
      ...tx,
      originalFees: this.originalFees?.encode() ?? tx.originalFees,
    };
  }

  estimateFeesFor(inputs: InputUtxo[], outputs: BitcoinTxOutput[]): SatoshiAny {
    const { originalFees } = this;

    const fees = super.estimateFeesFor(inputs, outputs);

    if (originalFees != null && originalFees.isGreaterThan(fees)) {
      return originalFees;
    }

    return fees;
  }
}
