import {Transaction} from "../types";

const EthTx = require('ethereumjs-tx');

class EthereumTx implements Transaction {
  internalTx: any;

  constructor(tx: any) {
    this.internalTx = tx;
  }

  static fromRaw(hex: string): Transaction {
    return new EthereumTx(new EthTx(hex));
  }

  verifySignature(): boolean {
    return this.internalTx.verifySignature();
  }

  getSenderAddress(): string {
    return this.internalTx.getSenderAddress().toString('hex');
  }
}

export default EthereumTx;