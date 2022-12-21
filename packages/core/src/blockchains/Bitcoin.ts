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

export interface BalanceUtxo {
  /**
   * Target address
   */
  address: string;
  /**
   * Bitcoin transaction Id
   */
  txid: string;
  /**
   * Transaction vout
   */
  vout: number;
  /**
   * encoded BigAmount
   */
  value: string;
}
