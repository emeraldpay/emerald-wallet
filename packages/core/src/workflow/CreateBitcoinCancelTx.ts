import { BitcoinTxOutput, CreateBitcoinTx } from './CreateBitcoinTx';
import { ValidationResult } from './types';

export class CreateBitcoinCancelTx extends CreateBitcoinTx {
  private originalFeePrice: number | undefined;

  get outputs(): BitcoinTxOutput[] {
    let totalChange = this.change;

    if (this.transaction.amount != null) {
      totalChange = totalChange.plus(this.transaction.amount);
    }

    return [
      {
        address: this.changeAddress ?? '',
        amount: totalChange.number.toNumber(),
        entryId: this.entryId,
      },
    ];
  }

  set feePrice(price: number) {
    if (this.originalFeePrice == null) {
      this.originalFeePrice = price;
    }

    super.feePrice = price;
  }

  validate(): ValidationResult {
    if (this.originalFeePrice != null && this.originalFeePrice >= this.feePrice) {
      return ValidationResult.INSUFFICIENT_FEE_PRICE;
    }

    if (this.changeAddress == null) {
      return ValidationResult.NO_CHANGE_ADDRESS;
    }

    if (this.tx.from.length === 0) {
      return ValidationResult.NO_FROM;
    }

    return ValidationResult.OK;
  }
}
