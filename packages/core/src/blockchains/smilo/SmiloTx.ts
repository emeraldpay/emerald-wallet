import {Transaction} from "../types";

const EthTx = require('ethereumjs-tx');

class SmiloTx implements Transaction {
  internalTx: any;

  constructor(tx: any) {
    this.internalTx = tx;
  }

  static fromRaw(hex: string): Transaction {
    return new SmiloTx(new EthTx(hex));
  }

  verifySignature(): boolean {
    return this.internalTx.verifySignature();
  }

  getSenderAddress(): string {
    return this.internalTx.getSenderAddress().toString('hex');
  }
}

export default SmiloTx;
