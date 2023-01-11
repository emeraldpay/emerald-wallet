import { EthereumAddress } from './EthereumAddress';
import { IBlockchain } from '../IBlockchain';
import IBlockchainParams from '../IBlockchainParams';

export class Ethereum implements IBlockchain {
  params: IBlockchainParams;
  title: string;

  constructor(params: IBlockchainParams, title: string) {
    this.params = params;
    this.title = title;
  }

  getTitle(): string {
    return this.title;
  }

  isValidAddress(address: string): boolean {
    return EthereumAddress.isValid(address);
  }
}
