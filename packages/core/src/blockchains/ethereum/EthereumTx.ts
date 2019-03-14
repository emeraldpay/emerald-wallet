import EthTx from 'ethereumjs-tx';
import {Transaction} from "../types";

class EthereumTx implements Transaction {
  internalTx: EthTx;

  constructor(tx: EthTx) {
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