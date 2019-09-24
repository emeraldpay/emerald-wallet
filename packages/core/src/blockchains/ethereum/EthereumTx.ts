import { Transaction as EthTx } from 'ethereumjs-tx';
import { ITransaction } from '../types';

class EthereumTx implements ITransaction {

  public static fromRaw (hex: string, chainId: any): ITransaction {
    return new EthereumTx(new EthTx(hex, { chain: chainId }));
  }
  public internalTx: EthTx;

  constructor (tx: any) {
    this.internalTx = tx;
  }

  public getHash (): string {
    return '0x' + this.internalTx.hash(true).toString('hex');
  }

  public verifySignature (): boolean {
    return this.internalTx.verifySignature();
  }

  public getSenderAddress (): string {
    return this.internalTx.getSenderAddress().toString('hex');
  }

  public getRecipientAddress (): string {
    return this.internalTx.to.toString('hex');
  }

  public getValue (): any {
    return '0x' + this.internalTx.value.toString('hex');
  }
}

export default EthereumTx;
