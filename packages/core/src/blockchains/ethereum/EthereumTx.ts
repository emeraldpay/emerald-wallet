import { Transaction } from '../types';

const EthTx = require('ethereumjs-tx');

class EthereumTx implements Transaction {

  public static fromRaw (hex: string): Transaction {
    return new EthereumTx(new EthTx(hex));
  }
  public internalTx: any;

  constructor (tx: any) {
    this.internalTx = tx;
  }

  public verifySignature (): boolean {
    return this.internalTx.verifySignature();
  }

  public getSenderAddress (): string {
    return this.internalTx.getSenderAddress().toString('hex');
  }
}

export default EthereumTx;
