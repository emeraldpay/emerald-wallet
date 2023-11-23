import { SatoshiAny } from '@emeraldpay/bigamount-crypto';
import { amountDecoder } from '../../../blockchains';
import { BitcoinPlainTx, TxMetaType } from '../types';
import { BitcoinTxOrigin, CreateBitcoinTx } from './CreateBitcoinTx';

export class CreateBitcoinSpeedUpTx extends CreateBitcoinTx {
  meta = { type: TxMetaType.BITCOIN_SPEEDUP };

  static fromPlain(origin: BitcoinTxOrigin, plain: BitcoinPlainTx): CreateBitcoinSpeedUpTx {
    const changeAddress = origin.changeAddress ?? plain.changeAddress;

    const tx = new CreateBitcoinSpeedUpTx({ ...origin, changeAddress }, plain.utxo);

    const decoder = amountDecoder<SatoshiAny>(origin.blockchain);

    tx.amount = decoder(plain.amount);
    tx.meta.type = TxMetaType.BITCOIN_SPEEDUP;
    tx.target = plain.target;
    tx.to = plain.to;
    tx.vkbPrice = plain.vkbPrice;

    return tx;
  }
}
