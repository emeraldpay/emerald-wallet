import { BlockchainCode } from './blockchains';
import { IBlockchain } from './IBlockchain';
import IBlockchainParams from './IBlockchainParams';

export class Bitcoin implements IBlockchain {
  params: IBlockchainParams;

  constructor(params: IBlockchainParams) {
    this.params = params;
  }

  getAssets(): string[] {
    return [this.params.coinTicker];
  }

  getTitle(): string {
    return this.params.code == BlockchainCode.BTC ? 'Bitcoin' : 'Bitcoin Testnet';
  }

  isValidAddress(address: string): boolean {
    return address.startsWith('bc1') || address.startsWith('tb1');
  }
}

export interface InputUtxo {
  /**
   * Target address
   */
  address: string;
  /**
   * Input sequence (nSequence)
   */
  sequence?: number;
  /**
   * Bitcoin transaction Id
   */
  txid: string;
  /**
   * Transaction vout
   */
  vout: number;
  /**
   * Encoded BigAmount
   */
  value: string;
}
