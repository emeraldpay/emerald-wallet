import { SatoshiAny } from '@emeraldpay/bigamount-crypto';
import { amountDecoder } from '../../../blockchains';
import { BitcoinPlainTx, TxMetaType } from '../types';
import { BitcoinTxOrigin, BitcoinTxOutput, CreateBitcoinTx } from './CreateBitcoinTx';

export class CreateBitcoinCancelTx extends CreateBitcoinTx {
  meta = { type: TxMetaType.BITCOIN_CANCEL };

  static fromPlain(origin: BitcoinTxOrigin, plain: BitcoinPlainTx): CreateBitcoinCancelTx {
    const changeAddress = origin.changeAddress ?? plain.changeAddress;

    const tx = new CreateBitcoinCancelTx({ ...origin, changeAddress }, plain.utxo);

    const decoder = amountDecoder<SatoshiAny>(origin.blockchain);

    tx.amount = decoder(plain.amount);
    tx.meta.type = TxMetaType.BITCOIN_CANCEL;
    tx.target = plain.target;
    tx.to = plain.to;
    tx.vkbPrice = plain.vkbPrice;

    return tx;
  }

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
}
