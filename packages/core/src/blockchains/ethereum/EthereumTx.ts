import Common, { Hardfork } from '@ethereumjs/common';
import { Transaction as EthTx } from '@ethereumjs/tx';
import {ITransaction} from '../ITransaction';
import {EthereumAddress} from "./Address";

class EthereumTx implements ITransaction {
  public static fromRaw (hex: string, chainId: any): ITransaction {
    if (chainId === 62 || chainId === 61) {
      // Because ethereumjs-tx doesn't support ETC
      const common = Common.custom({ chainId }, { baseChain: 1, hardfork: Hardfork.Byzantium });

      return new EthereumTx(EthTx.fromSerializedTx(Buffer.from(hex.slice(2), 'hex'), { common }));
    }

    const common = new Common({ chain: chainId });

    return new EthereumTx(EthTx.fromSerializedTx(Buffer.from(hex.slice(2), 'hex'), { common }));
  }

  public internalTx: EthTx;

  constructor (tx: any) {
    this.internalTx = tx;
  }

  public getHash(): string {
    return '0x' + this.internalTx.hash().toString('hex');
  }

  public verifySignature(): boolean {
    return this.internalTx.verifySignature();
  }

  public getSenderAddress(): EthereumAddress {
    return new EthereumAddress(this.internalTx.getSenderAddress().toString());
  }

  public getRecipientAddress(): EthereumAddress {
    const address = this.internalTx.to?.toString();

    if (address == null) {
      throw new Error('Address must be set');
    }

    return new EthereumAddress(address);
  }

  public getValue(): string {
    return '0x' + this.internalTx.value.toString('hex');
  }

  public getData(): string {
    return this.internalTx.data.toString('hex');
  }

  public getNonce (): number {
    return parseInt(this.internalTx.nonce.toString('hex'), 16);
  }
}

export default EthereumTx;
