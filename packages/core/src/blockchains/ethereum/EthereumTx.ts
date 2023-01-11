import { Common, Hardfork } from '@ethereumjs/common';
import { TransactionFactory, TypedTransaction } from '@ethereumjs/tx';
import { EthereumAddress } from './EthereumAddress';
import { ITransaction } from '../ITransaction';

export class EthereumTx implements ITransaction {
  static eip1559mark = Buffer.from('02', 'hex');

  internalTx: TypedTransaction;

  constructor(tx: TypedTransaction) {
    this.internalTx = tx;
  }

  static fromRaw(hex: string, chainId: number): ITransaction {
    const data = Buffer.from(hex.slice(2), 'hex');

    let hardfork: Hardfork | undefined = undefined;

    if (data.subarray(0, 1).equals(EthereumTx.eip1559mark)) {
      hardfork = Hardfork.London;
    }

    let common: Common;

    if (chainId === 61 || chainId === 62) {
      // Because ethereumjs-tx doesn't support ETC
      common = Common.custom({ chainId }, { baseChain: 1, hardfork: Hardfork.Byzantium });
    } else {
      common = new Common({ hardfork, chain: chainId });
    }

    return new EthereumTx(TransactionFactory.fromSerializedData(data, { common }));
  }

  getData(): string {
    return this.internalTx.data.toString('hex');
  }

  getHash(): string {
    return '0x' + this.internalTx.hash().toString('hex');
  }

  getNonce(): number {
    return parseInt(this.internalTx.nonce.toString(10), 10);
  }

  getRecipientAddress(): EthereumAddress {
    const address = this.internalTx.to?.toString();

    if (address == null) {
      throw new Error('Address must be set');
    }

    return new EthereumAddress(address);
  }

  getSenderAddress(): EthereumAddress {
    return new EthereumAddress(this.internalTx.getSenderAddress().toString());
  }

  getValue(): string {
    return '0x' + this.internalTx.value.toString(16);
  }

  verifySignature(): boolean {
    return this.internalTx.verifySignature();
  }
}
